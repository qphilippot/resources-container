import {scan} from 'dree';
import {readFileSync, writeFile} from 'fs';
import {resolve} from 'path';
import FunctionDeclarationResolver from "./function-declaration-resolver";

import type {ParseResult} from "@babel/parser";
import {parse} from "@babel/parser";
import type {
    ClassDeclaration,
    ClassMethod,
    ExportDefaultDeclaration,
    ExportNamedDeclaration,
    File,
    Program,
    TSExpressionWithTypeArguments
} from '@babel/types';

interface ClassMetadata {
    name: string,
    superClass: string | null,
    abstract: boolean,
    implements: string[],
    constructor: any,
    methods: any,
    export: {
        type: string,
        path: string
    }
}

interface generateClassesMetadataOptions {
    path: string,
    exclude?: RegExp | RegExp[],
    debug?: boolean,
    aliasRules?: { replace: string | RegExp, by: string }[],
    extensions?: string[]
}

// todo as babel does not export this interface, complete it here...
type BaseNode = ClassDeclaration | ExportDefaultDeclaration | ExportNamedDeclaration;

interface ClassDeclarationWrapper {
    node: ClassDeclaration,
    parentNodeType: string
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

export function generateClassesMetadata(
    {
        path,
        exclude = /node_modules/,
        debug = false,
        aliasRules = [
            {
                replace: __dirname,
                by: 'App'
            }
        ],
        extensions = ['ts']
    }: generateClassesMetadataOptions
): Record<string, ClassMetadata> {
    const classesMetadata: Record<string, ClassMetadata> = {};
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
            let alias = element.path;
            aliasRules.forEach(rule => {
                alias = alias.replace(rule.replace, rule.by);
            });

            const entryName = alias
                // remove file's extension
                .replace(/\..*$/, '')
                // replace path separator by "."
                .replace(/\\/g, '/');

            const content = readFileSync(element.path, 'utf-8');
            const fileNode: ParseResult<File> = parse(content, {
                sourceType: 'module',
                plugins: [
                    'typescript'
                ]
            });

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

            let allClassDeclarationNodes: ClassDeclarationWrapper[] = findClassDefinitionsInProgram(programNode);
            const hasMultipleDeclarationInProgram = allClassDeclarationNodes.length > 1;

            allClassDeclarationNodes.forEach(classDeclarationWrapper => {
                const classDeclarationNode = classDeclarationWrapper.node;

                let superClassName: string | null = null;

                if (
                    classDeclarationNode.superClass !== null &&
                    typeof classDeclarationNode.superClass !== 'undefined' &&
                    'name' in classDeclarationNode.superClass
                ) {
                    superClassName = classDeclarationNode.superClass.name;
                }

                const classMeta: ClassMetadata = {
                    name: classDeclarationNode.id.name,
                    superClass: superClassName,
                    abstract: classDeclarationNode.abstract ?? false,
                    implements: [],
                    constructor: {},
                    methods: {},
                    export: {
                        path: element.path,
                        type: 'default'
                    }
                };

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
                            classMeta.implements.push(expression.name);
                        }
                    }
                });


                classDeclarationNode.body.body.filter(node => node.type === 'ClassMethod').forEach(
                    (node: ClassMethod) => {
                        if (node.kind === 'constructor') {
                            const parameters = parser.retrieveSignature(node).parameters;
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

                const finalEntryName = entryName + (hasMultipleDeclarationInProgram ? `::${classMeta.name.toLowerCase()}` : '');
                classesMetadata[finalEntryName] = classMeta;
            });
        }
    );

    if (debug === true) {
        writeFile(
            'resolved-meta-class.json',
            JSON.stringify(classesMetadata, null, 4),
            err => {
                console.error(err)
            }
        );
    }

    return classesMetadata;
}



