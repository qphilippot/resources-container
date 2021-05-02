"use strict";
exports.__esModule = true;
var counter = 0;
var prefix = 'component_';
var Component = /** @class */ (function () {
    function Component(settings) {
        if (settings === void 0) { settings = {}; }
        var core_id = "" + prefix + counter++;
        this.name = settings.name || core_id;
        this.id = settings.id || core_id;
        this.core = {
            id: core_id
        };
    }
    return Component;
}());
exports["default"] = Component;
