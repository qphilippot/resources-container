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
var component_model_1 = require("./models/component/component.model");
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
    return Container;
}(component_model_1["default"]));
exports["default"] = Container;
