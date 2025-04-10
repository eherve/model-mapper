"use strict";
/** @format */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelMapper = void 0;
// tslint:disable: variable-name space-before-function-paren only-arrow-functions
const lodash_1 = require("lodash");
const moment = require("moment");
require("reflect-metadata");
const discriminator_decorator_1 = require("./discriminator.decorator");
class ModelMapper {
    constructor(type) {
        this._type = type;
        this.target = new type();
        this.propertyMapping = Reflect.getOwnMetadata('propertyMap', Object.getPrototypeOf(this.target)) || {};
        this.target.constructor.prototype.getPropertyMapping = () => {
            return this.propertyMapping;
        };
    }
    get type() {
        return this._type;
    }
    map(source) {
        if (!source)
            return;
        const discriminator = discriminator_decorator_1.registeredDiscriminator[this.type];
        if (discriminator === null || discriminator === void 0 ? void 0 : discriminator.length) {
            const extended = (0, lodash_1.find)(discriminator, entry => (0, lodash_1.isEqual)(source[entry.key], entry.value));
            if (extended)
                return new ModelMapper(extended.target).map(source);
        }
        const target = (0, lodash_1.clone)(this.target);
        Object.keys(this.propertyMapping).forEach(property => {
            const mapping = this.propertyMapping[property];
            const mapValue = this.buildMapValue(mapping.type, mapping.source, source);
            let value;
            if (typeof mapping.map === 'function')
                value = mapping.map(source, mapValue, target, mapping.source);
            else
                value = mapValue;
            if (value !== undefined)
                target[property] = value;
            if (mapping.default !== undefined && target[property] === undefined) {
                target[property] = typeof mapping.default === 'function' ? mapping.default() : mapping.default;
            }
        });
        if (typeof target.afterMapping === 'function')
            target.afterMapping();
        return target;
    }
    serialize(source) {
        if (!source)
            return;
        const discriminator = discriminator_decorator_1.registeredDiscriminator[this.type];
        if (discriminator === null || discriminator === void 0 ? void 0 : discriminator.length) {
            const extended = (0, lodash_1.find)(discriminator, entry => (0, lodash_1.isEqual)(source[entry.key], entry.value)); // TODO if source
            if (extended)
                return new ModelMapper(extended.target).serialize(source);
        }
        const target = {};
        Object.keys(this.propertyMapping).forEach(property => {
            const mapping = this.propertyMapping[property];
            const serializeValue = this.buildSerializeValue(mapping.type, source, property);
            let value;
            if (typeof mapping.serialize === 'function')
                value = mapping.serialize(source, serializeValue, target, property);
            else
                value = serializeValue;
            if (value !== undefined)
                (0, lodash_1.set)(target, mapping.source, value);
        });
        return target;
    }
    buildMapValue(type, pathString, source) {
        let path = (0, lodash_1.split)(pathString, '.');
        let data = source;
        while (path.length) {
            data = (0, lodash_1.get)(data, path[0]);
            path.splice(0, 1);
            if (path.length && (0, lodash_1.isArray)(data)) {
                return (0, lodash_1.concat)(...(0, lodash_1.map)(data, d => this.buildMapValue(type, path.join('.'), d)));
            }
        }
        if (Array.isArray(type)) {
            const arrayType = type[0];
            return Array.isArray(data) ? (0, lodash_1.map)(data, d => this.getMapValue(arrayType, d)) : this.getMapValue(arrayType, data);
        }
        else {
            return this.getMapValue(type, data);
        }
    }
    buildSerializeValue(type, source, property) {
        if (Array.isArray(type)) {
            const data = (0, lodash_1.get)(source, property);
            if (!data)
                return data;
            const arrayType = type[0];
            return Array.isArray(data)
                ? (0, lodash_1.map)(data, d => this.getSerializeValue(arrayType, d))
                : this.getSerializeValue(arrayType, data);
        }
        else {
            return this.getSerializeValue(type, (0, lodash_1.get)(source, property));
        }
    }
    getSerializeValue(type, value) {
        if (value === undefined)
            return undefined;
        if (value === null)
            return null;
        if (type === 'Moment')
            return moment.isMoment(value) ? value.toISOString() : value;
        if (type === 'Moment.Duration')
            return moment.isDuration(value) ? value.toISOString() : value;
        if (type === Date)
            return value.toISOString();
        if (type) {
            const discriminator = discriminator_decorator_1.registeredDiscriminator[type];
            if (discriminator === null || discriminator === void 0 ? void 0 : discriminator.length) {
                const extended = (0, lodash_1.find)(discriminator, entry => (0, lodash_1.isEqual)(value[entry.key], entry.value));
                if (extended)
                    return new ModelMapper(extended.target).serialize(value);
            }
            return new ModelMapper(type).serialize(value);
        }
        return value;
    }
    getMapValue(type, value) {
        if (value === undefined)
            return undefined;
        if (value === null)
            return null;
        if (type === 'Moment')
            return this.buildMoment(value);
        if (type === 'Moment.Duration')
            return this.buildMomentDuration(value);
        if (type === Date)
            return new Date(value);
        if (type) {
            const discriminator = discriminator_decorator_1.registeredDiscriminator[type];
            if (discriminator === null || discriminator === void 0 ? void 0 : discriminator.length) {
                const extended = (0, lodash_1.find)(discriminator, entry => (0, lodash_1.isEqual)(value[entry.key], entry.value));
                if (extended)
                    return new ModelMapper(extended.target).map(value);
            }
            return new ModelMapper(type).map(value);
        }
        return value;
    }
    buildMoment(value) {
        return value ? (moment.isMoment(value) ? value : moment(value)) : undefined;
    }
    buildMomentDuration(value) {
        return value ? (moment.isDuration(value) ? value : moment.duration(value)) : undefined;
    }
    getPropertyMappingTree() {
        const tree = {};
        (0, lodash_1.each)((0, lodash_1.keys)(this.propertyMapping), property => {
            tree[property] = this.propertyMapping[property];
            const type = Array.isArray(tree[property].type)
                ? (0, lodash_1.head)(tree[property].type)
                : tree[property].type;
            if (!(0, lodash_1.includes)([undefined, 'Moment', 'Moment.Duration', Date], type)) {
                try {
                    tree[property].propertyMapping = new ModelMapper(type).getPropertyMappingTree();
                }
                catch (err) {
                    console.error(property, type, err);
                }
            }
        });
        return tree;
    }
}
exports.ModelMapper = ModelMapper;
//# sourceMappingURL=model-mapper.js.map