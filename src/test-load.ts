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

console.log('content', content);

// const reflexionService = new ReflexionService();
// const meta = generateClassesMetadata({
//     path: "C:\\Users\\Quentin\\resources-container\\src\\core\\models\\config-loader\\yaml-config-loader.ts",
//     debug: true
// });
//
// reflexionService.setMetadata(meta);

// const loader = new YamlLoader();
// const filepath = resolve(__dirname, './core/models/config-loader/config-loader-manager.subscriptions.yaml');
// console.log('should resolve', filepath);
// console.log('loader', loader, loader.process.toString());
//
// const content = loader.process(filepath);
//
// console.log(JSON.stringify(content, null, 4));