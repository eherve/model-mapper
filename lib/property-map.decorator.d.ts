/** @format */
import 'reflect-metadata';
import { ConstructorType, Discriminators } from './types';
declare type PropertyDecorator = (target: Object, propertyKey: string | symbol) => void;
export declare type PropertyMapOptionsType = 'Moment' | 'Moment.Duration' | Date | ConstructorType;
export interface IPropertyMapOptions {
    source?: string;
    default?: any;
    type?: PropertyMapOptionsType | PropertyMapOptionsType[];
    discriminators?: Discriminators;
    map?: (source: any, value: any, target: any, property: string) => any;
    serialize?: (source: any, value: any, target: any, property: string) => any;
    metadata?: any;
}
export declare function propertyMap(options?: IPropertyMapOptions): PropertyDecorator;
export declare const PropertyMap: typeof propertyMap;
export {};
