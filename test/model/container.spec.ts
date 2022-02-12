import {describe, it} from 'mocha';
import {expect} from 'chai';
import Container from "../../src/core/container/container.model";
import ParameterBag from "../../src/core/parameter-bag/parameter-bag.model";
import ReadOnlyParameterBag from "../../src/core/parameter-bag/read-only.parameter-bag";
import ParameterNotFoundException from "../../src/core/exception/parameter-not-found.exception";
import Alias from "../../src/core/models/alias.model";


describe('Container', () => {
    it('automatically registers itself as a service', function (){
        const container = new Container();
        expect(container.get('service.container')).to.equals(container);
    });
    it('accept a parameter bag as constructor first argument property', function (){
        const container = new Container({
            parameterBag: new ParameterBag({ foo: 'bar' })
        });

        expect(JSON.stringify(container.getParameterBag().all())).to.equals('{"foo":"bar"}');
    });

    it('resolves the parameter bag on compile', function () {
        const container = new Container({
            parameterBag: new ParameterBag({ foo: 'bar' })
        });

        expect(container.getParameterBag().isResolved()).to.be.false;
        container.compile();
        expect(container.getParameterBag().isResolved()).to.be.true;
        expect(container.getParameterBag()).to.be.instanceof(ReadOnlyParameterBag);
        expect(JSON.stringify(container.getParameterBag().all())).to.equals('{"foo":"bar"}');
    });

    it('returns right compiled status using isCompiled', function () {
        const container = new Container({
            parameterBag: new ParameterBag({ foo: 'bar' })
        });

        expect(container.isCompiled()).to.be.false;
        container.compile();
        expect(container.isCompiled()).to.be.true;
    });

    it('isCompiled returns false before compile even if we are using read-only-bag', function () {
        const container = new Container({
            parameterBag: new ReadOnlyParameterBag({ foo: 'bar' })
        });

        expect(container.isCompiled()).to.be.false;
    });

    it('returns an empty array if no parameter has been defined', function () {
        const container = new Container();
        expect(JSON.stringify(container.getParameterBag().all())).to.equals('{}');
    });

    it('get/set parameter', function () {
        const container = new Container({
            parameterBag: new ParameterBag({ foo: 'bar' })
        });

        container.setParameter('bar', 'foo');
        expect(container.getParameter('bar')).to.equals('foo');
        container.setParameter('foo', 'baz');
        container.setParameter('Foo', 'baz1');
        expect(container.getParameter('foo')).to.equals('baz');
        expect(container.getParameter('Foo')).to.equals('baz1');

        expect(container.getParameter.bind(container, 'missing')).to.throw(
            ParameterNotFoundException,
            'You have requested a non-existent parameter "missing".'
        );
    });

    it('get service ids', function () {
        const container = new Container();
        container.set('foo', {});
        container.set('bar', {});
        expect(JSON.stringify(container.getResourceIds())).to.equals('["foo","bar","service.container"]');
    });

    it('test set', function () {
        const container = new Container();
        const foo = { "data": '123' };
        container.set('._. \\\\o/', foo);
        expect(container.get('._. \\\\o/')).to.equals(foo);
    });

    it('reset service to setting null value', function () {
        const container = new Container();
        const foo = { "data": '123' };
        container.set('foo', foo);
        expect(container.has('foo')).to.be.true;
        container.set('foo', null);
        expect(container.has('foo')).to.be.false;
    });

    it('replaces an existing alias using set', function () {
        const container = new Container();
        const foo1 = { "data": '123' };
        const foo2 = { "data": '123' };
        container.set('foo', foo1);
        container.setAlias('bar', new Alias('foo'));
        expect(container.get('bar')).to.equals(container.get('foo'));
        expect(container.get('bar')).to.equals(foo1);

        container.set('bar', foo2);
        expect(container.get('foo')).to.equals(foo1);
        expect(container.get('bar')).to.equals(foo2);
    });

    // todo testSetWithNullOnInitializedPredefinedService

});
