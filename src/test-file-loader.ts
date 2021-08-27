import * as dree from 'dree';

import {readFileSync} from 'fs';
import ReflexionService from "./utils/reflexion.service";
import * as path from 'path';
import FunctionDeclarationResolver from "./function-declaration-resolver";

const parser = new FunctionDeclarationResolver();
import * as babelParser from "@babel/parser";

function idempotency(a: number | null, b) {
}

// function a(reflexionService: ReflexionService) {}
// function boo(numdd: number = 10) {}

const reflector = new ReflexionService();

const mappemonde = {};


const tree = dree.scan(
    path.resolve(__dirname, './services/rex.service.ts'),
    {
        exclude: /node_modules/,
        hash: false,
        depth: 2,
        size: false,
        extensions: ['ts']
    },
    function (element, stat) {
        console.log("===> on va parser : ", element.path);
        const content = readFileSync(element.path, 'utf-8');
        const fileNode = babelParser.parse(content, {
            sourceType: 'module',
            plugins: [
                'typescript'
            ]
        });

        const programNode = fileNode.program;
        const allClassDeclarationNodes = programNode.body.filter(node => node.type === 'ClassDeclaration');

        if (allClassDeclarationNodes.length !== 1) {
            return;
        }

        const classDeclarationNode = allClassDeclarationNodes[0];

        console.log(classDeclarationNode);

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

                console.log('PUTAIN DE MET>HODE', node)
                const methodMeta = {
                    static: node.static,
                    computed: node.computed,
                    name: node.key.name,
                    parameters: node.params.map(param => {
                        return {
                            name: param.name,
                            type: parser.retrieveTypeFromNode(param),
                            defaultValue: parser.retrieveDefaultValueFromNode(param)
                        }
                    })
                };

                // const methodSignature = parser.retrieveSignature(node.body.body);
                classMeta.methods[methodMeta.name] = methodMeta;
            }
        });

        console.log(JSON.stringify(classMeta, null, 4));
    }
);