/** @format */
export declare type PropertyMapOptionsType = 'Moment' | 'Moment.Duration' | Date | (new () => any);
export interface IPropertyMapOptions {
    source?: string;
    default?: any;
    type?: PropertyMapOptionsType | PropertyMapOptionsType[];
    map?: (source: any, value: any, target: any, property: string) => any;
    serialize?: (source: any, value: any, target: any, property: string) => any;
    metadata?: any;
}
