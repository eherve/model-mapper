/** @format */

export type ConstructorType<T = any> = new (...args: any) => T;

export type Discriminators = { [value: string]: ConstructorType };
