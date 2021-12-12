import MixedInterface from "../../../src/utils/mixed.interface";

export default class FooClass {
    className: string = 'FooClass';
    public arguments: any;
    public bar: any = null;

    constructor(instanceArguments: any = undefined) {
        this.arguments = instanceArguments;
    }

    setBar(bar: any): void {
        this.bar = bar;
    }
}
