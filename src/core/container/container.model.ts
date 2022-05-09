import Mixed from "../../utils/mixed.interface";
import MixedInterface from "../../utils/mixed.interface";
import ContainerInterface from "../interfaces/container.interface";
import Alias from "../models/alias.model";
import {EXCEPTION_ON_INVALID_REFERENCE} from "./container-builder.invalid-behaviors";
import CircularReferencesDetectorService from "../circular-references-detector.service";
import {PublisherSubscriber} from "@qphi/publisher-subscriber";
import {INVALID_REFERENCE_ON_GET} from "./container-notification";
import ParameterBagInterface from "../parameter-bag/parameter-bag.interface";
import {checkValidId} from "./container.helper";
import SelfAliasingException from "../exception/self-aliasing.exception";
import Reference from "../models/reference.model";
import Definition from "../models/definition.model";
import EnvPlaceholderBag from "../parameter-bag/env-placeholder.bag";
import ParameterCircularReferenceException from "../exception/parameter-circular-reference.exception";
import ReadOnlyParameterBag from "../parameter-bag/read-only.parameter-bag";
import ExceptionOnInvalidReferenceFeature from "./features/exception-on-invalid-reference.feature";
import IdentifiableInterface from "@qphi/publisher-subscriber/src/interfaces/identifiable.interface";
import EnvVarProcessorManagerInterface from "../interfaces/env-var-processor-manager.interface";
import EnvVarProcessorManager from "../models/env-var-processor-manager.model";
import StringEnvProcessor from "../models/env-var-processor/string.env-processor";
import BooleanEnvProcessor from "../models/env-var-processor/boolean.env-processor";
import NotEnvProcessor from "../models/env-var-processor/not.env-processor";
import IntEnvProcessor from "../models/env-var-processor/int.env-processor";
import FloatEnvProcessor from "../models/env-var-processor/float.env-processor";
import Base64EnvProcessor from "../models/env-var-processor/base-64.env-processor";
import TrimEnvProcessor from "../models/env-var-processor/trim.env-processor";
import JsonEnvProcessor from "../models/env-var-processor/json.env-processor";
import KeyEnvProcessor from "../models/env-var-processor/key.env-processor";

class Container extends PublisherSubscriber implements ContainerInterface {
    private resources: Mixed;
    private aliases: Record<string, Alias>;
    private factories: Mixed;
    private noCompilationIsNeeded: boolean = false;
    private readonly envVarProcessorManager: EnvVarProcessorManagerInterface;
    /**
     * Contains parameters, not resources or alias
     */
    protected parameterBag: ParameterBagInterface;
    private circularReferenceDetector: CircularReferencesDetectorService = new CircularReferencesDetectorService();
    protected resolving = {};
    protected envCache = new Map<string, any>();
    private getHandlers: Record<string, Function> = {};
    private dataSlot: Record<string, any> = {};
    private features: Record<string, any> = {};

    constructor(settings: Mixed = {}) {
        super(settings.name || 'container');
        this.resources = {};
        this.aliases = {};
        this.factories = {};

        this.parameterBag = settings.parameterBag ?? new EnvPlaceholderBag();
        this.parameterBag
            .addExclusionRule(
                (values: MixedInterface) => values instanceof Reference
            )
            .addExclusionRule(
                (values: MixedInterface) => values instanceof Definition
            );

        // does not catch any exception raised in notification publication system
        this.stopPublicationOnException();
        this.injectFeature(new ExceptionOnInvalidReferenceFeature(this));

        this.envVarProcessorManager = new EnvVarProcessorManager(this);
        this.envVarProcessorManager.addProcessors([
            new StringEnvProcessor(),
            new BooleanEnvProcessor(),
            new NotEnvProcessor(),
            new IntEnvProcessor(),
            new FloatEnvProcessor(),
            new Base64EnvProcessor(),
            new TrimEnvProcessor(),
            new JsonEnvProcessor(),
            new KeyEnvProcessor()
        ]);
    }

    private injectFeature(feature: IdentifiableInterface): void {
        this.features[feature.getId()] = feature;
    }

    public getParameterBag(): ParameterBagInterface {
        return this.parameterBag;
    }

    public setParameterBag(bag: ParameterBagInterface): void {
        this.parameterBag = bag;
    }

    public getCircularReferenceDetector(): CircularReferencesDetectorService {
        return this.circularReferenceDetector;
    }


    public setResource(id: string, resource: any) {
        this.set(id, resource);
    }

    public isCompiled(): boolean {
        return this.noCompilationIsNeeded;
    }

    public hasResource(resourceId): boolean {
        return typeof this.resources[resourceId] !== "undefined";
    }

    public setDataSlot(name: string, value: any) {
        this.dataSlot[name] = value;
    }

    public getDataSlot(name: string): any {
        return this.dataSlot[name];
    }

    public getResources(): Mixed {
        return this.resources;
    }

