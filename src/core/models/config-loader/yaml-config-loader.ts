import FileLoader from "../../../../file-loader/file-loader.model";
import YamlLoader from "../../../../file-loader/yaml-loader";
import ConfigLoaderHandlerInterface from "./config-loader-handler.interface";
import ContainerBuilderInterface from "../../interfaces/container-builder.interface";
import InvalidArgumentException from "../../exception/invalid-argument.exception";
import { dirname } from 'path';
import Publisher from "../../../publisher-subscriber/model/publisher.model";
import CONFIG_LOADER_HANDLER_EVENTS from "./config-loader-handler.event";
import ManagerInterface from "../../interfaces/manager.interface";
import Manager from "../manager.model";
import handlerInterface from "../../interfaces/handler.interface";
import DefaultResolver from "./yaml-value-resolver-handlers/default.resolver";

export default class YamlConfigLoader
    extends Publisher
    implements ConfigLoaderHandlerInterface, ManagerInterface {

    private fileLoader: YamlLoader = new YamlLoader();
    protected readonly valueResolver: Manager = new Manager('yaml-value-manager');

    constructor(id) {
        super(id);
        this.initializeHandler();
    }

    initializeHandler() {
        this.addHandler(new DefaultResolver(this.valueResolver, 'default-resolver'), 'default-resolver');
    }

    addHandler(handler: handlerInterface, name: string) {
        this.valueResolver.addHandler(handler, name);
    }

    removeHandler(name: string) {
        this.valueResolver.removeHandler(name);
    }

    load(path: string, container: ContainerBuilderInterface) {
        const content = this.fileLoader.load(path);

        if (typeof content === 'undefined') {
            return;
        }

        this.parseImport(content, path, container);
        this.parseParameters(content.parameters, path, container);
        // this.parseExtensions(content.extensions) // not yet
        this.parseResources(content.resources, path, container);
    }

    parseResources(parameters, path, container: ContainerBuilderInterface) {
        if (typeof parameters === 'undefined') {
            return;
        }
    }

    parseParameters(parameters, path, container: ContainerBuilderInterface) {
        if (typeof parameters === 'undefined') {
            return;
        }

        if (typeof parameters !== 'object') {
            throw new InvalidArgumentException(
                `The "parameters" key should contain an array in "${path}". Check your YAML syntax.`
            );
        }

        Object.keys(parameters).forEach(name => {
            // difference
            //  $this->container->setParameter($key, $this->resolveServices($value, $path, true));
            container.setParameter(name, this.resolveParameter(parameters[name]));
        });

    }

    resolveParameter(value) {
        return this.valueResolver.process(value);
    }

    parseImport(content, path: string, container: ContainerBuilderInterface) {
        if (typeof content.imports === 'undefined') {
            return;
        }

        // warning : array or js object ?
        if (!Array.isArray(content.imports)) {
            throw new InvalidArgumentException(
                `The "imports" key should contain an array in "${path}". Check your YAML syntax.`
            );
        }

        const defaultDirectory = dirname(path);
        content.imports.forEach(entry => {
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
        this.load(path, container);
    }
}