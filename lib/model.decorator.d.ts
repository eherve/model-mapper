/** @format */
import 'reflect-metadata';
import { ConstructorType } from './types';
declare type ClassDecorator = (target: ConstructorType) => ConstructorType;
export declare type ModelOptions = {
    discriminatorKey?: string;
};
export declare function Model(options: ModelOptions): ClassDecorator;
export {};
