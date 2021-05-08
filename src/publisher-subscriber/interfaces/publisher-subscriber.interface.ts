import MixedInterface from "../../core/mixed.interface";
import SubscriptionInterface from "./subscription.interface";

interface PublisherSubscriberInterface {
    subscribe(publisher: PublisherSubscriberInterface, notification: string, handler: Function);
    unsubscribe(selector: MixedInterface);

    getNbSubscriptions(): number;
    getNbSubscribers(): number;

    publish(notification: string, data: any);

    addSubscriber(notification: string, subscription: SubscriptionInterface);
    removeSubscriber(notification: string, subscription_id: string);

    addSubscription(notification: string, subscription: SubscriptionInterface);
    removeSubscription(notification: string, subscription_id: string)

    getId(): string;
    destroy();
}

export default PublisherSubscriberInterface;