import { describe, it } from 'mocha';
import { expect } from  'chai';
import PublisherSubscriber from "../model/publisher-subscriber.model";

const Message = {
    INVALID_SUBSCRIBER_NUMBER: 'invalid number of subscribers',
    INVALID_SUBSCRIPTION_NUMBER: 'invalid number of subscriptions',
};

describe('Component can subscribe to another component', () => {
    let publisher = new PublisherSubscriber({ name: 'publisher' });
    let subscriber = new PublisherSubscriber({ name: 'subscriber' });
    let counter = 0;

    before(() => {
        subscriber.subscribe(publisher, 'aNotification', () => { counter++ });
    });

    it('Update correctly subscriber', () => {
        expect(subscriber.getNbSubscriptions()).to.equals(1, Message.INVALID_SUBSCRIPTION_NUMBER);
        expect(subscriber.getNbSubscribers()).to.equals(0, Message.INVALID_SUBSCRIBER_NUMBER);
    })

    it('Update correctly publisher', () => {
        expect(publisher.getNbSubscriptions()).to.equals(0, Message.INVALID_SUBSCRIPTION_NUMBER);
        expect(publisher.getNbSubscribers()).to.equals(1, Message.INVALID_SUBSCRIBER_NUMBER);
    })
});