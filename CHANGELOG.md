# Changelog

All notable changes to `@eherve/model-mapper` are documented here.

## 6.3.4

### Fixed

- Support `strictNullChecks` and current TypeScript language services while preserving unconstrained `ModelMapper<T>` consumers.
- Return `undefined` from `map()` when no source is supplied, and reflect nullable sources in its TypeScript result type. Calls whose source is typed `any` retain the previous return type for compatibility.
- Resolve a property's source path before mapping, calling custom map callbacks, or serializing, even when the path is absent from its metadata.
- Give each mapped instance its own copy of a mutable default value; factory defaults continue to be invoked for each instance.
- Use a CommonJS-compatible Moment import.

### Verification

- Add regression tests for mutable defaults and nullable mapping types.
- Check the package entry point after building so the generated `lib` files match the source.
- Report source coverage correctly and enforce minimum coverage in `npm test`.

## 6.3.3

### Fixed

- Preserve inherited `@PropertyMap()` metadata when mapping or serializing subclasses selected by discriminators, including subclasses without their own decorated properties.
- Merge property mappings across the prototype chain from parent to child while allowing child options to override parent options.
- Clone resolved metadata so mapping-tree inspection cannot mutate metadata stored on parent prototypes.
