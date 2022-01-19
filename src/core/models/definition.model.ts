import type MixedInterface from "../../utils/mixed.interface";
import FlexibleService from "../../utils/flexible.service";
import OutOfBoundsException from "../exception/out-of-bounds.exception";
import InvalidArgumentException from "../exception/invalid-argument.exception";
import Reference from "./reference.model";

const flexible = new FlexibleService();

export default class Definition {
    private id: string;
    private type?: InstanceType<any>;
    private _isAbstract: boolean = false;
    private autowired: boolean = false;
    private lazy: boolean = false;
    private settings: MixedInterface = {};
    private arguments: MixedInterface = [];
    // https://symfony.com/blog/new-in-symfony-5-1-autowire-public-typed-properties
    private injectedProperties: Array<any> = [];
    private changes: MixedInterface = {};
    private calls: Array<any> = [];
    private shared: boolean = true;
    private filePath: string | null = null;
    private factory: string|Array<any>|null = null;
    private public: boolean = true;
    private tags: MixedInterface = {};
    private synthetic: boolean = false;
    /**
     * Whether this definition is synthetic, that is not constructed by the
     * container, but dynamically injected.
     *
     * @returns {boolean}
     */
    public isSynthetic(): boolean {
        return this.synthetic;
    }

    /**
     * Sets whether this definition is synthetic, that is not constructed by the
     * container, but dynamically injected.
     *
     * @returns this
     */
    public setSynthetic(isSynthetic: boolean): Definition {
        this.synthetic = isSynthetic;

        if (typeof this.changes['public'] === 'undefined') {
            this.setPublic(true);
        }
        return this;
    }

    public setFile(filePath: string): void {
        this.filePath = filePath;
    }


    public getFilePath(): string {
        return this.filePath ?? '';
    }
    /**
     * Sets the visibility of this resource.
     * @returns {Definition}
     */
    public setPublic(isPublic: boolean): Definition {
        this.changes['public'] = true;
        this.public = isPublic;
        return this;
    }

    /**
     * Whether this service is public facing.
     *
     * @returns {boolean}
     */
    public isPublic(): boolean {
        return this.public;
    }

    constructor(type?: InstanceType<any>, settings: MixedInterface = {}) {
        if (typeof type !== 'undefined') {
            this.type = type;
        }

        this.settings = settings;
    }

    public setLazy(isLazy: boolean = true): void {
        this.lazy = isLazy;
    }

    public isLazy(): boolean {
        return this.lazy;
    }

    public hasFactory(): boolean {
        return this.getFactory() !== null;
    }

    public setFactory(factory: string|Array<any>|Reference|null) {
        this.changes['factory'] = true;

        if (typeof factory === 'string' && factory.includes('::')) {
            factory = factory.split('::');
            if (factory.length > 2) {
                factory.length = 2;
            }
        } else if (factory instanceof Reference) {
            // todo voir comment adapter ça en ts ??
            factory = [factory, '__invoke'];
        }

        this.factory = factory;
        return this;
    }

    public getFactory():string|Array<any>|null {
        return this.factory || null;
    }

    public setId(id) {
        this.id = id;
        return this;
    }

    public getId(): string {
        return this.id;
    }


    public setShared(shared:boolean): this {
        this.changes['shared'] = true;
        this.shared = shared;
        return this;
    }

    public isShared(): boolean {
        return this.shared;
    }

    public hasTag(tag: string): boolean {
        return typeof this.tags[tag] !== 'undefined';
    }

    /**
     * @return {object} a shallow copy of tags
     */
    public getTags(): object {
        return { ...this.tags };
    }

    /**
     * @param {string} name the tag name
     * @return {any}
     */
    public getTag(name: string): any {
        return this.tags[name];
    }


    /**
     * Adds a tag for this definition.
     * @return {Definition} this
     */
    public addTag(name: string, value: any = {}): Definition {
        this.tags[name] = value;
        return this;
    }

    /**
     * Sets tags for this definition.
     * @return {Definition} this
     */
    public setTags(tags: MixedInterface): Definition {
        this.tags = tags;
        return this;
    }

    public setResourceType(type: InstanceType<any>) {
        this.type = type ?? null;
        return this;
    }

