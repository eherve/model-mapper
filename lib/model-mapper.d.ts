/** @format */
import 'reflect-metadata';
export interface IModelMapper {
    _initials?: {
        [property: string]: any;
    };
    getPropertySource?(property: string): string | string[];
    isPropertyDirty?(property: string): boolean;
    getDirtyProperties?(): string[];
    resetDirty?(): this;
    merge?(source: any, resetDirty?: boolean): this;
}
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
