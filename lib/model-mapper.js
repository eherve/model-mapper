"use strict";
/** @format */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelMapper = void 0;
// tslint:disable: variable-name space-before-function-paren only-arrow-functions
require("reflect-metadata");
const lodash_1 = require("lodash");
const moment = require("moment");
class ModelMapper {
    constructor(type) {
        this.target = new type();
        this.propertyMapping = Reflect.getOwnMetadata('propertyMap', Object.getPrototypeOf(this.target)) || {};
    }
    map(source) {
        if (!source)
            return;
        Object.keys(this.propertyMapping).forEach(property => {
            const mapping = this.propertyMapping[property];
            this.target[property] =
                typeof mapping.transformer === 'function'
                    ? mapping.transformer(source, this.buildValue(mapping.type, mapping.source, source))
                    : this.buildValue(mapping.type, mapping.source, source);
            if (mapping.default !== undefined && this.target[property] === undefined) {
                this.target[property] = typeof mapping.default === 'function' ? mapping.default() : mapping.default;
            }
        });
        if (typeof this.target.afterMapping === 'function') {
            this.target.afterMapping();
        }
        return this.target;
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
                : data
                    ? this.getValue(type[0], data)
                    : data === null
                        ? null
                        : undefined;
        }
        else {
            return this.getValue(type, data);
        }
    }
    serialize(source) {
        if (!source) {
            return;
        }
        const res = {};
        Object.keys(this.propertyMapping).forEach(property => {
            const mapping = this.propertyMapping[property];
            if (Array.isArray(mapping.type)) {
                res[mapping.source] = ((0, lodash_1.get)(source, property) || []).map((value) => this.getSerializeValue(mapping.type[0], value));
            }
            else {
                const value = (0, lodash_1.get)(source, property);
                if (value !== undefined) {
                    res[mapping.source] = this.getSerializeValue(mapping.type, value);
                }
            }
        });
        return res;
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
}
exports.ModelMapper = ModelMapper;
//# sourceMappingURL=model-mapper.js.map