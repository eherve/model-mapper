import { clone } from 'lodash';
import 'reflect-metadata';
export type Type = 'Moment' | 'Moment.Duration' | (new () => any);

export interface IOptions {
  source?: string;
  default?: any;
  trace?: boolean;
  type?: Type | Type[];
}

export function propertyMap(options: IOptions = {}): PropertyDecorator {
  return (target: any, propertyKey: string) => {
    let ownMetadata;
    if (!Reflect.hasOwnMetadata('propertyMap', target)) {
      ownMetadata = clone(Reflect.getMetadata('propertyMap', target) || {});
      Reflect.defineMetadata('propertyMap', ownMetadata, target);
    } else {
      ownMetadata = Reflect.getOwnMetadata('propertyMap', target);
    }
    ownMetadata[propertyKey] = {
      source: options.source || propertyKey,
      default: options.default,
      trace: options.trace,
      type: options.type,
    };
  };
}
