/** @format */
import 'reflect-metadata';
import { IMappedEntity } from './mapped-entity.interface';
import { IPropertyMapOptions } from './property-map.decorator';
import { PropertyMappingTree } from './property-mapping-tree.interface';
import { Discriminators } from './types';
export declare class ModelMapper<T> {
    private _type;
    protected discriminators?: Discriminators;
    get type(): new () => T;
    protected target: any;
    protected propertyMapping: {
        [key: string]: IPropertyMapOptions;
    };
    protected discriminatorKey?: string;
    constructor(_type: new () => T, discriminators?: Discriminators);
    map<R extends T>(source?: any): R & IMappedEntity;
    serialize(source?: T): any;
    private buildMapValue;
    private buildSerializeValue;
    private getSerializeValue;
    private getMapValue;
    private getPropertyTypeConstructor;
    private buildMoment;
    private buildMomentDuration;
    getPropertyMappingTree(): PropertyMappingTree;
}
