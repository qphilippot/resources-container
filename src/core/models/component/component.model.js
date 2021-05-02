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
var counter = 0;
var prefix = 'component_';
var Component = /** @class */ (function (_super) {
    __extends(Component, _super);
    function Component(settings) {
        if (settings === void 0) { settings = {}; }
        var _this = _super.call(this) || this;
        _this.features = new feature_collection_1["default"]();
        var core_id = "" + prefix + counter++;
        _this.name = settings.name || core_id;
        _this.id = settings.id || core_id;
        _this.state = new component_state_1["default"](core_id);
        return _this;
    }
    Component.prototype.addMethod = function (name, method) {
        this[name] = method.bind(this);
    };
    return Component;
}(mixed_model_1["default"]));
exports["default"] = Component;
