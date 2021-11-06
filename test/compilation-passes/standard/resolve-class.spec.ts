import {describe, it} from 'mocha';
import {expect} from 'chai';
import ContainerBuilder from "../../../src/core/container-builder.model";
import CompilerInterface from "../../../src/core/interfaces/compiler.interface";
import Reference from "../../../src/core/models/reference.model";
import ResolveClassPass from "../../../src/core/compilation-passes/resolve-class.pass";
import Foo from "../../reflexivity/reflexion-service/fixtures/foo.model";

function provideValidClass() {
    return [
        // 'Acme\UnkownClass',
        'Publisher'
    ]
}
describe('Resolve class pass works as expected', () => {
    provideValidClass().forEach(service => {
        it('resolves class from id', () => {
            const container = new ContainerBuilder();
            container.getReflexionService().recordClass('Foo', Foo);
            container.getReflexionService().loadMeta({
                'App/Foo': {
                    name: 'Foo'
                }
            });

            const definition = container.register('App/Foo');


            const pass = new ResolveClassPass();
            pass.process(container);

            expect(definition.getResourceType()).to.equals(Foo);
        });
    });
});