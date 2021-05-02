import Mixed from "../../mixed.model";
import FeatureCollection from "../../features/feature.collection";
import ComponentState from "./component.state";
import MixedInterface from "../../mixed.interface";
import FunctionCollection from "../function.collection";
import SubscriptionInterface from "../subscription.interface";
let counter = 0;
const prefix = 'component_';


class Component extends Mixed {
    name: string;
    id: string;
    state: ComponentState;
    features: FeatureCollection = new FeatureCollection();
    behavior: FunctionCollection = new FunctionCollection();

    constructor(settings: MixedInterface = {}) {
        super();

        const core_id = `${prefix}${counter++}`;
        this.name = settings.name || core_id;
        this.id = settings.id || core_id;

        this.state = new ComponentState(core_id);
    }

    addBehavior(name: string, behavior: Function) {
        this.behavior.add(name, behavior.bind(this));
    }

    behave(name: string, parameters: any) {
        const behavior = this.behavior.get(name);
        return behavior(parameters);
    }

    subscribe(component: Component, notification: string, handler: Function) {
        const nbSubscriptions = this.state.su
        const subscription: SubscriptionInterface = {
            id: `sub_${this.id}_to_${component.id}_`
        }
    }
}

export default Component;