import MixedInterface from "../../utils/mixed.interface";
import FlexibleService from "../../utils/flexible.service";
import OutOfBoundsException from "../exception/out-of-bounds.exception";

const flexible = new FlexibleService();

export default class ResourceDefinition {
    private id: string;
    private type?: InstanceType<any>;
    settings: MixedInterface = {};
    arguments: Array<any> = [];
    private tags: MixedInterface;

    constructor(type?: InstanceType<any>, settings: MixedInterface = {}) {
        if (typeof type !== 'undefined') {
            this.type = type;
        }

        this.settings = settings;
    }

    setId(id) {
        this.id = id;
    }

    getId(): string {
        return this.id;
    }

    hasTag(tag: string): boolean {
        return typeof this.tags[tag] !== 'undefined';
    }

    setResourceType(type: InstanceType<any>) {
        this.type = type;
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
}