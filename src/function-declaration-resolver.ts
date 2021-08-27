import * as babelParser from "@babel/parser";

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

    retrieveTypeFromNode(node) {
        const annotationNode = node.typeAnnotation?.typeAnnotation;
        if (annotationNode) {

            console.log('annotationNode', annotationNode);
            switch (annotationNode.type) {
                case 'TSNumberKeyword':
                    return 'number';
                case 'TSStringKeyword':
                    return 'string';
                default:
                    return annotationNode.typeName.name
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

    retrieveDefaultValueFromNode(node) {
        if (node.type === 'ObjectExpression') {
            return this.retrieveValueFromObjectExpression(node);
            // if (parameterNode.right.properties.length === 0) {
            //     defaultValue = {};
            // }
            //
            // else {
            //     console.log(parameterNode.right.properties);
            // }
        }

        else {
            return  node.value;
        }

    }

    retrieveSignature(functionNode) {
        console.log('function node ===>', functionNode);
        // const functionNode = this.filterNodes(ast);

        const name = functionNode.id?.name;
        let parameters: Array<any> = [];
        let returnType = undefined;

        console.log(functionNode);

        functionNode.params.forEach(parameterNode => {
            let type: string = 'unknown';
            let parameterName: string = 'unknown';
            let defaultValue: any = undefined;

            if (parameterNode.type === 'AssignmentPattern') {
                console.log(parameterNode);
                // (left) a = 8 (right)
                parameterName = parameterNode.left.name;
                defaultValue = this.retrieveDefaultValueFromNode(parameterNode.right);
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