/** @format */
import 'reflect-metadata';
import { IMappedEntity } from './mapped-entity.interface';
import { IPropertyMapOptions } from './property-map-options.interface';
import { PropertyMappingTree } from './property-mapping-tree.interface';
export declare class ModelMapper<T> {
    get type(): new () => T;
    private _type;
    protected target: any;
    protected propertyMapping: {
        [key: string]: IPropertyMapOptions;
    };
    constructor(type: new () => T);
    map<R extends T>(source?: any): R & IMappedEntity;
    serialize(source?: T): any;
    private buildMapValue;
    private buildSerializeValue;
    private getSerializeValue;
    private getMapValue;
    private getPropertyTypeConstructor;
    private getTypeConstructor;
    private buildMoment;
    private buildMomentDuration;
    getPropertyMappingTree(): PropertyMappingTree;
}
