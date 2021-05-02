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
var container_service_1 = require("./container.service");
// todo: return an error instead of null when a component is not found
var AutowirableContainerService = /** @class */ (function (_super) {
    __extends(AutowirableContainerService, _super);
    function AutowirableContainerService(settings) {
        if (settings === void 0) { settings = {}; }
        var _this = _super.call(this, settings) || this;
        if (typeof settings.isAutowireEnabled !== 'undefined' &&
            settings.isAutowireEnabled !== true) {
            _this.disableAutoriwing();
        }
        else {
            _this.enableAutowiring();
        }
        return _this;
    }
    AutowirableContainerService.prototype.enableAutowiring = function () {
        this.isAutowireEnabled = true;
    };
    AutowirableContainerService.prototype.disableAutoriwing = function () {
        this.isAutowireEnabled = false;
    };
    return AutowirableContainerService;
}(container_service_1["default"]));
exports["default"] = AutowirableContainerService;
