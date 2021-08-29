import { scan } from 'dree';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import FunctionDeclarationResolver from "./function-declaration-resolver";

import { writeFile } from 'fs';

import * as babelParser from "@babel/parser";

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
    aliasRules?:  { replace:  string | RegExp, by: string }[],
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
    } : generateClassesMetadataOptions
) : Record<string, ClassMetadata> {
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
            const fileNode = babelParser.parse(content, {
                sourceType: 'module',
                plugins: [
                    'typescript'
                ]
            });


            const programNode = fileNode.program;
            if (debug === true) {
                writeFile(
                    'program.json',
                    JSON.stringify(programNode, null, 4),
                    err => {
                        console.error(err)
                    }
                );
            }
            let allClassDeclarationNodes = programNode.body.filter(node => node.type === 'ClassDeclaration');

            if (allClassDeclarationNodes.length === 0) {
                const exportDefaultDeclaration = programNode.body.find(
                    node => node.type === 'ExportDefaultDeclaration'
                );

                if (exportDefaultDeclaration?.declaration?.type === 'ClassDeclaration') {
                    allClassDeclarationNodes = [ exportDefaultDeclaration.declaration ];
                }
            }

            if (allClassDeclarationNodes.length !== 1) {
                return;
            }

            const classDeclarationNode = allClassDeclarationNodes[0];

            const classMeta : ClassMetadata = {
                name: classDeclarationNode.id.name,
                superClass: classDeclarationNode.superClass?.name,
                implements: [],
                constructor: {},
                methods: {}
            };


            try {
                    classDeclarationNode?.implements?.forEach(node => {
                    if (node.type === 'TSExpressionWithTypeArguments') {
                        classMeta.implements.push(node?.expression?.name);
                    }
                });

            }

            catch (err) {
                console.log(element.path);
                console.log(classDeclarationNode);
                throw err;
            }
            classDeclarationNode.body.body.filter(node => node.type === 'ClassMethod').forEach(node => {
                if (node.kind === 'constructor') {
                    const paramters = parser.retrieveSignature(node).parameters;
                    classMeta.constructor = paramters;
                }

                else if (node.kind === 'method') {
                    const methodMeta = {
                        static: node.static,
                        computed: node.computed,
                        async: node.async,
                        name: node.key.name,
                        parameters: node.params.map(param => {
                            try {
                                return {
                                    name: param.name,
                                    type: parser.retrieveTypeFromNode(param),
                                    defaultValue: parser.retrieveDefaultValueFromNode(param)
                                }
                            }

                            catch (err) {
                                console.log(element.path);
                                console.log(param);
                                throw err;
                            }

                        })
                    };

                    // const methodSignature = parser.retrieveSignature(node.body.body);
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



