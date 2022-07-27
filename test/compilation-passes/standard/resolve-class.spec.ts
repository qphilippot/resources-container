import {describe, it} from 'mocha';
import {expect} from 'chai';
import ContainerBuilder from "../../../src/core/container/container-builder.model";
import CompilerInterface from "../../../src/core/interfaces/compiler.interface";
import Reference from "../../../src/core/models/reference.model";
import ResolveClassPass from "../../../src/core/compilation-passes/standard/resolve-class.pass";
import Foo from "../../reflexivity/reflexion-service/fixtures/foo.model";
import {Publisher} from "@qphi/publisher-subscriber";

function provideValidClass() {
    return [
        {
            id: '123-some-name-for-Publisher',
            type: Publisher
        },

        {
            id: 'App/Foo',
            type: Foo
        },
    ]
}

function provideInvalidClass() {
    return [
        {
            id: 'oops',
        },

        {
            id: 'date',
        },
    ]
}

describe('ResolveClassPass works as expected', () => {
    provideValidClass().forEach(({ id, type }) => {
        it('resolves class from id', () => {
            const container = new ContainerBuilder();
            container.getReflexionService().recordClass(id, type);
            const definition = container.register(id);

            const pass = new ResolveClassPass();
            pass.process(container);

            expect(definition.getResourceType()).to.equals(type);
        });
    });

    provideInvalidClass().forEach(({ id }) => {
        it('resolves class from id', () => {
            const container = new ContainerBuilder();
            const definition = container.register(id);

            const pass = new ResolveClassPass();
            pass.process(container);

            expect(definition.getResourceType()).to.equals(null);
        });
    });


    // todo support ChildDefinition
    // public function testClassFoundChildDefinition()
    // {
    //     $container = new ContainerBuilder();
    //     $parent = $container->register('App\Foo', null);
    //     $child = $container->setDefinition(self::class, new ChildDefinition('App\Foo'));
    //
    //     (new ResolveClassPass())->process($container);
    //
    //     $this->assertSame('App\Foo', $parent->getClass());
    //     $this->assertSame(self::class, $child->getClass());
    // }
    //
    // public function testAmbiguousChildDefinition()
    // {
    //     $this->expectException(InvalidArgumentException::class);
    //     $this->expectExceptionMessage('Service definition "App\Foo\Child" has a parent but no class, and its name looks like an FQCN. Either the class is missing or you want to inherit it from the parent service. To resolve this ambiguity, please rename this service to a non-FQCN (e.g. using dots), or create the missing class.');
    //     $container = new ContainerBuilder();
    //     $container->register('App\Foo', null);
    //     $container->setDefinition('App\Foo\Child', new ChildDefinition('App\Foo'));
    //
    //     (new ResolveClassPass())->process($container);
    // }
});
