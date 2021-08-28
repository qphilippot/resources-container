import {describe, it} from 'mocha';
import {expect} from 'chai';
import FunctionDeclarationResolver from "../../../src/function-declaration-resolver";
import fixtures from './function-declaration-resolver.fixtures';
const parser = new FunctionDeclarationResolver();

interface FunctionParameterDefinitionInterface {
    name: string
    type: string
    defaultValue: any
}

describe('Test from fixtures', () => {
    fixtures.forEach((testCase: any, index) => {
        let testName = `Test#${index}`;
        if (testCase.it) {
            testName = testCase.it;
        }

        it(testName, () => {
            const functionNode = parser.generateNode(testCase.expression);
            const meta = parser.retrieveSignature(functionNode);

            if (testCase.debug === true) {
                console.log(meta);
            }

            expect(meta).to.exist;
            if (typeof testCase.name === 'undefined') {
                expect(meta?.name).to.be.undefined;
            }

            else {
                expect(meta?.name).to.exist;
                expect(meta?.name).to.be.equals(testCase.name);
            }

            testCase.async === true ? expect(meta?.async).to.be.true : expect(meta?.async).to.be.false;
            expect(Array.isArray(meta?.parameters)).to.be.true;
            expect(meta?.parameters.length).to.equals(testCase.parameters.length);

            if (testCase.parameters.length > 0) {
                const parameters: Record<string, FunctionParameterDefinitionInterface> = {};
                meta.parameters.forEach((param: FunctionParameterDefinitionInterface) => {
                    parameters[param.name] = param;
                });

                testCase.parameters.forEach((param: FunctionParameterDefinitionInterface) => {
                    let foundParam = parameters[param.name];
                    expect(foundParam).to.exist;
                    expect(foundParam.name).to.be.equals(param.name);
                    expect(foundParam.type).to.be.equals(param.type);
                    if (typeof param.defaultValue === 'object') {
                        expect(foundParam.defaultValue.toString()).to.be.equals(param.defaultValue.toString());
                    }

                    else {
                        expect(foundParam.defaultValue).to.be.equals(param.defaultValue);
                    }
                });
            }

            if (testCase?.returnType === undefined) {
                expect(meta?.returnType).to.be.undefined;
            }

            else {
                expect(meta?.returnType).to.exist;
            }
        })
    });
})