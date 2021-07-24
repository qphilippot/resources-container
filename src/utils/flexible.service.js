"use strict";
exports.__esModule = true;
var FlexibleService = /** @class */ (function () {
    function FlexibleService() {
    }
    FlexibleService.prototype.set = function (propertyPath, value, instance, separator) {
        if (separator === void 0) { separator = '.'; }
        var tokens = propertyPath.split(separator);
        var node = instance;
        var lastNode = instance;
        var lastToken;
        for (var i = 0; i < tokens.length; i++) {
            var token = tokens[i];
            if (token.length === 0) {
                throw "Invalid instance id";
            }
            if (typeof node[token] === 'undefined') {
                node[token] = {};
            }
            lastNode = node;
            node = node[token];
            lastToken = token;
        }
        lastNode[lastToken] = value;
        return instance;
    };
    FlexibleService.prototype.get = function (id, instance, separator) {
        if (separator === void 0) { separator = '.'; }
        var tokens = id.split(separator);
        var node = instance;
        for (var i = 0; i < tokens.length; i++) {
            var token = tokens[i];
            if (token.length === 0) {
                throw "Invalid instance id";
            }
            if (typeof node[token] === 'undefined') {
                return null;
            }
            node = node[token];
        }
        return node;
    };
    return FlexibleService;
}());
exports["default"] = FlexibleService;
