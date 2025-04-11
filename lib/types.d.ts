/** @format */
export declare type ConstructorType<T = any> = new (...args: any) => T;
export declare type Discriminators = {
    [value: string]: ConstructorType;
};
