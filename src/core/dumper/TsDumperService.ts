import ContainerBuilder from "../container/container-builder.model";
import {dirname, relative, resolve} from "path";
import {solve} from 'dependency-solver';
import fs from 'fs';
import Reference from "../models/reference.model";

export default class TsDumperService {
    static RESOURCE_PREFIX = 'Resource_';
    static INSTANCE_PREFIX = 'instance_';

    static dump(container: ContainerBuilder, filePath: string) {
        const definitions = container.getDefinitions();
        const reflectionService = container.getReflectionService();
        const bag = container.getParameterBag();
        const dependencyGraph = {};

        let instanceOrder = [];
        let parameters = {};

        definitions.forEach(definition => {
            if (definition.getId() === 'service.container') {
                return;
            }


            let definitionArgument = definition.getArguments();
            let dependencies: string[] = [];

            Object.keys(definitionArgument).forEach(entryName => {
                const entry = definitionArgument[entryName];
                if (entry instanceof Reference) {
                    dependencies.push(entry.toString());
                } else {
                    parameters[entryName] = bag.resolveValue(entry);
                }
            });


            // Due to solve algorithm issues, does not add definition without any dependency in graph
            if (dependencies.length === 0) {
                if (!definition.isAbstract()) {
                    instanceOrder.push(definition.getId());
                }
            } else {
                dependencyGraph[`${definition.getId()}`] = dependencies;
            }
        });


        const solvedDependencies = solve(dependencyGraph);
        solvedDependencies.forEach(entry => {
            if (!instanceOrder.includes(entry)) {
                instanceOrder.push(entry);
            }
        });

        //
        let fileContent = `// dumped import (from ${__filename})\n`;


        // write imports
        instanceOrder.forEach(definitionId => {
            const definition = container.getDefinition(definitionId);
            const entryName = definition.getId().replace(/\//g, '');
            let path = (definition.getFilePath() || reflectionService.getReflectionClass(definition.getResourceType()).getFilePath()).replace('.ts', '');

            path = relative(dirname(filePath), path).replace(/\\/g, '/');
            if (path.charAt(0) !== '.') {
                path = './' + path;
            }

            if (entryName.includes('::')) {
                fileContent += `import {${entryName.split('::').pop()} as ${TsDumperService.RESOURCE_PREFIX}${entryName.replace('::', '_')}}  from "${path}";\n`;
            } else {
                fileContent += `import ${TsDumperService.RESOURCE_PREFIX}${entryName} from "${path}";\n`;
            }

        });

        const parametersKey =  Object.keys(parameters);

        if (parametersKey.length > 0) {
            // write parameters
            fileContent += `\n\n// dumped parameters\n`;
            fileContent += 'const parameters = {\n';

            fileContent += parametersKey.map(parameterName => {
                const value = parameters[parameterName];
                const valueToInject = typeof value === 'string' ? `"${value}"` : value;
                return `"${parameterName}": ${valueToInject}\n`;
            }).join(',\n');

            fileContent += '};';
        }


        fileContent += `\n\n// dumped instantiation\n`;

        instanceOrder.forEach(definitionId => {
            const definition = container.getDefinition(definitionId);
            const entryName = definition.getId().replace(/\//g, '');
            let instanceNameSuffix = entryName;
            if (instanceNameSuffix.includes('::')) {
                instanceNameSuffix = `${instanceNameSuffix.replace('::', '_')}`;
            }
            const definitionArguments = definition.getArguments();
            const dumpedArguments = Object.keys(definitionArguments).map(arg => {
                const entry = definitionArguments[arg];
                if (entry instanceof Reference) {
                    let argumentNameSuffix = entry.toString().replace(/\//g, '');
                    if (argumentNameSuffix.includes('::')) {
                        argumentNameSuffix = `${argumentNameSuffix.replace('::', '_')}\n`;
                    }
                    return TsDumperService.INSTANCE_PREFIX + argumentNameSuffix;
                } else {
                    return "parameters['" + arg + "']";
                }
            });


            fileContent += `const ${TsDumperService.INSTANCE_PREFIX}${instanceNameSuffix} = new ${TsDumperService.RESOURCE_PREFIX}${instanceNameSuffix}(${dumpedArguments.join(', ')});\n`;
        });

        fileContent += '\n\n// dumped exports\n';
        // write exports
        instanceOrder.forEach(definitionId => {
            const definition = container.getDefinition(definitionId);
            let entryName = definition.getId().replace(/\//g, '');
            if (entryName.includes('::')) {
                entryName = `${entryName.replace('::', '_')}`;
            }

            fileContent += `export const ${entryName} = ${TsDumperService.INSTANCE_PREFIX}${entryName};\n`;
        });

        // exports alias : todo check to avoid collision if alias get same name as definition
        Object.keys(container.getAliases()).forEach(alias => {
            const data = container.getAlias(alias);
            // const definition = container.getDefinition(definitionId);
            const entryName = data.toString().replace(/\//g, '');
            fileContent += `export const ${alias} = ${TsDumperService.INSTANCE_PREFIX}${entryName};\n`;
        });

        fs.writeFile(
            resolve(filePath),
            fileContent,
            err => {
                if (err) {
                    console.error(err);
                }
            }
        );
    }
}
