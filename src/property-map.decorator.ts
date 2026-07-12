/** @format */

import { cloneDeep, merge } from 'lodash';
import 'reflect-metadata';
import { ConstructorType, Discriminators } from './types';

type PropertyDecorator = (target: Object, propertyKey: string | symbol) => void;

export type PropertyMapOptionsType = 'Moment' | 'Moment.Duration' | Date | ConstructorType;

export interface IPropertyMapOptions {
  source?: string;
  default?: any;
  type?: PropertyMapOptionsType | PropertyMapOptionsType[];

  discriminators?: Discriminators;

  map?: (source: any, value: any, target: any, property: string) => any;
  serialize?: (source: any, value: any, target: any, property: string) => any;

  metadata?: any;
}

export type PropertyMapping = { [key: string]: IPropertyMapOptions };

const PROPERTY_MAP_METADATA_KEY = 'propertyMap';

export function getPropertyMapping(target: Object): PropertyMapping {
  const prototypes: Object[] = [];
  let prototype: Object | null = target;

  while (prototype && prototype !== Object.prototype) {
    prototypes.unshift(prototype);
    prototype = Object.getPrototypeOf(prototype);
  }

  return prototypes.reduce<PropertyMapping>((propertyMapping, currentPrototype) => {
    const ownMetadata = Reflect.getOwnMetadata(PROPERTY_MAP_METADATA_KEY, currentPrototype) as
      | PropertyMapping
      | undefined;
    if (!ownMetadata) return propertyMapping;

    Object.keys(ownMetadata).forEach(property => {
      propertyMapping[property] = {
        ...cloneDeep(propertyMapping[property] || {}),
        ...cloneDeep(ownMetadata[property]),
      };
    });
    return propertyMapping;
  }, {} as PropertyMapping);
}

export function propertyMap(options: IPropertyMapOptions = {}): PropertyDecorator {
  return function (target: Object, propertyKey: string | symbol) {
    let ownMetadata: { [key: string | symbol]: IPropertyMapOptions };
    if (!Reflect.hasOwnMetadata(PROPERTY_MAP_METADATA_KEY, target)) {
      ownMetadata = cloneDeep(Reflect.getMetadata(PROPERTY_MAP_METADATA_KEY, target) || {});
      Reflect.defineMetadata(PROPERTY_MAP_METADATA_KEY, ownMetadata, target);
    } else {
      ownMetadata = Reflect.getOwnMetadata(PROPERTY_MAP_METADATA_KEY, target);
    }
    ownMetadata[propertyKey] = merge({ source: propertyKey }, options);
  };
}

export const PropertyMap = propertyMap;
