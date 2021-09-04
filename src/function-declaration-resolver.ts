import * as babelParser from "@babel/parser";
import InvalidArgumentException from "./core/exception/invalid-argument.exception";

export default class FunctionDeclarationResolver {
    private parser;

    constructor() {
        this.parser = babelParser;
    }

    generateNode(code: string) {
        return this.parser.parseExpression(code, {
            sourceType: 'script',
            plugins: [
                'typescript'
            ]
        });
    }


    filterNodes(ast) {
        return ast.program.body.filter(node => node.type === 'FunctionDeclaration');
    }

    retrieveTypeFromNode(givenNode) {
        let node;
        if (givenNode.typeAnnotation?.typeAnnotation) {
            node = givenNode.typeAnnotation?.typeAnnotation;
        }

        else if (givenNode.type === 'TSTypeAnnotation') {
            node = givenNode.typeAnnotation;
        }

        else {
            node = givenNode
        }


        if (node) {

            switch (node.type) {
                case 'TSNumberKeyword':
                    return 'number';
                case 'TSStringKeyword':
                    return 'string';
                case 'TSAnyKeyword':
                    return 'any';
                case 'TSObjectKeyword':
                    return 'object';
                case 'TSUnknownKeyword':
                    return 'unknown';
                case 'TSBooleanKeyword':
                case 'BooleanLiteral':
                    return 'boolean';
                case 'TSArrayType':
                    return 'array';
                case 'TSUndefinedKeyword':
                    return 'undefined';
                case 'Identifier':
                    return 'unknown';
                case 'ObjectPattern':
                    return 'object';
                case 'TSNullKeyword':
                    return 'null';
                case 'TSUnionType':
                    return  node.types.map(node => this.retrieveTypeFromNode(node)).join('|');
                case 'AssignmentPattern':
                    return this.retrieveTypeFromNode(node.left);
                default:
                    return node.typeName.name
            }
        }

        return 'unknown';
    }

    retrieveParameter(parameterNode) {

    }

    retrieveValueFromObjectExpression(objectExpressionNode) {
        const value: any = {};

        objectExpressionNode.properties.forEach(node => {
           if (node.type === 'ObjectProperty') {
                value[node.key.name] = node.value.value;
           }
        });

        return value;
    }

    retrieveDefaultValueFromNode(assignmentNode) {
        if (assignmentNode.type !== 'AssignmentPattern') {
            throw new InvalidArgumentException(`An AssignmentPattern is expected but "${assignmentNode.type}" is given`);
        }

        if (assignmentNode.right.type === 'ObjectExpression') {
            return this.retrieveValueFromObjectExpression(assignmentNode.right);
        }

        else {
            return  assignmentNode.right.value;
        }

    }

    retrieveSignature(functionNode) {
        const name = functionNode.id?.name;
        let parameters: Array<any> = [];
        let returnType = undefined;

        functionNode.params.forEach(parameterNode => {
            let type: string = 'unknown';
            let parameterName: string = 'unknown';
            let defaultValue: any = undefined;

            if (parameterNode.type === 'AssignmentPattern') {
                // (left) a = 8 (right)
                parameterName = parameterNode.left.name;
                defaultValue = this.retrieveDefaultValueFromNode(parameterNode);
                type = this.retrieveTypeFromNode(parameterNode.left);

            }

            else {
                parameterName = parameterNode.name;
                type = this.retrieveTypeFromNode(parameterNode);
            }

            parameters.push({
                name: parameterName,
                type,
                defaultValue
            });
        });

        return {
            async: functionNode.async,
            returnType,
            name,
            parameters
        };
    }

    resolveFromString(functionCode: string) {
        try {
            const functionNode = this.generateNode(functionCode);
            return this.retrieveSignature(functionNode);
        } catch (err) {
            console.error(err);
        }
    }
}