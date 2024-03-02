/** @format */
import { IClassMapOptions } from './class-map-options.interface';
import { IPropertyMapOptions } from './property-map-options.interface';
export interface IMappedEntity {
    getClassMapping(): IClassMapOptions;
    getPropertyMapping(): {
        [key: string]: IPropertyMapOptions;
    };
}
