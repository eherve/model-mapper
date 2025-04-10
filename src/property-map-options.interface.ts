/** @format */

export type ConstructorType<T = any> = new () => T;

export type PropertyMapOptionsType = 'Moment' | 'Moment.Duration' | Date | ConstructorType;

export interface IPropertyMapOptions {
  source?: string;
  default?: any;
  type?: PropertyMapOptionsType | PropertyMapOptionsType[];

  disciminators?: {
    [key: string]: ConstructorType;
  };

  map?: (source: any, value: any, target: any, property: string) => any;
  serialize?: (source: any, value: any, target: any, property: string) => any;

  metadata?: any;
}
