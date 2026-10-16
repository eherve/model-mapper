"use strict";
/** @format */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PropertyMap = exports.propertyMap = exports.getPropertyMapping = void 0;
const lodash_1 = require("lodash");
require("reflect-metadata");
const PROPERTY_MAP_METADATA_KEY = 'propertyMap';
function getPropertyMapping(target) {
    const prototypes = [];
    let prototype = target;
    while (prototype && prototype !== Object.prototype) {
        prototypes.unshift(prototype);
        prototype = Object.getPrototypeOf(prototype);
    }
    return prototypes.reduce((propertyMapping, currentPrototype) => {
        const ownMetadata = Reflect.getOwnMetadata(PROPERTY_MAP_METADATA_KEY, currentPrototype);
        if (!ownMetadata)
            return propertyMapping;
        Object.keys(ownMetadata).forEach(property => {
            propertyMapping[property] = Object.assign(Object.assign({}, (0, lodash_1.cloneDeep)(propertyMapping[property] || {})), (0, lodash_1.cloneDeep)(ownMetadata[property]));
        });
        return propertyMapping;
    }, {});
}
exports.getPropertyMapping = getPropertyMapping;
function propertyMap(options = {}) {
    return function (target, propertyKey) {
        let ownMetadata;
        if (!Reflect.hasOwnMetadata(PROPERTY_MAP_METADATA_KEY, target)) {
            ownMetadata = (0, lodash_1.cloneDeep)(Reflect.getMetadata(PROPERTY_MAP_METADATA_KEY, target) || {});
            Reflect.defineMetadata(PROPERTY_MAP_METADATA_KEY, ownMetadata, target);
        }
        else {
            ownMetadata = Reflect.getOwnMetadata(PROPERTY_MAP_METADATA_KEY, target);
        }
        ownMetadata[propertyKey] = (0, lodash_1.merge)({ source: propertyKey }, options);
    };
}
exports.propertyMap = propertyMap;
exports.PropertyMap = propertyMap;
//# sourceMappingURL=property-map.decorator.js.map