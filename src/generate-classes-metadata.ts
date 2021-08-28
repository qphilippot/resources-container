import { scan } from 'dree';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import FunctionDeclarationResolver from "./function-declaration-resolver";

import { writeFile } from 'fs';

import * as babelParser from "@babel/parser";

export function generateClassesMetadata(
    {
        path,
        exclude = /node_modules/,
        debug = false,
        extensions = ['ts']
    } : {
        path: string,
        exclude?: RegExp | RegExp[],
        debug?: boolean,
        extensions?: string[]
    }
) {
    const classesMetadata = {};
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
            const entryName = element.path
                .replace(__dirname, 'app')
                .replace('.service.ts', '')
                .replace(/\\/g, '.');

            const content = readFileSync(element.path, 'utf-8');
            const fileNode = babelParser.parse(content, {
                sourceType: 'module',
                plugins: [
                    'typescript'
                ]
            });


            const programNode = fileNode.program;
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

            const classMeta = {
                name: classDeclarationNode.id.name,
                superClass: classDeclarationNode.superClass?.name,
                constructor: {},
                methods: {}
            };


            classDeclarationNode.body.body.filter(node => node.type === 'ClassMethod').forEach(node => {
                if (node.kind === 'constructor') {
                    const paramters = parser.retrieveSignature(node).parameters;
                    classMeta.constructor = paramters;
                }

                else if (node.kind === 'method') {
                    const methodMeta = {
                        static: node.static,
                        computed: node.computed,
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



