import {scan} from 'dree';
import {readFileSync} from 'fs';
import {resolve} from 'path';
import FunctionDeclarationResolver from "./function-declaration-resolver";

import {writeFile} from 'fs';

import { parse } from "@babel/parser";
import type {ParseResult} from "@babel/parser";
import type {
    File,
    Program,
    ClassDeclaration,
    ExportDefaultDeclaration,
    TSExpressionWithTypeArguments,
    ClassMethod
} from '@babel/types';

interface ClassMetadata {
    name: string,
    superClass: string,
    implements: string[],
    constructor: any,
    methods: any
}

interface generateClassesMetadataOptions {
    path: string,
    exclude?: RegExp | RegExp[],
    debug?: boolean,
    aliasRules?: { replace: string | RegExp, by: string }[],
    extensions?: string[]
}

export function generateClassesMetadata(
    {
        path,
        exclude = /node_modules/,
        debug = false,
        aliasRules = [
            {
                replace: __dirname,
                by: 'app'
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
                .replace(/\\/g, '.');

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
            let allClassDeclarationNodes: ClassDeclaration[] = programNode.body.filter(node => node.type === 'ClassDeclaration') as ClassDeclaration[];

            if (allClassDeclarationNodes.length === 0) {
                const exportDefaultDeclaration: ExportDefaultDeclaration = programNode.body.find(
                    node => node.type === 'ExportDefaultDeclaration'
                ) as ExportDefaultDeclaration;

                if (exportDefaultDeclaration?.declaration?.type === 'ClassDeclaration') {
                    allClassDeclarationNodes = [exportDefaultDeclaration.declaration];
                }
            }

            if (allClassDeclarationNodes.length !== 1) {
                return;
            }

            const classDeclarationNode = allClassDeclarationNodes[0];
            let superClassName: string = 'undefined';
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
                implements: [],
                constructor: {},
                methods: {}
            };


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
                            }
                            else {
                                if ('name' in param) {
                                    data.name = param.name;
                                }
                                else {
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

            classesMetadata[entryName] = classMeta;
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



