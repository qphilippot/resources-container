// import Feature  from './feature.model';
// import Component from "../models/component/component.model";
//
// function publish(message: string, data: any = {}) {
//     const subscriptions = this.core.subscribers[message];
//     if (Array.isArray(subscriptions)) {
//         subscriptions.forEach(subcriptionHandler => {
//             subcriptionHandler.callback(data);
//         });
//     }
// }
//
//
// function subscribe(component, message, callback) {
//     if (
//         SmartComponent.isComponent(component) &&
//         component.hasFeature('publisher-subscriber')
//     ) {
//         const subscription = {
//             subscription_id: `${this._id}#${component._id}#${this.core.nbSubscriptions}`,
//             callback
//         };
//
//
//         const unsubscribe = PublisherSubscriberFeature.unsubscribeFactory(this, subscription, message, component);
//         subscription.unsubscribe = unsubscribe;
//
//         PublisherSubscriberFeature.addSubscription(this, message, subscription, component);
//         PublisherSubscriberFeature.addSubscriber(this, message, subscription, component);
//
//         return subscription;
//     }
//
//     else {
//         return null;
//     }
// }
//
//
// function unsubscribe(settings = {}) {
//     if (typeof settings.message === 'string') {
//         settings.message = [ settings.message ];
//     }
//
//     if (Array.isArray(settings.message)) {
//         settings.message.forEach(message => {
//             const subscriptions = this.core.subscriptions[message];
//
//             if (Array.isArray(subscriptions)) {
//                 const unsubscribesCallback = subscriptions.map(subscription => subscription.unsubscribe);
//                 unsubscribesCallback.forEach(callback => {
//                     callback();
//                 });
//             }
//         });
//     }
// }
//
//
//
// class PublisherSubscriberFeature extends  Feature {
//     init(component: Component, settings: any = {}) {
//         component.core.subscribers = {
//             /**
//              * message:
//              * [
//              *    {
//              *       subscription_id: string,
//              *       component_id: string,
//              *       callback: function
//              *    }
//              * ]
//              */
//         };
//
//         component.core.subscriptions = {
//             /**
//              * message: {
//              *      subscription_id: string,
//              *      component_id: string
//              *      callback: function
//              * }
//              */
//         }
//
//         component.core.nbSubscriptions = 0;
//         component.core.nbSubscribers = 0;
//
//         component.publish = publish.bind(component);
//         component.subscribe = subscribe.bind(component);
//         component.unsubscribe = unsubscribe.bind(component);
//
//         this.destroy = PublisherSubscriberFeature.destroy.bind(this, component);
//     }
//
//
//     /**
//      * Add subscription to subscriber (aka component whose is asking for a subscription)
//      * @param {SmartComponent} subscriber
//      * @param {string} message
//      * @param {{subscription_id: string, callback:function}} subscription
//      * @param {SmartComponent} publisher
//      */
//     static addSubscription(subscriber, message, subscription, publisher) {
//         if (Array.isArray(subscriber.core.subscriptions[message]) !== true) {
//             subscriber.core.subscriptions[message] = [];
//         }
//
//         subscriber.core.subscriptions[message].push({
//             component_id: publisher._id, // data used for debug
//             ...subscription
//         });
//
//         subscriber.core.nbSubscriptions++;
//     }
//
//     static unsubscribeFactory(subscriber, subscription, message, publisher) {
//         return () => {
//
//             // - A - remove subscribers to publisher's list
//             const subscribers = publisher.core.subscribers[message];
//             if (Array.isArray(subscribers)) {
//                 const subscriptionIndex = subscribers.findIndex(subscriber => {
//                     return subscriber.subscription_id = subscription.subscription_id;
//                 });
//
//                 if (subscriptionIndex >= 0) {
//                     const removedSubscription = subscribers.splice(subscriptionIndex, 1);
//                     // callback may contains some references to existings object.
//                     // by deleting reference to this function, all reference into function will be destroyed
//                     // it could prevent some memory leaks
//                     delete removedSubscription.callback;
//
//                     publisher.core.nbSubscribers--;
//
//                     if (publisher.core.subscribers[message].length === 0) {
//                         delete publisher.core.subscribers[message];
//                     }
//                 }
//             }
//
//             // - B - remove subscription from subscriber's list
//             const subscriptions = subscriber.core.subscriptions[message];
//             if (Array.isArray(subscriptions)) {
//                 const subscriptionIndex = subscriptions.findIndex(subscriber => {
//                     return subscriber.subscription_id = subscription.subscription_id;
//                 });
//
//                 if (subscriptionIndex >= 0) {
//                     const removedSubscription = subscriptions.splice(subscriptionIndex, 1);
//                     // callback may contains some references to existings object.
//                     // by deleting reference to this function, all reference into function will be destroyed
//                     // it could prevent some memory leaks
//                     delete removedSubscription.unsubscribe;
//
//                     if (subscriber.core.subscriptions[message].length === 0) {
//                         delete subscriber.core.subscriptions[message];
//                     }
//
//                     subscriber.core.nbSubscriptions--;
//                 }
//             }
//         }
//     }
//
//     static addSubscriber(subscriber, message, subscription, publisher) {
//         if (Array.isArray(publisher.core.subscribers[message]) !== true) {
//             publisher.core.subscribers[message] = [];
//         }
//
//         publisher.core.subscribers[message].push({
//             component_id: subscriber._id, // data used for debug
//             ...subscription
//         });
//
//         publisher.core.nbSubscribers++;
//     }
//
//     static destroy(component) {
//         Object.values(component.core.subscriptions)
//             .forEach(subscriptionsType => {
//                 subscriptionsType.forEach(subscription => subscription.unsubscribe())
//             });
//
//         Object.values(component.core.subscribers)
//             .forEach(subscriptionsType => {
//                 subscriptionsType.forEach(subscription => subscription.unsubscribe())
//             });
//     }
// }
//
// export default function(component, settings = {}) {
//     const feature = new PublisherSubscriberFeature(settings);
//     feature.init(component, settings);
//     return feature;
// };
