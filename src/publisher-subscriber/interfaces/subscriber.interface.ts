import MixedInterface from "../../utils/mixed.interface";
import SubscriptionInterface from "./subscription.interface";
import PublisherInterface from "./publisher.interface";
import NotificationRecord from "./notification-record.interface";

interface SubscriberInterface {
    subscribe(publisher: PublisherInterface, notification: string, handler: Function);
    unsubscribe(selector: MixedInterface);

    getNbSubscriptions(): number;

    addSubscription(notification: string, subscription: SubscriptionInterface);
    removeSubscription(notification: string, subscription_id: string);

    waitUntil(notifications: Array<NotificationRecord>): Promise<Array<any>>;

    getId(): string;
    destroy();
}

export default SubscriberInterface;