import {describe, it} from 'mocha';
import {expect} from 'chai';
import YamlContainerConfigLoader from "../../src/core/models/config-loader/yaml-container-config-loader";
import ContainerBuilder from "../../src/core/container/container-builder.model";
import InvalidArgumentException from "../../src/core/exception/invalid-argument.exception";
import * as path from "path";

const fixturePath =  path.resolve(__dirname, "../fixtures/");

describe('Container', () => {
    it('throw an exception loading unexisting file', function () {
        const loader = new YamlContainerConfigLoader('test-yaml-config-loader');
        const builder = new ContainerBuilder();

        const filePath = path.resolve(fixturePath, 'foo.yaml');

        expect(loader.load.bind(loader,  filePath, builder )).to.throw(
            InvalidArgumentException,
            `The file "${filePath}" does not exist`
        );
    });

    it('throw an exception loading non YAML file', function () {
        const loader = new YamlContainerConfigLoader('test-yaml-config-loader');
        const builder = new ContainerBuilder();
        const filePath = path.resolve(fixturePath, './ini/parameters.ini');
        expect(loader.load.bind(loader,  filePath, builder )).to.throw(
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

            expect(loader.load.bind(loader,  filePath, builder )).to.throw(
                InvalidArgumentException
            );
        })

    });
});
