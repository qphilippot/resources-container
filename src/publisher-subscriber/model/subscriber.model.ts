import SubscriptionInterface from "../interfaces/subscription.interface";
import MixedInterface from "../../utils/mixed.interface";
import SubscriberInterface from "../interfaces/subscriber.interface";
import PublisherInterface from "../interfaces/publisher.interface";
import NotificationRecord from "../interfaces/notification-record.interface";

class Subscriber implements SubscriberInterface {
    private readonly id: string;
    private subscriptions: Record<string, Array<SubscriptionInterface>> = {};
    private nbSubscriptions: number = 0;

    constructor(id) {
        this.id = id;
    }

    public getId(): string {
        return this.id;
    }

    subscribe(publisher: PublisherInterface, notification: string, handler: Function) {
        const nbSubscriptions = this.getNbSubscriptions();

        const subscription_id =  `sub_${this.id}_to_${publisher.getId()}_salt_${nbSubscriptions}`;
        const subscription: SubscriptionInterface = {
            id: subscription_id,
            subscriber_id: this.id,
            publisher_id: publisher.getId(),
            unsubscribe: () => {
                publisher.removeSubscriber(notification, subscription_id);
                this.removeSubscription(notification, subscription_id);
            },
            handler
        };

        this.addSubscription(notification, subscription);
        publisher.addSubscriber(notification, subscription);
    }

    unsubscribe(selector: MixedInterface) {
        if (typeof selector.notification === 'string') {
            selector.notification = [ selector.notification ];
        }

        if (Array.isArray(selector.notification)) {
            selector.notification.forEach(notification => {
                const subscriptions = this.getSubscriptionsByNotificationName(notification);
                const unsubscribesCallback = subscriptions.map(subscription => subscription.unsubscribe);
                unsubscribesCallback.forEach(callback => {
                    callback();
                });
            });
        }
    }

    destroy() {
        Object.values(this.subscriptions).forEach(subscriptionsType => {
            subscriptionsType.forEach(
                (subscription: SubscriptionInterface) => subscription.unsubscribe()
            )
        });
    }


    getNbSubscriptions(): number {
        return this.nbSubscriptions;
    }

    getSubscriptionsByNotificationName(notification: string): Array<SubscriptionInterface> {
        return this.subscriptions[notification] || [];
    }

    removeSubscription(notification: string, subscription_id: string) {
        const subscriptions = this.subscriptions[notification];
        let subscriptionIndex = -1;

        if (Array.isArray(subscriptions)) {
            subscriptionIndex = subscriptions.findIndex(
                (recordedSubscription: SubscriptionInterface) => {
                    return recordedSubscription.id = subscription_id;
                }
            );

            if (subscriptionIndex >= 0) {
                const removedSubscription: SubscriptionInterface = subscriptions.splice(subscriptionIndex, 1)[0];
                // callback may contains some references to existing objects.
                // by deleting reference to this function, all reference into function will be destroyed
                // it could prevent some memory leaks
                // delete removedSubscription.unsubscribe;

                if (this.subscriptions[notification].length === 0) {
                    delete this.subscriptions[notification];
                }

                this.nbSubscriptions--;
            }
        }
    }

    addSubscription(notification: string, subscription: SubscriptionInterface) {
        if (Array.isArray(this.subscriptions[notification]) !== true) {
            this.subscriptions[notification] = [];
        }

        const potentialDoublon = this.subscriptions[notification].find(candidate => candidate.id === subscription.id);
        if (typeof potentialDoublon === 'undefined') {
            this.subscriptions[notification].push(subscription);
            this.nbSubscriptions++;
        }

        else {
            throw `Unable to add subscription. A subscription with same id found`;
        }
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
}

export default Subscriber;