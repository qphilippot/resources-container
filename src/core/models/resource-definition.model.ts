import MixedInterface from "../../utils/mixed.interface";
import FlexibleService from "../../utils/flexible.service";
import OutOfBoundsException from "../exception/out-of-bounds.exception";
import InvalidArgumentException from "../exception/invalid-argument.exception";
import Reference from "./reference.model";

const flexible = new FlexibleService();

export default class ResourceDefinition {
    private id: string;
    private type?: InstanceType<any>;
    settings: MixedInterface = {};
    arguments: MixedInterface = [];
    properties: Array<any> = [];
    changes: MixedInterface = {};
    calls: Array<any> = [];
    private factory: any;
    private public: boolean;
    private tags: MixedInterface;
    private synthetic: boolean = false;

    /**
     * Whether this definition is synthetic, that is not constructed by the
     * container, but dynamically injected.
     *
     * @returns {boolean}
     */
    isSynthetic(): boolean {
        return this.synthetic;
    }

    /**
     * Sets whether this definition is synthetic, that is not constructed by the
     * container, but dynamically injected.
     *
     * @returns this
     */
    setSynthetic(isSynthetic: boolean): ResourceDefinition {
        this.synthetic = isSynthetic;

        if (typeof this.changes['public'] === 'undefined') {
            this.setPublic(true);
        }
        return this;
    }

    /**
     * Sets the visibility of this resource.
     * @returns {ResourceDefinition}
     */
    setPublic(isPublic: boolean): ResourceDefinition {
        this.changes['public'] = true;
        this.public = isPublic;
        return this;
    }

    /**
     * Whether this service is public facing.
     *
     * @returns {boolean}
     */
    isPublic(): boolean {
        return this.public;
    }

    constructor(type?: InstanceType<any>, settings: MixedInterface = {}) {
        if (typeof type !== 'undefined') {
            this.type = type;
        }

        this.settings = settings;
    }

    hasFactory(): boolean {
        return Object.keys(this.getFactory()).length > 0;
    }

    setFactory(factory: any) {
        this.factory = factory;
        return this;
    }

    getFactory():any {
        return this.factory || {};
    }

    setId(id) {
        this.id = id;
        return this;
    }

    getId(): string {
        return this.id;
    }

    hasTag(tag: string): boolean {
        return typeof this.tags[tag] !== 'undefined';
    }

    setResourceType(type: InstanceType<any>) {
        this.type = type;
        return this;
    }

    getResourceType(): InstanceType<any> {
        return this.type;
    }

    setup(propertyPath: string, value: any) {
        flexible.set(propertyPath, value, this.settings);
    }

    getSetting(propertyPath: string): any {
        return flexible.get(propertyPath, this.settings);
    }

    /**
     * @returns {MixedInterface} a shallow copy of settings. To update settings, use `setup`.
     */
    getSettings(): MixedInterface {
        return { ...this.settings };
    }

    setArguments(args: MixedInterface) {
        this.arguments = args;
        return this;
    }

    setArgument(index: number|string, arg: any) {
        this.arguments[index] = arg;
        return this;
    }

    addArgument(arg: any) {
        const index = Object.keys(this.arguments).length;
        this.arguments[index] = arg;
        return this;
    }

    replaceArgument(index: number, arg: any) {
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

    getArguments(): MixedInterface {
        return { ...this.arguments };
    }

    getProperties(): Array<any> {
        return this.properties.slice(0);
    }

    setProperties(properties: Array<any>): ResourceDefinition {
        this.properties = properties;
        return this;
    }

    getMethodCalls(): Array<any> {
        return this.calls.slice(0);
    }

    setMethodCalls(calls: Array<any>): ResourceDefinition {
        this.calls = [];

        calls.forEach(call => {
            this.addMethodCall(call[0], call[1], call[2] || false)
        });

        return this;
    }

    addMethodCall(methodName: string, args: MixedInterface, shouldReturnClone: boolean = false) : ResourceDefinition {
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