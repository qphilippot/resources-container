export default class FooClass {
    className: string = 'FooClass';
    public arguments: any;
    public bar: any = null;
    public called = false;

    constructor(instanceArguments: any = undefined) {
        this.arguments = instanceArguments;
    }

    setBar(bar: any): void {
        this.bar = bar;
    }

    public static getInstance($arguments = [])
    {
        const instance = new this($arguments);
        instance.called = true;

        return instance;
    }
}
