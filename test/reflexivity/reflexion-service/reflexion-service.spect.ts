import {describe, it} from 'mocha';
import {expect} from 'chai';
import ReflexionService from "../../../src/core/reflexion/reflexion.service";
import Foo from "./fixtures/foo.model";


describe('ReflexionService test', () => {
    it('find a class by name', () => {
        const reflexionService = new ReflexionService();
        reflexionService.recordClass('Foo', Foo);

        const theClass = reflexionService.findClass('Foo');

        expect(typeof theClass).to.equals('function');

        // @ts-ignore
        const instance = new theClass('foo');

        expect(instance instanceof Foo).to.be.true;
        expect(instance.getParam()).to.equal('foo');
    });

    it('find a class by alias', () => {
        const reflexionService = new ReflexionService();
        reflexionService.recordClass('Foo', Foo);
        reflexionService.loadMeta({
            bar: {
                name: 'Foo'
            }
        });

        const theClass = reflexionService.findClassByAlias('bar');

        expect(typeof theClass).to.equals('function');

        // @ts-ignore
        const instance = new theClass('foo');

        expect(instance instanceof Foo).to.be.true;
        expect(instance.getParam()).to.equal('foo');
    });
});