import {describe, it} from 'mocha';
import {expect} from 'chai';
import YamlContainerConfigLoader from "../../src/core/models/config-loader/yaml-container-config-loader";
import ContainerBuilder from "../../src/core/container/container-builder.model";
import InvalidArgumentException from "../../src/core/exception/invalid-argument.exception";
import * as path from "path";
import Reference from "../../src/core/models/reference.model";
import ConfigLoaderManager from "../../src/core/models/config-loader/config-loader.manager";
import CannotImportFileException from "../../src/core/models/config-loader/cannot-import-file.exception";
import FileNotFoundException from "../../file-loader/file-not-found.exception";
import {Scope} from "eslint";
import Definition from '../../src/core/models/definition.model';

const fixturePath = path.resolve(__dirname, "../fixtures/");

describe('Container', () => {
    it('throw an exception loading unexisting file', function () {
        const loader = new YamlContainerConfigLoader('test-yaml-config-loader');
        const builder = new ContainerBuilder();

        const filePath = path.resolve(fixturePath, 'foo.yaml');

        expect(loader.load.bind(loader, filePath, builder)).to.throw(
            FileNotFoundException,
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
                `The file "${path.resolve(filePath, 'foo_fake.yml')}" does not exist (which is being imported from "${resolvedPath}").`
            );
        });

        it('throws error with invalid file by default', function () {
            const loader = new YamlContainerConfigLoader('test-yaml-config-loader');
            const builder = new ContainerBuilder();
            const filePath = path.resolve(fixturePath, './yaml');
            const manager = new ConfigLoaderManager('config-loader-manager');
            manager.addHandler(loader, 'yaml');

            const resolvedPath = path.resolve(filePath, 'services4_bad_import_nonvalid.yml');
            const expectedFailurePath = path.resolve(filePath, 'nonvalid2.yml');
            expect(
                loader.load.bind(loader, resolvedPath, builder)
            ).to.throw(
                CannotImportFileException,
                `The service file "${expectedFailurePath}" is not valid. It should contain an array. Check your YAML syntax in ${expectedFailurePath} (which is being imported from "${resolvedPath}").`
            );
        });
    });

    // todo: support when@env config feature
    // describe('load with environment', function () {
    //
    // });

    describe('load services', function () {
        it('default behavior', function () {
            const loader = new YamlContainerConfigLoader('test-yaml-config-loader');
            const builder = new ContainerBuilder();
            const filePath = path.resolve(fixturePath, './yaml');
            loader.load(path.resolve(filePath, 'services6.yml'), builder);
            // const definitions = builder.getDefinitions();

            // foo definition exists and its class it "FooClass"
            expect(builder.getDefinition.bind(builder,'foo')).to.not.throw();
            expect(builder.getDefinition('foo').getResourceType()).to.equals('FooClass');

            // not_shared exists and it is not shared
            expect(builder.getDefinition.bind(builder,'not_shared')).to.not.throw();
            expect(builder.getDefinition('not_shared').isShared()).to.be.false;

            // file exists and has right filepath
            expect(builder.getDefinition.bind(builder,'file')).to.not.throw();
            expect(builder.getDefinition('file').getFilePath()).to.equals('%path%/foo.js');

            // arguments exists and has right args
            expect(builder.getDefinition.bind(builder,'arguments')).to.not.throw();
            const args = builder.getDefinition("arguments").getArguments();
            expect(args[0]).to.equals('foo');
            expect(args[1]).to.be.instanceof(Reference);
            expect(args[1].toString()).to.equals('foo');
            expect(JSON.stringify(args[2])).to.equals('[true,false]');

            // TODO finir la méthode parseDefinition 🤯🤯
            // difference: load only yaml config files
            // Check overrides
            // expect(definitions.find((definition: Definition) => definition.getId() === 'foo')).to.be.instanceof(Definition);
            // expect(JSON.stringify(parameters.values)).to.equals(JSON.stringify([true, false]));
            // // Check overrides does not remove any keys
            // expect(Object.keys(parameters).length).to.equals(6);

            const methodCalls = builder.getDefinition('method_call2').getMethodCalls();
            const call = methodCalls[0];
            expect(call[0]).to.equals('setBar');
            expect(call[1][0]).to.equals('foo');
            expect(call[1][1]).to.be.instanceof(Reference);
            expect(call[1][1].toString()).to.equals('foo');

            expect(JSON.stringify(call[1][2])).to.equals('[true,false]');

            expect(builder.getDefinition('new_factory1').getFactory()).to.equals('factory');
            let newFactory2 = builder.getDefinition('new_factory2').getFactory();
            expect(Array.isArray(newFactory2)).to.be.true;

            expect((newFactory2 as Array<any>)[0]).to.be.instanceof(Reference);
            expect((newFactory2 as Array<any>)[0].toString()).to.be.equals('baz');
            expect((newFactory2 as Array<any>)[1]).to.equals('getClass');

            let newFactory3 = builder.getDefinition('new_factory3').getFactory();
            expect(Array.isArray(newFactory3)).to.be.true;
            expect(JSON.stringify(newFactory3)).to.equals('["BazClass","getInstance"]');
            let newFactory4 = builder.getDefinition('new_factory4').getFactory();
            expect(Array.isArray(newFactory4)).to.be.true;
            expect(JSON.stringify(newFactory4)).to.equals('[null,"getInstance"]');

            let newFactory5 = builder.getDefinition('new_factory5').getFactory();
            expect(Array.isArray(newFactory5)).to.be.true;
            expect((newFactory5 as Array<any>)[0]).to.be.instanceof(Reference);
            expect((newFactory5 as Array<any>)[0].toString()).to.be.equals('baz');
            expect((newFactory5 as Array<any>)[1]).to.equals('__invoke');

        });
    });
});
