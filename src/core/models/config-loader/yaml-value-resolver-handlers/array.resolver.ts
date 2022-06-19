import HandlerInterface from "../../../interfaces/handler.interface";
import { Publisher } from "@qphi/publisher-subscriber";
import Manager from "../../manager.model";

export default class ArrayResolver extends Publisher implements HandlerInterface {
    private manager: Manager;

    constructor(manager, id) {
        super(id);
        this.manager = manager;
    }

    public match(data: any): boolean {
        return Array.isArray(data);
    }

    public process(data: any[]) {
        const resolved: any[] = [];

        data.forEach(property => {
            resolved.push(this.manager.process(property));
        });

        return resolved;
    }
}
