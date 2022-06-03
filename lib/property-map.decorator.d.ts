import 'reflect-metadata';
export declare type Type = 'Moment' | 'Moment.Duration' | (new () => any);
export interface IOptions {
    source?: string;
    default?: any;
    trace?: boolean;
    type?: Type | Type[];
    transformer?: (source: any, value: any) => any;
}
export declare function propertyMap(options?: IOptions): PropertyDecorator;
