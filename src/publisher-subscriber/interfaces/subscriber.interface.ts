import MixedInterface from "../../core/mixed.interface";
import SubscriptionInterface from "./subscription.interface";
import PublisherInterface from "./publisher.interface";

interface SubscriberInterface {
    subscribe(publisher: PublisherInterface, notification: string, handler: Function);
    unsubscribe(selector: MixedInterface);

    getNbSubscriptions(): number;

    addSubscription(notification: string, subscription: SubscriptionInterface);
    removeSubscription(notification: string, subscription_id: string)

    getId(): string;
    destroy();
}

export default SubscriberInterface;