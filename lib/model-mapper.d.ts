/** @format */
import 'reflect-metadata';
import { IClassMapOptions } from './class-map-options.interface';
import { IMappedEntity } from './mapped-entity.interface';
import { IPropertyMapOptions } from './property-map-options.interface';
import { PropertyMappingTree } from './property-mapping-tree.interface';
export declare class ModelMapper<T> {
    protected target: any;
    protected classMapping: IClassMapOptions;
    protected propertyMapping: {
        [key: string]: IPropertyMapOptions;
    };
    constructor(type: new () => T);
    map(source?: any): T & IMappedEntity;
    serialize(source?: T): any;
    private buildMapValue;
    private buildSerializeValue;
    private getSerializeValue;
    private getMapValue;
    private buildMoment;
    private buildMomentDuration;
    getPropertyMappingTree(): PropertyMappingTree;
}
