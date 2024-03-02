/** @format */
export declare type PropertyMapOptionsType = 'Moment' | 'Moment.Duration' | Date | (new () => any);
export interface IPropertyMapOptions {
    source?: string;
    default?: any;
    type?: PropertyMapOptionsType | PropertyMapOptionsType[];
    transformer?: (source: any, value: any, target: any, method: 'map' | 'serialize', property: string) => any;
    serialize?: boolean;
    info?: any;
}
