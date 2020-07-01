"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// tslint:disable: variable-name space-before-function-paren only-arrow-functions
const lodash_1 = require("lodash");
const moment = require("moment");
class ModelMapper {
    constructor(type) {
        this._target = new type();
        this._propertyMapping = this._target.constructor._propertyMap || {};
        const self = this;
        this._target.getPropertySource = function (property) {
            const mapping = self._propertyMapping[property];
            return mapping ? mapping.source : null;
        };
        this._target.isPropertyDirty = function (property) {
            const mapping = self._propertyMapping[property];
            if (!mapping || !mapping.trace) {
                return null;
            }
            return this[property].equals ? this[property].equals(this._initials[property]) :
                !lodash_1.isEqual(this[property], this._initials[property]);
        };
        this._target.getDirtyProperties = function () {
            const properties = [];
            for (const property in self._propertyMapping) {
                if (self._propertyMapping.hasOwnProperty(property)) {
                    if (this.isPropertyDirty(property)) {
                        properties.push(property);
                    }
                }
            }
            return properties;
        };
        this._target.resetDirty = function () {
            Object.keys(self._propertyMapping).forEach(key => {
                const mapping = self._propertyMapping[key];
                if (mapping.trace) {
                    this._initials[key] = this[key].clone ? this[key].clone() : lodash_1.cloneDeep(this[key]);
                }
            });
            return this;
        };
        this._target.merge = function (source, resetDirty = false) {
            lodash_1.merge(this, source);
            if (resetDirty) {
                this.resetDirty();
            }
            return this;
        };
    }
    map(source) {
        if (!source) {
            return;
        }
        Object.keys(this._propertyMapping).forEach(property => {
            const mapping = this._propertyMapping[property];
            if (Array.isArray(mapping.type)) {
                const arr = lodash_1.get(source, mapping.source);
                this._target[property] = Array.isArray(arr) ?
                    arr.map((value) => this.getValue(mapping.type[0], value)) :
                    arr === null ? null : undefined;
            }
            else {
                this._target[property] = this.getValue(mapping.type, lodash_1.get(source, mapping.source));
            }
            if (mapping.default !== undefined && this._target[property] === undefined) {
                const d = typeof mapping.default === 'function' ? mapping.default() : mapping.default;
                if (Array.isArray(mapping.type)) {
                    this._target[property] = Array.isArray(d) ?
                        d.map((value) => this.getValue(mapping.type[0], value)) :
                        d === null ? null : undefined;
                }
                else {
                    this._target[property] = this.getValue(mapping.type, d);
                }
            }
            if (mapping.trace) {
                this._target._initials = this._target._initials || {};
                this._target._initials[property] = this._target[property] && this._target[property].clone ?
                    this._target[property].clone() :
                    lodash_1.cloneDeep(this._target[property]);
            }
        });
        if (typeof this._target.afterMapping === 'function') {
            this._target.afterMapping();
        }
        return this._target;
    }
    serialize(source) {
        if (!source) {
            return;
        }
        const res = {};
        Object.keys(this._propertyMapping).forEach(property => {
            const mapping = this._propertyMapping[property];
            if (Array.isArray(mapping.type)) {
                res[mapping.source] = (lodash_1.get(source, property) || []).
                    map((value) => this.getSerializeValue(mapping.type[0], value));
            }
            else {
                res[mapping.source] = this.getSerializeValue(mapping.type, lodash_1.get(source, property));
            }
        });
        return res;
    }
    getSerializeValue(type, value) {
        if (type === 'Moment') {
            return value.toISOString();
        }
        if (type === 'Moment.Duration') {
            return value.toISOString(value);
        }
        if (type) {
            return new ModelMapper(type).serialize(value);
        }
        return value;
    }
    getValue(type, value) {
        if (type === 'Moment') {
            return this.buildMoment(value);
        }
        if (type === 'Moment.Duration') {
            return this.buildMomentDuration(value);
        }
        if (type) {
            return new ModelMapper(type).map(value);
        }
        return value;
    }
    buildMoment(value) {
        return value ? moment.isMoment(value) ? value : moment(value) : undefined;
    }
    buildMomentDuration(value) {
        return value ? moment.isDuration(value) ? value : moment.duration(value) : undefined;
    }
}
exports.ModelMapper = ModelMapper;
//# sourceMappingURL=model-mapper.js.map