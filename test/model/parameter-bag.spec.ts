import {describe, it} from 'mocha';
import {expect} from 'chai';
import ParameterBag from "../../src/core/parameter-bag/parameter-bag.model";
import ParameterNotFoundException from "../../src/core/exception/parameter-not-found.exception";
import RuntimeException from "../../src/core/exception/runtime.exception";
import ParameterCircularReferenceException from "../../src/core/exception/parameter-circular-reference.exception";

const someParameters = {
    foo: 'foo',
    bar: 'bar'
};

describe('ParameterBag standard test', () => {

    describe('Create / get / set - routines', () => {
        it('Constructor store parameters', () => {
            const bag = new ParameterBag({...someParameters});
            expect(JSON.stringify(bag.all(), null, 4)).to.equals(JSON.stringify(someParameters, null, 4));
        });

        it('Remove all parameters on clear', () => {
            const bag = new ParameterBag({...someParameters});
            bag.clear();
            expect(Object.keys(bag.all()).length).to.equals(0);
        });

        it('Remove parameter by name', () => {
            const bag = new ParameterBag({...someParameters});
            bag.remove('foo');
            expect(JSON.stringify(Object.keys(bag.all()))).to.equals('["bar"]');
        });

        it('Set a valid parameter', () => {
            const bag = new ParameterBag();
            bag.set('bar', 'foo');
            expect(bag.get('bar')).to.equals('foo');
        });


        it('Override a parameter with set', () => {
            const bag = new ParameterBag({foo: 'bar'});
            bag.set('foo', 'baz');
            expect(bag.get('foo')).to.equals('baz');
        });

        it('Throws an error on parameter not found', () => {
            const bag = new ParameterBag();

            expect(bag.get.bind(bag, 'baba')).to.throw(
                ParameterNotFoundException,
                'You have requested a non-existent parameter "baba"'
            );
        });

        it('Suggest a valid parameter on parameter not found when it is possible', () => {
            const bag = new ParameterBag({
                foo: 'foo',
                bar: 'bar',
                baz: 'baz',
                fiz: {
                    bar: {
                        boo: 12
                    }
                }
            });

            [
                ['foo1', 'You have requested a non-existent parameter "foo1". Did you mean this: "foo"?'],
                ['bag', 'You have requested a non-existent parameter "bag". Did you mean one of these: "bar", "baz"?'],
                ['', 'You have requested a non-existent parameter "".'],
                ['fiz.bar.boo', 'You have requested a non-existent parameter "fiz.bar.boo". You cannot access nested array items, do you want to inject "fiz" instead?'],
            ].forEach(test => {
                expect(bag.get.bind(bag, test[0])).to.throw(
                    ParameterNotFoundException,
                    test[1]
                );
            });
        });

        it('Says if a parameter is available in bag', () => {
            const bag = new ParameterBag({ foo: 'bar' });

            expect(bag.has('foo')).to.be.true;
            expect(bag.has('bar')).to.be.false;
        });

        it('Parameter name is case sensitive', () => {
            const bag = new ParameterBag({ BAR: 'baz', ...someParameters });
            bag.remove('BAR');

            expect(JSON.stringify(bag.all(), null, 4)).to.equals(JSON.stringify(someParameters, null, 4));
            bag.set('Foo', 'baz1');

            expect(bag.get('foo')).to.equals('foo');
            expect(bag.get('Foo')).to.equals('baz1');
        });
    });
    describe('ResolveValue', () => {
        it('is idempotent with raw string', () => {
            const bag = new ParameterBag();
            expect(bag.resolveValue('foo')).to.equals('foo');
        });

        it('replaces a %string% with correct value', () => {
            const bag = new ParameterBag({foo: 'bar'});
            expect(bag.resolveValue('I am %foo%')).to.equals('I am bar');

        });

        it('replaces placeholders in keys and values of arrays', () => {
            const bag = new ParameterBag({ foo: 'bar'});
            expect(JSON.stringify(bag.resolveValue( { '%foo%': '%foo%'}))).to.equals(JSON.stringify({ bar: 'bar'}));
        });

        it('replaces placeholders in nested arrays', () => {
            const bag = new ParameterBag({ foo: 'bar'});
            expect(JSON.stringify(bag.resolveValue({
                '%foo%': {
                    '%foo%': {
                        '%foo%': '%foo%'
                    }
                }
            }))).to.equals('{"bar":{"bar":{"bar":"bar"}}}');
        });

        it('supports % escaping by doubling it', () => {
            const bag = new ParameterBag({ foo: 'bar'});
            expect(bag.resolveValue('I am a %%foo%%')).to.equals('I am a %%foo%%');
            expect(bag.resolveValue('I\'m a %foo% %%foo %foo%')).to.equals('I\'m a bar %%foo bar');
            expect(JSON.stringify(bag.resolveValue({'foo' : {'bar' : {'ding' : 'I\'m a bar %%foo %%bar'}}}))).to.equals('{"foo":{"bar":{"ding":"I\'m a bar %%foo %%bar"}}}');
        });

        it('replaces arguments that are just a placeholder by their value without casting them to strings', () => {
            const bag = new ParameterBag({ foo: true});
            expect(bag.resolveValue('%foo%')).to.be.true;
            expect(bag.resolveValue('%foo%')).to.not.equals('true');

            bag.set('foo', null);
            expect(bag.resolveValue('%foo%')).to.be.null;
            expect(bag.resolveValue('%foo%')).to.not.equals('null');
        });

        it('replaces params placed besides escaped %', () => {
            const bag = new ParameterBag({
                foo: 'bar',
                baz: '%%%foo% %foo%%% %%foo%% %%%foo%%%'
            });

            expect(bag.resolveValue('%baz%')).to.equals('%%bar bar%% %%foo%% %%bar%%');
        });

        it('is not replacing greedily', () => {
            const bag = new ParameterBag({ baz: '%%s?%%s'});
            expect(bag.resolveValue('%baz%')).to.equals('%%s?%%s');
        });

        it('throws an ParameterNotFoundException if a placeholder references a non-existent parameter', () => {
            const bag = new ParameterBag();

            expect(bag.resolveValue.bind(bag, '%foobar%')).to.throw(
                ParameterNotFoundException,
                'You have requested a non-existent parameter "foobar"'
            );

            expect(bag.resolveValue.bind(bag, 'foo %foobar% bar')).to.throw(
                ParameterNotFoundException,
                'You have requested a non-existent parameter "foobar"'
            );
        });

        it('throws a RuntimeException when a parameter embeds another non-string parameter', () => {
            const bag = new ParameterBag({ foo: 'a %bar%', bar: {}});

            expect(bag.resolveValue.bind(bag, '%foo%')).to.throw(
                RuntimeException,
                'A string value must be composed of strings and/or numbers, but found parameter "bar" of type "object" inside string value "a %bar%".'
            );
        });

        it('throws a ParameterCircularReferenceException when a parameter has a circular reference', () => {
            const bag = new ParameterBag({
                foo: '%bar%',
                bar: '%foobar%',
                foobar: '%foo%'
            });


            expect(bag.resolveValue.bind(bag, '%foo%')).to.throw(
                ParameterCircularReferenceException,
                'Circular reference detected for parameter "foo" ("foo" > "bar" > "foobar" > "foo").'
            );

            bag
                .set('foo', 'a %bar%')
                .set('bar', 'a %foobar%')
                .set('foobar', 'a %foo%');

            expect(bag.resolveValue.bind(bag, '%foo%')).to.throw(
                ParameterCircularReferenceException,
                'Circular reference detected for parameter "foo" ("foo" > "bar" > "foobar" > "foo").'
            );
        });

        it('works with pretty intuitive example', () => {
            const bag = new ParameterBag({
                host: 'foo.bar',
                port: 1337
            });

            expect(bag.resolveValue('%host%:%port%')).to.equals('foo.bar:1337');
        });
    });
    describe('Resolve', () => {
        it('indicates why a parameter is needed', () => {
            const bag = new ParameterBag({ foo: '%bar%' });

            expect(bag.resolve.bind(bag)).to.throw(
                ParameterNotFoundException,
                'The parameter "foo" has a dependency on a non-existent parameter "bar".'
            );
        });

        it('unescapes value', () => {
            const bag = new ParameterBag({
                foo: {
                    bar: {
                        ding: "I'm a bar %%foo %%bar"
                    }
                },
                bar: "I'm a %%foo%%"
            });

            bag.resolve();

            expect(bag.get('bar')).to.equals("I'm a %foo%");
            expect(JSON.stringify(bag.get('foo'))).to.equals('{"bar":{"ding":"I\'m a bar %foo %bar"}}');
        });

        it('escape value', () => {
            const bag = new ParameterBag();

            bag.add({
                foo: bag.escapeValue({bar: {ding: "I'm a bar %foo %bar"}, zero: null }),
                bar: bag.escapeValue("I'm a %foo%")
            });

            expect(bag.get('bar')).to.equals("I'm a %%foo%%");
            expect(JSON.stringify(bag.get('foo'))).to.equals('{"bar":{"ding":"I\'m a bar %%foo %%bar"},"zero":null}');
        });
    });
    describe('Resolve string', () => {
       it('wraps parameters by %', () => {
           const bag = new ParameterBag({ foo: 'bar' });
           expect(bag.resolveString('%foo%')).to.equals('bar');
       });

        it('not resolves parameters with spaces', () => {
            const bag = new ParameterBag({ foo: 'bar' });
            expect(bag.resolveString('% foo %')).to.equals('% foo %');
        });


        it('ignore twig-like string', () => {
            const bag = new ParameterBag({ foo: 'bar' });
            expect(bag.resolveString('{% set my_template = "foo" %}')).to.equals('{% set my_template = "foo" %}');
        });

        it('allows text between % if there are spaces', () => {
            const bag = new ParameterBag();
            expect(bag.resolveString('50% is less than 100%')).to.equals('50% is less than 100%');
        });
    });
});