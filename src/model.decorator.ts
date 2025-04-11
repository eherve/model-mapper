/** @format */

import 'reflect-metadata';
import { ConstructorType } from './types';

type ClassDecorator = (target: ConstructorType) => ConstructorType;

export type ModelOptions = {
  discriminatorKey?: string;
};

export function Model(options: ModelOptions): ClassDecorator {
  return function (target: ConstructorType) {
    (target as any).__modelOptions = options;
    return target;
  };
}
