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
    private autoconfigured: boolean = false;
    private lazy: boolean = false;
    private settings: MixedInterface = {};
    protected arguments: MixedInterface = {};
    // https://symfony.com/blog/new-in-symfony-5-1-autowire-public-typed-properties
    private injectedProperties: Array<any> = [];
    private changes: MixedInterface = {};
    private calls: Array<any> = [];
    private shared: boolean = true;
    private filePath: string | null = null;
    private factory: ((any) => void) | string | Array<any> | null = null;
    private public: boolean = false;
    private tags: MixedInterface = {};
    private synthetic: boolean = false;
    // @todo better type...
    private configurator: ((any) => void) | string | Array<any> | null = null;
    private _instanceof: MixedInterface= {};

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

    public setFilePath(filePath: string): this {
        this.changes['file'] = true;
        this.filePath = filePath;

        return this;
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

    public setLazy(isLazy: boolean = true): this {
        this.changes['lazy'] = true;
        this.lazy = isLazy;
        return this;
    }

    public isLazy(): boolean {
        return this.lazy;
    }

    public hasFactory(): boolean {
        return this.getFactory() !== null;
    }

    public setFactory(factory: string | Array<any> | Reference | null) {
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

    public getFactory(): ((any) => void) | string | Array<any> | null {
        return this.factory || null;
    }

    public setId(id) {
        this.id = id;
        return this;
    }

    public getId(): string {
        return this.id;
    }


    public setShared(shared: boolean): this {
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
        return {...this.tags};
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
        this.changes['type'] = true;
        this.type = type ?? null;
        return this;
    }

    public getResourceType(): InstanceType<any> {
        return this.type;
    }

    public setup(propertyPath: string, value: any): this {
        flexible.set(propertyPath, value, this.settings);
        return this;
    }

    public getSetting(propertyPath: string): any {
        return flexible.get(propertyPath, this.settings);
    }

    /**
     * Sets a configurator to call after the service is fully initialized.
     *
     * @param {string|Array<any>|Reference|null} configurator A PHP function, reference or an array containing a class/Reference and a method to call
     *
     * @return this
     */
    public setConfigurator(configurator: ((any) => void) | string | Array<any> | Reference | null): this {
        this.changes['configurator'] = true;

        if (typeof configurator === 'string' && configurator.includes('::')) {
            configurator = configurator.split('::');
            configurator.length = 2;
        } else {
            if (configurator instanceof Reference) {
                configurator = [configurator, '__invoke'];
            }
        }

        this.configurator = configurator;

        return this;
    }

    /**
     * Gets the configurator to call after the service is fully initialized.
     */
    public getConfigurator(): ((any) => void) | string | Array<any> | null {
        return this.configurator;
    }

    /**
     * @returns {MixedInterface} a shallow copy of settings. To update settings, use `setup`.
     */
    public getSettings(): MixedInterface {
        return {...this.settings};
    }

    public setArguments(args: MixedInterface) {
        this.arguments = {...args};
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

    public setAutoconfigured(status: boolean): this {
        this.changes['autoconfigured'] = true;
        this.autoconfigured = status;

        return this;
    }

    public isAutoconfigured(): boolean {
        return this.autoconfigured;
    }

    public setArgument(index: number | string, arg: any) {
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

    public getChanges(): MixedInterface {
        return this.changes;
    }

    /**
     * Whether this definition is abstract, that means it merely serves as a
     * template for other definitions.
     *
     * @return bool
     */
    public isAbstract(): boolean {
        return this._isAbstract;
    }

    public addArgument(arg: any) {
        // As arguments is a mixed object, we have to deduce it index in order to properly "add" argument
        // It must not replace any existing arguments
        const index = Object.keys(this.arguments).length;
        this.arguments[index] = arg;
        return this;
    }

    /**
     * Replaces a specific argument.
     *
     * @return this
     *
     * @throws OutOfBoundsException When the replaced argument does not exist
     */
    public replaceArgument(key: string, value: any): this {
        const keys = Object.keys(this.arguments);
        const length = keys.length;
        if (length === 0) {
            throw new OutOfBoundsException('Cannot replace arguments if none have been configured yet.');
        }

        const keyAsNumber = parseInt(key, 10);
        if (!isNaN(keyAsNumber) && length <= keyAsNumber) {
            throw new OutOfBoundsException(
                `The index "${key}" is not in the range [0, ${length - 1}].`
            );
        }

        this.arguments[key] = value;
        return this;
    }

    public getArgument(key: string): any {
        if (typeof this.arguments[key] === 'undefined') {
            throw new OutOfBoundsException(`The argument "${key}" doesn't exists in definition "${this.getId()}".`)
        }

        return this.arguments[key];
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

    public addMethodCall(methodName: string, args: MixedInterface, shouldReturnClone: boolean = false): Definition {
        if (methodName.length === 0) {
            throw  new InvalidArgumentException('Method name cannot be empty');
        }

        this.calls.push([methodName, args, shouldReturnClone]);

        return this;
    }

    /**
     * Sets the definition templates to conditionally apply on the current definition, keyed by parent interface/class.
     *
     * @param ChildDefinition[] instanceof
     *
     * @return this
     */
    public setInstanceofConditionals(_instanceof: MixedInterface): this {
        this._instanceof = _instanceof;

        return this;
    }

    /**
     * Gets the definition templates to conditionally apply on the current definition, keyed by parent interface/class.
     *
     * @return ChildDefinition[]
     */
    public getInstanceofConditionals(): MixedInterface {
        return this._instanceof;
    }

}
