/** @format */
import 'reflect-metadata';
import { ConstructorType } from './property-map-options.interface';
export declare type ModelOptions = {
    discriminatorKey?: string;
    disciminators?: {
        [key: string]: ConstructorType;
    };
};
export declare function Model(options: ModelOptions): ClassDecorator;
