/** @format */

// tslint:disable: variable-name space-before-function-paren only-arrow-functions
import 'reflect-metadata';
import { isEqual, cloneDeep, get, merge, split, isArray, map, concat } from 'lodash';
import * as moment from 'moment';
import { IOptions, Type } from './property-map.decorator';

export class ModelMapper<T> {
  private target: any;
  private propertyMapping: { [key: string]: IOptions };

  constructor(type: new () => T) {
    this.target = new type();
    this.propertyMapping = Reflect.getOwnMetadata('propertyMap', Object.getPrototypeOf(this.target)) || {};
  }

  public map(source?: any): T {
    if (!source) return;
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

  private buildValue(type: Type | Type[], pathString: string, source: any): any {
    let path = split(pathString, '.');
    let data = source;
    while (path.length) {
      data = get(data, path[0]);
      path.splice(0, 1);
      if (path.length && isArray(data)) {
        return concat(...map(data, d => this.buildValue(type, path.join('.'), d)));
      }
    }
    if (Array.isArray(type)) {
      return Array.isArray(data)
        ? map(data, d => this.getValue((type as Type[])[0], d))
        : data
        ? this.getValue((type as Type[])[0], data)
        : data === null
        ? null
        : undefined;
    } else {
      return this.getValue(type, data);
    }
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
    if (value === null) return null;
    if (type === 'Moment') return value.toISOString();
    if (type === 'Moment.Duration') return value.toISOString(value);
    if (type === Date) return value.toISOString();
    if (type) return new ModelMapper(type as new () => any).serialize(value);
    return value;
  }

  private getValue(type: Type, value: any) {
    if (type === 'Moment') return this.buildMoment(value);
    if (type === 'Moment.Duration') return this.buildMomentDuration(value);
    if (type === Date) return new Date(value);
    if (type) return new ModelMapper(type as new () => any).map(value);
    return value;
  }

  private buildMoment(value: any): moment.Moment {
    return value ? (moment.isMoment(value) ? value : moment(value)) : undefined;
  }

  private buildMomentDuration(value: any): moment.Duration {
    return value ? (moment.isDuration(value) ? value : moment.duration(value)) : undefined;
  }
}
