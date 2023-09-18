/** @format */
import 'reflect-metadata';
import { IMappedEntity } from './mapped-entity.interface';
import { IPropertyMapOptions } from './property-map-options.interface';
export interface IPropertyMappingTreeElmt extends IPropertyMapOptions {
    propertyMapping?: PropertyMappingTree;
}
export declare type PropertyMappingTree = {
    [key: string]: IPropertyMappingTreeElmt;
};
export declare class ModelMapper<T> {
    protected target: any;
    protected propertyMapping: {
        [key: string]: IPropertyMapOptions;
    };
    constructor(type: new () => T);
    map(source?: any): T & IMappedEntity;
    private buildValue;
    serialize(source?: T): any;
    private getSerializeValue;
    private getValue;
    private buildMoment;
    private buildMomentDuration;
    getPropertyMappingTree(): PropertyMappingTree;
}
