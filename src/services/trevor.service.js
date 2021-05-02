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
var component_model_1 = require("../core/models/component/component.model");
var TrevorService = /** @class */ (function (_super) {
    __extends(TrevorService, _super);
    function TrevorService(helloService, settings) {
        if (settings === void 0) { settings = {}; }
        var _this = _super.call(this, __assign(__assign({}, settings), { name: settings.name || 'hello-service' })) || this;
        _this.helloService = helloService;
        return _this;
    }
    TrevorService.prototype.sayHello = function () {
        console.log('hello');
    };
    return TrevorService;
}(component_model_1["default"]));
exports["default"] = TrevorService;
