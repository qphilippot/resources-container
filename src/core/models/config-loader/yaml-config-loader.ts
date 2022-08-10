import YamlLoader from "../../../../file-loader/yaml-loader";
import ConfigLoaderHandlerInterface from "./config-loader-handler.interface";
import ContainerBuilderInterface from "../../interfaces/container-builder.interface";
import InvalidArgumentException from "../../exception/invalid-argument.exception";
import {dirname} from 'path';
import {Publisher, PublisherInterface} from '@qphi/publisher-subscriber';
import CONFIG_LOADER_HANDLER_EVENTS from "./config-loader-handler.event";
import ManagerInterface from "../../interfaces/manager.interface";
import Manager from "../manager.model";
import handlerInterface from "../../interfaces/handler.interface";
import DefaultResolver from "./yaml-value-resolver-handlers/default.resolver";
import {BoundArgument} from "../bound-argument.model";
import YamlDefinitionParser from "./YamlDefinitionParser.model";
import {DEFAULTS_KEYWORDS} from "./default.config";

export default class YamlConfigLoader
    extends Publisher
    implements ConfigLoaderHandlerInterface, ManagerInterface, PublisherInterface {

    private fileLoader: YamlLoader = new YamlLoader();
    protected readonly valueResolver: Manager = new Manager('yaml-value-manager');
    protected readonly defaultResolver: handlerInterface = new DefaultResolver(this.valueResolver, 'default-resolver')
    private instanceOf = [];
    private isLoadingInstanceOf: boolean = false;

    private definitionParser: YamlDefinitionParser = new YamlDefinitionParser();

    constructor(id) {
        super(id);
        this.initializeHandler();
    }

    public initializeHandler(): void {
        this.addHandler(new DefaultResolver(this.valueResolver, 'default-resolver'), 'default-resolver');
    }

    public addHandler(handler: handlerInterface, name: string) {
        this.valueResolver.addHandler(handler, name);
    }

    public removeHandler(name: string) {
        this.valueResolver.removeHandler(name);
    }

    public load(path: string, container: ContainerBuilderInterface) {
        const content = this.fileLoader.load(path);

        this.definitionParser.setContainer(container);

        if (typeof content === 'undefined') {
            return;
        }

        // validate
        if (typeof content !== 'object') {
            throw new InvalidArgumentException(
                `The service file "${path}" is not valid. It should contain an array. Check your YAML syntax.`
            );
        }

        // check first level are valid entry
        Object.keys(content).forEach(entry => {
            if (
                !['imports', 'parameters', 'services'].includes(entry)
            ) {
                // todo str_starts_with($namespace, 'when@')
                // todo check supported extensions
                throw new InvalidArgumentException(
                    `There is no extension able to load the configuration for "${entry}" (in "${path}"). Looked for namespace "${entry}", found "none".`
                );
            }
        });

        // loadContent(
        this.parseImports(content, path, container);
        this.parseParameters(content.parameters, path, container);
        // this.parseExtensions(content.extensions) // not yet
        this.parseServices(content.services, path, container);
    }

    public parseServices(services, path, container: ContainerBuilderInterface) {
        if (typeof services === 'undefined' || services === null) {
            return;
        }

        if (typeof services !== 'object') {
            throw new InvalidArgumentException(
                `The "services" key should contain an array in "${path}". Check your YAML syntax.`
            );
        }

        // todo transform in feature
        if (typeof services['_instanceof'] !== 'undefined') {
            const _instanceof = services._instanceof;
            delete services._instanceof;
            this.resolveInstanceOf(_instanceof, path, container);
        }

        this.isLoadingInstanceOf = false;
        const defaults = this.parseDefaults(services, path);

        Object.keys(services).forEach(id => {
            this.parseDefinition(id, services[id], path, defaults);
        });
    }

    /**
     * @throws InvalidArgumentException
     */
    public parseDefaults(parameters, path: string) {
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
                    tag = {name: entry};
                }

                const keys = Object.keys(tag);
                if (keys.length === 1 && typeof tag[keys[0]] === 'object') {
                    name = keys[0];
                    tag = tag[keys[0]];
                } else {
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

                Object.keys(tag).forEach((attribute: string) => {
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
    public parseDefinition(id: string, resource: object | string | null, path: string, defaults, shouldReturn = false) {
        this.definitionParser.parse(id, resource, path, shouldReturn);
    }

    /* eslint-disable  @typescript-eslint/no-unused-vars */
    public resolveInstanceOf(_instanceof, path, container: ContainerBuilderInterface) {
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

    public parseParameters(parameters, path, container: ContainerBuilderInterface) {
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

    public resolveValue(value) {
        try {
            return this.valueResolver.process(value);
        } catch (err) {
            console.error(err);

        }

    }

    public parseImports(content, path: string, container: ContainerBuilderInterface) {
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
                entry = {resource: entry};
            }

            if (typeof entry['resource'] === 'undefined' || entry['resource'] === null) {
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

    public match(key: string): boolean {
        return this.fileLoader.match(key);
    }

    /**
     * @param {Object} obj
     * @param {string} obj.path
     * @param {ContainerBuilderInterface} obj.container
     */
    public process({ path, container }) {
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
