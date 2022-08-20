import {scan} from 'dree';
import {readFileSync, writeFile} from 'fs';
import {resolve} from 'path';
import FunctionDeclarationResolver from "./function-declaration-resolver";

import type {ParseResult} from "@babel/parser";
import {parse} from "@babel/parser";
import type {
    ClassDeclaration,
    TSInterfaceDeclaration,
    ClassMethod,
    ExportDefaultDeclaration,
    ExportNamedDeclaration,
    File,
    ImportDeclaration,
    Program,
    TSExpressionWithTypeArguments, TSMethodSignature
} from '@babel/types';

export interface CodeElementMetadata {
    kind: string,
    namespace: string,
    name: string,
    implements: ObjectLocation[],
    methods: any,
    imports: any,
    export: {
        type: string,
        path: string
    }
}
export interface ClassMetadata extends CodeElementMetadata {
    superClass:  ObjectLocation | null,
    abstract: boolean,
    constructor: any[],
    kind:'class'
}

export interface InterfaceMetadata extends CodeElementMetadata {
    kind:'interface'
}

interface generateClassesMetadataOptions {
    separator?: string,
    path: string,
    exclude?: RegExp | RegExp[],
    debug?: boolean,
    aliasRules?: AliasRule[],
    extensions?: string[]
}

// todo as babel does not export this interface, complete it here...
type BaseNode = ClassDeclaration | ExportDefaultDeclaration | ExportNamedDeclaration;

interface ClassDeclarationWrapper {
    node: ClassDeclaration,
    parentNodeType: string
}

interface InterfaceDeclarationWrapper {
    node: TSInterfaceDeclaration,
    parentNodeType: string
}

export interface ObjectLocation {
    name: string,
    namespace: string
}

function retrieveImportsFromProgramNode(program: Program): ObjectLocation[] {
    const imports: ObjectLocation[] = [];
    (program.body.filter(node => node.type === 'ImportDeclaration') as ImportDeclaration[]).forEach(
        (importDeclarationNode: ImportDeclaration) => {
            importDeclarationNode.specifiers.forEach(specifier => {
                imports.push({
                    name: specifier.local?.name,
                    namespace: importDeclarationNode.source.value
                });
            });
        }
    );

    return imports;
}

function findInterfaceDefinitionInProgram(program: Program): InterfaceDeclarationWrapper[] {
    const declarations: InterfaceDeclarationWrapper[] = [];
    program.body.filter(node => node.type === 'TSInterfaceDeclaration').forEach(node => {
        declarations.push({
            node: node as TSInterfaceDeclaration,
            parentNodeType: 'Program'
        });
    });

    program.body.filter(child => child.type === 'ExportNamedDeclaration').forEach((entry: ExportDefaultDeclaration) => {
        // @ts-ignore
        if (entry.declaration.type === 'TSInterfaceDeclaration') {
            declarations.push({
                node: entry.declaration as unknown as TSInterfaceDeclaration,
                parentNodeType: 'ExportNamedDeclaration'
            });
        }
    });

    const exportDefaultDeclarationNode = program.body.find(
        node => node.type === 'ExportDefaultDeclaration'
    ) as ExportDefaultDeclaration;

    // @ts-ignore
    if (exportDefaultDeclarationNode?.declaration?.type === 'TSInterfaceDeclaration') {
        declarations.push({
            node: exportDefaultDeclarationNode.declaration as unknown as TSInterfaceDeclaration,
            parentNodeType: 'ExportDefaultDeclaration'
        });
    }

    return declarations;
}

function findClassDefinitionsInProgram(program: Program): ClassDeclarationWrapper[] {
    const declarations: ClassDeclarationWrapper[] = [];
    program.body.filter(node => node.type === 'ClassDeclaration').forEach(node => {
        declarations.push({
            node: node as ClassDeclaration,
            parentNodeType: 'Program'
        });
    });


    program.body.filter(child => child.type === 'ExportNamedDeclaration').forEach((entry: ExportDefaultDeclaration) => {
        if (entry.declaration.type === 'ClassDeclaration') {
            declarations.push({
                node: entry.declaration as unknown as ClassDeclaration,
                parentNodeType: 'ExportNamedDeclaration'
            });
        }
    });


    const exportDefaultDeclarationNode = program.body.find(
        node => node.type === 'ExportDefaultDeclaration'
    ) as ExportDefaultDeclaration;

    if (exportDefaultDeclarationNode?.declaration?.type === 'ClassDeclaration') {
        declarations.push({
            node: exportDefaultDeclarationNode.declaration as unknown as ClassDeclaration,
            parentNodeType: 'ExportDefaultDeclaration'
        });
    }

    return declarations;
}

function getNamespaceFromNamespacedEntry(entry: string, separator: string = '/'): string {
    const tokens = entry.split(separator);
    tokens.pop();
    return tokens.join(separator);
}

