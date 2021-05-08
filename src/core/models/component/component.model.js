"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
var mixed_model_1 = require("../../mixed.model");
var feature_collection_1 = require("../../features/feature.collection");
var component_state_1 = require("./component.state");
var function_collection_1 = require("../function.collection");
var counter = 0;
var prefix = 'component_';
var Component = /** @class */ (function (_super) {
    __extends(Component, _super);
    function Component(settings) {
        if (settings === void 0) { settings = {}; }
        var _this = _super.call(this) || this;
        _this.features = new feature_collection_1["default"]();
        _this.behavior = new function_collection_1["default"]();
        var core_id = "" + prefix + counter++;
        _this.name = settings.name || core_id;
        _this.id = settings.id || core_id;
        _this.state = new component_state_1["default"](core_id);
        return _this;
    }
    Component.prototype.addBehavior = function (name, behavior) {
        this.behavior.add(name, behavior.bind(this));
    };
    Component.prototype.behave = function (name, parameters) {
        var behavior = this.behavior.get(name);
        return behavior(parameters);
    };
    Component.prototype.subscribe = function (component, notification, handler) {
        this.state.subscribe(component, notification, handler);
    };
    Component.prototype.unsubscribe = function (selector) {
        this.state.unsubscribe(selector);
    };
    Component.prototype.publish = function (notification, data) {
        this.state.publish(notification, data);
    };
    Component.prototype.destroy = function () {
        this.state.destroy();
    };
    Component.prototype.addSubscriber = function (notification, subscription) {
        this.state.addSubscriber(notification, subscription);
    };
    Component.prototype.addSubscription = function (notification, subscription) {
        this.state.addSubscriber(notification, subscription);
    };
    Component.prototype.getId = function () {
        return this.id;
    };
    Component.prototype.getNbSubscribers = function () {
        return this.state.getNbSubscribers();
    };
    Component.prototype.getNbSubscriptions = function () {
        return this.state.getNbSubscriptions();
    };
    Component.prototype.removeSubscriber = function (notification, subscription_id) {
        this.state.removeSubscriber(notification, subscription_id);
    };
    Component.prototype.removeSubscription = function (notification, subscription_id) {
        this.state.removeSubscription(notification, subscription_id);
    };
    return Component;
}(mixed_model_1["default"]));
exports["default"] = Component;
