import PublisherSubscriberInterface from "../interfaces/publisher-subscriber.interface";
import SubscriptionInterface from "../interfaces/subscription.interface";
import MixedInterface from "../../utils/mixed.interface";
import PublisherInterface from "../interfaces/publisher.interface";
import Publisher from "./publisher.model";
import Subscriber from "./subscriber.model";
import SubscriberInterface from "../interfaces/subscriber.interface";
import NotificationRecord from "../interfaces/notification-record.interface";

class PublisherSubscriber implements PublisherSubscriberInterface {
    private readonly id: string;
    private publisher: PublisherInterface;
    private subscriber: SubscriberInterface;

    constructor(id) {
        this.id = id;

        this.publisher = new Publisher(id);
        this.subscriber = new Subscriber(id);
    }

    hasSubscription(subscriptionId: string): boolean {
        return (
            this.subscriber.hasSubscription(subscriptionId) ||
            this.publisher.hasSubscription(subscriptionId)
        );
    }

    addSubscriber(notification: string, subscription: SubscriptionInterface) {
        this.publisher.addSubscriber(notification, subscription);
    }

    getNbSubscribers(): number {
        return this.publisher.getNbSubscribers();
    }

    removeSubscriber(subscription_id: string) {
        this.publisher.removeSubscriber(subscription_id);
    }


    publish(notification: string, data: any) {
        this.publisher.publish(notification, data);
    }

    public getId(): string {
        return this.id;
    }

    subscribe(publisher: PublisherInterface, notification: string, handler: Function) {
        this.subscriber.subscribe(publisher, notification, handler);
    }

    getNbSubscriptions(): number {
        return this.subscriber.getNbSubscriptions();
    }

    removeSubscription(subscription_id: string) {
        this.subscriber.removeSubscription(subscription_id);
    }

    addSubscription(notification: string, subscription: SubscriptionInterface) {
        this.subscriber.addSubscription(notification, subscription);
    }

    waitUntil(notifications: Array<NotificationRecord>): Promise<Array<any>> {
        return this.subscriber.waitUntil(notifications);
    }

    destroy() {
        this.publisher.destroy();
        this.subscriber.destroy();
    }

    is(id: string): boolean {
        return this.id === id;
    }

    findSubscriptionById(subscriptionId: string): SubscriptionInterface | null {
        return (
            this.subscriber.findSubscriptionById(subscriptionId) ||
            this.publisher.findSubscriptionById(subscriptionId)
        );
    }

    findSubscriptionsByNotificationAndPublisherId(notification: string, publisherId: string): SubscriptionInterface[] {
        return this.subscriber.findSubscriptionsByNotificationAndPublisherId(notification, publisherId);
    }

    findSubscriptionsByNotification(notification: string): SubscriptionInterface[] {
        return this.subscriber.findSubscriptionsByNotification(notification).concat(
            this.publisher.findSubscriptionsByNotification(notification)
        );
    }

    getSubscriptions(): SubscriptionInterface[] {
        return this.subscriber.getSubscriptions().concat(this.publisher.getSubscriptions());
    }

    unsubscribeFromNotification(notification: string) {
        this.subscriber.unsubscribeFromNotification(notification);
    }

    unsubscribeFromPublisherId(publisherId: string) {
        this.subscriber.unsubscribeFromPublisherId(publisherId);
    }

    unsubscribeFromSubscriptionId(subscriptionId: string) {
        this.subscriber.unsubscribeFromSubscriptionId(subscriptionId);
    }
}

export default PublisherSubscriber;