import SubscriptionInterface from "./subscription.interface";
import SubscriptionManagerInterface from "./subscription-manager.interface";

interface PublisherInterface extends SubscriptionManagerInterface {
    publish(notification: string, data?: any);

    addSubscriber(notification: string, subscription: SubscriptionInterface);
    removeSubscriber(subscription_id: string);

    findSubscriptionBySubscriberId(subscriberId: string): SubscriptionInterface[];
    findSubscriptionsByNotificationAndSubscriberId(notification: string, subscriberId: string): SubscriptionInterface[];

    stopPublicationOnException();
    continuePublicationOnException();

    destroy();
}

export default PublisherInterface;