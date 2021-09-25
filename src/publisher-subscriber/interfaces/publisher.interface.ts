import SubscriptionInterface from "./subscription.interface";
import IdentifiableInterface from "./identifiable.interface";
import SubscriptionManagerInterface from "./subscription-manager.interface";

interface PublisherInterface extends SubscriptionManagerInterface {
    getNbSubscribers(): number;
    publish(notification: string, data?: any);

    addSubscriber(notification: string, subscription: SubscriptionInterface);
    removeSubscriber(subscription_id: string);

    hasSubscription(subscriptionId: string): boolean;
    destroy();
}

export default PublisherInterface;