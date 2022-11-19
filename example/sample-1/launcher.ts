import ContainerBuilder from "../../src/core/container/container-builder.model";
import {join, resolve, relative} from "path";
import {ProjectAnalyzer, ProjectMetadata, ReflectionMethodInterface} from "reflection-service";
import type {ReflectionClassInterface} from "reflection-service";


import ConfigLoaderManager from "../../src/core/models/config-loader/config-loader.manager";
import YamlContainerConfigLoader from "../../src/core/models/config-loader/yaml-container-config-loader";
import DefaultContainer from "../../src/core/container/default-container.model";
import ContainerInterface from "../../src/core/interfaces/container.interface";
import Reference from "../../src/core/models/reference.model";
import { solve } from 'dependency-solver';
import fs from 'fs';

export default class Launcher {
    private readonly container: ContainerBuilder;
    private readonly sourcePath: string;
    private projectFilesMetadata: ProjectMetadata;
    private readonly projectNamespace: string;

    private readonly configManager = new ConfigLoaderManager('config-loader-manager');

    constructor(absoluteSourcePath: string, projectNameSpace: string = 'App') {
        this.sourcePath = absoluteSourcePath;
        this.container = new DefaultContainer();

        this.projectNamespace = projectNameSpace;

        this.initializeConfigManager();

    }

    public async setup() {
        await this.analyseProjectFiles();
        this.initializeReflectionService();
    }

    private initializeConfigManager(): void {
        this.configManager.addHandler(new YamlContainerConfigLoader('yaml-config-loader'), 'yaml')
    }

    private async analyseProjectFiles(): Promise<void> {
        this.projectFilesMetadata = await ProjectAnalyzer.analyze({
            path: this.sourcePath,
            debug: process.env.NODE_ENV === 'dev',
            aliasRules: [
                {
                    replace: resolve(__dirname),
                    by: this.projectNamespace
                }
            ]
        })
    }

    private initializeReflectionService(): void {
        const reflectionService = this.container.getReflectionService();

        this.projectFilesMetadata.classes.forEach((_class: ReflectionClassInterface) => {
            reflectionService.addReflectionClass(_class);
            reflectionService.recordClass(_class.getName(), _class.getClass());
        });

        this.projectFilesMetadata.interfaces.forEach(_interface => {
            reflectionService.addReflectionInterface(_interface);
        });
    }

    private addDefinitionFromMetadata(): void {
        this.projectFilesMetadata.classes.forEach((entry: ReflectionClassInterface) => {
            const definition = this.container.register(entry.getName(), entry.getClass());


            definition
                .setFilePath(entry.getFilePath())
                .setAutowired(true);

                definition.setAbstract(entry.isAbstract());
                const _constructor: ReflectionMethodInterface = entry.getMethod('constructor');
                // check constructor arguments in order to add arguments
                _constructor?.getParameters().forEach((param, index) => {
                    definition.setArgument(
                        index,
                        // todo
                        new Reference(param.getName()));
                });
        });
    }

    public loadDefinitions(path: string): void {
        this.configManager.process({
            container: this.container,
            path
        });
    }

    public start(useConsole = true): void {
        this.container.compile();

        const mainClass = this.container.get('App/src/MainClass');

        if (useConsole) {
            console.log(mainClass.hello());
        }

        const container = this.container;
        const definitions = container.getDefinitions();
        console.log(definitions.map(def => def.getId()));
        console.log(container.getAliases());

        const dependencyGraph = {};

        let instanceOrder = [];
        definitions.forEach(definition => {
           if (definition.getId() === 'service.container') {
               return;
           }


           let definitionArgument = definition.getArguments();
           const dependencies = Object.keys(definitionArgument).length > 0
               ? definition.getArguments().map(reference => reference.toString())
               : []
           //
           // console.log(dependencies, Object.keys(dependencies).length);
           // console.log(`"${definition.getId()}" depends on: "${dependencies.join('", "')}"`);

           // Due to solve algorithm issues, does not add definition without any dependency in graph
           if (dependencies.length === 0) {
               instanceOrder.push(definition.getId());
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
           let path = definition.getFilePath() || container.getReflectionService().getReflectionClass(definition.getResourceType()).getFilePath().replace('.ts', '');
           path = relative(__dirname, path).replace(/\\/g, '/');
           if (path.charAt(0) !== '.') {
               path = './' + path;
           }

           fileContent += `import resource_${entryName} from "${path}";\n`;
        });


        fileContent += `\n\n// dumped instantiation\n`;

        instanceOrder.forEach(definitionId => {
            const definition = container.getDefinition(definitionId);
            const entryName = definition.getId().replace(/\//g, '');
            const definitionArguments = definition.getArguments();
            const instanceArguments = Object.keys(definitionArguments).length > 0
                ? definition.getArguments().map(reference => 'instance_' + reference.toString().replace(/\//g, ''))
                : []


            fileContent += `const instance_${entryName} = new resource_${entryName}(${instanceArguments.join(', ')});\n`;
        });

        fileContent += '\n\n// dumped exports\n';
        // write exports
        instanceOrder.forEach(definitionId => {
            const definition = container.getDefinition(definitionId);
            const entryName = definition.getId().replace(/\//g, '');
            fileContent += `export const ${entryName} = instance_${entryName};\n`;
        });

        // exports alias : todo check to avoid collision if alias get same name as definition
        Object.keys(container.getAliases()).forEach(alias => {
            const data = container.getAlias(alias);
            console.log(alias)
            // const definition = container.getDefinition(definitionId);
            const entryName = data.toString().replace(/\//g, '');
            fileContent += `export const ${alias} = instance_${entryName};\n`;
        });

        fs.writeFile(
            resolve(join(__dirname, './dumped_container.ts')),
            fileContent,
            err => {
                if (err) {
                    console.error(err);
                }
            }
        );
    }

    public getContainer(): ContainerInterface {
        return this.container;
    }
}
