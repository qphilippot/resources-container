import Container from "./container.model";
import FlexibleService from "../../utils/flexible.service";
import Component from "../models/component/component.model";
import MixedInterface from "../../utils/mixed.interface";
import ReflexionService from "../reflexion/reflexion.service";
import Definition from "../models/definition.model";
import ContainerBuilderInterface from "../interfaces/container-builder.interface";
import CompilerInterface from "../interfaces/compiler.interface";
import Compiler from "../compiler.model";
import BadMethodCallException from "../exception/bad-method-call.exception";
import ResourceNotFoundException from "../exception/resource-not-found.exception";
import Alias from "../models/alias.model";
import {
    EXCEPTION_ON_INVALID_REFERENCE,
    IGNORE_ON_INVALID_REFERENCE,
    IGNORE_ON_UNINITIALIZED_REFERENCE,
    NULL_ON_INVALID_REFERENCE
} from "./container-builder.invalid-behaviors";
import CircularReferenceException from "../exception/circular-reference.exception";
import RuntimeException from "../exception/runtime.exception";
import NullOnInvalidReferenceFeature from "./features/null-on-invalid-reference.feature";
import InlineContextualServices from "./inline-contextual-services";
import Reference from "../models/reference.model";
import {checkValidId} from "./container.helper";
import AliasNotFoundException from "../exception/alias-not-found.exception";
import CompilerPassInterface from "../interfaces/compiler-pass.interface";
import {BEFORE_OPTIMIZATION, DEFAULT_COMPILER_STEP} from "../compiler-step.enum";
import InvalidArgumentException from "../exception/invalid-argument.exception";
import ChildDefinition from "../models/child-definition.model";
import ParameterBagInterface from "../parameter-bag/parameter-bag.interface";
import EnvPlaceholderBag from "../parameter-bag/env-placeholder.bag";
import ReadOnlyParameterBag from "../parameter-bag/read-only.parameter-bag";
import ResolveEnvPlaceholdersPass from "../compilation-passes/standard/resolve-env-placeholders.pass";
import ParameterBag from "../parameter-bag/parameter-bag.model";

// todo: return an error instead of null when a component is not found

/**
 * Container Service have to use definitions concept in order to check if some resources dependancies are availables before instantiate it
 */
class ContainerBuilder implements ContainerBuilderInterface {
    private container: Container;
    private compiler: Compiler;

    private removedIds: Set<string> = new Set<string>();
    private flexible: FlexibleService;

    private reflexionService: ReflexionService = new ReflexionService();
    // definitions: Array<MixedInterface> = [];
    private definitions: Record<string, Definition> = {};

    /**
     * a map of env var names to their placeholders
     */
    private envPlaceholders: Map<string, string[]> = new Map<string, string[]>();

    /**
     * Map of env vars to their resolution counter
     */
    private envCounters = new Map<string, number>();

    constructor(settings: MixedInterface = {}) {
        this.container = settings.container || new Container(settings);
        this.flexible = new FlexibleService();

        this.reflexionService = new ReflexionService();

        const serviceContainerDefinition = (new Definition(ContainerBuilder))
            .setSynthetic(true)
            .setPublic(true);

        this.setDefinition('service.container', serviceContainerDefinition);

        // add feature
        new NullOnInvalidReferenceFeature(this.container);


    }

    public getContainer(): Container {
        return this.container;
    }

    public getParameterBag(): ParameterBagInterface {
        return this.container.getParameterBag();
    }

    /**
     * Create a standard definition with definition id and type
     * @param id
     * @param aClass
     */
    public register(id: string, aClass: InstanceType<any> | undefined = undefined): Definition {
        const definition = new Definition();
        definition.setId(id);

        if (typeof aClass !== undefined) {
            definition.setResourceType(aClass);
        } else {
            definition.setResourceType(null);
        }

        this.setDefinition(id, definition);
        return definition;
    }

