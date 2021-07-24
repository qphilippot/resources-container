import YamlLoader from "../file-loader/yaml-loader";
import YamlConfigLoader from "./core/models/config-loader/yaml-config-loader";
import { resolve } from 'path';
import ContainerBuilder from "./core/container-builder.model";

// const loader = new YamlLoader();
// const loader = new YamlConfigLoader();
// const container = new ContainerBuilder();
// const filepath = resolve(__dirname, './services.yaml');
// console.log(filepath);
// const content = loader.process({
//     path: filepath,
//     container
// });



const loader = new YamlLoader();
const filepath = resolve(__dirname, './core/models/config-loader/config-loader-manager.subscriptions.yaml');
console.log('should resolve', filepath);
console.log('loader', loader, loader.process.toString());

const content = loader.process(filepath);

console.log(JSON.stringify(content, null, 4));