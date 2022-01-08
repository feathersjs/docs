# Schemas

`schema` is a small wrapper over [JSON schema](https://json-schema.org/) and [AJV](https://ajv.js.org/) to define data schemas. It can also automatically get the correct TypeScript type for a schema. This allows for a single place to define your types and validation rules in plain JavaScript or TypeScript which can then be used by many other parts of a Feathers application. Schemas are also used by [resolvers](./resolvers.md) to validate and convert data before or after dynamically resolving properties.

## Definitions

If you are not familiar with JSON schema have a look at the [official getting started guide](https://json-schema.org/learn/getting-started-step-by-step). Here is an example for a possible user schema:

:::: tabs :options="{ useUrlFragment: false }"

::: tab "JavaScript"
```js
import { schema } from '@feathersjs/schema';

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
import { schema, Infer } from '@feathersjs/schema';

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

To create a new schema that extends an existing one, combine the schema properties from `schema.definition` with the new properties:

:::: tabs :options="{ useUrlFragment: false }"

::: tab "JavaScript"
```js
import { schema } from '@feathersjs/schema';

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

// The user result has all properties from the user but also an
// additional `id` added by the database
export const userResultSchema = schema({
  $id: 'UserResult',
  type: 'object',
  additionalProperties: false,
  required: [...userSchema.definition.required, 'id'],
  properties: {
    ...userSchema.definition.properties,
    id: { type: 'number' }
  }
});
```
:::

::: tab "TypeScript"
```ts
import { HookContext } from './definitions';
import { schema, Infer } from '@feathersjs/schema';

export const userSchema = schema({
  $id: 'User',
  type: 'object',
  additionalProperties: false,
  required: ['email', 'password'],
  properties: {
    email: { type: 'string' },
    password: { type: 'string' }
  }
} as const);

export type User = Infer<typeof userSchema>;

export const userResultSchema = schema({
  $id: 'UserResult',
  type: 'object',
  additionalProperties: false,
  required: [...userSchema.definition.required, 'id'],
  properties: {
    ...userSchema.definition.properties,
    id: { type: 'number' }
  }
});

export type User = Infer<typeof userResultSchema>;
```
:::

::::

## Associations

Associated schemas can be initialized via the `$ref` keyword referencing the `$id` set during schema definition.

:::: tabs :options="{ useUrlFragment: false }"

::: tab "JavaScript"
```js
import { schema } from '@feathersjs/schema';

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

export const messageSchema = schema({
  $id: 'Message',
  type: 'object',
  additionalProperties: false,
  required: ['text'],
  properties: {
    text: { type: 'string' },
    user: { $ref: 'User' }
  }
});
```
:::

::: tab "TypeScript"
In TypeScript the referenced type needs to be added explicitly.

```ts
import { HookContext } from './definitions';
import { schema, Infer } from '@feathersjs/schema';

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

export type User = Infer<typeof userSchema>;

export const messageSchema = schema({
  $id: 'Message',
  type: 'object',
  additionalProperties: false,
  required: ['text'],
  properties: {
    text: { type: 'string' },
    user: { $ref: 'User' }
  }
});

export type Message = Infer<typeof messageSchema> & {
  user: User
}
```
:::

::::

## Query helper

The `queryProperty` helper takes a schema definition (usually `{ type: '<type>' }`) and returns a schema that allows all of the [Feathers query syntax](../databases/querying.md) (like `$gt`, `$ne` etc.) with the correct type:

```js
import { queryProperty } from '@feathersjs/schema';

export const userQuerySchema = schema({
  $id: 'UserQuery',
  type: 'object',
  additionalProperties: false,
  properties: {
    age: queryProperty({
      type: 'number'
    })
  }
} as const);
```

## Validation hooks

There are two [hooks](../hooks.md) available to validate `params.query` and the service method `data`. Usually schema validation happens already through [resolvers](./resolvers.md) but these hooks can also be used individually.

### `validateQuery`

The `validateQuery` hook validates `params.query` for allowed query values. This is a great place to convert [Feathers query syntax](../databases/querying.md) values and set restrictions and defaults and also where the [query schema helper](#query-helper) is normally used: 

```js
import { schema, queryProperty, validateQuery } from '@feathersjs/schema';

export const userQuerySchema = schema({
  $id: 'UserQuery',
  type: 'object',
  additionalProperties: false,
  properties: {
    $limit: {
      type: 'number',
      default: 10,
      minimum: 10,
      maximum: 100
    },
    $skip: {
      type: 'number',
      minimum: 0
    },
    age: queryProperty({
      type: 'number'
    })
  }
} as const);

app.service('users').hooks([
  validateQuery(userQuerySchema)
]);
```

### `validateData`

The `validateData` hook validates the `data` of a `create`, `update` or `patch` [service method](../services.md) call. To allow partial updates (for `patch`) you can create an [extended schema](#extension) with no `required` fields:

```js
import { schema, queryProperty, validateData } from '@feathersjs/schema';

export const messageSchema = schema({
  $id: 'MessageData',
  type: 'object',
  additionalProperties: false,
  required: ['text'],
  properties: {
    text: { type: 'string' },
    user: { $ref: 'User' }
  }
});

export const messagePatchSchema = schema({
  $id: 'MessagePatch',
  type: 'object',
  additionalProperties: false,
  properties: {
    ...messageSchema.properties
  }
});

app.service('messages').hooks({
  create: validateData(messageSchema),
  update: validateData(messageSchema),
  path: validateData(messagePatchSchema)
});
```
