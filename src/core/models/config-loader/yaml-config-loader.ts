import FileLoader from "../../../../file-loader/file-loader.model";
import YamlLoader from "../../../../file-loader/yaml-loader";
import ConfigLoaderHandlerInterface from "./config-loader-handler.interface";
import ContainerBuilderInterface from "../../interfaces/container-builder.interface";
import InvalidArgumentException from "../../exception/invalid-argument.exception";
import { dirname } from 'path';
import { Publisher } from '@qphi/publisher-subscriber';
import CONFIG_LOADER_HANDLER_EVENTS from "./config-loader-handler.event";
import ManagerInterface from "../../interfaces/manager.interface";
import Manager from "../manager.model";
import handlerInterface from "../../interfaces/handler.interface";
import DefaultResolver from "./yaml-value-resolver-handlers/default.resolver";
import {BoundArgument} from "../bound-argument.model";
import YamlDefinitionParserModel from "./YamlDefinitionParser.model";
import YamlDefinitionParser from "./YamlDefinitionParser.model";

const SERVICE_KEYWORDS = {
    'alias' : 'alias',
    'parent' : 'parent',
    'class' : 'class',
    'shared' : 'shared',
    'synthetic' : 'synthetic',
    'lazy' : 'lazy',
    'public' : 'public',
    'abstract' : 'abstract',
    'deprecated' : 'deprecated',
    'factory' : 'factory',
    'file' : 'file',
    'arguments' : 'arguments',
    'properties' : 'properties',
    'configurator' : 'configurator',
    'calls' : 'calls',
    'tags' : 'tags',
    'decorates' : 'decorates',
    'decoration_inner_name' : 'decoration_inner_name',
    'decoration_priority' : 'decoration_priority',
    'decoration_on_invalid' : 'decoration_on_invalid',
    'autowire' : 'autowire',
    'autoconfigure' : 'autoconfigure',
    'bind' : 'bind',
};

const PROTOTYPE_KEYWORDS = {
    'resource' : 'resource',
    'namespace' : 'namespace',
    'exclude' : 'exclude',
    'parent' : 'parent',
    'shared' : 'shared',
    'lazy' : 'lazy',
    'public' : 'public',
    'abstract' : 'abstract',
    'deprecated' : 'deprecated',
    'factory' : 'factory',
    'arguments' : 'arguments',
    'properties' : 'properties',
    'configurator' : 'configurator',
    'calls' : 'calls',
    'tags' : 'tags',
    'autowire' : 'autowire',
    'autoconfigure' : 'autoconfigure',
    'bind' : 'bind',
};

const INSTANCEOF_KEYWORDS = {
    'shared' : 'shared',
    'lazy' : 'lazy',
    'public' : 'public',
    'properties' : 'properties',
    'configurator' : 'configurator',
    'calls' : 'calls',
    'tags' : 'tags',
    'autowire' : 'autowire',
    'bind' : 'bind',
};

const DEFAULTS_KEYWORDS = [
    'public',
    'tags',
    'autowire',
    'autoconfigure',
    'bind'
];


