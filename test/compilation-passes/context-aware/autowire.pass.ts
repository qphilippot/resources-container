import {describe, it} from 'mocha';
import {expect} from 'chai';
import ContainerBuilder from "../../../src/core/container/container-builder.model";
import Foo from "../fixtures/Foo";
import Bar from "../fixtures/Bar";
import ResolveClassPass from "../../../src/core/compilation-passes/standard/resolve-class.pass";
import AutowirePass from "../../../src/core/compilation-passes/context-aware/autowire.pass";
import {ClassMetadata, GET_EMPTY_CODE_ELEMENT_DATA, ObjectLocation} from "../../../src/generate-classes-metadata";
import {IS_CLASS} from "../../../src/core/reflexion/reflexion.config";

describe('Autowire compulation pass checking', function () {
    it('process standard case', function () {
        const container = new ContainerBuilder();
        container.register('foo', Foo);

        const barDefinition = container.register('bar', Bar);
        barDefinition.setAutowired(true);

        const reflectionService = container.getReflectionService();
        reflectionService.recordClass('Foo', Foo);
        reflectionService.recordClass('Bar', Bar, {
            ...GET_EMPTY_CODE_ELEMENT_DATA(),
            ...{
                kind: IS_CLASS,
                name: 'Bar',
                constructor: [
                    {
                        name: 'foo',
                        type: 'Foo',
                        defaultValue: undefined,
                        namespace: 'Foo'
                    }
                ],
                superClass: null,
                abstract: false,
            }
        } as ClassMetadata);

        // replace literal definition class name by related class type
        (new ResolveClassPass()).process(container);

        // replace literal class name by real class type
        (new AutowirePass()).process(container);

        const _arguments = container.getDefinition('bar').getArguments();
        console.log('bar', container.getDefinition('bar'));
        console.log('_arguments', _arguments);
        expect(Object.keys(_arguments)).to.equals(1);
        // expect(_arguments[0]).to.be.instanceof(Foo);
    })
});
