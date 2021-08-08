import Container from "./container.model";
import FlexibleService from "../utils/flexible.service";
import Component from "./models/component/component.model";
import Mixed from "../utils/mixed.interface";
import MixedInterface from "../utils/mixed.interface";
import ReflexionService from "../utils/reflexion.service";
import ResourceDefinition from "./models/resource-definition.model";
import ContainerBuilderInterface from "./interfaces/container-builder.interface";
import CompilerInterface from "./interfaces/compiler.interface";
import Compiler from "./compiler.model";
import ContainerInterface from "./interfaces/container.interface";
import BadMethodCallException from "./exception/bad-method-call.exception";
import InvalidArgumentException from "./exception/invalid-argument.exception";
import {isValidResourceId} from "./helpers/resource-definition.helper";
import ResourceNotFoundException from "./exception/resource-not-found.exception";
import Alias from "./models/alias.model";

// todo: return an error instead of null when a component is not found

/**
 * Container Service have to use definitions concept in order to check if some resources dependancies are availables before instantiate it
 */
class ContainerBuilder extends Component implements ContainerBuilderInterface {


    container: Container;
    compiler: Compiler;
    private noCompilationIsNeeded: boolean = false;
    removedIds: Set<string> = new Set<string>();
    flexible: FlexibleService;
    factories: Mixed;
    reflector: ReflexionService;
    // definitions: Array<MixedInterface> = [];
    definitions: Record<string, ResourceDefinition> = {};

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


    register(id: string, aClass: InstanceType<any> | undefined = undefined): ResourceDefinition {
        const definition = new ResourceDefinition();
        definition.setId(id);

        if (typeof aClass !== undefined) {
            definition.setResourceType(aClass);
        }

        this.addDefinition(definition);
        return definition;
    }

    addResource(resource, id: string = '') {
        // let _id: string;

        if (id === '') {
            id = resource.id;
        }
        //
        // else {
        //     _id = id;
        // }

        this.flexible.set(id, resource, this.container.resources);
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

    addAlias(alias, id) {
        this.flexible.set(alias, id, this.container.aliases);
    }

    getAliases(): Record<string, Alias> {
        return this.container.getAliases();
    }


    getAlias(alias: string): Alias {
        return this.container.getAlias(alias);
    }

    hasAlias(alias: string): boolean {
        return this.container.hasAlias(alias);
    }


    addParameter(id, value) {
        this.flexible.set(id, value, this.container.parameters);
    }

    findById(resource_id: string): Component | null {
        return this.flexible.get(resource_id, this.container.resources);
    }

    findByAlias(aliasName: string): Component | null {
        const alias : Alias | undefined = this.container.aliases[aliasName];

        if (typeof alias === 'undefined') {
            return null;
        } else {
            return this.findById(alias.toString());
        }
    }

    getParameter(parameterName: string): any {
        return this.container.getParameter(parameterName);
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

    setAlias(alias: string, id: Alias): ContainerInterface {
        this.container.setAlias(alias, id);
        delete this.definitions[alias];
        this.removedIds.delete(alias);

        return this;
    }

    setAliasFromString(alias: string, id: string): ContainerInterface {
        return this.setAlias(alias, new Alias(id));
    }

    getDefinitions(): Array<ResourceDefinition> {
        return Object.values(this.definitions);
    }
    // addDefinition(resource_id, type: InstanceType<any>, settings: MixedInterface = {}) {
    //     this.definitions.push({
    //         resource_id,
    //         type,
    //         settings: settings || {}
    //     });
    // }

    isCompiled(): boolean {
        return this.noCompilationIsNeeded;
    }

    setDefinition(definitionId: string, definition: ResourceDefinition) {
        if (this.isCompiled()) {
            throw new BadMethodCallException('Adding definition to a compiled container is not allowed.')
        }

        if (!isValidResourceId(definitionId)) {
            throw new InvalidArgumentException(`Invalid resource id ${definitionId}`)
        }

        delete this.container.aliases[definitionId];
        this.removedIds.delete(definitionId);
        this.definitions[definitionId] = definition;
    }

    getDefinition(definitionId: string): ResourceDefinition {
        const definition = this.definitions[definitionId];
        if (typeof definition === 'undefined') {
            throw new ResourceNotFoundException(definitionId);
        }

        return definition;
    }

    addDefinition(definition: ResourceDefinition) {
        this.definitions[definition.getId()] = definition;
    }



    // autowiring first tentative
    // process() {
    //     this.definitions.forEach(definition => {
    //         const definitionsDependencies = this.reflector.getFunctionArgumentsName(definition.getResourceType().prototype.constructor);
    //         // const optionalsDependencies = this.reflector.getFunctionArgumentsName(definition.type.prototype.constructor);
    //
    //         let resolvedDependencies: Array<any> = [];
    //
    //         let dependency: any;
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
    //             resolvedDependencies.push(dependency || undefined);
    //
    //         });
    //
    //         try {
    //             let resource;
    //             // // @ts-ignore
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
    //            // // @ts-ignore
    //              // // @ts-ignore
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
        this.noCompilationIsNeeded = true;
    }

    has(id: string) {
        return (
            this.findById(id) ||
            this.findByAlias(id)
        );
    }

    hasParameter(name: string): boolean {
        return this.container.hasParameter(name);
    }

    setParameter(name: string, value: any): void {
        this.container.setParameter(name, value);
    }
}

export default ContainerBuilder;