export default class ParentClass {
    private isToto: boolean = false;

    constructor(settings = {}) {
    }

    enableToto() {
        this.isToto = true;
    }

    disableToto() {
        this.isToto = false;
    }
}
