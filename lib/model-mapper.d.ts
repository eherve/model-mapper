/** @format */
import 'reflect-metadata';
import { IMappedEntity } from './mapped-entity.interface';
import { IPropertyMapOptions } from './property-map.decorator';
import { PropertyMappingTree } from './property-mapping-tree.interface';
import { Discriminators } from './types';
declare type MapResult<R, S> = 0 extends 1 & S ? R & IMappedEntity : unknown extends S ? (R & IMappedEntity) | undefined : [Exclude<S, null | undefined>] extends [never] ? undefined : [Extract<S, null | undefined>] extends [never] ? R & IMappedEntity : (R & IMappedEntity) | undefined;
export declare class ModelMapper<T> {
    private _type;
    protected discriminators?: Discriminators | undefined;
    get type(): new () => T;
    protected target: any;
    protected propertyMapping: {
        [key: string]: IPropertyMapOptions;
    };
    protected discriminatorKey?: string;
    constructor(_type: new () => T, discriminators?: Discriminators | undefined);
    map(): undefined;
    map<R extends T = T>(source: object): R & IMappedEntity;
    map<R extends T = T, S = unknown>(source: S): MapResult<R, S>;
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
export {};
