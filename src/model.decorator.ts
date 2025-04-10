/** @format */

import 'reflect-metadata';
import { ConstructorType } from './property-map-options.interface';

export type ModelOptions = {
  discriminatorKey?: string;
  disciminators?: {
    [key: string]: ConstructorType;
  };
};

export function Model(options: ModelOptions): ClassDecorator {
  return function <TFunction extends Function>(target: TFunction) {
    (target as any).__modelOptions = options;
    return target;
  };
}
