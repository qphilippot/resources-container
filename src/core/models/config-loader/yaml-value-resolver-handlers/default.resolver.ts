import HandlerInterface from "../../../interfaces/handler.interface";
import Publisher from "../../../../publisher-subscriber/model/publisher.model";
import YamlConfigLoader from "../yaml-config-loader";
import Manager from "../../manager.model";
import {
    EXCEPTION_ON_INVALID_REFERENCE,
    IGNORE_ON_INVALID_REFERENCE,
    IGNORE_ON_UNINITIALIZED_REFERENCE
} from "../../../container/container-builder.invalid-behaviors";
import Reference from "../../reference.model";

export default class DefaultResolver extends Publisher implements HandlerInterface {
    private manager: Manager;

    constructor(manager, id) {
        super(id);
        this.manager = manager;
    }

    match(data: any): boolean {
        return true
    }

    process(data: any) {
        return data;
    }
};