import HandlerInterface from "../../../interfaces/handler.interface";
import { Publisher } from "@qphi/publisher-subscriber";
import Manager from "../../manager.model";

export default class ObjectResolver extends Publisher implements HandlerInterface {
    private manager: Manager;

    constructor(manager, id) {
        super(id);
        this.manager = manager;
    }

    public match(data: any): boolean {
        return typeof data === 'object';
    }

    public process(data: any) {
        Object.keys(data).forEach(property => {
            data[property] = this.manager.process(data[property]);
        });

        return data;
    }
}
