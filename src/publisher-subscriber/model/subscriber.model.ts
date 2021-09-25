import SubscriptionInterface from "../interfaces/subscription.interface";
import SubscriberInterface from "../interfaces/subscriber.interface";
import PublisherInterface from "../interfaces/publisher.interface";
import NotificationRecord from "../interfaces/notification-record.interface";
import SubscriptionManager from "./subscription-manager.model";
import SubscriptionNotFoundException from "../exception/subscription-not-found.exception";

class Subscriber extends SubscriptionManager implements SubscriberInterface {
    unsubscribeFromSubscriptionId(subscriptionId: string) {
        const subscription = this.findSubscriptionById(subscriptionId);

        if (subscription === null) {
            throw new SubscriptionNotFoundException(subscriptionId, this.getId());
        }

        subscription.unsubscribe();
    }

    unsubscribeFromPublisherId(publisherId: string) {
        const subscriptions = this.getSubscriptions().filter(subscription => {
            return subscription.publisher_id === publisherId;
        });

        const unsubscribesCallback = subscriptions.map(subscription => subscription.unsubscribe);
        unsubscribesCallback.forEach(callback => {
            callback();
        });
    }

    unsubscribeFromNotification(notification: string) {
        const subscriptions = this.findSubscriptionsByNotification(notification);
        const unsubscribesCallback = subscriptions.map(subscription => subscription.unsubscribe);
        unsubscribesCallback.forEach(callback => {
            callback();
        });
    }

    subscribe(publisher: PublisherInterface, notification: string, handler: Function) {
        const nbSubscriptions = this.getNbSubscriptions();
        const subscription_id =  `sub_${this.getId()}_to_${publisher.getId()}_salt_${nbSubscriptions}`;

        const subscription: SubscriptionInterface = {
            id: subscription_id,
            subscriber_id: this.getId(),
            publisher_id: publisher.getId(),
            unsubscribe: () => {
                publisher.removeSubscriber(subscription_id);
                this.removeSubscription(subscription_id);
            },
            handler
        };

        this.addSubscription(notification, subscription);
        publisher.addSubscriber(notification, subscription);
    }

    // unsubscribe(selector: MixedInterface) {
    //     if (typeof selector.notification === 'string') {
    //         selector.notification = [ selector.notification ];
    //     }
    //
    //     if (Array.isArray(selector.notification)) {
    //         selector.notification.forEach(notification => {
    //
    //         });
    //     }
    // }
    //

    getNbSubscriptions(): number {
        return this.nbSubscriptionRecorded;
    }

    removeSubscription(subscription_id: string) {
        this.clearSubscription(subscription_id);
    }

    addSubscription(notification: string, subscription: SubscriptionInterface) {
        this.bindSubscriptionToNotification(notification, subscription);
    }

    // todo implement a "unsubscribeById" method
    waitUntil(notifications: Array<NotificationRecord>): Promise<Array<any>> {
        const dedicatedSubSubscriber = new Subscriber({ id:  `wait-until-${notifications.map(item => item.name).join('-and-')}` });
        return new Promise(resolve => {
            Promise.all(
                notifications.map(notification  => {
                    return new Promise(resolve1 => {
                        dedicatedSubSubscriber.subscribe(
                            notification.from,
                            notification.name,
                            resolve1
                        );
                    });
                })
            ).then((data: Array<any>) => {
                try {
                    // destroy to avoid memory leak with unused references to PublisherInterface from `notification.from`
                    dedicatedSubSubscriber.destroy();
                } catch (error) {
                    console.error(error);
                }

                resolve(data);
            });
        });
    }

    findSubscriptionsByNotificationAndPublisherId(notification: string, publisherId: string): SubscriptionInterface[] {
        const subscriptions = this.findSubscriptionsByNotification(notification);
        return subscriptions.filter(subscription => {
            subscription.publisher_id === publisherId
        });
    }
}

export default Subscriber;