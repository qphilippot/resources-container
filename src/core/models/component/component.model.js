"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const feature_collection_1 = require("../../features/feature.collection");
const component_state_1 = require("./component.state");
const function_collection_1 = require("../function.collection");
const publisher_subscriber_model_1 = require("../../../publisher-subscriber/model/publisher-subscriber.model");
let counter = 0;
const prefix = 'component_';
class Component {
    constructor(settings = {}) {
        this.features = new feature_collection_1.default();
        this.behavior = new function_collection_1.default();
        const core_id = `${prefix}${counter++}`;
        this.name = settings.name || core_id;
        this.id = settings.id || core_id;
        this.state = new component_state_1.default();
        this.publisherSubscriber = new publisher_subscriber_model_1.default(this.id);
    }
    addBehavior(name, behavior) {
        this.behavior.add(name, behavior.bind(this));
    }
    behave(name, parameters) {
        const behavior = this.behavior.get(name);
        return behavior(parameters);
    }
    subscribe(component, notification, handler) {
        this.publisherSubscriber.subscribe(component, notification, handler);
    }
    unsubscribe(selector) {
        this.publisherSubscriber.unsubscribe(selector);
    }
    publish(notification, data) {
        this.publisherSubscriber.publish(notification, data);
    }
    destroy() {
        this.publisherSubscriber.destroy();
    }
    addSubscriber(notification, subscription) {
        this.publisherSubscriber.addSubscriber(notification, subscription);
    }
    addSubscription(notification, subscription) {
        this.publisherSubscriber.addSubscriber(notification, subscription);
    }
    getId() {
        return this.id;
    }
    getNbSubscribers() {
        return this.publisherSubscriber.getNbSubscribers();
    }
    getNbSubscriptions() {
        return this.publisherSubscriber.getNbSubscriptions();
    }
    removeSubscriber(notification, subscription_id) {
        this.publisherSubscriber.removeSubscriber(notification, subscription_id);
    }
    removeSubscription(notification, subscription_id) {
        this.publisherSubscriber.removeSubscription(notification, subscription_id);
    }
    waitUntil(notifications) {
        return this.publisherSubscriber.waitUntil(notifications);
    }
}
exports.default = Component;
//# sourceMappingURL=component.model.js.map