    public set(id: string, resource: any): void {
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

    public setResource(id: string, resource: any) {
        this.set(id, resource);
    }

    public getResourceIds(): string[] {
        return Array.from(
            new Set([
                ...this.container.getResourceIds(),
                ...Object.keys(this.definitions)
            ])
        )
    }

    public getReflexionService(): ReflexionService {
        return this.reflexionService;
    }


    public addAlias(alias, id) {
        this.flexible.set(id, alias, this.container.getAliases());
    }

    public getAliases(): Record<string, Alias> {
        return this.container.getAliases();
    }

    public getEnvPlaceholders(): Map<string, string[]> {
        const bag = this.getParameterBag();
        return bag instanceof EnvPlaceholderBag ? bag.getEnvPlaceholders() : this.envPlaceholders;
    }

    /**
     * Resolves env parameter placeholders in a string or an array. Example => "env(foo)" to "FooEnvValue" (assume env(foo) == FooEnvValue)
     *
     * @param string|true|null format    A sprintf() format returning the replacement for each env var name or
     *                                    null to resolve back to the original "%env(VAR)%" format or
     *                                    true to resolve to the actual values of the referenced env vars
     * @param array            usedEnvs Env vars found while resolving are added to this array
     *
     * @return mixed The value with env parameters resolved if a string or an array is passed
     *
     * @todo split in several functions => 1 function by type and format /!\
     */
    public resolveEnvPlaceholders(value: any, format: string | boolean | null = null, usedEnvs: any[] = []): MixedInterface {
        // resolve back to the original "%env(VAR)%" format
        // todo split in different function
        if (null === format) {
            format = '%%env(%s)%%';
        }

        let bag = this.getParameterBag();
        // resolve to the actual values of the referenced env vars
        if (true === format) {
            value = bag.resolveValue(value);
        }

        if (value instanceof Definition) {
            value = [value];
        }

        if (typeof value === 'object' && value !== null) {
            const result = Array.isArray(value) ? [] : {};

            Object.keys(value).forEach((k: string) => {
                const v = value[k];
                let key: string | number = parseInt(k);
                if (Number.isNaN(key)) {
                    key = this.resolveEnvPlaceholders(k, format, usedEnvs) as unknown as string;
                }
                result[key] = this.resolveEnvPlaceholders(v, format, usedEnvs);
            });

            return result;
        }

        // if length > 38 its probably a md5 hash generated by env-parameter-bag todo use dedicated type
        if (typeof value !== 'string' || value.length < 38) {
            return value;
        }

        let envPlaceholders = this.getEnvPlaceholders();
        let completed = false;
        let resolved: string = '';

        for (const env of envPlaceholders.keys()) {
            const placeholders = envPlaceholders.get(env);
            if (!Array.isArray(placeholders)) {
                throw new RuntimeException(
                    `env placeholder should be a string array, "${typeof placeholders}" is given.`
                );
            }

            for (let i = 0; i < placeholders.length && completed === false; i++) {
                const placeholder = placeholders[i];
                if (value.includes(placeholder)) {
                    if (format === true) {
                        resolved = bag.escapeValue(this.getEnv(env));
                    } else {
                        if (typeof format === "string") {
                            resolved = format.replace("%s", env);
                        }
                    }
                    if (placeholder === value) {
                        value = resolved;
                        completed = true;
                    } else {
                        // if (typeof resolved !== 'string' && !(typeof resolved === "number" && Number.isFinite(resolved))) {
                        //     throw new RuntimeException(
                        //         `A string value must be composed of strings and/or numbers, but found parameter "env(${env})" of type "${resolved.constructor.name}" inside string value "${this.resolveEnvPlaceholders(value)}".`
                        //     );
                        // }

                        if (typeof value === 'string') {
                            value = value.replace(placeholder, resolved);
                        }

                    }
                    usedEnvs[env] = env;
                    let previousCounter = this.envCounters.get(env) ?? 0;
                    this.envCounters.set(env, previousCounter + 1);
                }
            }

        }

        return value;
    }

    public getEnv(name: string): any {
        const value = this.container.getEnv(name, this.getEnv.bind(this));
        const bag = this.getParameterBag();
        if (typeof value !== 'string' || !(bag instanceof EnvPlaceholderBag)) {
            return value;
        }
        const envPlaceholders = bag.getEnvPlaceholders();

        if (
            envPlaceholders.has(name) &&
            (envPlaceholders.get(name) as String[]).includes(value)
        ) {
            // @todo la copie sera probablement inutile quand on aura supprimé le comportement étrange au get() du EnvParameterBag
            const parametersBag = new ReadOnlyParameterBag(bag.all());
            return parametersBag.unescapeValue(parametersBag.get(`env(${name})`));
        }

        // As expression may contain several env() references, we have to check if they are all resolved
        for (const envPlaceholder of envPlaceholders) {
            // envPlaceholder[0] ==> supported env name
            // envPlaceholder[1] ==> env variable used
            const envVariablesUsed = envPlaceholder[1];
            if (envVariablesUsed.includes(value)) {
                return this.getEnv(value);
            }
        }

        this.container.getCircularReferenceDetector().record(`env(${name})`);
        try {
            return bag.unescapeValue(
                this.resolveEnvPlaceholders(bag.escapeValue(value), true)
            );
        } finally {
            this.container.getCircularReferenceDetector().clear(`env(${name})`);
        }
    }

    /**
     * @throws AliasNotFoundException
     * @param alias
     */
    public getAlias(alias: string): Alias {
        const found = this.container.getAlias(alias);
        if (found) {
            return this.container.getAlias(alias);
        }
        throw new AliasNotFoundException(alias);
    }

    public hasAlias(alias: string): boolean {
        return this.container.hasAlias(alias);
    }


    public addParameter(id, value) {
        this.container.setParameter(id, value);
        // this.flexible.set(id, value, this.container.parameters);
    }

    public findById(resource_id: string): Component | null {
        return this.flexible.get(resource_id, this.container.getResources());
    }

    public findByAlias(aliasName: string): Component | null {
        const alias: Alias | undefined = this.container.getAlias(aliasName);

        if (typeof alias === 'undefined') {
            return null;
        } else {
            return this.findById(alias.toString());
        }
    }

    public getParameter(parameterName: string): any {
        return this.container.getParameter(parameterName);
    }

    /**
     * Get a real resource
     * @param key
     * @param invalidBehavior
     */
    public get(key: string, invalidBehavior: number = EXCEPTION_ON_INVALID_REFERENCE): any {
        if (
            this.isCompiled() &&
            this.removedIds[key] &&
            invalidBehavior <= EXCEPTION_ON_INVALID_REFERENCE
        ) {
            return this.container.get(key, invalidBehavior);
        }


        return this.resolveGetBeforeCompilation(key, invalidBehavior);
    }

    /**
     * Replaces service references by the real service instance and evaluates expressions.
     *
     * @return any The same value with all service references replaced by
     *               the real service instances and all expressions evaluated
     */
    // doResolveServices
    // todo refactor with hook system
    public resolveServices(
        values: any,
        inlineContextualServices: InlineContextualServices = new InlineContextualServices()
    ): any {
        if (Array.isArray(values)) {
            const a = values.map(value => this.resolveServices(value, inlineContextualServices));
            return a;
        } else if (values instanceof Definition) {
            return this.createServiceFromDefinition(values, inlineContextualServices);
        }


            //   elseif ($value instanceof ServiceClosureArgument) {
            //             $reference = $value->getValues()[0];
            //             $value = function () use ($reference) {
            //                 return $this->resolveServices($reference);
            //             };
            //         } elseif ($value instanceof IteratorArgument) {
            //             $value = new RewindableGenerator(function () use ($value, &$inlineServices) {
            //                 foreach ($value->getValues() as $k => $v) {
            //                     foreach (self::getServiceConditionals($v) as $s) {
            //                         if (!$this->has($s)) {
            //                             continue 2;
            //                         }
            //                     }
            //                     foreach (self::getInitializedConditionals($v) as $s) {
            //                         if (!$this->doGet($s, ContainerInterface::IGNORE_ON_UNINITIALIZED_REFERENCE, $inlineServices)) {
            //                             continue 2;
            //                         }
            //                     }
            //
            //                     yield $k => $this->doResolveServices($v, $inlineServices);
            //                 }
            //             }, function () use ($value): int {
            //                 $count = 0;
            //                 foreach ($value->getValues() as $v) {
            //                     foreach (self::getServiceConditionals($v) as $s) {
            //                         if (!$this->has($s)) {
            //                             continue 2;
            //                         }
            //                     }
            //                     foreach (self::getInitializedConditionals($v) as $s) {
            //                         if (!$this->doGet($s, ContainerInterface::IGNORE_ON_UNINITIALIZED_REFERENCE)) {
            //                             continue 2;
            //                         }
            //                     }
            //
            //                     ++$count;
            //                 }
            //
            //                 return $count;
            //             });
            //         } elseif ($value instanceof ServiceLocatorArgument) {
            //             $refs = $types = [];
            //             foreach ($value->getValues() as $k => $v) {
            //                 if ($v) {
            //                     $refs[$k] = [$v];
            //                     $types[$k] = $v instanceof TypedReference ? $v->getType() : '?';
            //                 }
            //             }
            //             $value = new ServiceLocator(\Closure::fromCallable([$this, 'resolveServices']), $refs, $types);
        //         }

        else if (values instanceof Reference) {
            return this.resolveGetBeforeCompilation(
                values.toString(),
                values.getInvalidBehavior(),
                inlineContextualServices
            );
        }



            //    elseif ($value instanceof Parameter) {
            //             $value = $this->getParameter((string) $value);
            //         } elseif ($value instanceof Expression) {
            //             $value = $this->getExpressionLanguage()->evaluate($value, ['container' => $this]);
            //         } elseif ($value instanceof AbstractArgument) {
            //             throw new RuntimeException($value->getTextWithContext());
        //         }

        else if (typeof values === 'object') {
            // resolve recursively
            const keys = Object.keys(values);
            keys.forEach(key => {
                values[key] = this.resolveServices(values[key], inlineContextualServices);
            });

            return values;
        }
        return values;
    }

    private resolveGetBeforeCompilation(
        key: string,
        invalidBehavior: number = EXCEPTION_ON_INVALID_REFERENCE,
        inlineContextualServices: InlineContextualServices | null = null,
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

        let definition: Definition | null = null;
        try {
            definition = this.getDefinition(key);
        } catch (err) {
            if (
                err instanceof ResourceNotFoundException &&
                invalidBehavior > EXCEPTION_ON_INVALID_REFERENCE
            ) {
                return null;
            }

            throw err;
        }

        if (inlineContextualServices.isFromConstructor()) {
            this.container.getCircularReferenceDetector().record(key);
        }

        try {
            return this.createServiceFromDefinition(
                // definition is not null or exception had be throw yet
                // @ts-ignore
                definition,
                inlineContextualServices,
                key
            )
        } finally {
            if (inlineContextualServices.isFromConstructor()) {
                this.container.getCircularReferenceDetector().clear(key);
            }
        }
    }

    private createServiceFromDefinition(
        definition: Definition,
        inlineContextualServices: InlineContextualServices,
        id: string = '',
        tryProxy: boolean = true
    ) {
        if (id.length === 0 && inlineContextualServices.has(definition.getId())) {
            return inlineContextualServices.get(definition.getId());
        }

        if (definition instanceof ChildDefinition) {
            throw new RuntimeException(
                `Constructing service "${id}" from a parent definition is not supported at build time.`
            );
        }

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

        const parameterBag = this.container.getParameterBag();

        // resolve class using definition.filePath
        if (definition.getFilePath().length > 0) {
            const data = require(
                parameterBag.resolveValue(definition.getFilePath())
            );

            const type = definition.getResourceType();
            if (typeof this.reflexionService.findClass(type) === 'undefined') {
                this.reflexionService.recordClass(type, data.default);
            }
        }

        const definitionArguments =
            this.resolveServices(
                parameterBag.unescapeValue(parameterBag.resolveValue(definition.getArguments())),
                inlineContextualServices
            );

        // const args = this.resolveServices(
        //     definitionArguments,
        //     inlineContextualServices
        // );


        // let p = definition.getArguments().map(arg => {
        //     if (arg instanceof Reference) {
        //         return arg;
        //     } else {
        //         return parameterBag.unescapeValue(parameterBag.resolveValue(arg));
        //     }
        // });
        //
        // const args = this.resolveServices(
        //     p,
        //     inlineContextualServices
        // );

        let definitionFactory = definition.getFactory();

        // A000
        // todo add a hook ?
        if (definitionFactory !== null) {
            if (Array.isArray(definitionFactory)) {
                definitionFactory = [
                    this.resolveServices(
                        parameterBag.resolveValue(definitionFactory[0]),
                        inlineContextualServices
                    ),
                    definitionFactory[1]
                ];
            } else if (typeof definitionFactory === 'string') {
                // todo create dedicated error
                throw new RuntimeException(
                    `Cannot create service "${id}" because of invalid factory.`
                );
            }
        }

        // which use case ??
        // A001
        if (
            id.length > 0 &&
            definition.isShared() &&
            this.container.hasResource(id) &&
            (tryProxy || !definition.isLazy())
        ) {
            return this.container.getResource(id);
        }

        let service: any = null;
        // A002
        if (definitionFactory !== null) {
            // strange things happens in PHP here...
            if (Array.isArray(definitionFactory)) {
                let factoryClass: any = null;

                switch (typeof definitionFactory[0]) {
                    case 'string':
                        factoryClass = this.reflexionService.findClass(definitionFactory[0]);
                        break;
                    default:
                        factoryClass = definitionFactory[0];
                }

                if (typeof factoryClass === 'undefined' || factoryClass === null) {
                    // todo implement a test to get this exception
                    // todo create dedicated error
                    throw new RuntimeException(
                        `Cannot found the following factory "${id}". Did you record it correctly ?`
                    );
                }
                // check deprecation
                if (definitionFactory.length === 2) {
                    if (typeof factoryClass[definitionFactory[1]] !== 'undefined') {
                        service = factoryClass[definitionFactory[1]]();
                    } else {
                        // try static method
                        service = factoryClass.constructor[definitionFactory[1]]();
                    }

                }
                return service;
            }
            // if (\is_array($factory)) {
            //     $factory = [$this->resolveDefinitionDependency($parameterBag->resolveValue($factory[0]), $inlineServices, $isConstructorArgument), $factory[1]];
            // } elseif (!\is_string($factory)) {
            //     throw new RuntimeException(sprintf('Cannot create service "%s" because of invalid factory.', $id));
            // }
            //       //             $service = $factory(...$arguments);
            //         //
            //         //             if (!$definition->isDeprecated() && \is_array($factory) && \is_string($factory[0])) {
            //         //                 $r = new \ReflectionClass($factory[0]);
            //         //
            //         //                 if (0 < strpos($r->getDocComment(), "\n * @deprecated ")) {
            //         //                     trigger_deprecation('', '', 'The "%s" service relies on the deprecated "%s" factory class. It should either be deprecated or its factory upgraded.', $id, $r->name);
            //         //                 }
            //         //             }
        } else {
            const reflexionClass = this.reflexionService.findClass(
                parameterBag.resolveValue(definition.getResourceType())
            );

            if (reflexionClass) {
                service = new reflexionClass(...Object.values(definitionArguments));

                //    if (!$definition->isDeprecated() && 0 < strpos($r->getDocComment(), "\n * @deprecated ")) {
                //                 trigger_deprecation('', '', 'The "%s" service relies on the deprecated "%s" class. It should either be deprecated or its implementation upgraded.', $id, $r->name);
                //             }
            }
        }

        let lastWitherIndex: number | null = null;

        const methodsCall = definition.getMethodCalls();
        methodsCall.forEach((call, index) => {
            if (call[2] ?? false) {
                lastWitherIndex = index;
            }
        });

        if (null === lastWitherIndex && (tryProxy || !definition.isLazy())) {
            this.shareService(definition, service, id, inlineContextualServices)
        }


        const definitionProperties = definition.getInjectionProperties();
        const definitionPropertiesName = Object.keys(definitionProperties);

        definitionPropertiesName.forEach(propertyName => {
            if (propertyName in service) {
                // todo replace with voter system (use some middleware according to type)
                let propertyValue = definitionProperties[propertyName];
                if (typeof propertyValue === 'string' && propertyValue.length > 4) {
                    propertyValue = this.resolveEnvPlaceholders(propertyValue, true)
                }

                const resolvedProperty = this.resolveServices(
                    parameterBag.unescapeValue(
                        parameterBag.resolveValue(
                            propertyValue
                        )),

                    inlineContextualServices
                );

                service[propertyName] = resolvedProperty;
            }
        });


        definition.getMethodCalls().forEach((call, index) => {
            // call Method PHP method equivalent
            this.callInitializerMethod(service, call, inlineContextualServices);

            if (index === lastWitherIndex && (tryProxy || !definition.isLazy())) {
                this.shareService(definition, service, id, inlineContextualServices)
            }
        });

        // todo configurator pass
        const configuratorSettings = definition.getConfigurator();
        if (configuratorSettings !== null) {
            let configurator: ((any) => void) | InstanceType<any> | null = null;
            let entryPoint = null;

            if (Array.isArray(configuratorSettings)) {
                let callable = parameterBag.resolveValue(configuratorSettings[0]);
                entryPoint = configuratorSettings[1];

                if (callable instanceof Reference) {
                    configurator = this.resolveGetBeforeCompilation(
                        callable.toString(),
                        callable.getInvalidBehavior(),
                        inlineContextualServices
                    );
                } else if (typeof callable === 'string' && callable.length > 0) {
                    configurator = this.reflexionService.findClass(callable);
                } else {
                    if (callable instanceof Definition) {
                        configurator = this.createServiceFromDefinition(definition, inlineContextualServices);
                    }
                }
            } else {
                if (typeof configuratorSettings === "function") {
                    configurator = configuratorSettings;
                }
            }

            if (typeof configurator === "function" || typeof configurator === 'object' && configurator !== null) {
                if (typeof entryPoint === 'string' && entryPoint !== '__invoke') {
                    if (typeof configurator[entryPoint] === 'function') {
                        configurator[entryPoint](service);
                    } else {
                        let instanceName = '';
                        if (configuratorSettings[0] instanceof Definition) {
                            instanceName = configuratorSettings[0].getId();
                        } else {
                            instanceName = parameterBag.resolveValue(configuratorSettings[0]);
                        }

                        throw new InvalidArgumentException(
                            `Cannot configure service using "${instanceName}.${entryPoint}". No such method found.`
                        );
                    }
                } else {
                    configurator(service);
                }
            } else {
                throw new InvalidArgumentException(
                    `The configure callable for class "${service.constructor.name}" is not callable.`
                );
            }
        }

        return service;

    }

    private callInitializerMethod(
        service: any,
        call: Array<any>,
        inlineContextualServices: InlineContextualServices
    ): any {
        let toResolve = this.getElementToResolve(call[1], IGNORE_ON_INVALID_REFERENCE);

        for (const element of toResolve) {
            if (!this.has(element)) {
                return service;
            }
        }
        toResolve = this.getElementToResolve(call[1], IGNORE_ON_UNINITIALIZED_REFERENCE);
        for (const element of toResolve) {
            if (!this.resolveGetBeforeCompilation(element, IGNORE_ON_UNINITIALIZED_REFERENCE, inlineContextualServices)) {
                return service;
            }
        }

        let result: any = null;
        if (typeof service[call[0]] === 'function') {
            const args = this.resolveServices(
                this.container.getParameterBag().unescapeValue(
                    this.container.getParameterBag().resolveValue(call[1])
                ),
                inlineContextualServices
            );

            if (Array.isArray(args)) {
                result = service[call[0]](...args);
            } else {
                result = service[call[0]](args)
            }

        } else {
            throw `InvalidMethodName ${call[0]}`;
        }

        return (call[2] === false) ? service : result;

        // }
        // $result = $service->{$call[0]}(...$this->doResolveServices($this->getParameterBag()->unescapeValue($this->getParameterBag()->resolveValue($call[1])), $inlineServices));
        //
        //         return empty($call[2]) ? $service : $result;

    }

    private getElementToResolve(value: any, referenceInvalidBehaviorFallbackPolicy: number): Array<any> {
        const toResolve: Array<any> = [];
        if (Array.isArray(value)) {
            value.forEach(v => {
                toResolve.push(...this.getElementToResolve(v, referenceInvalidBehaviorFallbackPolicy));
            });
        } else {
            if (value instanceof Reference && value.getInvalidBehavior() === referenceInvalidBehaviorFallbackPolicy) {
                toResolve.push(value.toString());
            }
        }

        return Array.from(new Set<any>(toResolve));
    }

    // // doResolveServices
    // // todo refactor with hook system
    // resolveDefinitionDependency(values: any, inlineServices: any[] = [], isConstructor = false): any {
    //
    //     // resolve values like: ['foo', 'bar', '%hello%' ]
    //     if (Array.isArray(values)) {
    //         const a = values.map(value => this.resolveDefinitionDependency(value, inlineServices, isConstructor));
    //
    //         return a;
    //     } else if (typeof values === 'object') {
    //         // must be last condition
    //         // resolve values like: { "a": "someValue", 1: "foo", "$var": "%bar%" }
    //         const keys = Object.keys(values);
    //         keys.forEach(key => {
    //             // resolve value-part like  ["a", "someValue"]
    //             values[key] = this.resolveDefinitionDependency(values[key], inlineServices, isConstructor)
    //         });
    //
    //         return values;
    //     } else {
    //         return values;
    //     }
    // }

    private shareService(
        definition: Definition,
        service: any,
        id: string,
        inlineContextualServices: InlineContextualServices
    ) {
        inlineContextualServices.set(id, service);

        if (id.length > 0 && definition.isShared()) {
            this.container.setResource(id, service);
            this.container.getCircularReferenceDetector().clear(id);
        }
    }

    /**
     * @throws InvalidIdException
     * @param alias
     * @param id
     */
    public setAlias(alias: string, id: Alias): Alias {
        this.container.setAlias(alias, id);
        delete this.definitions[alias];
        this.removedIds.delete(alias);

        return id;
    }

    public setAliasFromString(alias: string, id: string): Alias {
        return this.setAlias(alias, new Alias(id));
    }

    public getDefinitions(): Array<Definition> {
        return Object.values(this.definitions);
    }

    // addDefinition(resource_id, type: InstanceType<any>, settings: MixedInterface = {}) {
    //     this.definitions.push({
    //         resource_id,
    //         type,
    //         settings: settings || {}
    //     });
    // }


    hasDefinition(definitionId: string): boolean {
        return typeof this.definitions[definitionId] !== 'undefined';
    }

    /**
     *
     * @param definitionId
     * @param definition
     * @throws InvalidIdException
     */
    setDefinition(definitionId: string, definition: Definition): Definition {
        if (this.isCompiled()) {
            throw new BadMethodCallException('Adding definition to a compiled container is not allowed.')
        }

        checkValidId(definitionId);
        definition.setId(definitionId);

        this.container.removeAlias(definitionId);
        this.removedIds.delete(definitionId);
        this.definitions[definitionId] = definition;

        return definition;
    }

    getDefinition(definitionId: string): Definition {
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
     * @return Definition The created definition
     */
    autowire(id: string, className: string | undefined = undefined): Definition {
        return this.setDefinition(id, new Definition(className).setAutowired(true))
    }

    /**
     * Adds the service definitions.
     *
     * @param {Record<string, Definition>} definitions An array of service definitions
     */
    addDefinitions(definitions: Record<string, Definition>) {
        Object.keys(definitions).forEach(id => {
            this.setDefinition(id, definitions[id]);
        });
    }

    /**
     * Sets the service definitions.
     *
     * @param {Record<string, Definition>} definitions A set of service definitions
     */
    setDefinitions(definitions: Record<string, Definition>) {
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
    //         }
    //         // if (definition)
    //     });
    // }
    //
    // process() {
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
    //
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

    /**
     * Compiles the container.
     *
     * This method passes the container to compiler
     * passes whose job is to manipulate and optimize
     * the container.
     *
     * The main compiler passes roughly do four things:
     *
     *  * The extension configurations are merged;
     *  * Parameter values are resolved;
     *  * The parameter bag is frozen;
     *  * Extension loading is disabled.
     *
     * @param {boolean} resolveEnvPlaceholders Whether %env()% parameters should be resolved using the current
     *                                     env vars or be replaced by uniquely identifiable placeholders.
     *                                     Set to "true" when you want to use the current ContainerBuilder
     *                                     directly, keep to "false" when the container is dumped instead.
     */
    compile(resolveEnvPlaceholder: boolean = false): void {
        const compiler = this.getCompiler();

        const bag = this.getParameterBag();
        if (resolveEnvPlaceholder && bag instanceof EnvPlaceholderBag) {
            compiler.addPass(
                new ResolveEnvPlaceholdersPass(),
                DEFAULT_COMPILER_STEP.AFTER_REMOVING,
                -1000
            );
        }

        compiler.compile(this);

        if (bag instanceof EnvPlaceholderBag) {
            if (resolveEnvPlaceholder) {
                const bagData = {};
                const oldBagData = bag.all();
                Object.keys(oldBagData).forEach(propertyName => {
                    const resolvedProperty = bag.resolveValue(
                            // @variation
                            this.resolveEnvPlaceholders(bag.get(propertyName), true)
                        );

                    bagData[propertyName] = resolvedProperty;
                });

                this.container.setParameterBag(new ParameterBag(bagData));
            }

            this.envPlaceholders = bag.getEnvPlaceholders();
        }

        this.container.compile();

        // todo should be a compilation pass
        this.getDefinitions().forEach(definition => {
            if (!definition.isPublic()) {
                this.removedIds[definition.getId()] = true;
            }
        });

        Object.keys(this.getAliases()).forEach((id) => {
            const alias = this.getAlias(id);
            if (!alias.isPublic()) {
                this.removedIds[id] = true;
            }
        })
    }

    isCompiled(): boolean {
        return this.container.isCompiled();
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

    //
    // getDataSlot(name: string): any {
    //     return this.container.dataSlot;
    // }

    // setDataSlot(name: string, value: any): void {
    // }

    addCompilerPass(
        pass: CompilerPassInterface,
        step: string = BEFORE_OPTIMIZATION,
        priority: number = 0
    ): this {
        this.getCompiler().addPass(pass, step, priority);
        return this;
    }

    getResources(): MixedInterface {
        return this.container.getResources();
    }

    /**
     * Merges a ContainerBuilder with the current ContainerBuilder configuration.
     *
     * Service definitions overrides the current defined ones.
     *
     * But for parameters, they are overridden by the current ones. It allows
     * the parameters passed to the container constructor to have precedence
     * over the loaded ones.
     *
     *     container = new ContainerBuilder(new ParameterBag({foo: "bar"}));
     *     loader = new LoaderXXX(container);
     *     loader.load('resource_name');
     *     container.register('foo', 'Object');
     *
     * In the above example, even if the loaded resource defines a foo
     * parameter, the value will still be 'bar' as defined in the ContainerBuilder
     * constructor.
     *
     * @throws BadMethodCallException When this ContainerBuilder is compiled
     */
    public merge(container: ContainerBuilderInterface): void {
        if (this.isCompiled()) {
            throw new BadMethodCallException('Cannot merge on a compiled container.');
        }

        this.mergeDefinition(container);
        this.mergeAliases(container);
        this.getParameterBag().merge(container.getParameterBag());

        //      if ($this->trackResources) {
        //             foreach ($container->getResources() as $resource) {
        //                 $this->addResource($resource);
        //             }
        //         }

        // foreach ($this->extensions as $name => $extension) {
        //     if (!isset($this->extensionConfigs[$name])) {
        //         $this->extensionConfigs[$name] = [];
        //     }
        //
        //     $this->extensionConfigs[$name] = array_merge($this->extensionConfigs[$name], $container->getExtensionConfig($name));
        // }

        //
        // foreach ($container->envCounters as $env => $count) {
        //     if (!$count && !isset($envPlaceholders[$env])) {
        //         continue;
        //     }
        //
        // foreach ($container->getAutoconfiguredInstanceof() as $interface => $childDefinition) {
        //     if (isset($this->autoconfiguredInstanceof[$interface])) {
        //         throw new InvalidArgumentException(sprintf('"%s" has already been autoconfigured and merge() does not support merging autoconfiguration for the same class/interface.', $interface));
        //     }
        //
        //     $this->autoconfiguredInstanceof[$interface] = $childDefinition;
        // }
        //
        // foreach ($container->getAutoconfiguredAttributes() as $attribute => $configurator) {
        //     if (isset($this->autoconfiguredAttributes[$attribute])) {
        //         throw new InvalidArgumentException(sprintf('"%s" has already been autoconfigured and merge() does not support merging autoconfiguration for the same attribute.', $attribute));
        //     }
        //
        //     $this->autoconfiguredAttributes[$attribute] = $configurator;
        // }

    }


    private mergeDefinition(container: ContainerBuilderInterface): void {
        container.getDefinitions().forEach(definition => {
            this.setDefinition(definition.getId(), definition);
        });
    }

    private mergeAliases(container: ContainerBuilderInterface): void {
        const aliases = container.getAliases();
        Object.keys(aliases).forEach(aliasId => {
            this.addAlias(aliases[aliasId], aliasId);
        });
    }
}

export default ContainerBuilder;
