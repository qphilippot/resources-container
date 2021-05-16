import { describe, it } from 'mocha';
import { expect } from  'chai';
import Publisher from "../model/publisher.model";
import Subscriber from "../model/subscriber.model";
import SubscriptionInterface from "../interfaces/subscription.interface";

const Message = {
    INVALID_SUBSCRIBER_NUMBER: 'invalid number of subscribers',
    INVALID_SUBSCRIPTION_NUMBER: 'invalid number of subscriptions',
};

describe('Subscribers and Publisher integration', () => {
    let publisher = new Publisher('publisher');
    let subscriber = new Subscriber('subscriber');
    let counter = 0;

    before(() => {
        subscriber.subscribe(publisher, 'aNotification', () => { counter++; });
    });

    describe('Subscriber can subscribe to another publisher', () => {
        it('Increment subscriptions number of subscriber', () => {
            expect(subscriber.getNbSubscriptions()).to.equals(1, Message.INVALID_SUBSCRIPTION_NUMBER);
        })

        it('Increment subscribers number of publisher', () => {
            expect(publisher.getNbSubscribers()).to.equals(1, Message.INVALID_SUBSCRIBER_NUMBER);
        })

        it('Subscription use the correct ids', () => {
            const subscription: SubscriptionInterface = subscriber.getSubscriptionsByNotificationName('aNotification')[0];
            expect(subscription.publisher_id).to.equals(publisher.getId());
            expect(subscription.subscriber_id).to.equals(subscriber.getId());
        })
    });

    describe('Subscriber can receive notification from publisher', () => {
        it('Notification without any parameters', () => {
           publisher.publish('aNotification');
           expect(counter).to.equals(1);
        })

        it('Published notification without any subscriber don`t throw any error', () => {
            publisher.publish('blablabla');
        })

        it('Notification with parameters', () => {
            let receivedData: any = null;
            subscriber.subscribe(publisher, 'get-my-param', data => receivedData = data);
            publisher.publish('get-my-param', 'hello');

            expect(receivedData).to.equals('hello');

            publisher.publish('get-my-param', 1);
            expect(receivedData).to.equals(1);

            publisher.publish('get-my-param');
            expect(receivedData).to.be.undefined;

            publisher.publish('get-my-param', null);
            expect(receivedData).to.be.null;

            publisher.publish('get-my-param', NaN);
            expect(receivedData).to.be.NaN;

            publisher.publish('get-my-param', { value: 8 });
            expect(receivedData.value).to.equals(8);
        })
    });
});
