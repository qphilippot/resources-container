import {describe, it} from 'mocha';
import {expect} from 'chai';
import ContainerBuilder from "../../src/core/container/container-builder.model";
import EnvVarProcessorManager from "../../src/core/models/env-var-processor-manager.model";
import StringEnvProcessor from "../../src/core/models/env-var-processor/string.env-processor";
import BooleanEnvProcessor from "../../src/core/models/env-var-processor/boolean.env-processor";
import NotEnvProcessor from "../../src/core/models/env-var-processor/not.env-processor";
import IntEnvProcessor from "../../src/core/models/env-var-processor/int.env-processor";
import FloatEnvProcessor from "../../src/core/models/env-var-processor/float.env-processor";
import Base64EnvProcessor from "../../src/core/models/env-var-processor/base-64.env-processor";
import TrimEnvProcessor from "../../src/core/models/env-var-processor/trim.env-processor";
import JsonEnvProcessor from "../../src/core/models/env-var-processor/json.env-processor";
import RuntimeException from "../../src/core/exception/runtime.exception";
import KeyEnvProcessor from "../../src/core/models/env-var-processor/key.env-processor";
import EnvNotFoundException from "../../src/core/exception/env-not-found.exception";
import EnvProcessorNotFoundException from "../../src/core/exception/env-processor-not-found.exception";

const validBools = [
    ['true', true],
    ['false', false],
    ['null', false],
    ['undefined', false],
    ['NaN', false],
    ['1', true],
    ['0', false],
    ['hello', false]
];
const validInts = [
    ['1', 1],
    ['1.1', 1],
    ['1e1', 10]
];
const invalidInts = [
    ['foo'],
    ['true'],
    ['null'],
];
const validFloats = [
    ['1', 1.0],
    ['1.1', 1.1],
    ['1e1', 10.0]
];
const invalidFloats = [
    ['foo'],
    ['true'],
    ['null'],
];

const validBase64s = [
    [Buffer.from('hello').toString('base64'), 'hello'],
    ['/+0=', '\x7Fm'],
    ['_-0=', '\x7Fm']
];

const validTrims = [
    [' hello\n', 'hello']
];

const validJson = [
    ['[1]', [1]],
    ['{"key": "value"}', {key: 'value'}],
    [null, null]
];

const invalidJson = [
    'invalid_json',
    1,
    1.1,
    true,
    false,
    'foo'
];

const invalidKeys = [
    {},
    {index2: 'value'},
    [ 'index', 'index2']
];

const validKeys = [
    {index: 'password'},
    {index: 'true'},
    {index: false},
    {index: '1'},
    {index: 1},
    {index: '1.1'},
    {index: 1.1},
    {index: []},
    {index: ['val1', 'val2']},
];

const validNestedKeys = [
    {index: { nested: { smg:'42', key: '23'}}},
    {index: { nested: { smg:'abc', key: 'def'}}}
];

const noMixedValues = [
    null,
    'string',
    1,
    true
];

