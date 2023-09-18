/** @format */

import { IPropertyMapOptions } from './property-map-options.interface';

export interface IMappedEntity {
  getPropertyMapping(): { [key: string]: IPropertyMapOptions };
}
