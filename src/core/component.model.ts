import Mixed from "./mixed.interface";

let counter = 0;
const prefix = 'component_';

interface CoreComponentInterface {
    id: string;
}

class Component {
    name: string;
    id: string;
    core: CoreComponentInterface;

    constructor(settings: Mixed = {}) {
        const core_id = `${prefix}${counter++}`;
        this.name = settings.name || core_id;
        this.id = settings.id || core_id;
        this.core = {
            id: core_id
        };
    }
}

export default Component;