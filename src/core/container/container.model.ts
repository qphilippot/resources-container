import Mixed from "../../utils/mixed.interface";
import Component from "../models/component/component.model";
import ContainerInterface from "../interfaces/container.interface";
import ResourceNotFoundException from "../exception/resource-not-found.exception";
import InvalidArgumentException from "../exception/invalid-argument.exception";
import Alias from "../models/alias.model";
import {EXCEPTION_ON_INVALID_REFERENCE} from "./container-builder.invalid-behaviors";
import CircularReferencesDetectorService from "../circular-references-detector.service";
import {PublisherSubscriber} from "@qphi/publisher-subscriber";
import {INVALID_REFERENCE_ON_GET} from "./container-notification";
import ParameterBagInterface from "../parameter-bag/parameter-bag.interface";
import ParameterBag from "../parameter-bag/parameter-bag.model";

class Container extends PublisherSubscriber implements ContainerInterface {
    resources: Mixed;
    aliases: Record<string, Alias>;
    factories: Mixed;
    /**
     * Contains parameters, not resources or alias
     * @private
     */
    private parameterBag: ParameterBagInterface;
    public circularReferenceDetector: CircularReferencesDetectorService = new CircularReferencesDetectorService();

    getHandlers: Record<string, Function> = {};
    dataSlot: Record<string, any> = {};

    constructor(settings: Mixed = {}) {
        super(settings.name || 'container');
        this.resources = {};
        this.aliases = {};
        // this.parameters = {};
        this.factories = {};

        this.parameterBag = settings.parameterBag ?? new ParameterBag();
    }

    getParameterBag(): ParameterBagInterface {
        return this.parameterBag;
    }

    hasResource(resourceId): boolean{
        return typeof this.resources[resourceId] !== "undefined";
    }
    setDataSlot(name: string, value: any) {
        this.dataSlot[name] = value;
    }

    getDataSlot(name: string): any {
        return this.dataSlot[name];
    }

    /**
     * @inheritDoc
     */
    get(
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

    make(serviceId: string, invalidBehavior:number) {
        this.circularReferenceDetector.process(serviceId);

        this.publish(INVALID_REFERENCE_ON_GET, { invalidBehavior, id: serviceId });

        return null;
    }
    set(id: string, resource: any): void {
        this.resources[id] = resource;
    }

    has(id: string) {
        const resource = this.resources[id];
        return (
            resource !== null &&
            typeof resource !== 'undefined'
        );
    }

    hasParameter(name: string): boolean {
        return this.parameterBag.has(name);
        // return typeof this.parameters[name] !== 'undefined';
    }

    getParameter(name: string): any {
        return this.parameterBag.get(name);
        // return this.parameters[name];
    }

    setParameter(name: string, value: any): void {
        this.parameterBag.set(name, value);
        // this.parameters[name] = value;
    }

    getAliases(): Record<string, Alias> {
        return this.aliases;
    }

    getAlias(alias:string): Alias {
        return this.aliases[alias];
    }

    setAlias(alias: string, id: Alias): ContainerInterface {
        if (alias.trim().length === 0) {
            throw new InvalidArgumentException(`Invalid alias id: "${alias}"`);
        }

        if (alias === id.toString()) {
            throw new InvalidArgumentException(`An alias can not reference itself, got a circular reference on: "${alias}"`);
        }

        this.aliases[alias] = id;

        return this;
    }

    removeAlias(alias: string):void {
        delete this.aliases[alias];
    }

    setAliasFromString(alias: string, id: string): ContainerInterface {
       return this.setAlias(alias, new Alias(id));
    }

    hasAlias(alias: string): boolean {
        return typeof this.aliases[alias] !== 'undefined';
    }
}

export default Container;