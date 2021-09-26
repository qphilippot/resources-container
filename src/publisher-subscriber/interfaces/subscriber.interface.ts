import MixedInterface from "../../utils/mixed.interface";
import SubscriptionInterface from "./subscription.interface";
import PublisherInterface from "./publisher.interface";
import NotificationRecord from "./notification-record.interface";
import SubscriptionManagerInterface from "./subscription-manager.interface";

interface SubscriberInterface extends SubscriptionManagerInterface {
    subscribe(publisher: PublisherInterface, notification: string, handler: Function);
    unsubscribeFromSubscriptionId(subscriptionId: string);
    unsubscribeFromPublisherId(publisherId: string);
    unsubscribeFromNotification(notification: string);
    findSubscriptionByPublisherId(publisherId: string): SubscriptionInterface[];
    getNbSubscriptions(): number;

    addSubscription(notification: string, subscription: SubscriptionInterface);
    removeSubscription(subscription_id: string);

    waitUntil(notifications: Array<NotificationRecord>): Promise<Array<any>>;
    findSubscriptionsByNotificationAndPublisherId(notification: string, publisherId: string): SubscriptionInterface[];
    hasSubscription(subscriptionId: string): boolean;
    getId(): string;
    destroy();
}

export default SubscriberInterface;