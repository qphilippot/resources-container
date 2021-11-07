import {describe, it} from 'mocha';
import {expect} from 'chai';
import ContainerBuilder from "../../src/core/container-builder.model";
import ResourceDefinition from "../../src/core/models/resource-definition.model";
import FooClass from "./fixtures/FooClass";
import BarClass from "./fixtures/BarClass";
import FooBarClass from "./fixtures/FooBarClass";
import ResourceNotFoundException from "../../src/core/exception/resource-not-found.exception";
import exp = require("constants");

describe('container-builder tests', function () {
    it('add default service.container definition', function () {
        const container = new ContainerBuilder();

        expect(container.getDefinitions().length).to.equals(1);
        expect(container.hasDefinition('service.container')).to.be.true;

        const definition = container.getDefinition('service.container');
        expect(definition instanceof ResourceDefinition).to.be.true;
        expect(definition.isSynthetic()).to.be.true;
        expect(definition.getResourceType()).to.equals(ContainerBuilder);
    });

    it('correctly use definitions', function () {
        const container = new ContainerBuilder();
        const definitions = {
            foo: new ResourceDefinition('Bar\FooClass'),
            bar: new ResourceDefinition('BarClass')
        };

        // emulate reflexivity
        container.getReflexionService()
            .recordClass('Bar\FooClass', FooClass)
            .recordClass('BarClass', BarClass)
            .recordClass('FooBarClass', FooBarClass);

        container.setDefinitions(definitions);

        // setDefinitions() sets the service definitions
        expect(JSON.stringify(Object.values(definitions))).to.equals(JSON.stringify(container.getDefinitions()))
        expect(container.hasDefinition('foo')).to.be.true;
        expect(container.hasDefinition('foobar')).to.be.false;

        const foobarDefinition = new ResourceDefinition('FooBarClass');
        container.setDefinition('foobar', foobarDefinition);
        expect(foobarDefinition).to.equals(container.getDefinition('foobar'));
        expect(foobarDefinition).to.equals(container.setDefinition('foobar', foobarDefinition));

        const duplicatedDefinition = {
            foobar: new ResourceDefinition('FooBarClass')
        };

        container.addDefinitions(duplicatedDefinition);
        expect(
            JSON.stringify([...Object.values(definitions), ...Object.values(duplicatedDefinition)])
        ).to.equals(JSON.stringify(container.getDefinitions()))
    });

    it('throws an exception using getDefinition and unknown definition id', function () {
        const container = new ContainerBuilder();

        expect(container.getDefinition.bind(container, 'baz')).to.throw(
            ResourceNotFoundException,
            'You have requested a non-existent service "baz".'
        );
    });

    it('register add a definition', function () {
        const container = new ContainerBuilder();
        container.register('foo', 'Bar\FooClass');
        expect(container.hasDefinition('foo')).to.be.true;
        expect(container.getDefinition('foo') instanceof ResourceDefinition).to.be.true;
    });

    it('can set definition as autowired', function () {
       const container = new ContainerBuilder();
       container.autowire('foo', 'Bar\FooClass');

       expect(container.hasDefinition('foo')).to.be.true;
       expect(container.getDefinition('foo').isAutowired()).to.be.true;
    });

    it('check if definitions, alias, or resource exists using has method', function () {
        const container = new ContainerBuilder();
        expect(container.has('foo')).to.be.false;

        container.register('foo', 'Bar\FooClass');
        expect(container.has('foo')).to.be.true;

        container.set('bar', Date);
        expect(container.has('bar')).to.be.true;
    });

    it('throws an exception trying to get unknown service', function () {
        const container = new ContainerBuilder();
        expect(container.get.bind(container, 'foo')).to.throw(
            ResourceNotFoundException,
            'You have requested a non-existent service "foo".'
        );
    })
});