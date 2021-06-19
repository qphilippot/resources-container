export default class Reference {
    private id: string;

    constructor(id:string) {
        this.id = id;
    }

    toString(): string {
        return this.id;
    }
}