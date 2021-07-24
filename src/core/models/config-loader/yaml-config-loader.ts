import FileLoader from "../../../../file-loader/file-loader.model";
import YamlLoader from "../../../../file-loader/yaml-loader";
import ConfigLoaderHandlerInterface from "./config-loader-handler.interface";
import ContainerBuilderInterface from "../../interfaces/container-builder.interface";
import InvalidArgumentException from "../../exception/invalid-argument.exception";
import { dirname } from 'path';
import Publisher from "../../../publisher-subscriber/model/publisher.model";
import CONFIG_LOADER_HANDLER_EVENTS from "./config-loader-handler.event";
export default class YamlConfigLoader extends Publisher implements ConfigLoaderHandlerInterface {
    private fileLoader: YamlLoader = new YamlLoader();

    load(path: string, container: ContainerBuilderInterface) {
        const content = this.fileLoader.load(path);

        if (typeof content === 'undefined') {
            return;
        }

        this.parseImport(content, path, container);

        console.log('content', content);
        console.log("container", container);
    }

    parseImport(content, path: string, container: ContainerBuilderInterface) {
        if (typeof content === 'undefined') {
            return;
        }

        if (!Array.isArray(content.imports)) {
            throw new InvalidArgumentException(
                `The "imports" key should contain an array in "${path}". Check your YAML syntax.`
            );
        }

        const defaultDirectory = dirname(path);
        content.imports.forEach(entry => {
            console.log(entry);
            if (typeof entry === 'string') {
                entry = { resource: entry};
            }

            if (typeof entry['resource'] === 'undefined') {
                throw new InvalidArgumentException(
                    `An import should provide a "resource" in "${path}". Check your YAML syntax.`
                );
            }

            // todo check if i can remove
            this.fileLoader.setCurrentDir(defaultDirectory);

            this.publish(
                CONFIG_LOADER_HANDLER_EVENTS.REQUIRE_CONFIGURATION_IMPORT,
                {
                    config: entry,
                    dir: defaultDirectory,
                    container,
                    path
                }
            );
            // this.import(
            //     entry.resource,
            //     entry.type ?? null,
            //     entry.ignore_errors ?? false,
            //     path
            // );
           // if (Array.isArray(entry[ ]))
        });
    }

    match(key: string): boolean {
        return this.fileLoader.match(key);
    }

    /**
     * @param {Object} obj
     * @param {string} obj.path
     * @param {ContainerBuilderInterface} obj.container
     */
    process({ path, container }) {
        console.log('bad process')
        this.load(path, container);
    }
}