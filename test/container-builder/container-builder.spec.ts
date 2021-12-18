import {describe, it} from 'mocha';
import {expect} from 'chai';
import ContainerBuilder from "../../src/core/container/container-builder.model";
import Definition from "../../src/core/models/definition.model";
import FooClass from "./fixtures/FooClass";
import BarClass from "./fixtures/BarClass";
import FooBarClass from "./fixtures/FooBarClass";
import ResourceNotFoundException from "../../src/core/exception/resource-not-found.exception";
import {
    IGNORE_ON_INVALID_REFERENCE,
    NULL_ON_INVALID_REFERENCE
} from "../../src/core/container/container-builder.invalid-behaviors";
import Reference from "../../src/core/models/reference.model";
import CircularReferenceException from "../../src/core/exception/circular-reference.exception";
import InvalidIdException from "../../src/core/exception/invalid-id.exception";
import RuntimeException from "../../src/core/exception/runtime.exception";
import Alias from "../../src/core/models/alias.model";
import SelfAliasingException from "../../src/core/exception/self-aliasing.exception";
import AliasNotFoundException from "../../src/core/exception/alias-not-found.exception";
import FooCompilerPass from "./fixtures/foo.compiler-pass";
import {BEFORE_OPTIMIZATION} from "../../src/core/compiler-step.enum";
import {join} from "path";

