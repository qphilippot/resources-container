import ParentClass from "./parent-class";

export default class Tom extends ParentClass {
    private carabistouille: string = "c'est de la poudre de perlimpinpin";
    constructor(settings = {}) {
        super(settings);
    }

    whatIsIt(): string {
        return this.carabistouille;
    }
}