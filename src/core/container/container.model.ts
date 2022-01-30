import Mixed from "../../utils/mixed.interface";
import MixedInterface from "../../utils/mixed.interface";
import ContainerInterface from "../interfaces/container.interface";
import Alias from "../models/alias.model";
import {EXCEPTION_ON_INVALID_REFERENCE} from "./container-builder.invalid-behaviors";
import CircularReferencesDetectorService from "../circular-references-detector.service";
import {PublisherSubscriber} from "@qphi/publisher-subscriber";
import {INVALID_REFERENCE_ON_GET} from "./container-notification";
import ParameterBagInterface from "../parameter-bag/parameter-bag.interface";
import ParameterBag from "../parameter-bag/parameter-bag.model";
import {checkValidId} from "./container.helper";
import SelfAliasingException from "../exception/self-aliasing.exception";
import Reference from "../models/reference.model";
import Definition from "../models/definition.model";
import EnvPlaceholderBag from "../parameter-bag/env-placeholder.bag";

class Container extends PublisherSubscriber implements ContainerInterface {
    private resources: Mixed;
    private aliases: Record<string, Alias>;
    private factories: Mixed;
    /**
     * Contains parameters, not resources or alias
     * @private
     */
    private parameterBag: ParameterBagInterface;
    private circularReferenceDetector: CircularReferencesDetectorService = new CircularReferencesDetectorService();

    private getHandlers: Record<string, Function> = {};
    private dataSlot: Record<string, any> = {};

    constructor(settings: Mixed = {}) {
        super(settings.name || 'container');
        this.resources = {};
        this.aliases = {};
        // this.parameters = {};
        this.factories = {};

        this.parameterBag = settings.parameterBag ?? new EnvPlaceholderBag();
        this.parameterBag
            .addExclusionRule(
                (values: MixedInterface) => values instanceof Reference
            )
            .addExclusionRule(
                (values: MixedInterface) => values instanceof Definition
            );
    }

    public getParameterBag(): ParameterBagInterface {
        return this.parameterBag;
    }

    public getCircularReferenceDetector(): CircularReferencesDetectorService {
        return this.circularReferenceDetector;
    }


    public setResource(id: string, resource: any) {
        this.set(id, resource);
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

        if (id === 'service_container') {
            return this;
        }

        if (this.factories[id]) {
            return this.factories[id](id, invalidBehavior);
        }

        return this.make(id, invalidBehavior);
    }

    public make(serviceId: string, invalidBehavior: number) {
        this.circularReferenceDetector.process(serviceId);

        this.publish(INVALID_REFERENCE_ON_GET, {invalidBehavior, id: serviceId});

        return null;
    }

    public set(id: string, resource: any): void {
        this.resources[id] = resource;
    }

    public has(id: string) {
        const resource = this.resources[id];
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

    public removeAlias(alias: string): void {
        delete this.aliases[alias];
    }

    public setAliasFromString(alias: string, id: string): Alias {
        return this.setAlias(alias, new Alias(id));
    }

    public hasAlias(alias: string): boolean {
        return typeof this.aliases[alias] !== 'undefined';
    }
}

export default Container;
