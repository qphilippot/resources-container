import {describe, it} from 'mocha';
import {expect} from 'chai';
import ContainerBuilder from "../../../src/core/container/container-builder.model";
import NamedArgumentDummy from "../../fixtures/NamedArgumentDummy";
import Reference from "../../../src/core/models/reference.model";
import ResolveNamedArgumentsPass from "../../../src/core/compilation-passes/context-aware/resolve-named-arguments.pass";

function getAllMethodNames(obj) {
    let methods = new Set();
    while (obj = Reflect.getPrototypeOf(obj)) {
        let keys = Reflect.ownKeys(obj)
        keys.forEach((k) => methods.add(k));
    }
    return methods;
}

function getAllFuncs(toCheck) {
    const props = [];
    let obj = toCheck;
    do {
        // @ts-ignore
        props.push(...Object.getOwnPropertyNames(obj));
    } while (obj = Object.getPrototypeOf(obj));

    return props;
    // return props.sort().filter((e, i, arr) => {
    //     if (e!=arr[i+1] && typeof toCheck[e] == 'function') return true;
    // });
}

describe('ResolveNamedArgumentsPass works as expected', () => {
    it('test "process" method', () => {
        const container = new ContainerBuilder();
        const definition = container.register('dummy', NamedArgumentDummy);

        console.log(NamedArgumentDummy.toString());
        // console.log(getAllFuncs(new NamedArgumentDummy()));
        console.log(NamedArgumentDummy.prototype);

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
