import {describe, it} from 'mocha';
import {expect} from 'chai';
import PublisherSubscriber from "../model/publisher-subscriber.model";
import Publisher from "../model/publisher.model";
import Subscriber from "../model/subscriber.model";
import SubscriptionAlreadyExistsException from "../exception/subscription-already-exists.exception";
import SubscriptionInterface from "../interfaces/subscription.interface";
import SubscriptionNotFoundException from "../exception/subscription-not-found.exception";

const Message = {
    INVALID_SUBSCRIBER_NUMBER: 'invalid number of subscribers',
    INVALID_SUBSCRIPTION_NUMBER: 'invalid number of subscriptions',
};

describe('PubSub test suite', () => {

    describe('Subscription behavior', () => {
        it('increase subscription counter when adding new subscription', () => {
            let publisher = new Publisher('publisher');
            let subscriber = new Subscriber('subscriber');

            expect(subscriber.getNbSubscriptions()).to.equals(0, Message.INVALID_SUBSCRIPTION_NUMBER);
            expect(publisher.getNbSubscribers()).to.equals(0, Message.INVALID_SUBSCRIBER_NUMBER);

            subscriber.subscribe(publisher, 'foo', () => {
            });

            expect(subscriber.getNbSubscriptions()).to.equals(1, Message.INVALID_SUBSCRIPTION_NUMBER);
            expect(publisher.getNbSubscribers()).to.equals(1, Message.INVALID_SUBSCRIBER_NUMBER);
        });
        it('trigger subscriber handler each time that publisher publish a subscribed notification', () => {
            let publisher = new Publisher('publisher');
            let subscriber = new Subscriber('subscriber');

            let counter = 0;
            subscriber.subscribe(publisher, 'foo', () => {
                counter++
            });
            for (let i = 0; i < 20; ++i) {
                expect(counter).to.equals(i);
                publisher.publish('foo');
                expect(counter).to.equals(i + 1);
            }
        });
        it('allows subscriber to subscribe more than once to same notification published by same publisher', () => {
            let publisher = new Publisher('publisher');
            let subscriber = new Subscriber('subscriber');

            let aCounter = 0;
            let bCounter = 0;
            let cCounter = 0;
            subscriber.subscribe(publisher, 'foo', () => {
                aCounter++
            });
            subscriber.subscribe(publisher, 'foo', () => {
                bCounter += 2;
                cCounter = bCounter + aCounter
            });
            for (let i = 0; i < 20; ++i) {
                expect(aCounter).to.equals(i);
                expect(bCounter).to.equals(2 * i);
                expect(cCounter).to.equals(aCounter + bCounter);
                publisher.publish('foo');
                expect(aCounter).to.equals(i + 1);
                expect(bCounter).to.equals(2 * (i + 1));
                expect(cCounter).to.equals(aCounter + bCounter);
            }
        });
        it('can subscribe to several publisher with same notification name and trigger the right one at each publish', () => {
            let aPublisher = new Publisher('aPublisher');
            let bPublisher = new Publisher('bPublisher');

            let subscriber = new Subscriber('subscriber');

            let aCounter = 0;
            let bCounter = 0;
            subscriber.subscribe(aPublisher, 'foo', () => {
                aCounter++
            });
            subscriber.subscribe(bPublisher, 'foo', () => {
                bCounter++
            });


            expect(subscriber.getNbSubscriptions()).to.equals(2, Message.INVALID_SUBSCRIPTION_NUMBER);
            expect(aPublisher.getNbSubscribers()).to.equals(1, Message.INVALID_SUBSCRIBER_NUMBER);
            expect(bPublisher.getNbSubscribers()).to.equals(1, Message.INVALID_SUBSCRIBER_NUMBER);

            for (let i = 0; i < 20; ++i) {
                expect(aCounter).to.equals(i);
                expect(bCounter).to.equals(0);
                aPublisher.publish('foo');

                expect(aCounter).to.equals(i + 1);
                expect(bCounter).to.equals(0);
            }


            for (let i = 0; i < 20; ++i) {
                expect(aCounter).to.equals(20);
                expect(bCounter).to.equals(i);
                bPublisher.publish('foo');

                expect(aCounter).to.equals(20);
                expect(bCounter).to.equals(i + 1);
            }
        });
        it('can subscribe to multiples notifications from same publisher', () => {
            let publisher = new Publisher('publisher');
            let subscriber = new Subscriber('subscriber');

            let fooCounter = 0;
            let barCounter = 0;

            subscriber.subscribe(publisher, 'foo', () => {
                fooCounter++
            });
            subscriber.subscribe(publisher, 'bar', () => {
                barCounter++
            });

            expect(subscriber.getNbSubscriptions()).to.equals(2, Message.INVALID_SUBSCRIPTION_NUMBER);
            expect(publisher.getNbSubscribers()).to.equals(2, Message.INVALID_SUBSCRIBER_NUMBER);

            publisher.publish('foo');
            expect(fooCounter).to.equals(1);
            expect(barCounter).to.equals(0);

            publisher.publish('bar');
            expect(fooCounter).to.equals(1);
            expect(barCounter).to.equals(1);
        });
    });


    describe('retrieve subscription behavior', () => {
       it('find subscription by notification', () => {
           const s1 = new Subscriber('s1');
           const s2 = new Subscriber('s2');
           const p = new Publisher('p');

           s1.subscribe(p, 'foo', () =>{});
           s2.subscribe(p, 'foo', () => {});
           s2.subscribe(p, 'bar', () => {});

           const s1Foo = s1.findSubscriptionsByNotification('foo');
           const s1Bar = s1.findSubscriptionsByNotification('bar');
           expect(JSON.stringify(s1Foo)).to.equals('[{"id":"sub_s1_to_p_salt_0","subscriber_id":"s1","publisher_id":"p"}]');
           expect(JSON.stringify(s1Bar)).to.equals('[]');
           const s2Foo = s2.findSubscriptionsByNotification('foo');
           const s2Bar = s2.findSubscriptionsByNotification('bar');
           expect(JSON.stringify(s2Foo)).to.equals('[{"id":"sub_s2_to_p_salt_0","subscriber_id":"s2","publisher_id":"p"}]');
           expect(JSON.stringify(s2Bar)).to.equals('[{"id":"sub_s2_to_p_salt_1","subscriber_id":"s2","publisher_id":"p"}]');


           const pFoo = p.findSubscriptionsByNotification('foo');
           const pBar = p.findSubscriptionsByNotification('bar');
           expect(JSON.stringify(pFoo)).to.equals('[{"id":"sub_s1_to_p_salt_0","subscriber_id":"s1","publisher_id":"p"},{"id":"sub_s2_to_p_salt_0","subscriber_id":"s2","publisher_id":"p"}]');
           expect(JSON.stringify(pBar)).to.equals('[{"id":"sub_s2_to_p_salt_1","subscriber_id":"s2","publisher_id":"p"}]');
       }) ;
    });

    describe('unsubscription behavior', () => {
        it('can unsubscribe by subscription id', () => {
            let publisher = new Publisher('publisher');
            let subscriber = new Subscriber('subscriber');


            subscriber.subscribe(publisher, 'foo', () => {
            });

            expect(subscriber.getNbSubscriptions()).to.equals(1, Message.INVALID_SUBSCRIPTION_NUMBER);
            expect(publisher.getNbSubscribers()).to.equals(1, Message.INVALID_SUBSCRIBER_NUMBER);


            const fooSubscription: SubscriptionInterface = subscriber.findSubscriptionsByNotification('foo')[0];
            subscriber.unsubscribeFromSubscriptionId(fooSubscription.id);


            expect(publisher.getNbSubscribers()).to.equals(0, Message.INVALID_SUBSCRIBER_NUMBER);
            expect(subscriber.getNbSubscriptions()).to.equals(0, Message.INVALID_SUBSCRIPTION_NUMBER);
        });
        it('remove only one subscription unsubscribing by valid subscription', () => {
            let publisher = new Publisher('publisher');
            let subscriber = new Subscriber('subscriber');

            let fooCounter = 0;
            let barCounter = 0;

            subscriber.subscribe(publisher, 'foo', () => {
                fooCounter++
            });
            subscriber.subscribe(publisher, 'bar', () => {
                barCounter++
            });

            expect(subscriber.getNbSubscriptions()).to.equals(2, Message.INVALID_SUBSCRIPTION_NUMBER);
            expect(publisher.getNbSubscribers()).to.equals(2, Message.INVALID_SUBSCRIBER_NUMBER);

            publisher.publish('foo');
            publisher.publish('bar');
            expect(fooCounter).to.equals(1);
            expect(barCounter).to.equals(1);

            const fooSubscription: SubscriptionInterface = subscriber.findSubscriptionsByNotification('foo')[0];
            subscriber.unsubscribeFromSubscriptionId(fooSubscription.id);

            expect(subscriber.getNbSubscriptions()).to.equals(1, Message.INVALID_SUBSCRIPTION_NUMBER);
            expect(publisher.getNbSubscribers()).to.equals(1, Message.INVALID_SUBSCRIBER_NUMBER);

            publisher.publish('foo');
            publisher.publish('bar');
            expect(fooCounter).to.equals(1);
            expect(barCounter).to.equals(2);

            const barSubscription: SubscriptionInterface = subscriber.findSubscriptionsByNotification('bar')[0];
            subscriber.unsubscribeFromSubscriptionId(barSubscription.id);

            expect(subscriber.getNbSubscriptions()).to.equals(0, Message.INVALID_SUBSCRIPTION_NUMBER);
            expect(publisher.getNbSubscribers()).to.equals(0, Message.INVALID_SUBSCRIBER_NUMBER);

            publisher.publish('foo');
            publisher.publish('bar');
            expect(fooCounter).to.equals(1);
            expect(barCounter).to.equals(2);
        });
        it('throws an error when unknown subscriptionId is provided to unsubscribe', () => {
            const subscriber = new Subscriber('subscriber');

            expect(subscriber.unsubscribeFromSubscriptionId.bind(subscriber, 'invalidSubscriptId')).to.throw(
                SubscriptionNotFoundException,
                'Unable to find subscription "invalidSubscriptId" in component "subscriber".'
            );

            const publisher = new Publisher('bar');
            subscriber.subscribe(publisher, 'foo', () => {});

            expect(subscriber.unsubscribeFromSubscriptionId.bind(subscriber, 'foo')).to.throw(
                SubscriptionNotFoundException,
                'Unable to find subscription "foo" in component "subscriber".'
            );

            expect(subscriber.getNbSubscriptions()).to.equals(1, Message.INVALID_SUBSCRIPTION_NUMBER);
            expect(publisher.getNbSubscribers()).to.equals(1, Message.INVALID_SUBSCRIBER_NUMBER);

        });
    });

    describe('Publishing workflow', () => {

    });

    describe('Publisher-Subscriber detect exception and correctly trigger them', () => {
        it('dedupe subscription  by id', () => {
            const publisher = new Publisher('publisher');
            const subscriber = new Subscriber('subscriber');

            subscriber.subscribe(publisher, 'foo', () => {
            });

            const subscriptionInterfaces = subscriber.findSubscriptionsByNotification('foo');

            console.log("==>", subscriptionInterfaces);

            expect(publisher.addSubscriber.bind(publisher, 'foo', subscriptionInterfaces[0])).to.throw(
                SubscriptionAlreadyExistsException,
                'Unable to add subscription "sub_subscriber_to_publisher_salt_0" to component "publisher" because it already manage a subscription with same id.'
            );

            expect(subscriber.addSubscription.bind(subscriber, 'foo', subscriptionInterfaces[0])).to.throw(
                SubscriptionAlreadyExistsException,
                'Unable to add subscription "sub_subscriber_to_publisher_salt_0" to component "subscriber" because it already manage a subscription with same id.'
            );
        });
    });

    describe('Pubsub can subscribe to another pubsub', () => {
        let publisher = new PublisherSubscriber('publisher');
        let subscriber = new PublisherSubscriber('subscriber');
        let counter = 0;

        before(() => {
            subscriber.subscribe(publisher, 'aNotification', () => {
                counter++
            });
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

});