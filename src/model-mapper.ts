/** @format */

// tslint:disable: variable-name space-before-function-paren only-arrow-functions
import {clone, concat, each, get, head, includes, isArray, keys, map, set, split} from 'lodash';
import * as moment from 'moment';
import 'reflect-metadata';
import {IMappedEntity} from './mapped-entity.interface';
import {IPropertyMapOptions, PropertyMapOptionsType} from './property-map-options.interface';
import {PropertyMappingTree} from './property-mapping-tree.interface';

export class ModelMapper<T> {
  protected target: any;
  protected propertyMapping: {[key: string]: IPropertyMapOptions};

  constructor(type: new () => T) {
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
      let value: any;
      if (typeof mapping.transformer === 'function') {
        value = mapping.transformer(source, this.buildValue(mapping.type, mapping.source, source), target, 'map');
      } else value = this.buildValue(mapping.type, mapping.source, source);
      if (value !== undefined) target[property] = value;
      if (mapping.default !== undefined && target[property] === undefined) {
        target[property] = typeof mapping.default === 'function' ? mapping.default() : mapping.default;
      }
    });
    if (typeof target.afterMapping === 'function') target.afterMapping();
    return target;
  }

  private buildValue(type: PropertyMapOptionsType | PropertyMapOptionsType[], pathString: string, source: any): any {
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
        ? map(data, d => this.getValue((type as PropertyMapOptionsType[])[0], d))
        : this.getValue((type as PropertyMapOptionsType[])[0], data);
    } else {
      return this.getValue(type, data);
    }
  }

  public serialize(source?: T): any {
    if (!source) return;
    const target: any = {};
    Object.keys(this.propertyMapping).forEach(property => {
      const mapping = this.propertyMapping[property];
      let value: any;
      if (typeof mapping.transformer === 'function') {
        value = mapping.transformer(
          source,
          this.buildSerializeValue(mapping.type, source, property),
          target,
          'serialize'
        );
      } else value = this.buildSerializeValue(mapping.type, source, property);
      if (value !== undefined) set(target, mapping.source, value);
    });
    return target;
  }

  private buildSerializeValue(
    type: PropertyMapOptionsType | PropertyMapOptionsType[],
    source: any,
    property: string
  ): any {
    if (Array.isArray(type)) {
      return (get(source, property) || []).map((value: any) =>
        this.getSerializeValue((type as PropertyMapOptionsType[])[0], value)
      );
    } else {
      return this.getSerializeValue(type, get(source, property));
    }
  }

  private getSerializeValue(type: PropertyMapOptionsType, value: any) {
    if (value === null) return null;
    if (type === 'Moment') return value.toISOString();
    if (type === 'Moment.Duration') return value.toISOString(value);
    if (type === Date) return value.toISOString();
    if (type) return new ModelMapper(type as new () => any).serialize(value);
    return value;
  }

  private getValue(type: PropertyMapOptionsType, value: any) {
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
        tree[property].propertyMapping = new ModelMapper(type as new () => any).getPropertyMappingTree();
      }
    });
    return tree;
  }
}
