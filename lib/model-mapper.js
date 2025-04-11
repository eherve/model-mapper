"use strict";
/** @format */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelMapper = void 0;
// tslint:disable: variable-name space-before-function-paren only-arrow-functions
const lodash_1 = require("lodash");
const moment = require("moment");
require("reflect-metadata");
class ModelMapper {
    constructor(_type, discriminators) {
        var _a;
        this._type = _type;
        this.discriminators = discriminators;
        this.target = new this._type();
        this.discriminatorKey = (_a = this._type.__modelOptions) === null || _a === void 0 ? void 0 : _a.discriminatorKey;
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
        if (this.discriminatorKey && this.discriminators) {
            const typeConstructor = this.discriminators[source[this.discriminatorKey]];
            if (typeConstructor)
                return new ModelMapper(typeConstructor).map(source);
        }
        const target = (0, lodash_1.clone)(this.target);
        Object.keys(this.propertyMapping).forEach(property => {
            const mapping = this.propertyMapping[property];
            const mapValue = this.buildMapValue(mapping, mapping.source, source);
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
        if (this.discriminatorKey && this.discriminators) {
            const typeConstructor = this.discriminators[source[this.discriminatorKey]];
            if (typeConstructor)
                return new ModelMapper(typeConstructor).serialize(source);
        }
        const target = {};
        Object.keys(this.propertyMapping).forEach(property => {
            const mapping = this.propertyMapping[property];
            const serializeValue = this.buildSerializeValue(mapping, source, property);
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
    buildMapValue(mapping, pathString, source) {
        let path = (0, lodash_1.split)(pathString, '.');
        let data = source;
        while (path.length) {
            data = (0, lodash_1.get)(data, path[0]);
            path.splice(0, 1);
            if (path.length && (0, lodash_1.isArray)(data)) {
                return (0, lodash_1.concat)(...(0, lodash_1.map)(data, d => this.buildMapValue(mapping, path.join('.'), d)));
            }
        }
        if (Array.isArray(mapping.type) && Array.isArray(data))
            return (0, lodash_1.map)(data, d => this.getMapValue(mapping, d));
        return this.getMapValue(mapping, data);
    }
    buildSerializeValue(mapping, source, property) {
        if (Array.isArray(mapping.type)) {
            const data = (0, lodash_1.get)(source, property);
            if (!data)
                return data;
            return Array.isArray(data)
                ? (0, lodash_1.map)(data, d => this.getSerializeValue(mapping, d))
                : this.getSerializeValue(mapping, data);
        }
        else {
            return this.getSerializeValue(mapping, (0, lodash_1.get)(source, property));
        }
    }
    getSerializeValue(mapping, value) {
        const type = Array.isArray(mapping.type) ? mapping.type[0] : mapping.type;
        if (value === undefined)
            return undefined;
        if (value === null)
            return null;
        if (type === 'Moment')
            return moment.isMoment(value) ? value.toISOString() : value;
        if (type === 'Moment.Duration')
            return moment.isDuration(value) ? value.toISOString() : value;
        if (type === Date || type instanceof Date)
            return value.toISOString();
        if (type)
            return this.getPropertyTypeConstructor(mapping, type, value).serialize(value);
        return value;
    }
    getMapValue(mapping, value) {
        const type = Array.isArray(mapping.type) ? mapping.type[0] : mapping.type;
        if (value === undefined)
            return undefined;
        if (value === null)
            return null;
        if (type === 'Moment')
            return this.buildMoment(value);
        if (type === 'Moment.Duration')
            return this.buildMomentDuration(value);
        if (type === Date || type instanceof Date)
            return new Date(value);
        if (type === String)
            return new String(value);
        if (type === Number)
            return new Number(value);
        if (type)
            return this.getPropertyTypeConstructor(mapping, type, value).map(value);
        return value;
    }
    getPropertyTypeConstructor(mapping, type, value) {
        var _a;
        const discriminators = mapping.discriminators;
        if (!discriminators)
            return new ModelMapper(type);
        const discriminatorKey = (_a = type.__modelOptions) === null || _a === void 0 ? void 0 : _a.discriminatorKey;
        if (!discriminatorKey)
            return new ModelMapper(type);
        const typeConstructor = discriminators[value[discriminatorKey]];
        if (!typeConstructor)
            return new ModelMapper(type);
        return new ModelMapper(typeConstructor);
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