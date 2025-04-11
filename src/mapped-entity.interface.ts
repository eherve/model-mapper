/** @format */

import { IPropertyMapOptions } from './property-map.decorator';

export interface IMappedEntity {
  getPropertyMapping(): { [key: string]: IPropertyMapOptions };
}
