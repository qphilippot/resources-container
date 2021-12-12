import {EXCEPTION_ON_INVALID_REFERENCE} from "../container/container-builder.invalid-behaviors";

export default class Reference {
    private id: string;
    private behaviorOnInvalid: number;

    constructor(id:string, behaviorOnInvalid: number = EXCEPTION_ON_INVALID_REFERENCE) {
        this.id = id;
        this.behaviorOnInvalid = behaviorOnInvalid;
    }

    /**
     * Returns the behavior to be used when the service does not exist.
     * @returns {number}
     */
    public getInvalidBehavior(): number {
        return this.behaviorOnInvalid;
    }

    toString(): string {
        return this.id;
    }
}
