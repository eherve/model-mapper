/** @format */
import 'reflect-metadata';
export declare const registeredDiscriminator: {
    [parent: string]: {
        key: string;
        value: any;
        target: new () => any;
    }[];
};
export declare function Discriminator(options: {
    key: string;
    value: any;
}): ClassDecorator;
