/** @format */
import 'reflect-metadata';
export declare class ModelMapper<T> {
    private target;
    private propertyMapping;
    constructor(type: new () => T);
    map(source?: any): T;
    private buildValue;
    serialize(source?: T): any;
    private getSerializeValue;
    private getValue;
    private buildMoment;
    private buildMomentDuration;
}