describe('container-builder tests', function () {
    describe('basic definition operations', function () {
        it('add default service.container definition', function () {
            const container = new ContainerBuilder();

            expect(container.getDefinitions().length).to.equals(1);
            expect(container.hasDefinition('service.container')).to.be.true;

            const definition = container.getDefinition('service.container');
            expect(definition instanceof Definition).to.be.true;
            expect(definition.isSynthetic()).to.be.true;
            expect(definition.getResourceType()).to.equals(ContainerBuilder);
        });

        it('correctly use definitions', function () {
            const container = new ContainerBuilder();
            const definitions = {
                foo: new Definition('Bar\FooClass'),
                bar: new Definition('BarClass')
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

            const foobarDefinition = new Definition('FooBarClass');
            container.setDefinition('foobar', foobarDefinition);
            expect(foobarDefinition).to.equals(container.getDefinition('foobar'));
            expect(foobarDefinition).to.equals(container.setDefinition('foobar', foobarDefinition));

            const duplicatedDefinition = {
                foobar: new Definition('FooBarClass')
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

        it('can set definition as autowired', function () {
            const container = new ContainerBuilder();
            container.autowire('foo', 'Bar\FooClass');

            expect(container.hasDefinition('foo')).to.be.true;
            expect(container.getDefinition('foo').isAutowired()).to.be.true;
        });

        it('returns all resources id using getResourceIds()', function () {
            const container = new ContainerBuilder();
            container.register('foo', 'FooClass');
            container.register('bar', 'BarClass');
            expect(JSON.stringify(container.getResourceIds())).to.equal(
                '["service.container","foo","bar"]'
            )
        })
    });

    describe('has', function () {
        it('check if definitions, alias, or resource exists', function () {
            const container = new ContainerBuilder();
            expect(container.has('foo')).to.be.false;

            container.register('foo', 'Bar\FooClass');
            expect(container.has('foo')).to.be.true;

            container.set('bar', Date);
            expect(container.has('bar')).to.be.true;
        });
    });

    describe('get', function () {
        it('throws an exception trying to get unknown service', function () {
            const container = new ContainerBuilder();
            expect(container.get.bind(container, 'foo')).to.throw(
                ResourceNotFoundException,
                'You have requested a non-existent service "foo".'
            );
        });

        it('returns null using get with invalid reference and unknown service', function () {
            const container = new ContainerBuilder();
            expect(
                container.get('unknown_service', NULL_ON_INVALID_REFERENCE)
            ).to.be.null;
        });

        it('throws circular reference exception if service has reference to itself', function () {
            const container = new ContainerBuilder();
            container.register('baz', 'FooClass').setArguments([new Reference('baz')]);
            expect(container.get.bind(container, 'baz')).to.throw(
                CircularReferenceException
            );
        });

        it('returns same instance when service is shared', function () {
            const container = new ContainerBuilder();
            container.getReflexionService()
                .recordClass('FooClass', FooClass);

            container.register('bar', 'FooClass');
            //
            expect(container.get('bar')).to.equals(container.get('bar'));
        });

        it('returns different instances with non shared services', function () {
            const container = new ContainerBuilder();
            container.getReflexionService()
                .recordClass('FooClass', FooClass);

            container.register('bar', 'FooClass').setShared(false);
            expect(container.get('bar')).to.not.equals(container.get('bar'));
            expect(container.get('bar')).to.be.instanceof(FooClass);
        });


        it('creates service based on definition', function () {
            const container = new ContainerBuilder();
            container.getReflexionService()
                .recordClass('FooClass', FooClass);

            container.register('foo', 'FooClass');

            expect(container.get('foo')).to.be.instanceof(Object);
            expect(container.get('foo')).to.be.instanceof(FooClass);

        });

        it('returns registered service', function () {
            const container = new ContainerBuilder();
            const foo = new FooClass();
            container.set('foo', foo);
            expect(container.get('foo')).to.equals(foo);
        });

        it('unset loading service when create service throws an exception', function () {
            const container = new ContainerBuilder();
            container.getReflexionService()
                .recordClass('FooClass', FooClass);
            container.register('foo', 'FooClass').setSynthetic(true);

            // process first get and update private loading service list
            expect(container.get.bind(container, 'foo')).to.throws(
                RuntimeException,
                'You have requested a synthetic service ("foo"). The DIC does not know how to construct this service.'
            );

            // if service is still loaded, exception won't be thrown anymore
            expect(container.get.bind(container, 'foo')).to.throws(
                RuntimeException,
                'You have requested a synthetic service ("foo"). The DIC does not know how to construct this service.'
            );
        });
    });

    describe('register', function () {
        it('add a definition', function () {
            const container = new ContainerBuilder();
            container.register('foo', 'Bar\FooClass');
            expect(container.hasDefinition('foo')).to.be.true;
            expect(container.getDefinition('foo') instanceof Definition).to.be.true;
        });

        it('does not override existing resource', function () {
            const container = new ContainerBuilder();
            container.getReflexionService()
                .recordClass('FooClass', FooClass);

            const foo = new FooClass();
            container.set('foo', foo);
            container.register('foo', 'FooClass');


            expect(container.get('foo')).to.equals(foo);
        });
    });

    describe('detect invalid id', function () {
        const invalidIds = [
            '',
            "\0",
            "\r",
            "\n",
            "'",
            'ab\\',
        ];

        invalidIds.forEach(function (id) {
            it(`"${id}" is not a valid alias id`, function () {
                const container = new ContainerBuilder();
                expect(container.setAlias.bind(container, id, 'foo')).to.throw(
                    InvalidIdException,
                    `Invalid alias id: "${id}"`
                );
            });
        });

        invalidIds.forEach(function (id) {
            it(`"${id}" is not a valid definition id`, function () {
                const container = new ContainerBuilder();
                expect(container.setDefinition.bind(container, id, new Definition('foo'))).to.throw(
                    InvalidIdException,
                    `Invalid alias id: "${id}"`
                );
            });
        });

    });

    describe('alias', function () {
        it('basic test', function () {
            const container = new ContainerBuilder();
            container.getReflexionService()
                .recordClass('FooClass', FooClass);
            container.register('foo', 'FooClass');
            container.setAlias('bar', new Alias('foo'));

            expect(container.hasAlias('bar')).to.be.true;
            expect(container.hasAlias('foobar')).to.be.false;
            expect(container.getAlias('bar').toString()).to.equals('foo');
            expect(container.has('bar')).to.be.true;
            expect(container.get('bar')).to.equals(container.get('foo'));
        });

        it('throws an exception with self aliasing', function () {
            const container = new ContainerBuilder();
            expect(container.setAlias.bind(container, 'foo', 'foo')).to.throws(
                SelfAliasingException,
                'An alias can not reference itself, got a circular reference on: "foo".'
            );
        })

        it('throws an exception trying to get unknown alias', function () {
            const container = new ContainerBuilder();
            expect(container.getAlias.bind(container, 'foo')).to.throws(
                AliasNotFoundException,
                'The resource alias "foo" does not exist.'
            );
        })

        it('retrieves alias using getAlias()', function () {
            const container = new ContainerBuilder();
            container.setAlias('bar', new Alias('foo')).setPublic(true);
            container.setAlias('foobar', new Alias('foo'));
            container.setAlias('moo', new Alias('foo', false));

            const aliases = container.getAliases();

            expect(aliases['bar'].toString()).to.equals('foo');
            expect(aliases['bar'].isPublic()).to.be.true;
            expect(aliases['foobar'].toString()).to.equals('foo');
            expect(aliases['foobar'].isPublic()).to.be.false;
            expect(aliases['moo'].toString()).to.equals('foo');
            expect(aliases['moo'].isPublic()).to.be.false;
        });

        it('clears alias when adding any resource or definition with same id', function () {
            const container = new ContainerBuilder();
            container.setAlias('bar', new Alias('foo')).setPublic(true);
            container.setAlias('foobar', new Alias('foo'));
            container.setAlias('moo', new Alias('foo', false));

            container.register('bar', 'FooClass');
            expect(container.hasAlias('bar')).to.be.false;

            container.setResource('foobar', new FooClass());
            container.setResource('moo', new FooClass());

            expect(Object.keys(container.getAliases()).length).to.equals(0);
        });

        it('keeps invalid behavior setting', function () {
            const container = new ContainerBuilder();
            container.getReflexionService().recordClass('FooClass', FooClass);
            const definition = new Definition('FooClass');
            definition.addMethodCall(
                'setBar',
                [new Reference('bar', IGNORE_ON_INVALID_REFERENCE)]
            );

            container.setDefinition('aliased', definition);
            container.setAlias('alias', new Alias('aliased'));
            expect(container.get('alias')).to.be.instanceof(FooClass);
        });
    });

    describe('compiler passes', function () {
        it('can add compilation pass', function () {
            const container = new ContainerBuilder();
            const defaultPass = container.getCompiler().getPasses();

            const pass1 = new FooCompilerPass();
            const pass2 = new FooCompilerPass();
            container.addCompilerPass(pass1, BEFORE_OPTIMIZATION, -5);
            container.addCompilerPass(pass2, BEFORE_OPTIMIZATION, 10);

            const passes = container.getCompiler().getPasses();
            expect(defaultPass.length + 2).to.equals(passes.length);
            // higher priority first
            expect(passes.indexOf(pass1) > passes.indexOf(pass2)).to.be.true;
        });
    });

    describe('create service', function () {
        it('can create service using file', function () {
            const builder = new ContainerBuilder();

            builder.register('foo1', 'FooClass').setFile(join(__dirname, 'fixtures/FooClass.ts'));
            builder.register('foo2', 'FooClass').setFile(join(__dirname, 'fixtures/%file%.ts'));
            builder.register('foo3', 'FooClass');
            builder.setParameter('file', 'FooClass');

            expect(builder.get('foo1')).to.be.instanceof(FooClass);
            expect(builder.get('foo2')).to.be.instanceof(FooClass);
            expect(builder.get('foo3')).to.be.instanceof(FooClass);
        });

        it('create proxy with real service instanciator', function () {
            const builder = new ContainerBuilder();
            builder.register('foo', 'Bar\FooClass').setFile(
                join(__dirname, 'fixtures/FooClass.ts')
            );

            builder.getDefinition('foo').setLazy(true);

            const foo = builder.get('foo');

            // The same proxy is retrieved on multiple subsequent calls
            expect(foo).to.be.equals(builder.get('foo'));
            expect(foo === builder.get('foo')).to.be.true;
        });

        it('replaces parameters in the class provided by the service definition', function () {
            const builder = new ContainerBuilder();
            builder.register('foo1', '%class%');
            builder.setParameter('class', 'FooClass');
            // emulate reflexivity
            builder.getReflexionService().recordClass('FooClass', FooClass)
            expect(builder.get('foo1')).to.be.instanceof(FooClass);
        });

        it('create services arguments', function () {
            const builder = new ContainerBuilder();
            builder.register('bar', 'BarClass');
            const foo1Definition = builder.register('foo1', 'FooClass');
            foo1Definition.addArgument({
                'foo': '%value%',
                '%value%': 'foo',
                '2': new Reference('bar'),
                '3': '%%unescape it%%'
            });


            builder.getReflexionService()
                .recordClass('BarClass', BarClass)
                .recordClass('FooClass', FooClass);

            builder.setParameter('value', 'bar');
            const foo = builder.get('foo1');
            expect(JSON.stringify(foo.arguments)).to.equals(
                JSON.stringify({
                    'foo': 'bar',
                    'bar': 'foo',
                    '2': builder.get('bar'),
                    '3': '%unescape it%'
                }
                ))
        });
        it('create services using factory', function () {
           const builder = new ContainerBuilder();
           builder.register('foo', 'FooClass').setFactory('FooClass::getInstance');
           builder.register('qux', 'FooClass').setFactory(['FooClass', 'getInstance']);
           builder.register('bar', 'FooClass').setFactory([new Definition('FooClass'), 'getInstance']);
           builder.register('baz', 'FooClass').setFactory([new Reference('bar'), 'getInstance']);

           expect(builder.get('foo').called)
        });
    });
});
