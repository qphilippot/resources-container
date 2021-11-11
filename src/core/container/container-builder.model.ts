import Container from "./container.model";
import FlexibleService from "../../utils/flexible.service";
import Component from "../models/component/component.model";
import Mixed from "../../utils/mixed.interface";
import MixedInterface from "../../utils/mixed.interface";
import ReflexionService from "../reflexion/reflexion.service";
import ResourceDefinition from "../models/resource-definition.model";
import ContainerBuilderInterface from "../interfaces/container-builder.interface";
import CompilerInterface from "../interfaces/compiler.interface";
import Compiler from "../compiler.model";
import ContainerInterface from "../interfaces/container.interface";
import BadMethodCallException from "../exception/bad-method-call.exception";
import InvalidArgumentException from "../exception/invalid-argument.exception";
import {isValidResourceId} from "../helpers/resource-definition.helper";
import ResourceNotFoundException from "../exception/resource-not-found.exception";
import Alias from "../models/alias.model";
import {
    EXCEPTION_ON_INVALID_REFERENCE,
    IGNORE_ON_UNINITIALIZED_REFERENCE,
    NULL_ON_INVALID_REFERENCE
} from "./container-builder.invalid-behaviors";
import CircularReferenceException from "../exception/circular-reference.exception";
import RuntimeException from "../exception/runtime.exception";
import {
    ERROR_ON_GET_DEFINITION_BEFORE_COMPILATION,
    INVALID_REFERENCE_ON_GET_DEFINITION
} from "./container-notification";
import NullOnInvalidReferenceFeature from "./features/null-on-invalid-reference.feature";
import InlineContextualServices from "./inline-contextual-services";
import ContainerHookContext from "./container-hook-context";

// todo: return an error instead of null when a component is not found

/**
 * Container Service have to use definitions concept in order to check if some resources dependancies are availables before instantiate it
 */
class ContainerBuilder implements ContainerBuilderInterface {
    container: Container;
    compiler: Compiler;
    private noCompilationIsNeeded: boolean = false;
    removedIds: Set<string> = new Set<string>();
    flexible: FlexibleService;

    reflexionService: ReflexionService = new ReflexionService();
    // definitions: Array<MixedInterface> = [];
    definitions: Record<string, ResourceDefinition> = {};

    constructor(settings: MixedInterface = {}) {
        this.container = settings.container || new Container();
        this.flexible = new FlexibleService();

        this.reflexionService = new ReflexionService();

        const serviceContainerDefinition = (new ResourceDefinition(ContainerBuilder))
            .setSynthetic(true)
            .setPublic(true);

        this.setDefinition('service.container', serviceContainerDefinition);

        // add feature
        new NullOnInvalidReferenceFeature(this.container);
    }

    getContainer(): Container {
        return this.container;
    }


    /**
     * Create a standard definition with definition id and type
     * @param id
     * @param aClass
     */
    register(id: string, aClass: InstanceType<any> | undefined = undefined): ResourceDefinition {
        const definition = new ResourceDefinition();
        definition.setId(id);

        if (typeof aClass !== undefined) {
            definition.setResourceType(aClass);
        } else {
            definition.setResourceType(null);
        }

        this.addDefinition(definition);
        return definition;
    }

    set(id: string, resource: any): void {
        if (
            this.isCompiled() &&
            this.hasDefinition(id) &&
            !this.getDefinition(id).isSynthetic()
        ) {
            throw new BadMethodCallException(
                `Setting service "${id}" for an unknown or non-synthetic service definition on a compiled container is not allowed.`
            );
        }

        delete this.definitions[id];
        delete this.removedIds[id];

        this.removeAlias(id);
        this.container.set(id, resource);
    }

    getReflexionService(): ReflexionService {
        return this.reflexionService;
    }

    createResource(resource_id: string, resourceType: InstanceType<any>, injection: MixedInterface) {
        const resource = new resourceType({
            ...this.getContainer(),
            ...injection
        });
    }

    // recordResource(resource_id: string, type: InstanceType<any>, parameters: any) {
    //     this.addResource(new type(parameters), resource_id)
    // }

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
        const alias: Alias | undefined = this.container.aliases[aliasName];

