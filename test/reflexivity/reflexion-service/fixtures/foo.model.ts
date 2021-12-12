export default class Foo {
    private param: any;

    constructor(param: any) {
        this.param = param;
    }

    public getParam():any {
        return this.param;
    }
}
