/** @format */
import { IPropertyMapOptions } from './property-map-options.interface';
export interface IPropertyMappingTreeElmt extends IPropertyMapOptions {
    propertyMapping?: PropertyMappingTree;
}
export declare type PropertyMappingTree = {
    [key: string]: IPropertyMappingTreeElmt;
};
