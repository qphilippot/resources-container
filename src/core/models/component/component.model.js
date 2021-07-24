"use strict";
exports.__esModule = true;
var feature_collection_1 = require("../../features/feature.collection");
var component_state_1 = require("./component.state");
var function_collection_1 = require("../function.collection");
var publisher_subscriber_model_1 = require("../../../publisher-subscriber/model/publisher-subscriber.model");
var counter = 0;
var prefix = 'component_';
var Component = /** @class */ (function () {
    function Component(settings) {
        if (settings === void 0) { settings = {}; }
        this.features = new feature_collection_1["default"]();
        this.behavior = new function_collection_1["default"]();
        var core_id = "" + prefix + counter++;
        this.name = settings.name || core_id;
        this.id = settings.id || core_id;
        this.state = new component_state_1["default"]();
        this.publisherSubscriber = new publisher_subscriber_model_1["default"](this.id);
    }
    Component.prototype.addBehavior = function (name, behavior) {
        this.behavior.add(name, behavior.bind(this));
    };
    Component.prototype.behave = function (name, parameters) {
        var behavior = this.behavior.get(name);
        return behavior(parameters);
    };
    Component.prototype.subscribe = function (component, notification, handler) {
        this.publisherSubscriber.subscribe(component, notification, handler);
    };
    Component.prototype.unsubscribe = function (selector) {
        this.publisherSubscriber.unsubscribe(selector);
    };
    Component.prototype.publish = function (notification, data) {
        this.publisherSubscriber.publish(notification, data);
    };
    Component.prototype.destroy = function () {
        this.publisherSubscriber.destroy();
    };
    Component.prototype.addSubscriber = function (notification, subscription) {
        this.publisherSubscriber.addSubscriber(notification, subscription);
    };
    Component.prototype.addSubscription = function (notification, subscription) {
        this.publisherSubscriber.addSubscriber(notification, subscription);
    };
    Component.prototype.getId = function () {
        return this.id;
    };
    Component.prototype.getNbSubscribers = function () {
        return this.publisherSubscriber.getNbSubscribers();
    };
    Component.prototype.getNbSubscriptions = function () {
        return this.publisherSubscriber.getNbSubscriptions();
    };
    Component.prototype.removeSubscriber = function (notification, subscription_id) {
        this.publisherSubscriber.removeSubscriber(notification, subscription_id);
    };
    Component.prototype.removeSubscription = function (notification, subscription_id) {
        this.publisherSubscriber.removeSubscription(notification, subscription_id);
    };
    Component.prototype.waitUntil = function (notifications) {
        return this.publisherSubscriber.waitUntil(notifications);
    };
    return Component;
}());
exports["default"] = Component;
