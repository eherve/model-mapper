/** @format */

import { IPropertyMapOptions } from './property-map.decorator';

export interface IPropertyMappingTreeElmt extends IPropertyMapOptions {
  propertyMapping?: PropertyMappingTree;
}

export type PropertyMappingTree = { [key: string]: IPropertyMappingTreeElmt };
