/** @format */

import { clone, merge } from 'lodash';
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

export function propertyMap(options: IPropertyMapOptions = {}): PropertyDecorator {
  return function (target: Object, propertyKey: string | symbol) {
    let ownMetadata: { [key: string | symbol]: IPropertyMapOptions };
    if (!Reflect.hasOwnMetadata('propertyMap', target)) {
      ownMetadata = clone(Reflect.getMetadata('propertyMap', target) || {});
      Reflect.defineMetadata('propertyMap', ownMetadata, target);
    } else {
      ownMetadata = Reflect.getOwnMetadata('propertyMap', target);
    }
    ownMetadata[propertyKey] = merge({ source: propertyKey }, options);
  };
}

export const PropertyMap = propertyMap;
