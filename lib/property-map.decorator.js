"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.propertyMap = void 0;
const lodash_1 = require("lodash");
require("reflect-metadata");
function propertyMap(options = {}) {
    return (target, propertyKey) => {
        let ownMetadata;
        if (!Reflect.hasOwnMetadata('propertyMap', target)) {
            ownMetadata = (0, lodash_1.clone)(Reflect.getMetadata('propertyMap', target) || {});
            Reflect.defineMetadata('propertyMap', ownMetadata, target);
        }
        else {
            ownMetadata = Reflect.getOwnMetadata('propertyMap', target);
        }
        ownMetadata[propertyKey] = {
            source: options.source || propertyKey,
            default: options.default,
            type: options.type,
            transformer: options.transformer
        };
    };
}
exports.propertyMap = propertyMap;
//# sourceMappingURL=property-map.decorator.js.map