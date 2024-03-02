"use strict";
/** @format */
Object.defineProperty(exports, "__esModule", { value: true });
exports.classMap = void 0;
require("reflect-metadata");
function classMap(options = {}) {
    return (target) => {
        Reflect.defineMetadata('classMap', options, target);
        console.log(Reflect.getOwnMetadata('classMap', Object.getPrototypeOf(target)) || {});
    };
}
exports.classMap = classMap;
//# sourceMappingURL=class-map.decorator.js.map