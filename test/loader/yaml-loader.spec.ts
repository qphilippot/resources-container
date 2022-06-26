import {describe, it} from 'mocha';
import {expect} from 'chai';
import YamlContainerConfigLoader from "../../src/core/models/config-loader/yaml-container-config-loader";
import ContainerBuilder from "../../src/core/container/container-builder.model";
import InvalidArgumentException from "../../src/core/exception/invalid-argument.exception";
import * as path from "path";
import Reference from "../../src/core/models/reference.model";
import ConfigLoaderManager from "../../src/core/models/config-loader/config-loader.manager";
import CannotImportFileException from "../../src/core/models/config-loader/cannot-import-file.exception";

const fixturePath = path.resolve(__dirname, "../fixtures/");

describe('Container', () => {
    it('throw an exception loading unexisting file', function () {
        const loader = new YamlContainerConfigLoader('test-yaml-config-loader');
        const builder = new ContainerBuilder();

        const filePath = path.resolve(fixturePath, 'foo.yaml');

        expect(loader.load.bind(loader, filePath, builder)).to.throw(
            InvalidArgumentException,
            `The file "${filePath}" does not exist`
        );
    });

    it('throw an exception loading non YAML file', function () {
        const loader = new YamlContainerConfigLoader('test-yaml-config-loader');
        const builder = new ContainerBuilder();
        const filePath = path.resolve(fixturePath, './ini/parameters.ini');
        expect(loader.load.bind(loader, filePath, builder)).to.throw(
            InvalidArgumentException,
            `The file "${filePath}" does not contain valid YAML.`
        );
    });

    it('throw an exception loading invalid YAML file', function () {
        const invalidYaml = [
            'bad_parameters.yml',
            'bad_imports.yml',
            'bad_import.yml',
            'bad_services.yml',
            'bad_service.yml',
            'bad_calls.yml',
            'bad_format.yml',
            'nonvalid1.yml',
            'nonvalid2.yml'
        ];

        const loader = new YamlContainerConfigLoader('test-yaml-config-loader');
        const builder = new ContainerBuilder();

        invalidYaml.forEach(suffix => {
            const filePath = path.resolve(fixturePath, './yaml', suffix);

            expect(loader.load.bind(loader, filePath, builder)).to.throw(
                InvalidArgumentException
            );
        })

    });

    it('load parameters', function () {
        const loader = new YamlContainerConfigLoader('test-yaml-config-loader');
        const builder = new ContainerBuilder();
        const filePath = path.resolve(fixturePath, './yaml/services2.yml');
        loader.load(filePath, builder);

        const parameters = builder.getParameterBag().all();

        expect(parameters.foo).to.equals('bar');
        expect(JSON.stringify(parameters.mixedcase)).to.equals('{"MixedCaseKey":"value"}');
        expect(JSON.stringify(parameters.values)).to.equals(JSON.stringify([true, false, 0, 1000.3, Number.MAX_SAFE_INTEGER]));
        expect(parameters.bar).to.equals('foo');
        expect(parameters.escape).to.equals('@escapeme');
        expect(parameters.foo_bar.toString()).to.equals((new Reference('foo_bar')).toString());

        expect(JSON.stringify(parameters).length).to.equals(JSON.stringify({
            'foo': 'bar',
            'mixedcase': {
                'MixedCaseKey': 'value'
            },
            values: [true, false, 0, 1000.3, Number.MAX_SAFE_INTEGER],
            bar: 'foo',
            escape: '@escapeme',
            foo_bar: new Reference('foo_bar')
        }).length);
    });

    describe('load imports', function () {
        it('merge paramerters', function () {
            const loader = new YamlContainerConfigLoader('test-yaml-config-loader');
            const builder = new ContainerBuilder();
            const filePath = path.resolve(fixturePath, './yaml');
            const manager = new ConfigLoaderManager('config-loader-manager');
            manager.addHandler(loader, 'yaml');
            loader.load(path.resolve(filePath, 'services4.yml'), builder);
            const parameters = builder.getParameterBag().all();

            // difference: load only yaml config files
            // Check overrides
            expect(parameters.foo).to.equals('foo');
            expect(JSON.stringify(parameters.values)).to.equals(JSON.stringify([true, false]));
            // Check overrides does not remove any keys
            expect(Object.keys(parameters).length).to.equals(6);
        });

        it('does not throw error with bad import due to ignore_errors value', function () {
            const loader = new YamlContainerConfigLoader('test-yaml-config-loader');
            const builder = new ContainerBuilder();
            const filePath = path.resolve(fixturePath, './yaml');
            const manager = new ConfigLoaderManager('config-loader-manager');
            manager.addHandler(loader, 'yaml');

            // Bad import throws no exception due to ignore_errors value.
            loader.load(path.resolve(filePath, 'services4_bad_import.yml'), builder);
        });

        it('does not throw error with nonexistent file due to ignore_errors: not_found value', function () {
            const loader = new YamlContainerConfigLoader('test-yaml-config-loader');
            const builder = new ContainerBuilder();
            const filePath = path.resolve(fixturePath, './yaml');
            const manager = new ConfigLoaderManager('config-loader-manager');
            manager.addHandler(loader, 'yaml');
            // Bad import with nonexistent file throws no exception due to ignore_errors: not_found value.
            loader.load(path.resolve(filePath, 'services4_bad_import_file_not_found.yml'), builder);
        });

        it('throws error with nonexistent file by default', function () {
            const loader = new YamlContainerConfigLoader('test-yaml-config-loader');
            const builder = new ContainerBuilder();
            const filePath = path.resolve(fixturePath, './yaml');
            const manager = new ConfigLoaderManager('config-loader-manager');
            manager.addHandler(loader, 'yaml');

            const resolvedPath = path.resolve(filePath, 'services4_bad_import_with_errors.yml');
            expect(
                loader.load.bind(loader, resolvedPath, builder)
            ).to.throw(
                CannotImportFileException,
                `Cannot import "${path.resolve(filePath, 'foo_fake.yml')}" from "${resolvedPath}".`
            );
        });


    });
});
