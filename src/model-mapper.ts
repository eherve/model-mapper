// tslint:disable: variable-name space-before-function-paren only-arrow-functions
import 'reflect-metadata';
import { isEqual, cloneDeep, get, merge, split, isArray, map } from 'lodash';
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
  private target: any;
  private propertyMapping: { [key: string]: IOptions };

  constructor(type: new () => T) {
    this.target = new type();
    this.propertyMapping = Reflect.getOwnMetadata('propertyMap', Object.getPrototypeOf(this.target)) || {};
    const self = this;

    this.target.getPropertySource = function (property: string): string | string[] {
      const mapping = self.propertyMapping[property];
      return mapping ? mapping.source : null;
    };

    this.target.isPropertyDirty = function (property: string): boolean {
      const mapping = self.propertyMapping[property];
      if (!mapping || !mapping.trace) {
        return null;
      }
      return this[property].equals
        ? this[property].equals(this._initials[property])
        : !isEqual(this[property], this._initials[property]);
    };

    this.target.getDirtyProperties = function (): string[] {
      const properties: string[] = [];
      for (const property in self.propertyMapping) {
        if (self.propertyMapping.hasOwnProperty(property)) {
          if (this.isPropertyDirty(property)) {
            properties.push(property);
          }
        }
      }
      return properties;
    };

    this.target.resetDirty = function (): T {
      Object.keys(self.propertyMapping).forEach(key => {
        const mapping = self.propertyMapping[key];
        if (mapping.trace) {
          this._initials[key] = this[key].clone ? this[key].clone() : cloneDeep(this[key]);
        }
      });
      return this;
    };

    this.target.merge = function (source: any, resetDirty: boolean = false): T {
      merge(this, source);
      if (resetDirty) {
        this.resetDirty();
      }
      return this;
    };
  }

  public map(source?: any): T {
    if (!source) return;

    Object.keys(this.propertyMapping).forEach(property => {
      const mapping = this.propertyMapping[property];

      const value = this.buildValue(mapping.source, source);
      if (Array.isArray(mapping.type)) {
        this.target[property] = Array.isArray(value)
          ? value.map((v: any) => this.getValue((mapping.type as Type[])[0], v))
          : value === null
          ? null
          : undefined;
      } else {
        this.target[property] = this.getValue(mapping.type, value);
      }

      if (mapping.default !== undefined && this.target[property] === undefined) {
        this.target[property] = typeof mapping.default === 'function' ? mapping.default() : mapping.default;
      }

      if (mapping.trace) {
        this.target._initials = this.target._initials || {};
        this.target._initials[property] =
          this.target[property] && this.target[property].clone
            ? this.target[property].clone()
            : cloneDeep(this.target[property]);
      }
    });

    if (typeof this.target.afterMapping === 'function') {
      this.target.afterMapping();
    }

    return this.target;
  }

  private buildValue(pathString: string, source: any): any {
    let path = split(pathString, '.');
    let data = source;
    while (path.length) {
      data = get(data, path[0]);
      path.splice(0, 1);
      if (path.length && isArray(data)) {
        return map(data, d => this.buildValue(path.join('.'), d));
      }
    }
    return data;
  }

  public serialize(source?: T): any {
    if (!source) {
      return;
    }
    const res: any = {};

    Object.keys(this.propertyMapping).forEach(property => {
      const mapping = this.propertyMapping[property];
      if (Array.isArray(mapping.type)) {
        res[mapping.source] = (get(source, property) || []).map((value: any) =>
          this.getSerializeValue((mapping.type as Type[])[0], value)
        );
      } else {
        const value = get(source, property);
        if (value !== undefined) {
          res[mapping.source] = this.getSerializeValue(mapping.type, value);
        }
      }
    });

    return res;
  }

  private getSerializeValue(type: Type, value: any) {
    if (value === null) {
      return null;
    }
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
    return value ? (moment.isMoment(value) ? value : moment(value)) : undefined;
  }

  private buildMomentDuration(value: any): moment.Duration {
    return value ? (moment.isDuration(value) ? value : moment.duration(value)) : undefined;
  }
}
