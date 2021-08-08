import {describe, it} from 'mocha';
import {expect} from 'chai';
import ContainerBuilder from "../../../src/core/container-builder.model";
import NamedArgumentDummy from "../../fixtures/NamedArgumentDummy";
import Reference from "../../../src/core/models/reference.model";
import ResolveNamedArgumentsPass from "../../../src/core/compilation-passes/context-aware/resolve-named-arguments.pass";


describe('ResolveNamedArgumentsPass works as expected', () => {
    it('test "process" method', () => {
        const container = new ContainerBuilder();
        const definition = container.register('dummy', NamedArgumentDummy);
        definition.setArguments({
            2: 'http://api.example.com',
            'apiKey': '123',
            0: new Reference('foo')
        });


        definition.addMethodCall('setApiKey', { 'apiKey': '123' });
        const pass = new ResolveNamedArgumentsPass();

        pass.process(container);

        expect(JSON.stringify(definition.getArguments())).to.equals(JSON.stringify({
            0: new Reference('foo'),
            1: '123',
            2: 'http://api.example.com'
        }));

        expect(definition.getMethodCalls()).to.equals(['setApiKey', ['123']]);


    });
});
