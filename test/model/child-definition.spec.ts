import {describe, it} from 'mocha';
import {expect} from 'chai';
import ChildDefinition from "../../src/core/models/child-definition.model";
import OutOfBoundsException from "../../src/core/exception/out-of-bounds.exception";

describe('child-definition behavior', function () {
    it('construct a valid Definition', function () {
        const definition = new ChildDefinition('foo');
        expect(definition.getParentDefinitionId()).to.equals('foo');
        expect(JSON.stringify(definition.getChanges())).to.equals('{}');
    });

    // [ 'ResourceType', 'Factory', 'Configurator', 'File'].forEach(property => {
    it('set/get property type properly', function () {
        const definition = new ChildDefinition('foo');
        expect(definition.getResourceType()).to.be.undefined;

        // test chain method
        expect(definition).to.equals(definition.setResourceType('foo'));
        expect('foo').to.equals(definition.getResourceType());

        expect(JSON.stringify({'type': true})).to.equals(JSON.stringify(definition.getChanges()));
    });

    it('set/get property factory properly', function () {
        const definition = new ChildDefinition('foo');
        expect(definition.getFactory()).to.be.null;

        // test chain method
        expect(definition).to.equals(definition.setFactory('foo'));
        expect('foo').to.equals(definition.getFactory());

        expect(JSON.stringify({'factory': true})).to.equals(JSON.stringify(definition.getChanges()));
    });

    it('set/get property configurator properly', function () {
        const definition = new ChildDefinition('foo');
        expect(definition.getConfigurator()).to.be.null;

        // test chain method
        expect(definition).to.equals(definition.setConfigurator('foo'));
        expect('foo').to.equals(definition.getConfigurator());

        expect(JSON.stringify({'configurator': true})).to.equals(JSON.stringify(definition.getChanges()));
    });

    it('set/get property "file path" properly', function () {
        const definition = new ChildDefinition('foo');
        expect(definition.getFilePath().length).to.equals(0);

        // test chain method
        expect(definition).to.equals(definition.setFilePath('foo'));
        expect('foo').to.equals(definition.getFilePath());

        expect(JSON.stringify({'file': true})).to.equals(JSON.stringify(definition.getChanges()));
    });

    it('can set child definition as public', function () {
        const definition = new ChildDefinition('foo');
        expect(definition.isPublic()).to.be.false;
        expect(definition).to.equals(definition.setPublic(true));
        expect(JSON.stringify({'public': true})).to.equals(JSON.stringify(definition.getChanges()));
    });


    it('can set child definition as lazy', function () {
        const definition = new ChildDefinition('foo');
        expect(definition.isLazy()).to.be.false;
        expect(definition).to.equals(definition.setLazy(false));
        expect(definition.isLazy()).to.be.false;
        expect(JSON.stringify({'lazy': true})).to.equals(JSON.stringify(definition.getChanges()));
    });

    it('can set child definition as autowired', function () {
        const definition = new ChildDefinition('foo');
        expect(definition.isAutowired()).to.be.false;
        expect(definition).to.equals(definition.setAutowired(true));
        expect(definition.isAutowired()).to.be.true;
        expect(JSON.stringify({'autowired': true})).to.equals(JSON.stringify(definition.getChanges()));
    });

    it('setArguments', function () {
        const definition = new ChildDefinition('foo');

        expect(JSON.stringify(definition.getArguments())).to.equals('{}');
        expect(definition.replaceArgument('0', 'foo')).to.equals(definition);
        expect(JSON.stringify({'index_0': 'foo'})).to.equals(JSON.stringify(definition.getArguments()));
    });

    it('replaceArgument', function () {
        const definition = new ChildDefinition('foo');
        definition.setArguments({
            0: 'foo',
            1: 'bar'
        });

        expect(definition.getArgument('0')).to.equals('foo');
        expect(definition.getArgument('1')).to.equals('bar');

        definition.replaceArgument('1', 'baz');

        expect(definition.getArgument('0')).to.equals('foo');
        expect(definition.getArgument('1')).to.equals('baz');

        const expectedArguments = {
            0: 'foo',
            1: 'bar',
            index_1: 'baz',
        }

        expect(JSON.stringify(expectedArguments)).to.equals(JSON.stringify(definition.getArguments()));

        expect(definition).to.equals(definition.replaceArgument('$bar', 'val'));
        expect(definition.getArgument('$bar')).to.equals('val');
        expectedArguments['$bar'] = 'val';

        expect(JSON.stringify(expectedArguments)).to.equals(JSON.stringify(definition.getArguments()));
    });

    it('throws OutOfBoundsException trying to get missing argument', function () {
       const definition = new ChildDefinition('foo');
       definition.setArguments({ 0: 'foo' });
       definition.replaceArgument('0', 'foo' );
       expect(definition.getArgument.bind(definition, '1')).to.throw(
           OutOfBoundsException,
           'The argument "1" doesn\'t exists in definition "foo".'
       );
    });
});
