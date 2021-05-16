"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const component_model_1 = require("./models/component/component.model");
class Container extends component_model_1.default {
    constructor(settings = {}) {
        super(settings);
        this.resources = {};
        this.aliases = {};
        this.parameters = {};
    }
}
exports.default = Container;
//# sourceMappingURL=container.model.js.map