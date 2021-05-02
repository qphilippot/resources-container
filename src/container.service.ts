import Container from "./core/container.model";
import FlexibleService from "./core/flexible.service";
import Component from "./core/component.model";
import Mixed from "./core/mixed.interface";
import MixedInterface from "./core/mixed.interface";
import ReflexionService from "./core/reflexion.service";

// todo: return an error instead of null when a component is not found

/**
 * Container Service have to use definitions concept in order to check if some resources dependancies are availables before instantiate it
 */
class ContainerService extends Component {
    container: Container;
    flexible: FlexibleService;
    factories: Mixed;
    reflector: ReflexionService;
    definitions: Array<MixedInterface> = [];

    constructor(settings: MixedInterface = {}) {
        super({
            name: settings.name || 'container-service'
        })

        this.container = new Container();
        this.flexible = new FlexibleService();
        this.factories = {};

        this.reflector = new ReflexionService();

        this.addResource(this, 'service.container');
    }

    getContainer(): Container {
        return this.container;
    }


    
    addResource(resource, id: string | null = null) {
        if (id === null) {
            id = resource.id;
        }

        this.flexible.set(id, resource, this.container.resources);
    }

    createResource(resource_id: string, resourceType: InstanceType<any>, injection: MixedInterface) {
        const resource = new resourceType({
            ...this.getContainer(),
            ...injection
        });
    }

    recordResource(resource_id: string, type: InstanceType<any>, parameters: any) {
        console.log('recordResource', new type(parameters));
        this.addResource(new type(parameters), resource_id)
    }

    recordFactory(id, factory) {
        // todo
        this.flexible.set(id, factory, this.factories);
    }

    processFactories() {
        Object.keys(this.factories).forEach(factoryName => {

        });
    }

    addAlias(alias, id) {
        this.flexible.set(alias, id, this.container.aliases);
    }

    addParameter(id, value) {
        this.flexible.set(id, value, this.container.parameters);
    }

    findById(resource_id: string): Component | null {
        return this.flexible.get(resource_id, this.container.resources);
    }

    findByAlias(alias: string): Component | null {
        const instance_id: string | undefined = this.container.aliases[alias];

        if (typeof instance_id === 'undefined') {
            return null;
        }

        else {
            return this.findById(instance_id);
        }
    }

    getParameter(parameterName: string): any | null {
        return this.container.parameters[parameterName] || null;
    }

    get(key: string): Component | null {
        let candidate: Component | null = this.findById(key);

        if (candidate !== null) {
            return candidate;
        }

        candidate = this.findByAlias(key);

        if (candidate !== null) {
            return candidate;
        }

        return this.getParameter(key);
    }

    addDefinition(resource_id, type: InstanceType<any>,  settings: MixedInterface = {}) {
        this.definitions.push({
            resource_id,
            type,
            settings
        });
    }

    process() {
        this.definitions.forEach(definition => {
            const definitionsDependencies = this.reflector.getFunctionArgumentsName(definition.type.prototype.constructor);
            // const optionalsDependencies = this.reflector.getFunctionArgumentsName(definition.type.prototype.constructor);

            console.log('definitionsDependencies', definitionsDependencies);
           // if (definition)
        });
    }
}

export default ContainerService;