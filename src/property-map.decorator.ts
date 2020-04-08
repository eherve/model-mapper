export type Type = 'Moment' | 'Moment.Duration' | (new () => any);

export interface IOptions {
  source?: string;
  default?: any;
  trace?: boolean;
  type?: Type | Type[];
}

export function propertyMap(options: IOptions = {}) {
  return (target: any, propertyKey: string) => {
    if (!target.constructor._propertyMap) { target.constructor._propertyMap = {}; }
    target.constructor._propertyMap[propertyKey] = {
      source: options.source || propertyKey,
      default: options.default, trace: options.trace,
      type: options.type
    };
  };
}