export default class YamlConfigLoader
    extends Publisher
    implements ConfigLoaderHandlerInterface, ManagerInterface {

    private fileLoader: YamlLoader = new YamlLoader();
    protected readonly valueResolver: Manager = new Manager('yaml-value-manager');
    private instanceOf = [];
    private isLoadingInstanceOf: boolean = false;

    private definitionParser: YamlDefinitionParser = new YamlDefinitionParser();

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

        this.definitionParser.setContainer(container);

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

        if (typeof parameters !== 'object') {
            throw new InvalidArgumentException(
                `The "services" key should contain an array in "${path}". Check your YAML syntax.`
            );
        }

        // todo transform in feature
        if (typeof parameters['_instanceof'] !== 'undefined') {
            const _instanceof = parameters._instanceof;
            delete parameters._instanceof;
            this.resolveInstanceOf(_instanceof, path, container);
        }

        this.isLoadingInstanceOf = false;
        const defaults = this.parseDefaults(parameters, path);
        
        Object.keys(parameters.services).forEach(id => {
            const service = parameters.services[id];
            this.parseDefinition(id, service, path, defaults);
        })
    }

    /**
     * @throws InvalidArgumentException
     */
    parseDefaults(parameters, path: string) {
        if (typeof parameters['_default'] === 'undefined') {
            return {};
        }
        
        const defaults = parameters._default;
        delete parameters._default;
        
        if (typeof defaults !== 'object') {
            throw new InvalidArgumentException(
                `Service "_defaults" key must be an array, "${typeof defaults}" given in "${path}".`
            );
        }

        Object.keys(defaults).forEach(key => {
            if (DEFAULTS_KEYWORDS.indexOf(key) < 0) {
                throw new InvalidArgumentException(
                    `The configuration key "${key}" cannot be used to define a default value in "${path}". Allowed keys are "${DEFAULTS_KEYWORDS.toString()}".`
                );
            }
        });

        // todo: transform in handlers
        if (typeof defaults['tags'] !== 'undefined') {
            if (typeof defaults.tags !== 'object') {
                throw new InvalidArgumentException(
                    `Parameter "tags" in "_defaults" must be an object in "${path}". Check your YAML syntax.`
                );
            }

            Object.keys(defaults.tags).forEach(entry => {
                let tag: any = entry;
                let name: string;

                if (typeof entry === 'string') {
                    tag = { name: entry };
                }

                const keys = Object.keys(tag);
                if (keys.length === 1 && typeof tag[keys[0]] === 'object') {
                    name = keys[0];
                    tag = tag[keys[0]];
                }

                else {
                    if (typeof tag.name !== 'undefined') {
                        throw new InvalidArgumentException(
                            `A "tags" entry in "_defaults" is missing a "name" key in "${path}".`
                        );
                    }

                    name = tag.name;
                    delete tag.name;
                }

                if (typeof name !== 'string' || name.length === 0) {
                    throw new InvalidArgumentException(
                        `The tag name in "_defaults" must be a non-empty string in "${path}".`
                    );
                }

                Object.keys(tag).forEach((attribute:string) => {
                    const value = tag[attribute];
                    const isScalar = /boolean|number|string/.test(typeof value);
                    if (!isScalar && value !== null) {
                        throw new InvalidArgumentException(
                            `Tag "${name}", attribute "${attribute}" in "_defaults" must be of a scalar-type in "${path}". Check your YAML syntax.`
                        );
                    }
                });
            });

            if (typeof defaults.bind !== 'undefined') {
                if (typeof defaults.bind !== 'object') {
                    throw new InvalidArgumentException(
                        `Parameter "bind" in "_defaults" must be an object in "${path}". Check your YAML syntax.`
                    );
                }

                const resolvedResource = this.resolveValue(defaults.bind);
                resolvedResource.forEach(arg => {
                    const value = resolvedResource[arg];
                    defaults.bind[arg] = new BoundArgument(value, true, BoundArgument.DEFAULTS_BINDING, path);
                });
            }

            return defaults;
        }
    }
    /**
     * Parses a definition.
     * @param id
     * @param resource
     * @param path
     * @param defaults
     * @param shouldReturn
     * @throws InvalidArgumentException When tags are invalid
     */
    parseDefinition(id: string, resource: object | string | null, path: string, defaults, shouldReturn = false) {
        this.definitionParser.parse(id, resource, path, shouldReturn);
    }

    resolveInstanceOf(_instanceof, path, container: ContainerBuilderInterface) {
        if (typeof _instanceof !== 'object') {
            throw new InvalidArgumentException(
                `Service "_instanceof" key must be an array, "${typeof _instanceof}" given in "${path}".`
            );
        }

        this.instanceOf = [];
        this.isLoadingInstanceOf = true;

        Object.keys(_instanceof).forEach(id => {
            const resource = _instanceof[id];

            if (typeof resource !== 'object') {
                throw new InvalidArgumentException(
                    `Type definition "${id}" must be a non-empty array within "_instanceof" in "${path}". Check your YAML syntax.`
                );
            }

            this.parseDefinition(id, resource, path, [], false);
        });


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
            container.setParameter(name, this.resolveValue(parameters[name]));
        });

    }

    resolveValue(value) {
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
        return this.load(path, container);
    }


    // clearInstanceOf() {
    //     this.instanceOf = []
    // }
    //
    // getInstanceOf() {
    //     return this.instanceOf;
    // }
}