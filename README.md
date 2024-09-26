# ts-compare-fn

[![View this project on NPM](https://badgen.net/npm/v/ts-compare-fn)](https://www.npmjs.com/package/ts-compare-fn)
[![License](https://badgen.net/github/license/vmosyaykin/ts-compare-fn/)](./LICENSE)
[![Package minified & gzipped size](https://badgen.net/bundlephobia/minzip/ts-compare-fn)](https://bundlephobia.com/package/ts-compare-fn)

Type-safe, autocomplete-friendly, and intuitive compare function creator
with sensible defaults and a highly customizable API.

- Sort an array of objects by a single or multiple keys
- Supports nested paths, including in tuples, and custom getters
- Provides robust type inference and autocomplete support
- Works with strings, numbers, bigints, booleans, and dates
- Uses [Intl.Collator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Collator)
to compare strings for localization support
- Default locale is environment-independent
for consistency and better SSR compatibility
- Uses [numeric](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Collator/Collator#numeric)
collation by default, so that `"10.jpg", "1.jpg", "2.jpg"`
sorts as `"1.jpg", "2.jpg", "10.jpg"`
- Gracefully handles `null` and `undefined` values

## Installation

This library is published in the NPM registry and can be installed
using any compatible package manager.

```sh
# NPM
npm install ts-compare-fn --save

# Yarn
yarn add ts-compare-fn
```

## Usage

### Basic
Pick a property name to sort by. The function will infer
the type of the property and return a compare function
to use with `Array.prototype.sort` or `Array.prototype.toSorted`.
```typescript
import { compareFn } from 'ts-compare-fn';

type User = {
  id: number;
  name: string;
  address: {
    city: string;
  };
  emails: [string, string];
};

const users: User[] = [...];

// Sort by a single property
users.sort(compareFn('name'));
users.sort(compareFn('id'));

// To sort in descending order, prepend the property name with '-'
users.sort(compareFn('-name'));

// To sort by a nested property, use a dot-separated path
users.sort(compareFn('address.city'));
users.sort(compareFn('emails.0'));

// Sort by multiple properties
users.sort(compareFn('address.city', 'name'));
```

This works with array literals and standard TypeScript inference as well.
```typescript
const users = [
  { name: 'Charlie', address: { city: 'New York' } },
  { name: 'Bob', address: { city: 'London' } },
  { name: 'Alice', address: { city: 'New York' } },
].sort(compareFn('address.city', 'name'));
```

You can also create a type-specific `compare` function once and use
it throughout your codebase.
```typescript
import { compareFn } from 'ts-compare-fn';

interface User {
  name: string;
  dateOfBirth: Date;
}

export const compareUsers = compareFn<User>('name', 'dateOfBirth');
```

### Custom getters
This library allows you to pass a custom getter function to extract
a value from an object. This is useful when you need to sort by
a computed value or implement a custom sorting logic.
```typescript
import { compareFn } from 'ts-compare-fn';

type User = { dateOfBirth: Date; name: string; };
const users: User[] = [...];

// Sort by a custom getter
users.sort(compareFn((user) => daysTillBirthday(user.dateOfBirth)));

// Mix and match with property names
users.sort(compareFn('name', (user) => daysTillBirthday(user.dateOfBirth)));
```

*Note: getter return values are not cached,
so it should be a pure function
(always return the same value for the same object)*

### Options

#### Locale
The default locale is `en-u-co-eor-kn`, which means strings
are compared using the [European ordering rules](https://en.wikipedia.org/wiki/European_ordering_rules)
and the [numeric](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Collator/Collator#numeric)
collation.
You can customize this by passing an options object as the last argument.
```typescript
import { compareFn } from 'ts-compare-fn';

type User = { name: string; age: number; city: string; };
const users: User[] = [...];

// Sort using custom locale
users.sort(compareFn('name', { locale: 'fr' }));

// Or provide a custom collator instance for more control
users.sort(compareFn(
  'age',
  'name',
  { collator: new Intl.Collator('fr', { sensitivity: 'case' }) }
));

// You can also specify locale or collator for a specific property
users.sort(compareFn(
  { path: 'city', collator: new Intl.Collator('en-US') },
  { path: 'name', locale: 'fr' }
));
```

#### Default values
By default, `null` and `undefined` values are sorted to the end of the array
(beginning of the array for descending order).
You can customize this behavior by passing
a custom default value for a property.
```typescript
import { compareFn } from 'ts-compare-fn';

const compounds = [
  { name: 'Water', formula: 'H₂0' },
  { name: 'Carbon dioxide', formula: 'CO₂', freezingPoint: -78.5 },
  { name: 'Glycerol', formula: 'C₃H₈O₃', freezingPoint: 17.8 },
];

// By default, undefined values are sorted to the end
compounds.sort(compareFn('freezingPoint')); // CO₂, C₃H₈O₃, H₂0

// You can specify a custom default value
compounds.sort(compareFn(
  'freezingPoint',
  { defaultValue: 0 }
)); // CO₂, H₂0, C₃H₈O₃
```

If you want to sort by multiple properties and provide
default values for some of them, you need to provide
a sort config object with the `path` and `defaultValue` properties.
```typescript
compounds.sort(compareFn(
  { path: 'freezingPoint', defaultValue: 0 },
  'formula',
));
```

## API

### compareFn<Type>(path, options?)

#### path

``` SortablePath<Type> | `-${SortablePath<Type>}` ```

- A property name or a dot-separated path to sort by.
```typescript
const users: { name: string; address: { city: string } }[] = [...];

users.sort(compareFn('name'));
users.sort(compareFn('address.city'));
```
- Prepend with `-` to sort in descending order.
```typescript
users.sort(compareFn('-name'));
```
- Path should lead to a property of type `number`, `string`, `boolean`, `bigint`, or `Date`
- Nullishable paths are allowed
```typescript
type Address = { city?: string };
type AddressWithNull = { city: string | null | undefined };

compareFn<Address>('city');
compareFn<AddressWithNull>('city');
```
- Mixed-typed paths are not allowed
```typescript
type Address = { zip: number | string };

// Will raise a type error
compareFn<Address>('zip');

// Use a custom getter instead to coerce values to the same type
compareFn<Address>((address) => String(address.zip));
```
- Sorting by a tuple element is supported, but not an array element
```typescript
type User = { emails: [string, string], favorites: string[] };

compareFn<User>('emails.0');

// Will raise a type error
compareFn<User>('favorites.0');

// For non-empty arrays, use a [Type, ...Type[]] syntax
type User = { phones: [string, ...string[]] };
compareFn<User>('phones.0');
```

#### options

``` { locale?, collator? } & { defaultValue? } ```

##### locale (optional)
A string representing the locale to use for string comparison.
See [Intl.Collator#locales](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Collator/Collator#locales).
Ignored if `collator` is provided.
##### collator (optional)
An instance of `Intl.Collator` to use for string comparison.
See [Intl.Collator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Collator).
You can also provide a custom object with the `compare` method that has the signature `(a: string, b: string) => number`.
#### defaultValue (optional)
A value to use for sorting `null` and `undefined` values.
Should be of the same type as the property being sorted.

### compareFn(getter, options?)

#### getter

``` (item: Type) => number | undefined | null ```

``` (item: Type) => string | undefined | null ```

``` (item: Type) => boolean | undefined | null ```

``` (item: Type) => bigint | undefined | null ```

``` (item: Type) => Date | undefined | null ```

- A function that takes an object of type `Type` and returns a value to sort by.
- The return value should be of type `number`, `string`, `boolean`, `bigint`, or `Date`.
- Nullishable return values are allowed.
- The function should be pure (always return the same value for the same object).
- Getter return values are not cached, so it should not perform heavy computations
when dealing with large arrays.

#### options

``` { locale?, collator? } ```

See [locale](#locale-optional) and [collator](#collator-optional) for details.

### compareFn(...sortConfigs, options?)

#### SortConfig<Type>

``` SortablePath<Type> | `-${SortablePath<Type>}` | Getter<Type> ```
- A property name, a dot-separated path, or a custom getter to sort by. See [path](#path) and [getter](#getter) for details.

``` { path: SortablePath<Type> | `-${SortablePath<Type>}`, ...options? } ```
``` { get: Getter<Type>, ...options? } ```
- A way to provide different options for each property being sorted.
- See [path](#path), [getter](#getter), and [options](#options) for details.

```typescript
import { compareFn } from 'ts-compare-fn';

type Village = {
  name: string;
  country: string;
  longitude: number;
  latitude: number;
};
const villages: Village[] = [...];

// Sort by multiple properties with custom options
villages.sort(compareFn(
  {
    path: 'country',
    collator: new Intl.Collator('fr', { sensitivity: 'base' })
  },
  {
    path: 'name',
    locale: 'fr'
  },
  {
    get: ({ longitude, latitude }) => getNearestCity(longitude, latitude),
    defaultValue: 'Paris',
  }
));
```

#### options

``` { locale?, collator? } ```

Global options that apply to all properties being sorted.
See [locale](#locale-optional) and [collator](#collator-optional) for details.

Options provided in `SortConfig` objects take precedence over global options.



## License

Released under [MIT License](./LICENSE).
