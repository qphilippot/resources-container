import Container from "./container.model";
import FlexibleService from "../utils/flexible.service";
import Component from "./models/component/component.model";
import Mixed from "../utils/mixed.interface";
import MixedInterface from "../utils/mixed.interface";
import ReflexionService from "../utils/reflexion.service";
import TrevorService from "../services/trevor.service";
import ResourceDefinition from "./models/resource-definition.model";
import ContainerBuilderInterface from "./interfaces/container-builder.interface";
import CompilerInterface from "./interfaces/compiler.interface";
import Compiler from "./compiler.model";

// todo: return an error instead of null when a component is not found

/**
 * Container Service have to use definitions concept in order to check if some resources dependancies are availables before instantiate it
 */
class ContainerBuilder extends Component implements ContainerBuilderInterface {
    container: Container;
    compiler: Compiler;

    flexible: FlexibleService;
    factories: Mixed;
    reflector: ReflexionService;
    // definitions: Array<MixedInterface> = [];
    definitions: Array<ResourceDefinition> = [];

    constructor(settings: MixedInterface = {}) {
        super({
            name: settings.name || 'container-builder'
        })

        this.container = settings.container || new Container();
        this.flexible = new FlexibleService();
        this.factories = {};

        this.reflector = new ReflexionService();

        this.addResource(this, 'service.container');
    }

    getContainer(): Container {
        return this.container;
    }


    addResource(resource, id: string) {
        // let _id: string;
        //
        // if (id === null) {
        //     _id = resource.id;
        // }
        //
        // else {
        //     _id = id;
        // }

        this.flexible.set(id || resource.id, resource, this.container.resources);
    }

    createResource(resource_id: string, resourceType: InstanceType<any>, injection: MixedInterface) {
        const resource = new resourceType({
            ...this.getContainer(),
            ...injection
        });
    }

    recordResource(resource_id: string, type: InstanceType<any>, parameters: any) {
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
        } else {
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

    // addDefinition(resource_id, type: InstanceType<any>, settings: MixedInterface = {}) {
    //     this.definitions.push({
    //         resource_id,
    //         type,
    //         settings: settings || {}
    //     });
    // }

    addDefinition(definition: ResourceDefinition) {
        this.definitions.push(definition);
    }


    // autowiring first tentative
    // process() {
    //     console.log("== process ==");
    //     this.definitions.forEach(definition => {
    //         const definitionsDependencies = this.reflector.getFunctionArgumentsName(definition.getResourceType().prototype.constructor);
    //         // const optionalsDependencies = this.reflector.getFunctionArgumentsName(definition.type.prototype.constructor);
    //
    //         let resolvedDependencies: Array<any> = [];
    //
    //         let dependency: any;
    //         console.log('definitionsDependencies', definitionsDependencies);
    //         definitionsDependencies.forEach((dependencyName: string) => {
    //             const dependencySettings = definition.settings.dependencies[dependencyName];
    //             if (typeof dependencySettings === "object") {
    //                 dependency = dependencySettings;
    //             } else {
    //                 if (typeof dependencySettings === 'string') {
    //                     dependencyName = dependencySettings;
    //                 }
    //
    //                 dependency = this.get(dependencyName);
    //             }
    //             //
    //             console.log('push', dependencyName, dependency || undefined);
    //             resolvedDependencies.push(dependency || undefined);
    //
    //         });
    //
    //         try {
    //             let resource;
    //             // console.log('local-1',localDependenciesIndex);
    //             // // @ts-ignore
    //             console.log('local',...resolvedDependencies);
    //             // // @ts-ignore
    //             resource = new (definition.getResourceType())(...resolvedDependencies);
    //             // resource = new TrevorService(...resolvedDependencies);
    //             this.addResource(resource, definition.id);
    //         }
    //         catch (e) {
    //             console.error(e);
    //         }
    //         // if (definition)
    //     });
    // }
    //
    // process() {
    //     console.log("== process ==");
    //     this.definitions.forEach(definition => {
    //         const dependencies = definition.getArguments();
    //
    //         dependencies.forEach((dependency: any) => {
    //             if (typeof dependencySettings === "object") {
    //                 dependency = dependencySettings;
    //             } else {
    //                 if (typeof dependencySettings === 'string') {
    //                     dependencyName = dependencySettings;
    //                 }
    //
    //                 dependency = this.get(dependencyName);
    //             }
    //             //
    //             console.log('push', dependencyName, dependency || undefined);
    //             resolvedDependencies.push(dependency || undefined);
    //         });
    //
    //         try {
    //             let resource;
    //             // console.log('local-1',localDependenciesIndex);
    //             // // @ts-ignore
    //             console.log('local',...resolvedDependencies);
    //             // // @ts-ignore
    //             resource = new (definition.getResourceType())(...resolvedDependencies);
    //             // resource = new TrevorService(...resolvedDependencies);
    //             this.addResource(resource, definition.id);
    //         }
    //         catch (e) {
    //             console.error(e);
    //         }
    //         // if (definition)
    //     });
    // }

    getCompiler(): CompilerInterface {
        if (typeof this.compiler === 'undefined') {
            this.compiler = new Compiler();
        }

        return  this.compiler;
    }

    compile() {
        this.getCompiler().compile(this);
    }

    has(id: string) {
        return (
            this.findById(id) ||
            this.findByAlias(id)
        );
    }
}

export default ContainerBuilder;