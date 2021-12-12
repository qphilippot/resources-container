import Mixed from "../../../utils/mixed.model";
import FeatureCollection from "../../features/feature.collection";
import ComponentState from "./component.state";
import MixedInterface from "../../../utils/mixed.interface";
import FunctionCollection from "../function.collection";
import {
    PublisherSubscriberInterface,
    PublisherSubscriber,
    PublisherInterface
} from '@qphi/publisher-subscriber';

export interface NotificationRecord {
    from: PublisherInterface;
    name: string;
    handler?: Function
}
let counter = 0;
const prefix = 'component_';

class Component extends PublisherSubscriber implements PublisherSubscriberInterface {
    name: string;
    state: ComponentState;
    features: FeatureCollection = new FeatureCollection();
    behavior: FunctionCollection = new FunctionCollection();

    constructor(settings: MixedInterface = {}) {
        super(settings.id || `${prefix}${counter++}`);
        const core_id = `${prefix}${counter++}`;
        this.name = settings.name || core_id;

        this.state = new ComponentState();
    }

    addBehavior(name: string, behavior: Function) {
        this.behavior.add(name, behavior.bind(this));
    }

    behave(name: string, parameters: any) {
        const behavior = this.behavior.get(name);
        return behavior(parameters);
    }
}

export default Component;
