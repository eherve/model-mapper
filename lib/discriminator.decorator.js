"use strict";
/** @format */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Discriminator = exports.registeredDiscriminator = void 0;
require("reflect-metadata");
exports.registeredDiscriminator = {};
function Discriminator(options) {
    return function (target) {
        const parent = Object.getPrototypeOf(target);
        if (!exports.registeredDiscriminator[parent])
            exports.registeredDiscriminator[parent] = [];
        exports.registeredDiscriminator[parent].push(Object.assign(Object.assign({}, options), { target: target }));
        return target;
    };
}
exports.Discriminator = Discriminator;
//# sourceMappingURL=discriminator.decorator.js.map