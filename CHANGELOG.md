# Changelog

## 6.3.4

### Fixed

- Make `ModelMapper` compatible with strict null checks and recent TypeScript language services.
- Type `map()` accurately when called without a source while preserving its existing runtime behavior.
- Resolve optional property source paths before mapping, callbacks, and serialization.
- Use a CommonJS-compatible Moment import that remains callable with current TypeScript versions.

## 6.3.3

### Fixed

- Preserve inherited `@PropertyMap()` metadata when mapping or serializing subclasses selected by discriminators, including subclasses without their own decorated properties.
- Merge property mappings across the prototype chain from parent to child while allowing child options to override parent options.
- Clone resolved metadata so mapping-tree inspection cannot mutate metadata stored on parent prototypes.
