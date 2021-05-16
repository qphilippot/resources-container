"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const container_service_1 = require("./container.service");
// todo: return an error instead of null when a component is not found
class AutowirableContainerService extends container_service_1.default {
    constructor(settings = {}) {
        super(settings);
        if (typeof settings.isAutowireEnabled !== 'undefined' &&
            settings.isAutowireEnabled !== true) {
            this.disableAutoriwing();
        }
        else {
            this.enableAutowiring();
        }
    }
    enableAutowiring() {
        this.isAutowireEnabled = true;
    }
    disableAutoriwing() {
        this.isAutowireEnabled = false;
    }
}
exports.default = AutowirableContainerService;
//# sourceMappingURL=autowirable-container.service.js.map