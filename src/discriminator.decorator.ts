/** @format */

import 'reflect-metadata';

export const registeredDiscriminator: {
  [parent: string]: {
    key: string;
    value: any;
    target: new () => any;
  }[];
} = {};

export function Discriminator(options: { key: string; value: any }): ClassDecorator {
  return function <TFunction extends Function>(target: TFunction) {
    const parent = Object.getPrototypeOf(target);
    if (!registeredDiscriminator[parent]) registeredDiscriminator[parent] = [];
    registeredDiscriminator[parent].push({ ...options, target: target as any });
    return target;
  };
}
