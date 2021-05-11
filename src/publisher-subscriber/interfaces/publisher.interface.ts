import SubscriptionInterface from "./subscription.interface";

interface PublisherInterface {
    getNbSubscribers(): number;
    publish(notification: string, data?: any);

    addSubscriber(notification: string, subscription: SubscriptionInterface);
    removeSubscriber(notification: string, subscription_id: string);

    getId(): string;
    destroy();
}

export default PublisherInterface;