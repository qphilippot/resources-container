import Mixed from "../utils/mixed.interface";
import Component from "./models/component/component.model";
import ContainerInterface from "./interfaces/container.interface";
import ResourceNotFoundException from "./exception/resource-not-found.exception";
import InvalidArgumentException from "./exception/invalid-argument.exception";
import Alias from "./models/alias.model";

class Container extends Component implements ContainerInterface {
    resources: Mixed;
    aliases: Record<string, Alias>;
    parameters: Mixed;

    constructor(settings: Mixed = {}) {
        super(settings);

        this.resources = {};
        this.aliases = {};
        this.parameters = {};
    }

    get(id: string) {
        if (this.has(id)) {
            return this.resources[id];
        }

        else {
            throw new ResourceNotFoundException(`Resource not found: ${id}`);
        }
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


    setAliasFromString(alias: string, id: string): ContainerInterface {
       return this.setAlias(alias, new Alias(id));
    }

    hasAlias(alias: string): boolean {
        return typeof this.aliases[alias] !== 'undefined';
    }
}

export default Container;