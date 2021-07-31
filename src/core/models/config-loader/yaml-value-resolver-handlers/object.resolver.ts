import HandlerInterface from "../../../interfaces/handler.interface";
import Publisher from "../../../../publisher-subscriber/model/publisher.model";
import YamlConfigLoader from "../yaml-config-loader";
import Manager from "../../manager.model";

export default class ObjectResolver extends Publisher implements HandlerInterface {
    private manager: Manager;

    constructor(manager, id) {
        super(id);
        this.manager = manager;
    }

    match(data: any): boolean {
        return typeof data === 'object';
    }

    process(data: any) {
        Object.keys(data).forEach(property => {
            data[property] = this.manager.process(property);
        });

        return data;
    }
};