        if (typeof alias === 'undefined') {
            return null;
        } else {
            return this.findById(alias.toString());
        }
    }

    getParameter(parameterName: string): any {
        return this.container.getParameter(parameterName);
    }

    /**
     * Get a real resource
     * @param key
     * @param invalidBehavior
     */
    get(key: string, invalidBehavior: number = EXCEPTION_ON_INVALID_REFERENCE): any {
        if (
            this.isCompiled() &&
            this.removedIds[key] &&
            invalidBehavior <= EXCEPTION_ON_INVALID_REFERENCE
        ) {
            return this.container.get(key, invalidBehavior);
        }


        return this.resolveGetBeforeCompilation(key, invalidBehavior);

        // do get
    }

    resolveGetBeforeCompilation(
        key: string,
        invalidBehavior: number = EXCEPTION_ON_INVALID_REFERENCE,
        inlineContextualServices: InlineContextualServices|null = null,
    ) {
        if (inlineContextualServices === null) {
            inlineContextualServices = new InlineContextualServices();
            inlineContextualServices.setFromConstructor();
        }

        if (inlineContextualServices.has(key)) {
            return inlineContextualServices.get(key);
        }

        try {
            if (invalidBehavior === IGNORE_ON_UNINITIALIZED_REFERENCE) {
                return this.container.get(key, invalidBehavior);
            }

            const resource = this.container.get(key, NULL_ON_INVALID_REFERENCE);
            if (resource) {
                return resource;
            }
        } catch (error) {
            if (
                error instanceof CircularReferenceException &&
                inlineContextualServices.isFromConstructor()
            ) {
                throw error;
            }
        }


        if (!this.hasDefinition(key) && this.hasAlias(key)) {
            return this.get(this.getAlias(key).toString(), invalidBehavior);
        }

        try {
            const definition = this.getDefinition(key);
        } catch (err) {
            /**
             * @hook ERROR_ON_GET_DEFINITION_BEFORE_COMPILATION
             */
            const context = new ContainerHookContext(invalidBehavior);
            this.container.publish(ERROR_ON_GET_DEFINITION_BEFORE_COMPILATION, context);

            if (context.shouldThrows(err.name)) {
                throw err;
            }

            if (context.shouldReturn()) {
                return context.getReturnValue();
            }
        }

        if (inlineContextualServices.isFromConstructor()) {
            this.container.circularReferenceDetector.record(key);
        }
    }

    createService(
        definition: ResourceDefinition,
        inlineService: Record<string, any> = {},
        isConstructorArgument: boolean = false,
        id: string = '',
        tryProxy: boolean = true
    ) {
        if (id.length === 0 && inlineService[definition.getId()]) {
            return inlineService[definition.getId()];
        }

        // if ($definition instanceof ChildDefinition) {
        //     throw new RuntimeException(sprintf('Constructing service "%s" from a parent definition is not supported at build time.', $id));
        // }

        if (definition.isSynthetic()) {
            throw new RuntimeException(
                `You have requested a synthetic service ("${id}"). The DIC does not know how to construct this service.`
            );
        }

        //    if ($definition->isDeprecated()) {
        //             $deprecation = $definition->getDeprecation($id);
        //             trigger_deprecation($deprecation['package'], $deprecation['version'], $deprecation['message']);
        //         }


        //      if ($tryProxy && $definition->isLazy() && !$tryProxy = !($proxy = $this->proxyInstantiator) || $proxy instanceof RealServiceInstantiator) {
        //             $proxy = $proxy->instantiateProxy(
        //                 $this,
        //                 $definition,
        //                 $id, function () use ($definition, &$inlineServices, $id) {
        //                     return $this->createService($definition, $inlineServices, true, $id, false);
        //                 }
        //             );
        //             $this->shareService($definition, $proxy, $id, $inlineServices);
        //
        //             return $proxy;
        //         }

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

    hasDefinition(definitionId: string): boolean {
        return typeof this.definitions[definitionId] !== 'undefined';
    }

    setDefinition(definitionId: string, definition: ResourceDefinition): ResourceDefinition {
        if (this.isCompiled()) {
            throw new BadMethodCallException('Adding definition to a compiled container is not allowed.')
        }

        if (!isValidResourceId(definitionId)) {
            throw new InvalidArgumentException(`Invalid resource id ${definitionId}`)
        }

        delete this.container.aliases[definitionId];
        this.removedIds.delete(definitionId);
        this.definitions[definitionId] = definition;

        return definition;
    }

    getDefinition(definitionId: string): ResourceDefinition {
        const definition = this.definitions[definitionId];
        if (typeof definition === 'undefined') {
            throw new ResourceNotFoundException(definitionId);
        }

        return definition;
    }

    /**
     * Registers an autowired service definition.
     *
     * This method implements a shortcut for using setDefinition() with
     * an autowired definition.
     *
     * @return ResourceDefinition The created definition
     */
    autowire(id: string, className: string | undefined = undefined): ResourceDefinition {
        return this.setDefinition(id, new ResourceDefinition(className).setAutowired(true))
    }

    addDefinition(definition: ResourceDefinition) {
        this.definitions[definition.getId()] = definition;
    }

    /**
     * Adds the service definitions.
     *
     * @param {Record<string, ResourceDefinition>} definitions An array of service definitions
     */
    addDefinitions(definitions: Record<string, ResourceDefinition>) {
        Object.keys(definitions).forEach(id => {
            this.setDefinition(id, definitions[id]);
        });
    }

    /**
     * Sets the service definitions.
     *
     * @param {Record<string, ResourceDefinition>} definitions A set of service definitions
     */
    setDefinitions(definitions: Record<string, ResourceDefinition>) {
        this.definitions = {};
        this.addDefinitions(definitions);
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

        return this.compiler;
    }

    compile() {
        this.getCompiler().compile(this);
        this.noCompilationIsNeeded = true;
    }

    /**
     * Search in definitions, alias, and resources
     * @param id
     */
    has(id: string): boolean {
        return (
            this.hasDefinition(id) ||
            this.hasAlias(id) ||
            this.container.has(id)
        );
    }

    hasParameter(name: string): boolean {
        return this.container.hasParameter(name);
    }

    setParameter(name: string, value: any): void {
        this.container.setParameter(name, value);
    }

    removeAlias(alias: string): void {
        this.container.removeAlias(alias);
    }

    getDataSlot(name: string): any {
        return this.container.dataSlot;
    }

    setDataSlot(name: string, value: any): void {
    }
}

export default ContainerBuilder;