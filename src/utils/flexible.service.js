"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class FlexibleService {
    set(propertyPath, value, instance, separator = '.') {
        const tokens = propertyPath.split(separator);
        let node = instance;
        let lastNode = instance;
        let lastToken;
        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];
            if (token.length === 0) {
                throw `Invalid instance id`;
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
    }
    get(id, instance, separator = '.') {
        const tokens = id.split(separator);
        let node = instance;
        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];
            if (token.length === 0) {
                throw `Invalid instance id`;
            }
            if (typeof node[token] === 'undefined') {
                return null;
            }
            node = node[token];
        }
        return node;
    }
}
exports.default = FlexibleService;
//# sourceMappingURL=flexible.service.js.map