import {describe, it} from 'mocha';
import {expect} from 'chai';
import ContainerBuilder from "../../src/core/container-builder.model";
import EnvVarProcessorManager from "../../src/core/models/env-var-processor-manager.model";
import StringEnvProcessor from "../../src/core/models/env-var-processor/string.env-processor";
import BooleanEnvProcessor from "../../src/core/models/env-var-processor/boolean.env-processor";
import NotEnvProcessor from "../../src/core/models/env-var-processor/not.env-processor";
import IntEnvProcessor from "../../src/core/models/env-var-processor/int.env-processor";
import FloatEnvProcessor from "../../src/core/models/env-var-processor/float.env-processor";
import Base64EnvProcessor from "../../src/core/models/env-var-processor/base-64.env-processor";

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
        it(`can retrieve value as $expected`, () => {
            const container = new ContainerBuilder();
            const processor = new EnvVarProcessorManager(container);
            processor.addProcessor(new Base64EnvProcessor());

            let result = processor.getEnv('base64', 'foo', (name) => {
                expect(name).to.equals('foo');
                return Buffer.from('hello').toString('base64');
            });

            expect(result).to.equals('hello');


            result = processor.getEnv('base64', 'foo', (name) => {
                return '/+0=';
            });

            expect(result).to.equals('\x7Fm');

            result = processor.getEnv('base64', 'foo', (name) => {
                return '_-0=';
            });

            expect(result).to.equals('\x7Fm');

        });
    });
});