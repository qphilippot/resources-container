/* eslint-disable */
import YamlLoader from "../file-loader/yaml-loader";
import YamlConfigLoader from "./core/models/config-loader/yaml-config-loader";
import { resolve } from 'path';
import ContainerBuilder from "./core/container/container-builder.model";
import ConfigLoaderManager from "./core/models/config-loader/config-loader.manager";
import YamlContainerConfigLoader from "./core/models/config-loader/yaml-container-config-loader";
import { generateClassesMetadata } from "./generate-classes-metadata";
// const loader = new YamlLoader();

const manager = new ConfigLoaderManager('config-loader-manager');
const loader = new YamlContainerConfigLoader('yaml-config-loader');

manager.addHandler(loader, 'yaml');

const container = new ContainerBuilder();
const filepath = resolve(__dirname, './fixtures/services.yaml');
// console.log(filepath);
const content = loader.process({
    path: filepath,
    container
});

// console.log('parameters', container.getParameterBag().all());

// const reflectionService = new ReflectionService();
// const meta = generateClassesMetadata({
//     path: "C:\\Users\\Quentin\\resources-container\\src\\core\\models\\config-loader\\yaml-config-loader.ts",
//     debug: true
// });


// reflectionService.setMetadata(meta);

// const loader = new YamlLoader();
// const filepath = resolve(__dirname, './core/models/config-loader/config-loader-manager.subscriptions.yaml');
// console.log('should resolve', filepath);
// console.log('loader', loader, loader.process.toString());
//
// const content = loader.process(filepath);
//
// console.log(JSON.stringify(content, null, 4));


const mupath = resolve(__dirname, '../test/reflexivity/generate-classes-metadata/fixtures/a/classes');
const meta = generateClassesMetadata({
    path: mupath,
    debug: true,
    aliasRules: [
        {
            replace: resolve(__dirname, './..'),
            by: 'app'
        }
    ]
});

const debugDefinitionName = 'app/test/reflexivity/generate-classes-metadata/fixtures/a/classes/export-sapristi::abc';
Object.keys(meta).forEach(async entry => {
    const value = meta[entry];
    let _constructor;

    if (value.export.type === 'export:default') {
        _constructor = require(value.export.path).default;
    }
    if (value.export.type === 'export:named') {
        _constructor = require(value.export.path)[value.name];
    }

    container.getReflectionService().recordClass(entry, _constructor);

    const definition = container.register(entry, entry);
    if (entry === debugDefinitionName) {
        console.log(value);
    }

    definition
        .setFilePath(value.export.path)
        .setAutowired(true)
        .setAbstract(value.abstract);
});


// container.getDefinitions().forEach(definition => {
//     console.log(definition.getId(), definition.getResourceType());
// });

console.log('defintion', container.getDefinition(debugDefinitionName));
// console.log('ABC', container.get('app/test/reflexivity/generate-classes-metadata/fixtures/a/classes/export-sapristi::abc'));

