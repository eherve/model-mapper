"use strict";
/** @format */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Model = void 0;
require("reflect-metadata");
function Model(options) {
    return function (target) {
        target.__modelOptions = options;
        return target;
    };
}
exports.Model = Model;
//# sourceMappingURL=model.decorator.js.map