describe('Env Processor works as expected', () => {
    describe('String Env Processor works as expected', () => {
        const validStrings = [
            ['hello', 'hello'],
            ['true', 'true'],
            [false, 'false'],
            [null, 'null'],
            [1, '1'],
            [0, '0'],
            [1.1, '1.1'],
            [1e1, '10'],
            [{a: 0.1, b: {c: 'd'}}, '{"a":0.1,"b":{"c":"d"}}']
        ];


        validStrings.forEach(([value, expected]) => {
            it('can retrieve a string env value', () => {
                const container = new ContainerBuilder();
                container.setParameter('env(foo)', value);
                container.compile();

                const processor = new EnvVarProcessorManager(container);
                processor.addProcessor(new StringEnvProcessor());

                const result = processor.getEnv('string', 'foo', () => {
                    throw `should not be called`;
                });

                expect(result).to.equals(expected);
            })
        });
    });
    describe('Bool Env Processor works as expected', () => {
        validBools.forEach(([value, expected]) => {
            it('can retrieve a bool env value', () => {
                const container = new ContainerBuilder();
                const processor = new EnvVarProcessorManager(container);
                processor.addProcessor(new BooleanEnvProcessor());

                const result = processor.getEnv('bool', 'foo', (name) => {
                    expect(name).to.equals('foo');
                    return value;
                });

                expect(result).to.equals(expected);
            })
        });
    });
    describe('not(Bool) Env Processor works as expected', () => {
        validBools.forEach(([value, expected]) => {
            it(`can retrieve a ${value} as ${!expected}`, () => {
                const container = new ContainerBuilder();
                const processor = new EnvVarProcessorManager(container);
                processor.addProcessor(new BooleanEnvProcessor());
                processor.addProcessor(new NotEnvProcessor());

                const result = processor.getEnv('not', 'foo', (name) => {
                    expect(name).to.equals('foo');
                    return value;
                });

                expect(result).to.equals(!expected);
            })
        });
    });
    describe('Int Env Processor works as expected', () => {
        validInts.forEach(([value, expected]) => {
            it(`can retrieve a ${value} as ${!expected}`, () => {
                const container = new ContainerBuilder();
                const processor = new EnvVarProcessorManager(container);
                processor.addProcessor(new IntEnvProcessor());

                const result = processor.getEnv('int', 'foo', (name) => {
                    expect(name).to.equals('foo');
                    return value;
                });

                expect(result).to.equals(expected);
            })
        });

        invalidInts.forEach(value => {
            it(`Throw an exception for ${value}`, () => {
                const container = new ContainerBuilder();
                const processor = new EnvVarProcessorManager(container);
                processor.addProcessor(new IntEnvProcessor());


                expect(processor.getEnv.bind(processor, 'int', 'foo', (name) => {
                    expect(name).to.equals('foo');
                    return value;
                })).to.throw(`Non-numeric env var "foo" cannot be cast to int.`);
            })
        });
    });
    describe('Float Env Processor works as expected', () => {
        validFloats.forEach(([value, expected]) => {
            it(`can retrieve a ${value} as ${!expected}`, () => {
                const container = new ContainerBuilder();
                const processor = new EnvVarProcessorManager(container);
                processor.addProcessor(new FloatEnvProcessor());

                const result = processor.getEnv('float', 'foo', (name) => {
                    expect(name).to.equals('foo');
                    return value;
                });

                expect(result).to.equals(expected);
            })
        });

        invalidFloats.forEach(value => {
            it(`Throw an exception for ${value}`, () => {
                const container = new ContainerBuilder();
                const processor = new EnvVarProcessorManager(container);
                processor.addProcessor(new FloatEnvProcessor());


                expect(processor.getEnv.bind(processor, 'float', 'foo', (name) => {
                    return value;
                })).to.throw(`Non-numeric env var "foo" cannot be cast to float.`);
            })
        });
    });
    describe('Base64 Env Processor works as expected', () => {
        validBase64s.forEach(([value, expected]) => {
            it(`can retrieve a ${value} as ${expected}`, () => {
                const container = new ContainerBuilder();
                const processor = new EnvVarProcessorManager(container);
                processor.addProcessor(new Base64EnvProcessor());

                let result = processor.getEnv('base64', 'foo', (name) => {
                    expect(name).to.equals('foo');
                    return value;
                });

                expect(result).to.equals(expected);
            });
        });
    });
    describe('Trim Env Processor works as expected', () => {
        validTrims.forEach(([value, expected]) => {
            it(`can retrieve a ${value} as ${expected}`, () => {
                const container = new ContainerBuilder();
                const processor = new EnvVarProcessorManager(container);
                processor.addProcessor(new TrimEnvProcessor());

                let result = processor.getEnv('trim', 'foo', (name) => {
                    expect(name).to.equals('foo');
                    return value;
                });

                expect(result).to.equals(expected);
            });
        });
    });
    describe('JSON Env Processor works as expected', () => {
        validJson.forEach(([value, expected]) => {
            it(`can retrieve a ${value} as ${expected}`, () => {
                const container = new ContainerBuilder();
                const processor = new EnvVarProcessorManager(container);
                processor.addProcessor(new JsonEnvProcessor());

                let result = processor.getEnv('json', 'foo', (name) => {
                    expect(name).to.equals('foo');
                    return value;
                });

                expect(JSON.stringify(result)).to.equals(JSON.stringify(expected));
            });
        });

        invalidJson.forEach(value => {
            it(`throw an error with invalid JSON: ${value}`, () => {
                const container = new ContainerBuilder();
                const processor = new EnvVarProcessorManager(container);
                processor.addProcessor(new JsonEnvProcessor());


                expect(processor.getEnv.bind(processor, 'json', 'foo', () => {
                    return value;
                })).to.throw(RuntimeException, /Invalid JSON in env var "foo"*/);
            })
        });
    });
    describe('Deal with Unknown Env Processor', () => {
        it(`throw an error when no processor was found`, () => {
            const container = new ContainerBuilder();
            const processor = new EnvVarProcessorManager(container);

            expect(processor.getEnv.bind(processor, 'json', 'foo', () => {
                return 'foo';
            })).to.throw(EnvProcessorNotFoundException, `Unsupported env var prefix`);
        });
    });
    describe('Key Env Processor works as expected', () => {
        describe('throw an error when value is not an object', () => {
            noMixedValues.forEach((item, index) => {
                it(`${index} - throw an error when value is not an object`, () => {
                    const container = new ContainerBuilder();
                    const processor = new EnvVarProcessorManager(container);
                    processor.addProcessor(new KeyEnvProcessor());


                    expect(processor.getEnv.bind(processor, 'key', 'index:foo', () => {
                        return item;
                    })).to.throw(RuntimeException, `Resolved value of "foo" did not result in an object value.`);
                    //RuntimeException(`Resolved value of "${name}" did not result in an object value.`)
                });
            })
        });
        describe('throw an error when key is not found', () => {
            invalidKeys.forEach((value, index) => {
                it(`throw an error with invalid Keys: ${index}`, () => {
                    const container = new ContainerBuilder();
                    const processor = new EnvVarProcessorManager(container);
                    processor.addProcessor(new KeyEnvProcessor());


                    expect(processor.getEnv.bind(processor, 'key', 'index:foo', () => {
                        return value;
                    })).to.throw(EnvNotFoundException, `Key "index" not found in ${JSON.stringify(value)} (resolved from "foo").`);
                })
            });
        });
        describe('can retrieve valid key', () => {
            validKeys.forEach(item => {
                it(`can retrieve key`, () => {
                    const container = new ContainerBuilder();
                    const processor = new EnvVarProcessorManager(container);
                    processor.addProcessor(new KeyEnvProcessor());

                    let result = processor.getEnv('key', 'index:foo', (name) => {
                        expect(name).to.equals('foo');
                        return item;
                    });


                    expect(result).to.equals(item.index);
                });
            });
        });
        describe('can retrieve chained key', () => {
            // validNestedKeys.forEach(item => {
                it(`can retrieve nested key`, () => {
                    const container = new ContainerBuilder();
                    const processor = new EnvVarProcessorManager(container);
                    processor.addProcessor(new KeyEnvProcessor());

                    let result = processor.getEnv('key', 'index:file:foo', (name) => {
                        expect(name).to.equals('file:foo');
                        return { index: 'password' };
                    });

                    expect(result).to.equals('password');
                });
            // });
        })


        // todo finir tests


    });
});
