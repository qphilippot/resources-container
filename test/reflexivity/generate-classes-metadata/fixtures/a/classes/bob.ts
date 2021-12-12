import ParentClass from "./parent-class";
import BobInterface from "./bobInterface";
import VoidInterface from "./VoidInterface";

export default class Bob extends ParentClass implements BobInterface, VoidInterface {
    constructor(settings = {}) {
        super(settings);
    }

    someFunction(p1: unknown) {

    }
}
