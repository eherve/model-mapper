/** @format */

import { IPropertyMapOptions } from './property-map-options.interface';

export interface IPropertyMappingTreeElmt extends IPropertyMapOptions {
  propertyMapping?: PropertyMappingTree;
}

export type PropertyMappingTree = { [key: string]: IPropertyMappingTreeElmt };
