import {describe, it} from 'mocha';
import {expect} from 'chai';
import ContainerBuilder from "../../../src/core/container-builder.model";
import CheckDefinitionValidityPass from "../../../src/core/compilation-passes/standard/check-definition-validity.pass";
import CircularReferenceException from "../../../src/core/exception/circular-reference.exception";
import BadDefinitionValidityException from "../../../src/core/exception/passes/bad-definition-validity.exception";
import Alias from "../../../src/core/models/alias.model";

describe('Standard CheckDefinitionValidity works as expected', () => {
    it('detects synthetic private definition', () => {
        const container = new ContainerBuilder();
        const pass = new CheckDefinitionValidityPass();

        container.register('a').setSynthetic(true).setPublic(false);

        expect(pass.process.bind(pass, container)).to.throw(
            BadDefinitionValidityException,
            'A synthetic service ("a") must be public.'
        );
    })

    // todo: require reflexion feature
    // it('detects non synthetic non abstract definition without class', () => {
    //     const container = new ContainerBuilder();
    //     const pass = new CheckDefinitionValidityPass();
    //
    //     container.register('a').setSynthetic(false).setAbstract(false);
    //
    //     expect(pass.process.bind(pass, container)).to.throw(
    //         BadDefinitionValidityException,
    //         'A synthetic service ("a") must be public.'
    //     );
    // })

    // it('accept service locator without classe', () => {
    //     const container = new ContainerBuilder();
    //     const pass = new CheckDefinitionValidityPass();
    //
    //     container.register('a').addTag('container.service_locator');
    //     pass.process(container);
    // });

    // todo: need reflexion
    // it('detect factory without class', () => {
    //     const container = new ContainerBuilder();
    //     const pass = new CheckDefinitionValidityPass();
    //
    //     container.register('.123_anonymous_service_id_should_not_throw_~1234567').setFactory('factory');
    //     pass.process(container);
    //
    //     container.register('.any_non_anonymous_id_throws').setFactory('factory');
    //     expect(pass.process.bind(pass, container)).to.throw(
    //         BadDefinitionValidityException,
    //         'A synthetic service ("a") must be public.'
    //     );
    // });

    it('works with some basic process', () => {
        const container = new ContainerBuilder();
        container.register('a', 'class');
        container.register('b', 'class').setSynthetic(true).setPublic(true);
        container.register('c', 'class').setAbstract(true);
        container.register('d', 'class').setSynthetic(true);

        const pass = new CheckDefinitionValidityPass();
        pass.process(container);
    });

    it('works with valid tags', () => {
        const container = new ContainerBuilder();
        container.register('a', 'class').addTag('foo', { bar: 'baz' });
        container.register('b', 'class').addTag('foo', { bar: null });
        container.register('c', 'class').addTag('foo', { bar: 1 });
        container.register('d', 'class').addTag('foo', { bar: 1.1 });

        const pass = new CheckDefinitionValidityPass();
        pass.process(container);
    });

    it('detects invalid tags', () => {
        const container = new ContainerBuilder();
        container.register('a', 'class').addTag('foo', { bar: { alberto: 'toto' }});

        const pass = new CheckDefinitionValidityPass();
        expect(pass.process.bind(pass, container)).to.throw(
            BadDefinitionValidityException,
        'A "tags" attribute must be of a scalar-type for service "a", tags "bar".'
        );
    });

    // todo: require env truc bidule
    it('detect dynamic public alias name', () => {
        const container = new ContainerBuilder();
        // $this->expectException(EnvParameterException::class);
        const env = container.getParameter('env(BAR)');
        const alias = new Alias('class');
        alias.setPublic(true);
        container.setAlias("foo.$env", alias);


        const pass = new CheckDefinitionValidityPass();
        expect(pass.process.bind(pass, container)).to.throw(
            BadDefinitionValidityException,
            'A "tags" attribute must be of a scalar-type for service "a", tags "bar".'
        );
    });

    it('allows dynamic private name', () => {
        const container = new ContainerBuilder();
        const env = container.getParameter('env(BAR)');
        container.register("foo.$env", 'class');
        container.setAlias("bar.$env", new Alias('class'));

        const pass = new CheckDefinitionValidityPass();
        pass.process(container);
    });
});