    public getResourceType(): InstanceType<any> {
        return this.type;
    }

    public setup(propertyPath: string, value: any) {
        flexible.set(propertyPath, value, this.settings);
    }

    public getSetting(propertyPath: string): any {
        return flexible.get(propertyPath, this.settings);
    }

    /**
     * @returns {MixedInterface} a shallow copy of settings. To update settings, use `setup`.
     */
    public getSettings(): MixedInterface {
        return { ...this.settings };
    }

    public setArguments(args: MixedInterface) {
        this.arguments = args;
        return this;
    }

    public setAutowired(status: boolean): this {
        this.changes['autowired'] = true;
        this.autowired = status;

        return this;
    }

    public isAutowired(): boolean {
        return this.autowired;
    }

    public setArgument(index: number|string, arg: any) {
        this.arguments[index] = arg;
        return this;
    }

    /**
     * Whether this definition is abstract, that means it merely serves as a
     * template for other definitions.
     *
     * @return {Definition} this
     */
    public setAbstract(isAbstract: boolean): Definition {
        this._isAbstract = isAbstract;
        return this;
    }

    /**
     * Whether this definition is abstract, that means it merely serves as a
     * template for other definitions.
     *
     * @return bool
     */
    public isAbstract(): boolean    {
        return this._isAbstract;
    }

    public addArgument(arg: any) {
        // As arguments is a mixed object, we have to deduce it index in order to properly "add" argument
        // It must not replace any existing arguments
        const index = Object.keys(this.arguments).length;
        this.arguments[index] = arg;
        return this;
    }

    public replaceArgument(index: number, arg: any) {
        const keys = Object.keys(this.arguments);
        const length = keys.length;
        if (length === 0) {
            throw new OutOfBoundsException('Cannot replace arguments if none have been configured yet.');
        }

        if (length <= index) {
            throw new OutOfBoundsException(
                `The index "${index}" is not in the range [0, ${length - 1}].`
            );
        }

        const key = keys[index];
        this.arguments[key] = arg;
        return this;
    }

    public getArguments(): MixedInterface {
        return this.arguments;
    }

    public getInjectionProperties(): Record<string, any> {
        return this.injectedProperties;
    }

    public setInjectionProperties(properties: Array<any>): Definition {
        this.injectedProperties = properties;
        return this;
    }

    public setInjectionProperty(name: string, value: any): this {
        this.injectedProperties[name] = value;
        return this;
    }

    public getMethodCalls(): Array<any> {
        return this.calls.slice(0);
    }

    public setMethodCalls(calls: Array<any>): Definition {
        this.calls = [];

        calls.forEach(call => {
            this.addMethodCall(call[0], call[1], call[2] || false)
        });

        return this;
    }

    public addMethodCall(methodName: string, args: MixedInterface, shouldReturnClone: boolean = false) : Definition {
        if (methodName.length === 0) {
            throw  new InvalidArgumentException('Method name cannot be empty');
        }

        this.calls.push([ methodName, args, shouldReturnClone ]);

        return this;
    }

//
//     /**
//      * Removes a method to call after service initialization.
//      *
//      * @returns $this
//      */
//     public function removeMethodCall(string $method)
//     {
//         foreach ($this->calls as $i => $call) {
//             if ($call[0] === $method) {
//                 unset($this->calls[$i]);
//             }
//         }
//
//         return $this;
//     }
//
//     /**
//      * Check if the current definition has a given method to call after service initialization.
//      *
//      * @returns bool
//      */
//     public function hasMethodCall(string $method)
//     {
//         foreach ($this->calls as $call) {
//             if ($call[0] === $method) {
//                 return true;
//             }
//         }
//
//         return false;
//     }
//
//     /**
//      * Gets the methods to call after service initialization.
//      *
//      * @returns array An array of method calls
//      */
//     public function getMethodCalls()
//     {
//         return $this->calls;
//     }
//
//     /**
//      * Sets the definition templates to conditionally apply on the current definition, keyed by parent interface/class.
//      *
//      * @param ChildDefinition[] $instanceof
//      *
//      * @returns $this
//      */
//     public function setInstanceofConditionals(array $instanceof)
//     {
//         $this->instanceof = $instanceof;
//
//         return $this;
//     }
}