interface AliasRule {
    replace: string | RegExp,
    by: string
}

function getNamespacedEntry(name: string, rules: AliasRule[], separator: string = '/'): string {
    let alias = name;
    rules.forEach(rule => {
        alias = alias.replace(rule.replace, rule.by);
    });

    alias = alias.replace(/.(min.)?(js|ts|mjs)/, '').replace(/([-_.][a-z])/ig, ($1) => {
        return $1.toUpperCase()
            .replace('-', '')
            .replace('.', '')
            .replace('_', '');
    });

    return alias.replace(/\\/g, separator);
}

export function generateClassesMetadata(
    {
        path,
        exclude = /node_modules/,
        debug = false,
        separator = '/',
        aliasRules = [
            {
                replace: __dirname,
                by: 'App'
            }
        ],
        extensions = ['ts']
    }: generateClassesMetadataOptions
): Record<string, CodeElementMetadata> {
    const projectMetadata: Record<string, CodeElementMetadata> = {};
    const parser = new FunctionDeclarationResolver();
    scan(
        resolve(path),
        {
            exclude,
            hash: false,
            depth: 10,
            size: false,
            extensions
        },

        element => {
            const content = readFileSync(element.path, 'utf-8');
            const fileNode: ParseResult<File> = parse(content, {
                sourceType: 'module',
                plugins: [
                    'typescript'
                ]
            });

            const entryName = getNamespacedEntry(element.path, aliasRules, separator);
            const programNode: Program = fileNode.program;
            if (debug === true) {
                writeFile(
                    'program.json',
                    JSON.stringify(programNode, null, 4),
                    err => {
                        console.error(err)
                    }
                );
            }

            const allClassDeclarationNodes: ClassDeclarationWrapper[] = findClassDefinitionsInProgram(programNode);
            const hasMultipleDeclarationInProgram = allClassDeclarationNodes.length > 1;

            allClassDeclarationNodes.forEach(classDeclarationWrapper => {
                const classDeclarationNode = classDeclarationWrapper.node;

                const classMeta: ClassMetadata = {
                    kind: 'class',
                    namespace: getNamespaceFromNamespacedEntry(entryName, separator),
                    name: classDeclarationNode.id.name,
                    superClass: null,
                    abstract: classDeclarationNode.abstract ?? false,
                    implements: [],
                    constructor: [],
                    methods: {},
                    imports: retrieveImportsFromProgramNode(programNode),
                    export: {
                        path: element.path,
                        type: 'default'
                    }
                };

                // rewrite local import path by their namespace
                if (classMeta.namespace?.length > 1) {
                    classMeta.imports.forEach((_import, index) => {
                        // Path is absolute (add it to path helper)
                        // if (resolve(_import.path) == path.normalize(_import.path)) {
                        //     // do some stuff
                        // } else {
                        _import.namespace = getNamespacedEntry(
                            resolve(element.path, '../', _import.namespace),
                            aliasRules,
                            separator
                        );
                    });
                }

                if (
                    classDeclarationNode.superClass !== null &&
                    typeof classDeclarationNode.superClass !== 'undefined' &&
                    'name' in classDeclarationNode.superClass
                ) {
                    classMeta.superClass = resolveLocalResourceLocation(
                        classDeclarationNode.superClass.name,
                        classMeta.imports,
                        entryName
                    );
                }

                if (classDeclarationWrapper.parentNodeType === 'ExportDefaultDeclaration') {
                    classMeta.export.type = 'export:default';
                } else if (classDeclarationWrapper.parentNodeType === 'ExportNamedDeclaration') {
                    classMeta.export.type = 'export:named';
                } else {
                    classMeta.export.type = 'inline';
                }


                classDeclarationNode?.implements?.forEach(node => {
                    if (node.type === 'TSExpressionWithTypeArguments') {
                        const expression = (node as TSExpressionWithTypeArguments).expression;
                        if ("name" in expression) {
                            classMeta.implements.push(resolveLocalResourceLocation(
                                expression.name,
                                classMeta.imports,
                                entryName
                            ));
                        }
                    }
                });


                classDeclarationNode.body.body.filter(node => node.type === 'ClassMethod').forEach(
                    (node: ClassMethod) => {
                        if (node.kind === 'constructor') {
                            const parameters = parser.retrieveSignature(node, classMeta.imports).parameters;
                            classMeta.constructor = parameters;
                        } else if (node.kind === 'method') {
                            let nodeName = '';

                            if ("name" in node.key) {
                                nodeName = node.key.name;
                            }

                            const methodMeta = {
                                static: node.static,
                                computed: node.computed,
                                async: node.async,
                                name: nodeName,
                                parameters: node.params.map(param => {
                                    const data = {
                                        name: '',
                                        type: 'unkown',
                                        defaultValue: undefined
                                    };

                                    const isAssignmentPattern = param.type === 'AssignmentPattern';

                                    if (isAssignmentPattern && 'left' in param && 'name' in param.left) {
                                        data.name = param.left.name;
                                    } else {
                                        if ('name' in param) {
                                            data.name = param.name;
                                        } else {
                                            data.name = 'undefined';
                                        }
                                    }

                                    data.type = parser.retrieveTypeFromNode(param);

                                    if (isAssignmentPattern) {
                                        data.defaultValue = parser.retrieveDefaultValueFromNode(param)
                                    }


                                    return data;
                                }),
                                returnType: node.returnType ? parser.retrieveTypeFromNode(node.returnType) : 'unknown'
                            };

                            classMeta.methods[methodMeta.name] = methodMeta;
                        }
                    });

                const finalEntryName = getFinalEntryName(entryName, hasMultipleDeclarationInProgram, classMeta);
                projectMetadata[finalEntryName] = classMeta;
            });

            const interfaceDeclarationNodes = findInterfaceDefinitionInProgram(programNode);

            interfaceDeclarationNodes.forEach(interfaceDeclaration => {
                const interfaceNode = interfaceDeclaration.node;

                const interfaceMeta: InterfaceMetadata = {
                    kind: 'interface',
                    namespace: getNamespaceFromNamespacedEntry(entryName, separator),
                    name: interfaceNode.id.name,
                    implements: [],
                    methods: {},
                    imports: retrieveImportsFromProgramNode(programNode),
                    export: {
                        path: element.path,
                        type: 'default'
                    }
                };

                // rewrite local import path by their namespace
                if (interfaceMeta.namespace?.length > 1) {
                    interfaceMeta.imports.forEach((_import, index) => {
                        // Path is absolute (add it to path helper)
                        // if (resolve(_import.path) == path.normalize(_import.path)) {
                        //     // do some stuff
                        // } else {
                        _import.namespace = getNamespacedEntry(
                            resolve(element.path, '../', _import.namespace),
                            aliasRules,
                            separator
                        );
                    });
                }


                if (interfaceDeclaration.parentNodeType === 'ExportDefaultDeclaration') {
                    interfaceMeta.export.type = 'export:default';
                } else if (interfaceDeclaration.parentNodeType === 'ExportNamedDeclaration') {
                    interfaceMeta.export.type = 'export:named';
                } else {
                    interfaceMeta.export.type = 'inline';
                }


                interfaceNode?.extends?.forEach(node => {
                    if (node.type === 'TSExpressionWithTypeArguments') {
                        const expression = (node as TSExpressionWithTypeArguments).expression;
                        if ("name" in expression) {
                            interfaceMeta.implements.push(resolveLocalResourceLocation(
                                expression.name,
                                interfaceMeta.imports,
                                entryName
                            ));
                        }
                    }
                });


                interfaceNode.body.body.filter(node => node.type === 'TSMethodSignature').forEach(
                    (node: TSMethodSignature) => {
                        if (node.kind === 'method') {
                            let nodeName = '';

                            if ("name" in node.key) {
                                nodeName = node.key.name;
                            }

                            const methodMeta = {
                                static: false,
                                computed: node.computed,
                                async: false, // todo effectuer un test sur le type de retour
                                name: nodeName,
                                parameters: node.parameters.map(param => {
                                    const data = {
                                        name: '',
                                        type: 'unkown',
                                        defaultValue: undefined
                                    };


                                        if ('name' in param) {
                                            data.name = param.name;
                                        } else {
                                            data.name = 'undefined';
                                        }


                                    data.type = parser.retrieveTypeFromNode(param);



                                    return data;
                                }),

                                returnType: 'unknown until babel 8.0'
                            };

                            interfaceMeta.methods[methodMeta.name] = methodMeta;
                        }
                    });

                const finalEntryName = getFinalEntryName(entryName, hasMultipleDeclarationInProgram, interfaceMeta);
                projectMetadata[finalEntryName] = interfaceMeta;
            });
        }
    );

    if (debug === true) {
        writeFile(
            'resolved-meta-class.json',
            JSON.stringify(projectMetadata, null, 4),
            err => {
                console.error(err)
            }
        );
    }

    return projectMetadata;
}


function getFinalEntryName(entryName: string, hasMultipleDeclarationInProgram: boolean, meta: CodeElementMetadata): string {
    return entryName + (
        (hasMultipleDeclarationInProgram && meta.export.type !== 'export:default')
            ? `::${meta.name.toLowerCase()}`
            : ''
    );
}

function resolveLocalResourceLocation(entry: string, _imports: ObjectLocation[], currentNamespace: string): ObjectLocation {
    const importedObjectLocation = _imports.find(location => location.name === entry);
    const location = {
        name: entry,
        namespace: ''
    };

    if (importedObjectLocation) {
        location.namespace = importedObjectLocation.namespace;
    } else {
        location.namespace = `${currentNamespace}::${entry}`;
    }

    return location;
}


