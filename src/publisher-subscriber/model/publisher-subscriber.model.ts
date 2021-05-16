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

    addSubscriber(notification: string, subscription: SubscriptionInterface) {
       this.publisher.addSubscriber(notification, subscription);
    }

    getNbSubscribers(): number {
        return this.publisher.getNbSubscribers();
    }

    removeSubscriber(notification: string, subscription_id: string) {
        this.publisher.removeSubscriber(notification, subscription_id);
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

    unsubscribe(selector: MixedInterface) {
        this.subscriber.unsubscribe(selector);
    }

    getNbSubscriptions(): number {
        return this.subscriber.getNbSubscriptions();
    }

    removeSubscription(notification: string, subscription_id: string) {
        this.subscriber.removeSubscription(notification, subscription_id);
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
}

export default PublisherSubscriber;