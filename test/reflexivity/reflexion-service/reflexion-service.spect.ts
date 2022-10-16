import {describe, it} from 'mocha';
import {expect} from 'chai';
import ReflectionService from "../../../src/core/reflexion/reflexion.service";
import Foo from "./fixtures/foo.model";


describe('ReflectionService test', () => {
    it('find a class by name', () => {
        const reflectionService = new ReflectionService();
        reflectionService.recordClass('Foo', Foo);

        const theClass = reflectionService.findClass('Foo');

        expect(typeof theClass).to.equals('function');

        if (typeof theClass === 'undefined') {
            return;
        }
        const instance = new theClass('foo');

        expect(instance instanceof Foo).to.be.true;
        expect(instance.getParam()).to.equal('foo');
    });

    it('find a class by alias', () => {
        const reflectionService = new ReflectionService();
        reflectionService.recordClass('Foo', Foo);
        reflectionService.loadMeta({
            bar: {
                name: 'Foo'
            }
        });

        const theClass = reflectionService.findClassByAlias('bar');

        expect(typeof theClass).to.equals('function');
        if (typeof theClass === 'undefined') {
            return;
        }

        const instance = new theClass('foo');

        expect(instance instanceof Foo).to.be.true;
        expect(instance.getParam()).to.equal('foo');
    });
});
