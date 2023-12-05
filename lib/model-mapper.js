"use strict";
/** @format */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelMapper = void 0;
// tslint:disable: variable-name space-before-function-paren only-arrow-functions
const lodash_1 = require("lodash");
const moment = require("moment");
require("reflect-metadata");
class ModelMapper {
    constructor(type) {
        this.target = new type();
        this.propertyMapping = Reflect.getOwnMetadata('propertyMap', Object.getPrototypeOf(this.target)) || {};
        this.target.constructor.prototype.getPropertyMapping = () => {
            return this.propertyMapping;
        };
    }
    map(source) {
        if (!source)
            return;
        const target = (0, lodash_1.clone)(this.target);
        Object.keys(this.propertyMapping).forEach(property => {
            const mapping = this.propertyMapping[property];
            if (typeof mapping.transformer === 'function') {
                target[property] = mapping.transformer(source, this.buildValue(mapping.type, mapping.source, source), target, 'map');
            }
            else {
                target[property] = this.buildValue(mapping.type, mapping.source, source);
            }
            if (mapping.default !== undefined && target[property] === undefined) {
                target[property] = typeof mapping.default === 'function' ? mapping.default() : mapping.default;
            }
        });
        if (typeof target.afterMapping === 'function')
            target.afterMapping();
        return target;
    }
    buildValue(type, pathString, source) {
        let path = (0, lodash_1.split)(pathString, '.');
        let data = source;
        while (path.length) {
            data = (0, lodash_1.get)(data, path[0]);
            path.splice(0, 1);
            if (path.length && (0, lodash_1.isArray)(data)) {
                return (0, lodash_1.concat)(...(0, lodash_1.map)(data, d => this.buildValue(type, path.join('.'), d)));
            }
        }
        if (Array.isArray(type)) {
            return Array.isArray(data)
                ? (0, lodash_1.map)(data, d => this.getValue(type[0], d))
                : this.getValue(type[0], data);
        }
        else {
            return this.getValue(type, data);
        }
    }
    serialize(source) {
        if (!source)
            return;
        const target = {};
        Object.keys(this.propertyMapping).forEach(property => {
            const mapping = this.propertyMapping[property];
            if (typeof mapping.transformer === 'function') {
                (0, lodash_1.set)(target, mapping.source, mapping.transformer(source, this.buildSerializeValue(mapping.type, source, property), target, 'serialize'));
            }
            else {
                (0, lodash_1.set)(target, mapping.source, this.buildSerializeValue(mapping.type, source, property));
            }
        });
        return target;
    }
    buildSerializeValue(type, source, property) {
        if (Array.isArray(type)) {
            return ((0, lodash_1.get)(source, property) || []).map((value) => this.getSerializeValue(type[0], value));
        }
        else {
            return this.getSerializeValue(type, (0, lodash_1.get)(source, property));
        }
    }
    getSerializeValue(type, value) {
        if (value === null)
            return null;
        if (type === 'Moment')
            return value.toISOString();
        if (type === 'Moment.Duration')
            return value.toISOString(value);
        if (type === Date)
            return value.toISOString();
        if (type)
            return new ModelMapper(type).serialize(value);
        return value;
    }
    getValue(type, value) {
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
        if (type)
            return new ModelMapper(type).map(value);
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
                tree[property].propertyMapping = new ModelMapper(type).getPropertyMappingTree();
            }
        });
        return tree;
    }
}
exports.ModelMapper = ModelMapper;
//# sourceMappingURL=model-mapper.js.map