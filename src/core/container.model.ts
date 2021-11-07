import Mixed from "../utils/mixed.interface";
import Component from "./models/component/component.model";
import ContainerInterface from "./interfaces/container.interface";
import ResourceNotFoundException from "./exception/resource-not-found.exception";
import InvalidArgumentException from "./exception/invalid-argument.exception";
import Alias from "./models/alias.model";
import {EXCEPTION_ON_INVALID_REFERENCE} from "./container-builder.invalid-behaviors";

class Container extends Component implements ContainerInterface {
    resources: Mixed;
    aliases: Record<string, Alias>;
    parameters: Mixed;
    factories: Mixed;

    constructor(settings: Mixed = {}) {
        super(settings);

        this.resources = {};
        this.aliases = {};
        this.parameters = {};
        this.factories = {};
    }

    /**
     * @inheritDoc
     */
    get(id: string, invalidBehavior: number = EXCEPTION_ON_INVALID_REFERENCE): any {
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

        if (invalidBehavior === EXCEPTION_ON_INVALID_REFERENCE) {
            throw new ResourceNotFoundException(id);
        }
        // todo create service as fallback (make in php)
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
        return typeof this.parameters[name] !== 'undefined';
    }

    getParameter(name: string): any {
        return this.parameters[name];
    }

    setParameter(name: string, value: any): void {
        this.parameters[name] = value;
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