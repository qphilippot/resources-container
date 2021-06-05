"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const component_model_1 = require("./models/component/component.model");
const resource_not_found_exception_1 = require("./exception/resource-not-found.exception");
class Container extends component_model_1.default {
    constructor(settings = {}) {
        super(settings);
        this.resources = {};
        this.aliases = {};
        this.parameters = {};
    }
    get(id) {
        if (this.has(id)) {
            return this.resources[id];
        }
        else {
            throw new resource_not_found_exception_1.default(`Resource not found: ${id}`);
        }
    }
    has(id) {
        const resource = this.resources[id];
        return (resource !== null &&
            typeof resource !== 'undefined');
    }
    hasParameter(name) {
        return typeof this.parameters[name] !== 'undefined';
    }
    getParameter(name) {
        return this.parameters[name];
    }
    setParameter(name, value) {
        this.parameters[name] = value;
    }
}
exports.default = Container;
//# sourceMappingURL=container.model.js.map