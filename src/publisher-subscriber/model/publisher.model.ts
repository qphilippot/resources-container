import SubscriptionInterface from "../interfaces/subscription.interface";
import PublisherInterface from "../interfaces/publisher.interface";

class Publisher implements PublisherInterface {
    private readonly id: string;
    private subscribers: Record<string, Array<SubscriptionInterface>> = {};
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

    destroy() {
        Object.values(this.subscribers).forEach(subscriptionsType => {
            subscriptionsType.forEach(
                (subscription: SubscriptionInterface) => subscription.unsubscribe()
            )
        });
    }

    getNbSubscribers(): number {
        return this.nbSubscribers;
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

            // // handler may contains some references to existing objects.
            // // by deleting reference to this function, all reference into function will be destroyed
            // // it could prevent some memory leaks
            // delete removedSubscription.handler;

            this.nbSubscribers--;

            if (this.subscribers[notification].length === 0) {
                delete this.subscribers[notification];
            }
        }
    }

    publish(notification: string, data?: any) {
        const subscriptions = this.subscribers[notification];

        if (Array.isArray(subscriptions)) {
            // shallow copy in order to avoid iteration on modifiable collection
            subscriptions.slice(0).forEach(
                (subscription: SubscriptionInterface) => {
                    subscription.handler(data);
                }
            );
        }
    }
}

export default Publisher;