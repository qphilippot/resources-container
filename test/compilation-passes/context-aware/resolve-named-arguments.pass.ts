import {describe} from 'mocha';

function getAllMethodNames(obj) {
    const methods = new Set();
    while (obj = Reflect.getPrototypeOf(obj)) {
        const keys = Reflect.ownKeys(obj)
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
    // todo reflection is needed.
    // it('test "process" method', () => {
    //     const container = new ContainerBuilder();
    //     const definition = container.register('dummy', NamedArgumentDummy);
    //
    //     console.log(NamedArgumentDummy.toString());
    //     // console.log(getAllFuncs(new NamedArgumentDummy()));
    //     console.log(NamedArgumentDummy.prototype);
    //
    //     definition.setArguments({
    //         2: 'http://api.example.com',
    //         'apiKey': '123',
    //         0: new Reference('foo')
    //     });
    //
    //
    //     definition.addMethodCall('setApiKey', { 'apiKey': '123' });
    //     const pass = new ResolveNamedArgumentsPass();
    //
    //     pass.process(container);
    //
    //     expect(JSON.stringify(definition.getArguments())).to.equals(JSON.stringify({
    //         0: new Reference('foo'),
    //         1: '123',
    //         2: 'http://api.example.com'
    //     }));
    //
    //     expect(definition.getMethodCalls()).to.equals(['setApiKey', ['123']]);
    //
    //
    // });
});
