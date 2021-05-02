import MixedInterface from "../../mixed.interface";
import SubscriptionInterface from "../subscription.interface";

class ComponentState {
    private id: string;
    private subscribers: Record<string, Array<SubscriptionInterface>> = {};
    private subscriptions: Record<string, Array<SubscriptionInterface>> = {};
    private nbSubscriptions: number = 0;
    private nbSubscribers: number = 0;
    private state: MixedInterface = {};

    constructor(id) {
        this.id = id;
    }

    store(key: string, value: any) {
        this.state[key] = value;
    }

    get(key: string): any {
        return this.state[key];
    }

    getNbSubscriptions(): number {
        return this.nbSubscriptions;
    }

    addSubscription(name: string, subscription: SubscriptionInterface) {
        if (Array.isArray(this.subscriptions[name]) !== true) {
            this.subscriptions[name] = [];
        }

        const potentialDoublon = this.subscriptions[name].find(candidate => candidate.id === subscription.id);
        if (potentialDoublon === null) {
            this.subscriptions[name].push(subscription);
            this.nbSubscriptions++;
        }
    }
}

export default ComponentState;