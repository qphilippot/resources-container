import {describe, it} from 'mocha';
import {expect} from 'chai';
import EnvPlaceholderBag from "../../src/core/parameter-bag/env-placeholder.bag";
import InvalidArgumentException from "../../src/core/exception/invalid-argument.exception";
import RuntimeException from "../../src/core/exception/runtime.exception";

// todo reuse parameter-bag spec with this class...
// todo define what is "word" characters in tutorial
describe('env placeholder parameter bag', () => {
    it('throws invalid argument exception if env name contains non word characters', function () {
        const bag = new EnvPlaceholderBag();
        expect(bag.get.bind(bag, 'env(%foo%)')).to.throw(
            InvalidArgumentException,
            'Invalid env(%foo%) name: only "word" characters are allowed.'
        );
    });

    it("merge won't duplicate identical parameters", function () {
        const bag = new EnvPlaceholderBag();
        const anotherBag = new EnvPlaceholderBag();

        const envVariableName = 'DB_HOST';
        const parameter = `env(${envVariableName})`;
        // initialize placeholders
        bag.get(parameter);

        bag.mergeEnvPlaceholders(anotherBag);
        const mergedPlaceholders = bag.getEnvPlaceholders();

        const placeholders = mergedPlaceholders.get(envVariableName) ?? [];

        expect(Array.isArray(placeholders)).to.be.true;
        expect(placeholders.length).to.equals(1);
        const placeholder = placeholders[0];
        expect(typeof placeholder).to.equals('string');
        expect(placeholder.includes(envVariableName)).to.be.true;
    });

    it("merges even if first bag is empty", function () {
        const bag = new EnvPlaceholderBag();
        const anotherBag = new EnvPlaceholderBag();

        const envVariableName = 'DB_HOST';
        const parameter = `env(${envVariableName})`;

        // initialize placeholder only in second bag
        anotherBag.get(parameter);

        expect(bag.getEnvPlaceholders().size).to.equals(0);

        bag.mergeEnvPlaceholders(anotherBag);
        const mergedPlaceholders = bag.getEnvPlaceholders();

        const placeholders = mergedPlaceholders.get(envVariableName) ?? [];

        expect(Array.isArray(placeholders)).to.be.true;
        expect(placeholders.length).to.equals(1);
        const placeholder = placeholders[0];
        expect(typeof placeholder).to.equals('string');
        expect(placeholder.includes(envVariableName)).to.be.true;
    });

    it("merges placeholders even if it exists only in second bag", function () {
        const bag = new EnvPlaceholderBag();
        const anotherBag = new EnvPlaceholderBag();
        const uniqueEnvName = 'DB_HOST';
        const sharedEnvName = 'DB_user';
        const sharedParameter = `env(${sharedEnvName})`;
        const uniqueParameter = `env(${uniqueEnvName})`;

        bag.get(sharedParameter);
        anotherBag.mergeEnvPlaceholders(bag);
        anotherBag.get(uniqueParameter)
        bag.mergeEnvPlaceholders(anotherBag);
        const mergedPlaceholders = bag.getEnvPlaceholders();
        expect((mergedPlaceholders.get(uniqueEnvName) ?? []).length).to.equals(1);
        expect((mergedPlaceholders.get(sharedEnvName) ?? []).length).to.equals(1)
    });

    it("merges placeholders different identifiers for placeholder", function () {
        const bag = new EnvPlaceholderBag();
        const anotherBag = new EnvPlaceholderBag();
        const sharedEnvName = 'DB_user';
        const sharedParameter = `env(${sharedEnvName})`;

        bag.get(sharedParameter);
        anotherBag.get(sharedParameter)
        bag.mergeEnvPlaceholders(anotherBag);
        const mergedPlaceholders = bag.getEnvPlaceholders();
        expect((mergedPlaceholders.get(sharedEnvName) ?? []).length).to.equals(2)
    });

    it('requires string to resolve env', function () {
        const bag = new EnvPlaceholderBag();
        bag.get('env(INT_VAR)');
        bag.set( 'env(INT_VAR)', 2);
        expect(bag.resolve.bind(bag)).to.throw(
            RuntimeException,
            'The default value of env parameter "INT_VAR" must be a string or null, "number" given.'
        );
    });

    it('get default scalar env', function () {
        const bag = new EnvPlaceholderBag();
        bag.set( 'env(INT_VAR)', 2);

        expect(bag.get.bind(bag, 'env(INT_VAR)')).to.throw(
            RuntimeException,
            'The default value of an env() parameter must be a string or null, but "Number" given to "env(INT_VAR)"'
        );
    });

    it('get default scalar env', function () {
        const bag = new EnvPlaceholderBag();
        expect(bag.get('env(INT_VAR)')).match(/env_.*_INT_VAR_.*/);

        bag.set( 'env(INT_VAR)', '2');
        expect(bag.get('env(INT_VAR)')).match(/env_.*_INT_VAR_.*/);
        expect(bag.all()['env(INT_VAR)']).to.equals('2');
        bag.resolve();

        expect(bag.get('env(INT_VAR)')).match(/env_.*_INT_VAR_.*/);
        expect(bag.all()['env(INT_VAR)']).to.equals('2');
    });

    it('allow null value on resolve ', function () {
        const bag = new EnvPlaceholderBag();
        bag.get('env(NULL_VAR)');
        bag.set('env(NULL_VAR)', null);
        bag.resolve();
        expect(bag.all()['env(NULL_VAR)']).to.be.null;
    });

    it('allow null value on get ', function () {
        const bag = new EnvPlaceholderBag();
        bag.set('env(NULL_VAR)', null);
        bag.get('env(NULL_VAR)');
        bag.resolve();
        expect(bag.all()['env(NULL_VAR)']).to.be.null;
    });

    it('thrown exception resolving invalid default values', function () {
        const bag = new EnvPlaceholderBag();
        bag.get('env(ARRAY_VAR)');
        bag.set('env(ARRAY_VAR)', []);

        expect(bag.resolve.bind(bag)).to.throw(
            RuntimeException,
            'The default value of env parameter "ARRAY_VAR" must be a string or null, "object" given.'
        );
    });

    it('thrown exception getting invalid default values', function () {
        const bag = new EnvPlaceholderBag();
        bag.set('env(ARRAY_VAR)', []);

        expect(bag.get.bind(bag, 'env(ARRAY_VAR)')).to.throw(
            RuntimeException,
            'The default value of an env() parameter must be a string or null, but "Array" given to "env(ARRAY_VAR)".'
        );
    });

    it('testDefaultToNullAllowed', function () {
        const bag = new EnvPlaceholderBag();
        bag.resolve();
        expect(bag.get('env(default::BAR)')).to.be.not.null;
    });

    it('testExtraCharsInProcessor', function () {
        const bag = new EnvPlaceholderBag();
        bag.resolve();
        expect(bag.get('env(key:a.b-c:FOO)')).match(/env_.*_key_a_b_c_FOO_.*/);
    });
});
