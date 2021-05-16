import Mixed from "../../../utils/mixed.model";
import FeatureCollection from "../../features/feature.collection";
import ComponentState from "./component.state";
import MixedInterface from "../../../utils/mixed.interface";
import FunctionCollection from "../function.collection";
import SubscriptionInterface from "../../../publisher-subscriber/interfaces/subscription.interface";
import PublisherSubscriberInterface from "../../../publisher-subscriber/interfaces/publisher-subscriber.interface";
import PublisherSubscriber from "../../../publisher-subscriber/model/publisher-subscriber.model";
import NotificationRecord from "../../../publisher-subscriber/interfaces/notification-record.interface";
let counter = 0;
const prefix = 'component_';

class Component implements PublisherSubscriberInterface {
    name: string;
    id: string;
    state: ComponentState;
    features: FeatureCollection = new FeatureCollection();
    behavior: FunctionCollection = new FunctionCollection();

    publisherSubscriber: PublisherSubscriberInterface;

    constructor(settings: MixedInterface = {}) {
        const core_id = `${prefix}${counter++}`;
        this.name = settings.name || core_id;
        this.id = settings.id || core_id;

        this.state = new ComponentState();
        this.publisherSubscriber = new PublisherSubscriber(this.id);
    }

    addBehavior(name: string, behavior: Function) {
        this.behavior.add(name, behavior.bind(this));
    }

    behave(name: string, parameters: any) {
        const behavior = this.behavior.get(name);
        return behavior(parameters);
    }


    subscribe(component: PublisherSubscriberInterface, notification: string, handler: Function) {
       this.publisherSubscriber.subscribe(component, notification, handler);
    }

    unsubscribe(selector: MixedInterface) {
      this.publisherSubscriber.unsubscribe(selector);
    }

    publish(notification: string, data: any) {
        this.publisherSubscriber.publish(notification, data);
    }

    destroy() {
        this.publisherSubscriber.destroy();
    }

    addSubscriber(notification: string, subscription: SubscriptionInterface) {
        this.publisherSubscriber.addSubscriber(notification, subscription);
    }

    addSubscription(notification: string, subscription: SubscriptionInterface) {
        this.publisherSubscriber.addSubscriber(notification, subscription);
    }

    getId(): string {
        return this.id;
    }

    getNbSubscribers(): number {
        return this.publisherSubscriber.getNbSubscribers();
    }

    getNbSubscriptions(): number {
        return this.publisherSubscriber.getNbSubscriptions();
    }

    removeSubscriber(notification: string, subscription_id: string) {
        this.publisherSubscriber.removeSubscriber(notification, subscription_id);
    }

    removeSubscription(notification: string, subscription_id: string) {
        this.publisherSubscriber.removeSubscription(notification, subscription_id);
    }

    waitUntil(notifications: Array<NotificationRecord>): Promise<Array<any>> {
        return this.publisherSubscriber.waitUntil(notifications);
    }
}

export default Component;