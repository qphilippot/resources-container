"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const component_model_1 = require("../core/models/component/component.model");
class HelloService extends component_model_1.default {
    constructor(settings = {}) {
        super({
            ...settings,
            name: settings.name || 'hello-service'
        });
    }
    sayHello() {
        console.log('hello');
    }
}
exports.default = HelloService;
//# sourceMappingURL=hello.service.js.map