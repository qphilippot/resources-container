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
    arguments: Array<any> = [];
    properties: Array<any> = [];
    calls: Array<any> = [];
    private factory: any;
    private tags: MixedInterface;

    constructor(type?: InstanceType<any>, settings: MixedInterface = {}) {
        if (typeof type !== 'undefined') {
            this.type = type;
        }

        this.settings = settings;
    }

    setFactory(factory: any) {
        this.factory = factory;
        return this;
    }

    getFactory():any {
        return this.factory;
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
     * @return {MixedInterface} a shallow copy of settings. To update settings, use `setup`.
     */
    getSettings(): MixedInterface {
        return { ...this.settings };
    }

    setArguments(args: Array<any>) {
        this.arguments = args;
        return this;
    }

    setArgument(index: number, arg: any) {
        this.arguments[index] = arg;
        return this;
    }

    addArgument(arg: any) {
        this.arguments.push(arg);
        return this;
    }

    replaceArgument(index: number, arg: any) {
        if (this.arguments.length === 0) {
            throw new OutOfBoundsException('Cannot replace arguments if none have been configured yet.');
        }

        if (this.arguments.length <= index) {
            throw new OutOfBoundsException(
                `The index "${index}" is not in the range [0, ${this.arguments.length - 1}].`
            );
        }

        this.arguments[index] = arg;
        return this;
    }

    getArguments(): Array<any> {
        return this.arguments.slice(0);
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

    addMethodCall(methodName: string, args: Array<any>, shouldReturnClone: boolean = false) : ResourceDefinition {
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
//      * @return $this
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
//      * @return bool
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
//      * @return array An array of method calls
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
//      * @return $this
//      */
//     public function setInstanceofConditionals(array $instanceof)
//     {
//         $this->instanceof = $instanceof;
//
//         return $this;
//     }
}