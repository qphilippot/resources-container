import HandlerInterface from "../../../interfaces/handler.interface";
import Publisher from "../../../../publisher-subscriber/model/publisher.model";
import YamlConfigLoader from "../yaml-config-loader";
import Manager from "../../manager.model";
import {
    EXCEPTION_ON_INVALID_REFERENCE,
    IGNORE_ON_INVALID_REFERENCE,
    IGNORE_ON_UNINITIALIZED_REFERENCE
} from "../../../container-builder.invalid-behaviors";
import Reference from "../../reference.model";

export default class ReferenceResolver extends Publisher implements HandlerInterface {
    private manager: Manager;

    constructor(manager, id) {
        super(id);
        this.manager = manager;
    }

    match(data: any): boolean {
        return typeof data === 'string' && data.startsWith('@');
    }

    process(str: string) {
        let value: string | Reference;
        let invalidBehavior: number | null = null;

        if (str.startsWith('@@')) {
            value = str.substring(1);
        }

        else if (str.startsWith('@!')) {
            value = str.substring(2);
            invalidBehavior = IGNORE_ON_UNINITIALIZED_REFERENCE;
        }

        else if (str.startsWith('@?')) {
            value = str.substring(2);
            invalidBehavior = IGNORE_ON_INVALID_REFERENCE;
        }

        else {
            value = str.substring(1);
            invalidBehavior = EXCEPTION_ON_INVALID_REFERENCE;
        }

        if (invalidBehavior !== null) {
            value = new Reference(value, invalidBehavior);
        }

        return value;
    }
};