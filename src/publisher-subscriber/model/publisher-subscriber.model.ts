import PublisherSubscriberInterface from "../interfaces/publisher-subscriber.interface";
import SubscriptionInterface from "../interfaces/subscription.interface";
import MixedInterface from "../../core/mixed.interface";

class PublisherSubscriber implements PublisherSubscriberInterface {
    private readonly id: string;
    private subscribers: Record<string, Array<SubscriptionInterface>> = {};
    private subscriptions: Record<string, Array<SubscriptionInterface>> = {};
    private nbSubscriptions: number = 0;
    private nbSubscribers: number = 0;

    constructor(id) {
        this.id = id;
    }

    addSubscriber(notification: string, subscription: SubscriptionInterface) {
        if (Array.isArray(this.subscribers[notification]) !== true) {
            this.subscribers[notification] = [];
        }

        const potentialDoublon = this.subscribers[notification].find(candidate => candidate.id === subscription.id);
        if (typeof potentialDoublon === 'undefined') {
            this.subscribers[notification].push(subscription);
            this.nbSubscribers++;
        }

        else {
            throw `Unable to add subscription. A subscriber with same id found`;
        }
    }

    public getId(): string {
        return this.id;
    }

    subscribe(publisher: PublisherSubscriberInterface, notification: string, handler: Function) {
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

        Object.values(this.subscribers).forEach(subscriptionsType => {
            subscriptionsType.forEach(
                (subscription: SubscriptionInterface) => subscription.unsubscribe()
            )
        });
    }


    getNbSubscriptions(): number {
        return this.nbSubscriptions;
    }

    getNbSubscribers(): number {
        return this.nbSubscribers;
    }

    getSubscriptionsByNotificationName(notification: string): Array<SubscriptionInterface> {
        return this.subscriptions[notification] || [];
    }

    removeSubscriber(notification: string, subscription_id: string) {
        const subscribers = this.subscribers[notification];
        let subscriptionIndex = -1;

        if (Array.isArray(subscribers)) {
            subscriptionIndex = subscribers.findIndex(
                (recordedSubscription: SubscriptionInterface) => {
                    return recordedSubscription.id = subscription_id;
                }
            );
        }

        if (subscriptionIndex >= 0) {
            const removedSubscription: SubscriptionInterface = subscribers.splice(subscriptionIndex, 1)[0];

            // handler may contains some references to existing objects.
            // by deleting reference to this function, all reference into function will be destroyed
            // it could prevent some memory leaks
            delete removedSubscription.handler;

            this.nbSubscribers--;

            if (this.subscribers[notification].length === 0) {
                delete this.subscribers[notification];
            }
        }
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
                delete removedSubscription.unsubscribe;

                if (this.subscriptions[notification].length === 0) {
                    delete this.subscriptions[notification];
                }

                this.nbSubscriptions--;
            }
        }
    }

    publish(notification: string, data: any) {
        const subscriptions = this.subscribers[notification];

        if (Array.isArray(subscriptions)) {
            subscriptions.forEach(
                (subscription: SubscriptionInterface) => {
                    subscription.handler(data);
                }
            );
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
}

export default PublisherSubscriber;