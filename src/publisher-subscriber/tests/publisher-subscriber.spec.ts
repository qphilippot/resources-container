import {describe, it} from 'mocha';
import {expect} from 'chai';
import PublisherSubscriber from "../model/publisher-subscriber.model";
import Publisher from "../model/publisher.model";
import Subscriber from "../model/subscriber.model";
import SubscriptionAlreadyExistsException from "../exception/subscription-already-exists.exception";
import SubscriptionInterface from "../interfaces/subscription.interface";
import SubscriptionNotFoundException from "../exception/subscription-not-found.exception";
import {findSubscriptionByRoleAndComponentId} from "../helper/subscription-manager.helper";
import InvalidArgumentException from "../../core/exception/invalid-argument.exception";

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

            s1.subscribe(p, 'foo', () => {
            });
            s2.subscribe(p, 'foo', () => {
            });
            s2.subscribe(p, 'bar', () => {
            });


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
        });
        it('return empty array if unknown notification is used with findSubscriptionByNotification', () => {
            const subscription = new Subscriber('subscription');
            const publisher = new Publisher('publisher');
            const pubsub = new PublisherSubscriber('pubsub');

            expect(JSON.stringify(subscription.findSubscriptionsByNotification('nope'))).to.equals('[]');
            expect(JSON.stringify(publisher.findSubscriptionsByNotification('nope'))).to.equals('[]');
            expect(JSON.stringify(pubsub.findSubscriptionsByNotification('nope'))).to.equals('[]');
        });
        it('find subscription by publisher_id', () => {
            const p1 = new Publisher('p1');
            const p2 = new Publisher('p2');

            const subscriber = new Subscriber('subscriber');

            const pubsub = new PublisherSubscriber('pubsub')

            subscriber.subscribe(p1, 'foo', () => {
            });
            subscriber.subscribe(p1, 'bar', () => {
            });
            subscriber.subscribe(p2, 'foo', () => {
            });
            subscriber.subscribe(p2, 'bar', () => {
            });

            expect(JSON.stringify(subscriber.findSubscriptionByPublisherId('nope'))).to.equals('[]');
            expect(JSON.stringify(subscriber.findSubscriptionByPublisherId('p1'))).to.equals('[{"id":"sub_subscriber_to_p1_salt_0","subscriber_id":"subscriber","publisher_id":"p1"},{"id":"sub_subscriber_to_p1_salt_1","subscriber_id":"subscriber","publisher_id":"p1"}]');
            expect(JSON.stringify(subscriber.findSubscriptionByPublisherId('p2'))).to.equals('[{"id":"sub_subscriber_to_p2_salt_2","subscriber_id":"subscriber","publisher_id":"p2"},{"id":"sub_subscriber_to_p2_salt_3","subscriber_id":"subscriber","publisher_id":"p2"}]');

            pubsub.subscribe(p1, 'foo', () => {
            });
            expect(JSON.stringify(pubsub.findSubscriptionByPublisherId('p1'))).to.equals('[{"id":"sub_pubsub_to_p1_salt_0","subscriber_id":"pubsub","publisher_id":"p1"}]');

            pubsub.subscribe(p2, 'foo', () => {
            });
            expect(JSON.stringify(pubsub.findSubscriptionByPublisherId('p2'))).to.equals('[{"id":"sub_pubsub_to_p2_salt_1","subscriber_id":"pubsub","publisher_id":"p2"}]');

            pubsub.subscribe(pubsub, 'loop', () => {
            });
            expect(JSON.stringify(pubsub.findSubscriptionByPublisherId('pubsub'))).to.equals('[{"id":"sub_pubsub_to_pubsub_salt_2","subscriber_id":"pubsub","publisher_id":"pubsub"}]');

            subscriber.subscribe(pubsub, 'toto', () => {
            });
            expect(JSON.stringify(subscriber.findSubscriptionByPublisherId('pubsub'))).to.equals('[{"id":"sub_subscriber_to_pubsub_salt_4","subscriber_id":"subscriber","publisher_id":"pubsub"}]');
        });
        it('return empty array if unknown publisher_id is used with findSubscriptionByPublisherId', () => {
            const subscription = new Subscriber('subscription');
            const pubsub = new PublisherSubscriber('pubsub');

            expect(JSON.stringify(subscription.findSubscriptionByPublisherId('nope'))).to.equals('[]');
            expect(JSON.stringify(pubsub.findSubscriptionByPublisherId('nope'))).to.equals('[]');
        });
        it('find subscriptions by notification and publisher_id', () => {
            const s1 = new Subscriber('s1');
            const s2 = new Subscriber('s2');
            const p = new Publisher('p');
            const p2 = new Publisher('p2');

            s1.subscribe(p, 'foo', () => {});
            s2.subscribe(p, 'foo', () => {});
            s2.subscribe(p, 'bar', () => {});
            s2.subscribe(p2, 'toto', () => {});

            const s1Foo = s1.findSubscriptionsByNotificationAndPublisherId('foo', 'p');
            const s1Bar = s1.findSubscriptionsByNotificationAndPublisherId('bar', 'p');
            expect(JSON.stringify(s1Foo)).to.equals('[{"id":"sub_s1_to_p_salt_0","subscriber_id":"s1","publisher_id":"p"}]');
            expect(JSON.stringify(s1Bar)).to.equals('[]');
            const s2Foo = s2.findSubscriptionsByNotificationAndPublisherId('foo', 'p');
            const s2Bar = s2.findSubscriptionsByNotificationAndPublisherId('bar', 'p');
            expect(JSON.stringify(s2Foo)).to.equals('[{"id":"sub_s2_to_p_salt_0","subscriber_id":"s2","publisher_id":"p"}]');
            expect(JSON.stringify(s2Bar)).to.equals('[{"id":"sub_s2_to_p_salt_1","subscriber_id":"s2","publisher_id":"p"}]');

            const s2TotoP = s2.findSubscriptionsByNotificationAndPublisherId('toto', 'p');
            const s2TotoP2 = s2.findSubscriptionsByNotificationAndPublisherId('toto', 'p2');

            expect(JSON.stringify(s2TotoP)).to.equals('[]');
            expect(JSON.stringify(s2TotoP2)).to.equals('[{"id":"sub_s2_to_p2_salt_2","subscriber_id":"s2","publisher_id":"p2"}]');
        });
        it('find subscriptions by notification and subscriber_id', () => {
            const s1 = new Subscriber('s1');
            const s2 = new Subscriber('s2');
            const p = new Publisher('p');
            const p2 = new Publisher('p2');

            s1.subscribe(p, 'foo', () => {});
            s2.subscribe(p2, 'foo', () => {});
            s2.subscribe(p2, 'bar', () => {});

            const pFoo = p.findSubscriptionsByNotificationAndSubscriberId('foo', 's1');
            const pBar = p.findSubscriptionsByNotificationAndSubscriberId('bar', 's1');

            expect(JSON.stringify(pFoo)).to.equals('[{"id":"sub_s1_to_p_salt_0","subscriber_id":"s1","publisher_id":"p"}]');
            expect(JSON.stringify(pBar)).to.equals('[]');

            const p2Foo = p2.findSubscriptionsByNotificationAndSubscriberId('foo', 's2');
            const p2BarS1 = p2.findSubscriptionsByNotificationAndSubscriberId('bar', 's1');
            const p2BarS2 = p2.findSubscriptionsByNotificationAndSubscriberId('bar', 's2');

            expect(JSON.stringify(p2Foo)).to.equals('[{"id":"sub_s2_to_p2_salt_0","subscriber_id":"s2","publisher_id":"p2"}]');
            expect(JSON.stringify(p2BarS1)).to.equals('[]');
            expect(JSON.stringify(p2BarS2)).to.equals('[{"id":"sub_s2_to_p2_salt_1","subscriber_id":"s2","publisher_id":"p2"}]');
        });
        it('find subscription by subscriber_id', () => {
            const p1 = new Publisher('p1');
            const p2 = new Publisher('p2');

            const subscriber = new Subscriber('subscriber');

            const pubsub = new PublisherSubscriber('pubsub')

            subscriber.subscribe(p1, 'foo', () => {
            });
            subscriber.subscribe(p1, 'bar', () => {
            });
            subscriber.subscribe(p2, 'foo', () => {
            });
            subscriber.subscribe(p2, 'bar', () => {
            });

            expect(JSON.stringify(p1.findSubscriptionBySubscriberId('nope'))).to.equals('[]');

            expect(JSON.stringify(p1.findSubscriptionBySubscriberId('subscriber'))).to.equals('[{"id":"sub_subscriber_to_p1_salt_0","subscriber_id":"subscriber","publisher_id":"p1"},{"id":"sub_subscriber_to_p1_salt_1","subscriber_id":"subscriber","publisher_id":"p1"}]');
            expect(JSON.stringify(p2.findSubscriptionBySubscriberId('subscriber'))).to.equals('[{"id":"sub_subscriber_to_p2_salt_2","subscriber_id":"subscriber","publisher_id":"p2"},{"id":"sub_subscriber_to_p2_salt_3","subscriber_id":"subscriber","publisher_id":"p2"}]');

            subscriber.subscribe(pubsub, 'foo', () => {
            });
            expect(JSON.stringify(pubsub.findSubscriptionBySubscriberId('subscriber'))).to.equals('[{"id":"sub_subscriber_to_pubsub_salt_4","subscriber_id":"subscriber","publisher_id":"pubsub"}]');

            pubsub.subscribe(p2, 'foo', () => {
            });
            expect(JSON.stringify(p2.findSubscriptionBySubscriberId('pubsub'))).to.equals('[{"id":"sub_pubsub_to_p2_salt_0","subscriber_id":"pubsub","publisher_id":"p2"}]');

            pubsub.subscribe(pubsub, 'loop', () => {
            });
            expect(JSON.stringify(pubsub.findSubscriptionBySubscriberId('pubsub'))).to.equals('[{"id":"sub_pubsub_to_pubsub_salt_1","subscriber_id":"pubsub","publisher_id":"pubsub"},{"id":"sub_pubsub_to_p2_salt_0","subscriber_id":"pubsub","publisher_id":"p2"}]');
        });
        it('return empty array if unknown subscriber_id is used with findSubscriptionBySubscriberId', () => {
            const publisher = new Publisher('publisher');
            const pubsub = new PublisherSubscriber('pubsub');

            expect(JSON.stringify(pubsub.findSubscriptionBySubscriberId('nope'))).to.equals('[]');
            expect(JSON.stringify(pubsub.findSubscriptionBySubscriberId('nope'))).to.equals('[]');
        });
        it('find subscription by subscription_id', () => {
            const subscriber = new Subscriber('subscriber');
            const publisher = new Publisher('publisher')

            subscriber.subscribe(publisher, 'foo', () => {
            });
            const subscription = subscriber.getSubscriptions()[0];

            expect(subscriber.findSubscriptionById(subscription.id)).to.equals(subscription);
            expect(publisher.findSubscriptionById(subscription.id)).to.equals(subscription);
        });
        it('returns null when we an unknown subscription is required by subscription_id', () => {
            const subscriber = new Subscriber('subscriber');
            const publisher = new Publisher('publisher')
            const pubsub = new PublisherSubscriber('publisher')

            expect(subscriber.findSubscriptionById('missing')).to.equals(null);
            expect(publisher.findSubscriptionById('missing')).to.equals(null);
            expect(pubsub.findSubscriptionById('missing')).to.equals(null);
        });
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
            subscriber.subscribe(publisher, 'foo', () => {
            });

            expect(subscriber.unsubscribeFromSubscriptionId.bind(subscriber, 'foo')).to.throw(
                SubscriptionNotFoundException,
                'Unable to find subscription "foo" in component "subscriber".'
            );

            expect(subscriber.getNbSubscriptions()).to.equals(1, Message.INVALID_SUBSCRIPTION_NUMBER);
            expect(publisher.getNbSubscribers()).to.equals(1, Message.INVALID_SUBSCRIBER_NUMBER);

        });
    });
    describe('Publishing workflow', () => {
        it('handle subscription list as a fifo as default', () => {
            const publisher = new Publisher('publisher');
            const subscribar = new Subscriber('subscribar');
            const subscriboo = new Subscriber('subscriboo');

            let trace = '';

            subscribar.subscribe(publisher, 'foo', () => {
                trace += 'a';
            });

            subscriboo.subscribe(publisher, 'foo', () => {
                trace += 'b';
            });

            publisher.publish('foo');

            expect(trace).to.equals('ab');
        });
        it('publication continues if one subscriber handler throw an error by default', () => {
            const publisher = new Publisher('publisher');
            const subscribar = new Subscriber('subscribar');
            const subscriboo = new Subscriber('subscriboo');

            let triggered = false;

            subscribar.subscribe(publisher, 'foo', () => {
                throw new Error();
            });

            subscriboo.subscribe(publisher, 'foo', () => {
                triggered = true;
            });

            publisher.publish('foo');

            expect(triggered).to.be.true;
        });
        it('stop or remain publication workflow using stopPublicationOnException and continuePublicationOnException', () => {
            const publisher = new Publisher('publisher');
            const subscribar = new Subscriber('subscribar');
            const subscriboo = new Subscriber('subscriboo');
            const subscribaba = new Subscriber('subscribaba');

            let first = false;
            let third = false;

            publisher.stopPublicationOnException();

            subscribar.subscribe(publisher, 'foo', () => {
                first = true;
            });

            subscriboo.subscribe(publisher, 'foo', () => {
                throw new Error('expected error');
            });

            subscribaba.subscribe(publisher, 'foo', () => {
                third = true;
            });


            expect(publisher.publish.bind(publisher, 'foo')).to.throw(
                Error,
                'expected error'
            );

            expect(first).to.be.true;
            expect(third).to.be.false;

            first = false;

            publisher.continuePublicationOnException();

            publisher.publish('foo');

            expect(first).to.be.true;
            expect(third).to.be.true;
        });
    });
    describe('Publisher-Subscriber detect exception and correctly trigger them', () => {
        it('dedupe subscription  by id', () => {
            const publisher = new Publisher('publisher');
            const subscriber = new Subscriber('subscriber');

            subscriber.subscribe(publisher, 'foo', () => {
            });

            const subscriptionInterfaces = subscriber.findSubscriptionsByNotification('foo');

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
    describe('Additionnal tests on subscription-manager.helper', () => {
        it('findSubscriptionByRoleAndComponentId throws an exception with invalid role', () => {
            const pubsub = new PublisherSubscriber('foo');

            expect(findSubscriptionByRoleAndComponentId.bind(
                this,
                pubsub,
                'invalid_role',
                'nevermind'
            )).to.throw(
                InvalidArgumentException,
                'Invalid argument given for "role" in "findSubscriptionByRoleAndComponentId". Values expected are "publisher_id" or "subscriber_id" but "invalid_role" was given.'
            );
        });
        it('clear all subscriptions property using destroy', () => {
            const pub = new Publisher('pub');
            const sub = new Subscriber('sub');

            sub.subscribe(pub, 'foo', () => {});
            sub.subscribe(pub, 'bar', () => {});

            expect(sub.getNbSubscriptions()).to.equals(2);
            expect(pub.getSubscriptions().length).to.equals(2);

            sub.destroy();

            expect(sub.getNbSubscriptions()).to.equals(0);
            expect(pub.getSubscriptions().length).to.equals(0);
        });
        it('implements identifiable correctly', () => {
            const pub = new Publisher('pub');
            const sub = new Subscriber('sub');
            const pubsub = new PublisherSubscriber('pubsub');

            expect(pub.getId()).to.equals('pub');
            expect(sub.getId()).to.equals('sub');
            expect(pubsub.getId()).to.equals('pubsub');

            expect(pub.is(sub.getId())).to.be.false;
            expect(pub.is(pubsub.getId())).to.be.false;
            expect(pub.is(pub.getId())).to.be.true;
            expect(sub.is(pub.getId())).to.be.false;
            expect(sub.is(pubsub.getId())).to.be.false;
            expect(sub.is(sub.getId())).to.be.true;
            expect(pubsub.is(pub.getId())).to.be.false;
            expect(pubsub.is(sub.getId())).to.be.false;
            expect(pubsub.is(pubsub.getId())).to.be.true;
        })
    });

});