/** @format */
import { IPropertyMapOptions } from './property-map.decorator';
export interface IPropertyMappingTreeElmt extends IPropertyMapOptions {
    propertyMapping?: PropertyMappingTree;
}
export declare type PropertyMappingTree = {
    [key: string]: IPropertyMappingTreeElmt;
};
