import {describe, it} from 'mocha';
import {expect} from 'chai';
import ContainerBuilder from "../../../src/core/container/container-builder.model";
import Alias from "../../../src/core/models/alias.model";
import ResolveParameterPlaceHoldersPass
    from "../../../src/core/compilation-passes/standard/resolve-parameter-placeholders.pass";
import ParameterNotFoundException from "../../../src/core/exception/parameter-not-found.exception";

const createTestContainer = (): ContainerBuilder => {
    const containerBuilder = new ContainerBuilder();

    containerBuilder.setParameter('foo.class', 'Foo');
    containerBuilder.setParameter('foo.factory.class', 'FooFactory');
    containerBuilder.setParameter('foo.arg1', 'bar');
    containerBuilder.setParameter('foo.arg2', {'%foo.arg1%': 'baz'});
    containerBuilder.setParameter('foo.method', 'foobar');
    containerBuilder.setParameter('foo.property.name', 'bar');
    containerBuilder.setParameter('foo.property.value', 'baz');
    containerBuilder.setParameter('foo.file', 'foo.js');
    containerBuilder.setParameter('alias.id', 'bar');

    const fooDefinition = containerBuilder.register('foo', '%foo.class%');
    fooDefinition.setFactory(['%foo.factory.class%', 'getFoo']);
    fooDefinition.setArguments(['%foo.arg1%', {'%foo.arg1%': 'baz'}]);
    fooDefinition.addMethodCall('%foo.method%', ['%foo.arg1%', '%foo.arg2%']);
    fooDefinition.setInjectionProperty('%foo.property.name%', '%foo.property.value%');
    fooDefinition.setFilePath('%foo.file%');
    fooDefinition.setBindings({'baz': '%env(BAZ)%'});

    containerBuilder.setAlias('%alias.id%', new Alias('foo'));

    return containerBuilder;
}

describe('ResolveReferencesToAliasesPass works as expected', () => {
    let fooDefinition;
    let container;
    before(() => {
        const pass = new ResolveParameterPlaceHoldersPass();
        container = createTestContainer();
        pass.process(container);
        fooDefinition = container.getDefinition('foo');
    });

    it('resolves parameters', () => {
        expect(fooDefinition.getResourceType()).to.equals('Foo');
    });

    it('resolves factory\'s parameters', () => {
        expect(JSON.stringify(fooDefinition.getFactory())).to.equals('["FooFactory","getFoo"]');
    });

    it('resolves argument\'s parameters', () => {
        expect(JSON.stringify(fooDefinition.getArguments())).to.equals('{"0":"bar","1":{"bar":"baz"}}');
    });

    it('resolves method call\'s parameters', () => {
        expect(JSON.stringify(fooDefinition.getMethodCalls())).to.equals('[["foobar",["bar",{"bar":"baz"}],false]]');
    });


    it('resolves injection properties', () => {
        expect(JSON.stringify(fooDefinition.getInjectionProperties())).to.equals('{"bar":"baz"}');
    });

    it('resolves path', () => {
        expect(fooDefinition.getFilePath()).to.equals('foo.js');
    });

    it('resolves alias', () => {
        expect(container.getAlias('bar').toString()).to.equals('foo');
    });

    it('resolves bindings', () => {
        const {baz} = container.getDefinition('foo').getBindings();
        expect(baz.getValues()[0].value).to.equals(container.getParameterBag().resolveValue('%env(BAZ)%'));
    });

    it('throws an exception on parameter not found', () => {
        const builder = new ContainerBuilder();
        const definition = builder.register('baz_service_id');
        definition.setArgument(0, '%non_existent_param%');

        const pass = new ResolveParameterPlaceHoldersPass();
        expect(pass.process.bind(pass, builder)).to.throw(
            ParameterNotFoundException,
            'The service "baz_service_id" has a dependency on a non-existent parameter "non_existent_param".'
        );
    });

    it('could quiet parameter not found exception', () => {
        const builder = new ContainerBuilder();
        const definition = builder.register('baz_service_id');
        definition.setArgument(0, '%non_existent_param%');

        const pass = new ResolveParameterPlaceHoldersPass();
        pass.enableThrowExceptionOnResolve(false);
        pass.process(builder);

        expect(definition.getErrors().length).to.equals(1);
    });
});
