# @eherve/model-mapper

Map plain JavaScript data into class instances using property decorators, and serialize those instances back to plain data. The mapper supports nested models, arrays, dates, Moment values, inheritance, and discriminators.

## Install

```sh
npm install @eherve/model-mapper
```

Enable legacy property decorators in your TypeScript configuration:

```json
{
  "compilerOptions": {
    "experimentalDecorators": true
  }
}
```

## Map and serialize a model

```ts
import { ModelMapper, PropertyMap } from '@eherve/model-mapper';

class User {
  @PropertyMap({ source: '_id' })
  id!: string;

  @PropertyMap()
  name!: string;

  @PropertyMap({ type: Date })
  createdAt!: Date;

  @PropertyMap({ default: [] })
  roles!: string[];
}

const mapper = new ModelMapper(User);
const user = mapper.map({
  _id: 'user-1',
  name: 'Ada',
  createdAt: '2026-01-01T00:00:00.000Z',
});

user.id; // 'user-1'
user.createdAt instanceof Date; // true
user.roles; // []

mapper.serialize(user);
// {
//   _id: 'user-1',
//   name: 'Ada',
//   createdAt: '2026-01-01T00:00:00.000Z',
//   roles: []
// }
```

Only decorated properties are mapped and serialized. `source` names the input path and the serialized output path; dotted paths such as `profile.name` are supported. An absent source property leaves the destination property unchanged unless a `default` is defined. A `null` source value remains `null`.

Mutable default values are copied for each mapped object. A function supplied as `default` is called for each mapped object.

## Nested models and arrays

```ts
class Address {
  @PropertyMap()
  city!: string;
}

class Customer {
  @PropertyMap({ type: Address })
  address!: Address;

  @PropertyMap({ type: [Address], default: [] })
  previousAddresses!: Address[];
}

const customer = new ModelMapper(Customer).map({
  address: { city: 'Paris' },
  previousAddresses: [{ city: 'Lyon' }],
});
```

The `type` option also accepts `Date`, `'Moment'`, and `'Moment.Duration'`. Import `moment` in your application if you work with Moment values directly.

## Inheritance and discriminators

Decorated properties on a base class are available to subclasses. A subclass can add decorated properties or override a parent's mapping options.

```ts
import { Model } from '@eherve/model-mapper';

@Model({ discriminatorKey: 'kind' })
class Animal {
  @PropertyMap()
  kind!: string;
}

class Cat extends Animal {
  @PropertyMap()
  lives!: number;
}

const mapper = new ModelMapper(Animal, { cat: Cat });
const animal = mapper.map({ kind: 'cat', lives: 9 });
animal instanceof Cat; // true
```

Pass `discriminators` alongside `type` in `@PropertyMap()` to select subclasses for nested models or arrays. The base type must declare its discriminator key with `@Model()`.

## Custom transformations

`@PropertyMap()` accepts `map` and `serialize` callbacks. Each receives the full source, the converted value, the target under construction, and the property or source path. Mapping callbacks receive the resolved source path; serialization callbacks receive the class property name.

```ts
class Product {
  @PropertyMap({
    source: 'price.cents',
    map: (_source, cents) => cents / 100,
    serialize: (_source, euros) => Math.round(euros * 100),
  })
  price!: number;
}
```

`map()` returns `undefined` when called without a source or with a falsy source. TypeScript reflects this for omitted and explicitly nullable sources. When a source is typed `any`, check it before mapping if it may be absent.

## Development

```sh
npm ci
npm test
npm pack --dry-run
```

`npm test` builds `lib`, checks the package entry point, runs the tests, and checks source coverage. The published package contains the generated files in `lib`; `npm run build` regenerates them.

## License

MIT. See [LICENSE](LICENSE).
