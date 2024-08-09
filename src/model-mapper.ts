/** @format */

// tslint:disable: variable-name space-before-function-paren only-arrow-functions
import {clone, concat, each, get, head, includes, isArray, keys, map, set, split} from 'lodash';
import * as moment from 'moment';
import 'reflect-metadata';
import {IMappedEntity} from './mapped-entity.interface';
import {IPropertyMapOptions, PropertyMapOptionsType} from './property-map-options.interface';
import {PropertyMappingTree} from './property-mapping-tree.interface';

export class ModelMapper<T> {
  get type(): new () => T {
    return this._type;
  }
  private _type: new () => T;

  protected target: any;
  protected propertyMapping: {[key: string]: IPropertyMapOptions};

  constructor(type: new () => T) {
    this._type = type;
    this.target = new type();
    this.propertyMapping = Reflect.getOwnMetadata('propertyMap', Object.getPrototypeOf(this.target)) || {};
    this.target.constructor.prototype.getPropertyMapping = () => {
      return this.propertyMapping;
    };
  }

  public map(source?: any): T & IMappedEntity {
    if (!source) return;
    const target = clone(this.target);
    Object.keys(this.propertyMapping).forEach(property => {
      const mapping = this.propertyMapping[property];
      const mapValue = this.buildMapValue(mapping.type, mapping.source, source);
      let value: any;
      if (typeof mapping.map === 'function') value = mapping.map(source, mapValue, target, mapping.source);
      else value = mapValue;
      if (value !== undefined) target[property] = value;
      if (mapping.default !== undefined && target[property] === undefined) {
        target[property] = typeof mapping.default === 'function' ? mapping.default() : mapping.default;
      }
    });
    if (typeof target.afterMapping === 'function') target.afterMapping();
    return target;
  }

  public serialize(source?: T): any {
    if (!source) return;
    const target: any = {};
    Object.keys(this.propertyMapping).forEach(property => {
      const mapping = this.propertyMapping[property];
      const serializeValue = this.buildSerializeValue(mapping.type, source, property);
      let value: any;
      if (typeof mapping.serialize === 'function') value = mapping.serialize(source, serializeValue, target, property);
      else value = serializeValue;
      if (value !== undefined) set(target, mapping.source, value);
    });
    return target;
  }

  private buildMapValue(type: PropertyMapOptionsType | PropertyMapOptionsType[], pathString: string, source: any): any {
    let path = split(pathString, '.');
    let data = source;
    while (path.length) {
      data = get(data, path[0]);
      path.splice(0, 1);
      if (path.length && isArray(data)) {
        return concat(...map(data, d => this.buildMapValue(type, path.join('.'), d)));
      }
    }
    if (Array.isArray(type)) {
      const arrayType = (type as PropertyMapOptionsType[])[0];
      return Array.isArray(data) ? map(data, d => this.getMapValue(arrayType, d)) : this.getMapValue(arrayType, data);
    } else {
      return this.getMapValue(type, data);
    }
  }

  private buildSerializeValue(
    type: PropertyMapOptionsType | PropertyMapOptionsType[],
    source: any,
    property: string
  ): any {
    if (Array.isArray(type)) {
      const data = get(source, property);
      if (!data) return data;
      const arrayType = (type as PropertyMapOptionsType[])[0];
      return Array.isArray(data)
        ? map(data, d => this.getSerializeValue(arrayType, d))
        : this.getSerializeValue(arrayType, data);
    } else {
      return this.getSerializeValue(type, get(source, property));
    }
  }

  private getSerializeValue(type: PropertyMapOptionsType, value: any) {
    if (value === undefined) return undefined;
    if (value === null) return null;
    if (type === 'Moment') return moment.isMoment(value) ? value.toISOString() : value;
    if (type === 'Moment.Duration') return moment.isDuration(value) ? value.toISOString() : value;
    if (type === Date) return value.toISOString();
    if (type) return new ModelMapper(type as new () => any).serialize(value);
    return value;
  }

  private getMapValue(type: PropertyMapOptionsType, value: any) {
    if (value === undefined) return undefined;
    if (value === null) return null;
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

  public getPropertyMappingTree(): PropertyMappingTree {
    const tree: PropertyMappingTree = {};
    each(keys(this.propertyMapping), property => {
      tree[property] = this.propertyMapping[property];
      const type = Array.isArray(tree[property].type)
        ? head(tree[property].type as PropertyMapOptionsType[])
        : tree[property].type;
      if (!includes([undefined, 'Moment', 'Moment.Duration', Date], type as any)) {
        try {
          tree[property].propertyMapping = new ModelMapper(type as new () => any).getPropertyMappingTree();
        } catch (err) {
          console.error(property, type, err);
        }
      }
    });
    return tree;
  }
}
