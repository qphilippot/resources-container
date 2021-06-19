"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const component_model_1 = require("./models/component/component.model");
const resource_not_found_exception_1 = require("./exception/resource-not-found.exception");
const invalid_argument_exception_1 = require("./exception/invalid-argument.exception");
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
    getAliases() {
        return { ...this.aliases };
    }
    getAlias(alias) {
        return this.aliases[alias];
    }
    setAlias(alias, id) {
        if (alias.trim().length === 0) {
            throw new invalid_argument_exception_1.default(`Invalid alias id: "${alias}"`);
        }
        if (alias === id) {
            throw new invalid_argument_exception_1.default(`An alias can not reference itself, got a circular reference on: "${alias}"`);
        }
        this.aliases[alias] = id;
        return this;
    }
    hasAlias(alias) {
        return (typeof this.aliases[alias] === 'string' &&
            this.aliases[alias].length > 0);
    }
}
exports.default = Container;
//# sourceMappingURL=container.model.js.map