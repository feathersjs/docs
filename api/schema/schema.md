# Schemas

`schema` is a small wrapper over [JSON schema](https://json-schema.org/) and [AJV](https://ajv.js.org/) to define a data schema and get the TypeScript type from that schema definition.

## Definitions

If you are not familiar with JSON schema have a look at the [official getting started guide](https://json-schema.org/learn/getting-started-step-by-step). Here is an example for a possible user schema:

:::: tabs :options="{ useUrlFragment: false }"

::: tab "JavaScript"
```js
import { schema, resolve } from '@feathersjs/schema';

export const userSchema = schema({
  $id: 'User',
  type: 'object',
  additionalProperties: false,
  required: ['email', 'password'],
  properties: {
    id: { type: 'number' },
    email: { type: 'string' },
    password: { type: 'string' }
  }
});
```
:::

::: tab "TypeScript"
```ts
import { HookContext } from './definitions';
import { schema, resolve, Infer } from '@feathersjs/schema';

export const userSchema = schema({
  $id: 'User',
  type: 'object',
  additionalProperties: false,
  required: ['email', 'password'],
  properties: {
    id: { type: 'number' },
    email: { type: 'string' },
    password: { type: 'string' }
  }
} as const);

export type User = Infer<typeof userSchema>;
```
:::

::::

> __Very Important:__ To get the correct TypeScript types the definition always needs to be declared via `schema({} as const)`.

## Extension

To create a new schema from an existing one, `schema.extend` can be used. 

## Associations

Associated schemas can be initialized via the `$ref` keyword referencing the `$id` set during schema definition.

## Query helpers

Currently there are two helpers that can be used when defining schemas for queries using the [Feathers query syntax](../databases/querying.md).

### queryProperty

The `queryProperty` helper takes a schema definition (usually `{ type: 'type' }`) and returns a schema that allows all of the Feathers query syntax (like `$gt`, `$ne` etc.) with the correct type:

```js
import { queryProperty } from '@feathersjs/schema';

export const userQuerySchema = schema({
  $id: 'UserQuery',
  type: 'object',
  additionalProperties: false,
  properties: {
    age: queryProperty({
      type: 'number
    })
  }
} as const);
```

### queryArray

`queryArray` takes a list of valid values and returns an array type that only allows those values. Combined with `schema.propertyNames` this can be used to e.g. resolve fields via the query:

```js
import { queryArray } from '@feathersjs/schema';

export const userQuerySchema = schema({
  $id: 'UserQuery',
  type: 'object',
  additionalProperties: false,
  properties: {
    $resolve: queryArray(userSchema.propertyNames),
  }
} as const);
```
