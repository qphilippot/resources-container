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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
var component_model_1 = require("./models/component/component.model");
var resource_not_found_exception_1 = require("./exception/resource-not-found.exception");
var invalid_argument_exception_1 = require("./exception/invalid-argument.exception");
var Container = /** @class */ (function (_super) {
    __extends(Container, _super);
    function Container(settings) {
        if (settings === void 0) { settings = {}; }
        var _this = _super.call(this, settings) || this;
        _this.resources = {};
        _this.aliases = {};
        _this.parameters = {};
        return _this;
    }
    Container.prototype.get = function (id) {
        if (this.has(id)) {
            return this.resources[id];
        }
        else {
            throw new resource_not_found_exception_1["default"]("Resource not found: " + id);
        }
    };
    Container.prototype.has = function (id) {
        var resource = this.resources[id];
        return (resource !== null &&
            typeof resource !== 'undefined');
    };
    Container.prototype.hasParameter = function (name) {
        return typeof this.parameters[name] !== 'undefined';
    };
    Container.prototype.getParameter = function (name) {
        return this.parameters[name];
    };
    Container.prototype.setParameter = function (name, value) {
        this.parameters[name] = value;
    };
    Container.prototype.getAliases = function () {
        return __assign({}, this.aliases);
    };
    Container.prototype.getAlias = function (alias) {
        return this.aliases[alias];
    };
    Container.prototype.setAlias = function (alias, id) {
        if (alias.trim().length === 0) {
            throw new invalid_argument_exception_1["default"]("Invalid alias id: \"" + alias + "\"");
        }
        if (alias === id) {
            throw new invalid_argument_exception_1["default"]("An alias can not reference itself, got a circular reference on: \"" + alias + "\"");
        }
        this.aliases[alias] = id;
        return this;
    };
    Container.prototype.hasAlias = function (alias) {
        return (typeof this.aliases[alias] === 'string' &&
            this.aliases[alias].length > 0);
    };
    return Container;
}(component_model_1["default"]));
exports["default"] = Container;
