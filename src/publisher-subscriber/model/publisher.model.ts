import SubscriptionInterface from "../interfaces/subscription.interface";
import PublisherInterface from "../interfaces/publisher.interface";
import SubscriptionManager from "./subscription-manager.model";

class Publisher extends SubscriptionManager implements PublisherInterface {

    addSubscriber(notification: string, subscription: SubscriptionInterface) {
        return this.bindSubscriptionToNotification(notification, subscription);
    }

    getNbSubscribers(): number {
        return this.nbSubscriptionRecorded;
    }

    removeSubscriber(subscription_id: string) {
      this.clearSubscription(subscription_id);
    }

    publish(notification: string, data?: any) {
        const subscriptions = this.notificationsCollection[notification];

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