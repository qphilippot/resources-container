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
var container_model_1 = require("./core/container.model");
var flexible_service_1 = require("./core/flexible.service");
var component_model_1 = require("./core/models/component/component.model");
var reflexion_service_1 = require("./core/reflexion.service");
// todo: return an error instead of null when a component is not found
/**
 * Container Service have to use definitions concept in order to check if some resources dependancies are availables before instantiate it
 */
var ContainerService = /** @class */ (function (_super) {
    __extends(ContainerService, _super);
    function ContainerService(settings) {
        if (settings === void 0) { settings = {}; }
        var _this = _super.call(this, {
            name: settings.name || 'container-service'
        }) || this;
        _this.definitions = [];
        _this.container = new container_model_1["default"]();
        _this.flexible = new flexible_service_1["default"]();
        _this.factories = {};
        _this.reflector = new reflexion_service_1["default"]();
        _this.addResource(_this, 'service.container');
        return _this;
    }
    ContainerService.prototype.getContainer = function () {
        return this.container;
    };
    ContainerService.prototype.addResource = function (resource, id) {
        if (id === void 0) { id = null; }
        if (id === null) {
            id = resource.id;
        }
        this.flexible.set(id, resource, this.container.resources);
    };
    ContainerService.prototype.createResource = function (resource_id, resourceType, injection) {
        var resource = new resourceType(__assign(__assign({}, this.getContainer()), injection));
    };
    ContainerService.prototype.recordResource = function (resource_id, type, parameters) {
        console.log('recordResource', new type(parameters));
        this.addResource(new type(parameters), resource_id);
    };
    ContainerService.prototype.recordFactory = function (id, factory) {
        // todo
        this.flexible.set(id, factory, this.factories);
    };
    ContainerService.prototype.processFactories = function () {
        Object.keys(this.factories).forEach(function (factoryName) {
        });
    };
    ContainerService.prototype.addAlias = function (alias, id) {
        this.flexible.set(alias, id, this.container.aliases);
    };
    ContainerService.prototype.addParameter = function (id, value) {
        this.flexible.set(id, value, this.container.parameters);
    };
    ContainerService.prototype.findById = function (resource_id) {
        return this.flexible.get(resource_id, this.container.resources);
    };
    ContainerService.prototype.findByAlias = function (alias) {
        var instance_id = this.container.aliases[alias];
        if (typeof instance_id === 'undefined') {
            return null;
        }
        else {
            return this.findById(instance_id);
        }
    };
    ContainerService.prototype.getParameter = function (parameterName) {
        return this.container.parameters[parameterName] || null;
    };
    ContainerService.prototype.get = function (key) {
        var candidate = this.findById(key);
        if (candidate !== null) {
            return candidate;
        }
        candidate = this.findByAlias(key);
        if (candidate !== null) {
            return candidate;
        }
        return this.getParameter(key);
    };
    ContainerService.prototype.addDefinition = function (resource_id, type, settings) {
        if (settings === void 0) { settings = {}; }
        this.definitions.push({
            resource_id: resource_id,
            type: type,
            settings: settings
        });
    };
    ContainerService.prototype.process = function () {
        var _this = this;
        this.definitions.forEach(function (definition) {
            var definitionsDependencies = _this.reflector.getFunctionArgumentsName(definition.type.prototype.constructor);
            // const optionalsDependencies = this.reflector.getFunctionArgumentsName(definition.type.prototype.constructor);
            console.log('definitionsDependencies', definitionsDependencies);
            // if (definition)
        });
    };
    return ContainerService;
}(component_model_1["default"]));
exports["default"] = ContainerService;