    /**
     * @inheritDoc
     */
    public get(
        id: string,
        invalidBehavior: number = EXCEPTION_ON_INVALID_REFERENCE
    ): any {
        if (this.resources[id]) {
            return this.resources[id];
        }

        if (this.aliases[id]) {
            return this.resources[this.aliases[id].toString()];
        }

        if (id === 'service.container') {
            return this;
        }

        if (this.factories[id]) {
            return this.factories[id](id, invalidBehavior);
        }

        return this.make(id, invalidBehavior);
    }

    public make(serviceId: string, invalidBehavior: number) {
        this.circularReferenceDetector.process(serviceId);

        // todo resolve alias before compilation using AliasResolverService which contains own inlineContextualService and CircularDependencyDetector
        // if (this.aliases[serviceId]) {
        //     this.circularReferenceDetector.process(serviceId);
        //     const aliased = this.get(this.aliases[serviceId].toString(), invalidBehavior);
        //     if (aliased) {
        //         return aliased;
        //     }
        // }

        this.publish(INVALID_REFERENCE_ON_GET, {invalidBehavior, id: serviceId});

        return null;
    }

    public set(id: string, resource: any): void {
        this.resources[id] = resource;
    }

    public has(id: string) {
        const resource = this.resources[id] ?? this.resources[this.getAlias(id)?.toString()];
        return (
            resource !== null &&
            typeof resource !== 'undefined'
        );
    }

    public hasParameter(name: string): boolean {
        return this.parameterBag.has(name);
        // return typeof this.parameters[name] !== 'undefined';
    }

    public getParameter(name: string): any {
        return this.parameterBag.get(name);
        // return this.parameters[name];
    }

    public setParameter(name: string, value: any): void {
        this.parameterBag.set(name, value);
        // this.parameters[name] = value;
    }

    public getAliases(): Record<string, Alias> {
        return this.aliases;
    }

    public getAlias(alias: string): Alias {
        return this.aliases[alias];
    }

    public getResource(resourceId: string): Mixed {
        return this.resources[resourceId];
    }

    public getResourceIds(): string[] {
        return Array.from(
            new Set([
                ...Object.keys(this.aliases),
                ...Object.keys(this.resources),
                'service.container'
            ])
        )
    }

    /**
     * @throws InvalidIdException
     * @throws InvalidArgumentException
     * @param alias
     * @param id
     */
    public setAlias(alias: string, id: Alias): Alias {
        checkValidId(alias);

        if (alias === id.toString()) {
            throw new SelfAliasingException(alias);
        }

        this.aliases[alias] = id;

        return id;
    }

    public clearAliases(): void {
        this.aliases = {};
    }

    public removeAlias(alias: string): void {
        delete this.aliases[alias];
    }

    public setAliasFromString(alias: string, id: string): Alias {
        return this.setAlias(alias, new Alias(id));
    }

    public hasAlias(alias: string): boolean {
        return typeof this.aliases[alias] !== 'undefined';
    }

    public getEnv(name: string, recursiveCall: (string, Function) => any): any {
        const envName = `env(${name})`;
        if (typeof (this.resolving[envName]) !== 'undefined') {
            throw new ParameterCircularReferenceException(Object.keys(this.resolving));
        }

        if (this.envCache.has(name)) {
            return this.envCache.get(name);
        }

        let prefix, localName;
        const words = name.split(':');
        if (words.length > 1) {
            prefix = words.shift();
            localName = words.join(':');
        } else {
            prefix = 'string';
            localName = name;
        }

        // this.resolving[envName] = true;
        this.getCircularReferenceDetector().record(envName);
        try {
            return this.envCache[name] = this.envVarProcessorManager.getEnv(prefix, localName, recursiveCall ?? this.getEnv.bind(this));
        } finally {
            this.getCircularReferenceDetector().clear(envName);
        }
        // todo resolve from processor
        // const id = 'container.env_var_processors_locator';
        // if (!this.has(id)) {
        //     this.set(id, new ServiceLocator([]));
        // }
        // this.getEnv ??= \Closure::fromCallable([this, 'getEnv']);
        // processors = this.get(id);
        // const index = name.indexOf(name);
        // if (index >= 0) {
        //     prefix = substr(name, 0, index);
        //     localName = substr(name, 1 + index);
        // } else {
        //     prefix = 'string';
        //     localName = name;
        // }
        // processor = processors.has(prefix) ? processors.get(prefix) : new EnvVarProcessor(this);

        // this.resolving[envName] = true;
        // try {
        //     return this.envCache[name] = processor.getEnv(prefix, localName, this.getEnv);
        // } finally {
        //     unset(this.resolving[envName]);
        // }
    }


    /**
     * Compiles the container.
     *
     * This method does two things:
     *
     *  * Parameter values are resolved;
     *  * The parameter bag is frozen.
     */
    public compile() {
        this.parameterBag.resolve();
        this.parameterBag = new ReadOnlyParameterBag(this.parameterBag.all());
        this.noCompilationIsNeeded = true;
    }
}

export default Container;
