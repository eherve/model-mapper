/** @format */

// tslint:disable: variable-name space-before-function-paren only-arrow-functions
import { clone, concat, each, get, head, includes, isArray, keys, map, set, split } from 'lodash';
import * as moment from 'moment';
import 'reflect-metadata';
import { IMappedEntity } from './mapped-entity.interface';
import { ConstructorType, IPropertyMapOptions, PropertyMapOptionsType } from './property-map-options.interface';
import { PropertyMappingTree } from './property-mapping-tree.interface';

export class ModelMapper<T> {
  get type(): new () => T {
    return this._type;
  }
  private _type: new () => T;

  protected target: any;
  protected propertyMapping: { [key: string]: IPropertyMapOptions };

  constructor(type: new () => T) {
    this._type = type;
    this.target = new type();
    this.propertyMapping = Reflect.getOwnMetadata('propertyMap', Object.getPrototypeOf(this.target)) || {};
    this.target.constructor.prototype.getPropertyMapping = () => {
      return this.propertyMapping;
    };
  }

  public map<R extends T>(source?: any): R & IMappedEntity {
    if (!source) return;

    // TODO
    // const extended = this.getExtended(this.type, source);
    // if (extended) return new ModelMapper(extended).map(source);

    const target = clone(this.target);
    Object.keys(this.propertyMapping).forEach(property => {
      const mapping = this.propertyMapping[property];
      const mapValue = this.buildMapValue(mapping, mapping.source, source);
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

    // TODO
    // const extended = this.getExtended(this.type, source); // TODO if source !=
    // if (extended) return new ModelMapper(extended).serialize(source);

    const target: any = {};
    Object.keys(this.propertyMapping).forEach(property => {
      const mapping = this.propertyMapping[property];
      const serializeValue = this.buildSerializeValue(mapping, source, property);
      let value: any;
      if (typeof mapping.serialize === 'function') value = mapping.serialize(source, serializeValue, target, property);
      else value = serializeValue;
      if (value !== undefined) set(target, mapping.source, value);
    });
    return target;
  }

  private buildMapValue(mapping: IPropertyMapOptions, pathString: string, source: any): any {
    let path = split(pathString, '.');
    let data = source;
    while (path.length) {
      data = get(data, path[0]);
      path.splice(0, 1);
      if (path.length && isArray(data)) {
        return concat(...map(data, d => this.buildMapValue(mapping, path.join('.'), d)));
      }
    }
    if (Array.isArray(mapping.type) && Array.isArray(data)) return map(data, d => this.getMapValue(mapping, d));
    return this.getMapValue(mapping, data);
  }

  private buildSerializeValue(mapping: IPropertyMapOptions, source: any, property: string): any {
    if (Array.isArray(mapping.type)) {
      const data = get(source, property);
      if (!data) return data;
      return Array.isArray(data)
        ? map(data, d => this.getSerializeValue(mapping, d))
        : this.getSerializeValue(mapping, data);
    } else {
      return this.getSerializeValue(mapping, get(source, property));
    }
  }

  private getSerializeValue(mapping: IPropertyMapOptions, value: any) {
    const type = Array.isArray(mapping.type) ? mapping.type[0] : mapping.type;
    if (value === undefined) return undefined;
    if (value === null) return null;
    if (type === 'Moment') return moment.isMoment(value) ? value.toISOString() : value;
    if (type === 'Moment.Duration') return moment.isDuration(value) ? value.toISOString() : value;
    if (type === Date || type instanceof Date) return value.toISOString();
    if (type) return this.getPropertyTypeConstructor(mapping, type, value).serialize(value);
    return value;
  }

  private getMapValue(mapping: IPropertyMapOptions, value: any) {
    const type = Array.isArray(mapping.type) ? mapping.type[0] : mapping.type;
    if (value === undefined) return undefined;
    if (value === null) return null;
    if (type === 'Moment') return this.buildMoment(value);
    if (type === 'Moment.Duration') return this.buildMomentDuration(value);
    if (type === Date || type instanceof Date) return new Date(value);
    if (type === String) return new String(value);
    if (type === Number) return new Number(value);
    if (type) return this.getPropertyTypeConstructor(mapping, type, value).map(value);
    return value;
  }

  private getPropertyTypeConstructor(
    mapping: IPropertyMapOptions,
    type: ConstructorType,
    value: any
  ): ModelMapper<ConstructorType> {
    const disciminators = mapping.disciminators || (type as any).__modelOptions?.disciminators;
    if (!disciminators) return new ModelMapper(type);
    return this.getTypeConstructor(disciminators, type, value);
  }

  private getTypeConstructor(
    disciminators: { [key: string]: ConstructorType },
    type: ConstructorType,
    value: any
  ): ModelMapper<ConstructorType> {
    const discriminatorKey = (type as any).__modelOptions?.discriminatorKey;
    if (!discriminatorKey) return new ModelMapper(type);
    // console.log('\ndiscriminator', `${discriminatorKey}:${value[discriminatorKey]}`);
    const typeConstructor = disciminators[value[discriminatorKey]];
    if (!typeConstructor) return new ModelMapper(type);
    // console.log('typeConstructor', typeConstructor);
    return new ModelMapper(typeConstructor);
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
