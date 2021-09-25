import IdentifiableInterface from "./identifiable.interface";
import SubscriptionInterface from "./subscription.interface";

export default interface SubscriptionManagerInterface extends IdentifiableInterface {
    hasSubscription(subscriptionId: string): boolean;
    getSubscriptions(): SubscriptionInterface[];
    findSubscriptionsByNotification(notification: string): SubscriptionInterface[];
    findSubscriptionById(subscriptionId: string): SubscriptionInterface | null;
}