/** @format */

import { clone } from 'lodash';
import 'reflect-metadata';
import { IPropertyMapOptions } from './property-map-options.interface';

export function propertyMap(options: IPropertyMapOptions = {}): PropertyDecorator {
  return (target: any, propertyKey: string) => {
    let ownMetadata: { [key: string]: IPropertyMapOptions };
    if (!Reflect.hasOwnMetadata('propertyMap', target)) {
      ownMetadata = clone(Reflect.getMetadata('propertyMap', target) || {});
      Reflect.defineMetadata('propertyMap', ownMetadata, target);
    } else {
      ownMetadata = Reflect.getOwnMetadata('propertyMap', target);
    }
    ownMetadata[propertyKey] = {
      source: options.source || propertyKey,
      default: options.default,
      type: options.type,
      transformer: options.transformer,
      info: options.info,
    };
  };
}
