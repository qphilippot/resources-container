import ReflectionParameterInterface from "./reflection-parameter.interface";

export type ReflectionParameterConstructorPayload = {
    name: string,
    position: number,
    defaultValue: any,
    optional: boolean
}
export default class ReflectionParameter implements ReflectionParameterInterface {
    private readonly name: string;
    private readonly position: number; // todo
    private readonly defaultValue: any;// todo
    private readonly optional: boolean;

    constructor({
        name,
        position,
        defaultValue,
        optional
    }: ReflectionParameterConstructorPayload
    ) {
        this.name = name;
        this.position = position;
        this.defaultValue = defaultValue;
        this.optional = optional;
    }

    public getName(): string {
        return this.name;
    }

    public getPosition(): number {
        return this.position;
    }

    public isDefaultValueAvailable(): boolean {
        return typeof this.defaultValue !== 'undefined';
    }

    public getDefaultValue(): any {
        return this.defaultValue;
    }

    public isOptional(): boolean {
        return this.optional;
    }
}
