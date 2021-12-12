import HandlerInterface from "../../../interfaces/handler.interface";
import Manager from "../../manager.model";
import { Publisher } from "@qphi/publisher-subscriber";

export default class DefaultResolver extends Publisher implements HandlerInterface {
    private manager: Manager;

    constructor(manager, id) {
        super(id);
        this.manager = manager;
    }

    public match(): boolean {
        return true
    }

    public process(data: any) {
        return data;
    }
}
