"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function propertyMap(options = {}) {
    return (target, propertyKey) => {
        if (!target.constructor._propertyMap) {
            target.constructor._propertyMap = {};
        }
        target.constructor._propertyMap[propertyKey] = {
            source: options.source || propertyKey,
            default: options.default, trace: options.trace,
            type: options.type
        };
    };
}
exports.propertyMap = propertyMap;
//# sourceMappingURL=property-map.decorator.js.map