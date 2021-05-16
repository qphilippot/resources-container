import Mixed from "../utils/mixed.interface";
import Component from "./models/component/component.model";
import ContainerInterface from "../../psr/container/container.interface";
import ResourceNotFoundException from "./exception/resource-not-found.exception";

class Container extends Component implements ContainerInterface {
    resources: Mixed;
    aliases: Record<string, string>;
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
}

export default Container;