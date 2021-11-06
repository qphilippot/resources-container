export default class Foo {
    private param: any;

    constructor(param: any) {
        this.param = param;
    }

    getParam():any {
        return this.param;
    }
}