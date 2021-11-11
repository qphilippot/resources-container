import {describe, it} from 'mocha';
import {expect} from 'chai';
import ContainerBuilder from "../../../src/core/container/container-builder.model";
import ResolveReferencesToAliasesPass from "../../../src/core/compilation-passes/standard/resolve-references-to-aliases.pass";
import CompilerInterface from "../../../src/core/interfaces/compiler.interface";
import Reference from "../../../src/core/models/reference.model";
import CircularReferenceException from "../../../src/core/exception/circular-reference.exception";
import ResourceDefinition from "../../../src/core/models/resource-definition.model";
import Alias from "../../../src/core/models/alias.model";

const createTestContainer = () => {
    const container = new ContainerBuilder();
    const compiler: CompilerInterface = container.getCompiler();
    compiler.addStep('test');
    compiler.addPass(new ResolveReferencesToAliasesPass(), 'test', 0);

    return container;
}

// TODO: frozen cause we need reflection method to check which name have arguments in methods
describe('ResolveReferencesToAliasesPass works as expected', () => {
    it('test "process" method', () => {
        const container = new ContainerBuilder();
        container.setAliasFromString('bar', 'foo');

        const definition = container.register('moo');
        definition.setArguments([ new Reference('bar') ]);

        const pass = new ResolveReferencesToAliasesPass();
        pass.process(container);

        const args = definition.getArguments();
        console.log(args);
        expect(args[0].toString()).to.equals('foo');
    });

    it('test "process" method recursively', () => {
        const container = new ContainerBuilder();
        container
            .setAliasFromString('bar', 'foo')
            .setAliasFromString('moo', 'bar');

        const definition = container.register('foobar');
        definition.setArguments([ new Reference('moo') ]);

        const pass = new ResolveReferencesToAliasesPass();
        pass.process(container);

        const args = definition.getArguments();
        expect(args[0].toString()).to.equals('foo');
    });

    it('test alias circular reference detection', () => {
        const container = new ContainerBuilder();
        container
            .setAlias('bar', new Alias('foo'))
            .setAlias('foo', new Alias('bar'));


        const pass = new ResolveReferencesToAliasesPass();
        expect(pass.process.bind(pass, container)).to.throw(
            CircularReferenceException,
            'Circular reference detected for resource "foo", path "foo->foo"'
        );
    });

    it('test resolve factory', () => {
        const container = new ContainerBuilder();
        container.register('factory', 'Factory');
        container.setAlias('factory_alias', new Alias('factory'));

        const foo = new ResourceDefinition();
        foo.setId('foo'); // for debug
        foo.setFactory([ new Reference('factory_alias'), 'createFoo' ]);
        container.setDefinition('foo', foo);

        const bar = new ResourceDefinition();
        bar.setFactory([ 'Factory', 'createFoo' ]);
        container.setDefinition('bar', bar);

        const pass = new ResolveReferencesToAliasesPass();
        pass.process(container);

        const resolvedFooFactory = container.getDefinition('foo').getFactory();
        const resolvedBarFactory = container.getDefinition('bar').getFactory();

        expect(resolvedFooFactory).to.be.not.null;
        expect(resolvedBarFactory).to.be.not.null;

        console.log(resolvedFooFactory);
        // @ts-ignore
        expect('factory').to.equals(resolvedFooFactory[0].toString())
        // @ts-ignore
        expect('Factory').to.equals(resolvedBarFactory[0].toString())
    });
});