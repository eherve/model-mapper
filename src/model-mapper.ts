// tslint:disable: variable-name space-before-function-paren only-arrow-functions
import { isEqual, cloneDeep, get, merge } from 'lodash';
import * as moment from 'moment';
import { IOptions, Type } from './property-map.decorator';

export interface IModelMapper {

  _initials?: { [property: string]: any };

  getPropertySource?(property: string): string | string[];

  isPropertyDirty?(property: string): boolean;

  getDirtyProperties?(): string[];

  resetDirty?(): this;

  merge?(source: any, resetDirty?: boolean): this;

}

export class ModelMapper<T> {

  private _target: any;
  private _propertyMapping: { [key: string]: IOptions };

  constructor(type: new () => T) {
    this._target = new type();
    this._propertyMapping = this._target.constructor._propertyMap || {};
    const self = this;

    this._target.getPropertySource = function (property: string): string | string[] {
      const mapping = self._propertyMapping[property];
      return mapping ? mapping.source : null;
    };

    this._target.isPropertyDirty = function (property: string): boolean {
      const mapping = self._propertyMapping[property];
      if (!mapping || !mapping.trace) { return null; }
      return this[property].equals ? this[property].equals(this._initials[property]) :
        !isEqual(this[property], this._initials[property]);
    };

    this._target.getDirtyProperties = function (): string[] {
      const properties: string[] = [];
      for (const property in self._propertyMapping) {
        if (self._propertyMapping.hasOwnProperty(property)) {
          if (this.isPropertyDirty(property)) { properties.push(property); }
        }
      }
      return properties;
    };

    this._target.resetDirty = function (): T {
      Object.keys(self._propertyMapping).forEach(key => {
        const mapping = self._propertyMapping[key];
        if (mapping.trace) {
          this._initials[key] = this[key].clone ? this[key].clone() : cloneDeep(this[key]);
        }
      });
      return this;
    };

    this._target.merge = function (source: any, resetDirty = false): T {
      merge(this, source);
      if (resetDirty) { this.resetDirty(); }
      return this;
    };
  }

  public map(source?: any): T {
    if (!source) { return; }

    Object.keys(this._propertyMapping).forEach(property => {
      const mapping = this._propertyMapping[property];

      if (Array.isArray(mapping.type)) {
        this._target[property] = (get(source, mapping.source) || []).
          map((value: any) => this.getValue((mapping.type as Type[])[0], value));
      } else {
        this._target[property] = this.getValue(mapping.type, get(source, mapping.source));
      }

      if (mapping.default !== undefined && this._target[property] === undefined) {
        this._target[property] = mapping.default;
      }

      if (mapping.trace) {
        this._target._initials = this._target._initials || {};
        this._target._initials[property] = this._target[property] && this._target[property].clone ?
          this._target[property].clone() :
          cloneDeep(this._target[property]);
      }
    });

    if (typeof this._target.afterMapping === 'function') { this._target.afterMapping(); }

    return this._target;
  }

  public serialize(source?: T): any {
    if (!source) { return; }
    const res: any = {};

    Object.keys(this._propertyMapping).forEach(property => {
      const mapping = this._propertyMapping[property];
      if (Array.isArray(mapping.type)) {
        res[mapping.source] = (get(source, property) || []).
          map((value: any) => this.getSerializeValue((mapping.type as Type[])[0], value));
      } else {
        res[mapping.source] = this.getSerializeValue(mapping.type, get(source, property));
      }
    });

    return res;
  }

  private getSerializeValue(type: Type, value: any) {
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

  private getValue(type: Type, value: any) {
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

  private buildMoment(value: any): moment.Moment {
    return value ? moment.isMoment(value) ? value : moment(value) : undefined;
  }

  private buildMomentDuration(value: any): moment.Duration {
    return value ? moment.isDuration(value) ? value : moment.duration(value) : undefined;
  }

}
