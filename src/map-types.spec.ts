/** @format */

import { ModelMapper } from './model-mapper';

class TypedModel {
  public value: string;
}

declare const nullableSource: { value: string } | null;
declare const anySource: any;

function acceptsGenericMapper<T>(mapper: ModelMapper<T>): ModelMapper<T> {
  return mapper;
}

if (false) {
  const mapper = new ModelMapper(TypedModel);
  const nullableResult = mapper.map(nullableSource);
  const explicitNullableResult = mapper.map<TypedModel>(nullableSource);
  const anyResult = mapper.map(anySource);
  const absentResult = mapper.map();

  // @ts-expect-error A nullable source may produce undefined.
  const requiredFromNullable: TypedModel = nullableResult;
  // @ts-expect-error Explicit result types do not erase source nullability.
  const requiredFromExplicitNullable: TypedModel = explicitNullableResult;
  // @ts-expect-error Calling without a source returns undefined.
  const requiredFromAbsent: TypedModel = absentResult;
  const requiredFromAny: TypedModel = anyResult;
  void requiredFromNullable;
  void requiredFromAny;
  void requiredFromExplicitNullable;
  void requiredFromAbsent;
  void acceptsGenericMapper;
}
