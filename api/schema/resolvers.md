# Resolvers

Resolvers dynamically resolve individual properties based on a context, in a Feathers application usually the [hook context](../hooks.md#hook-context).

This provide a flexible way to do things like:

  - Populating associations
  - Returning computed properties
  - Securing queries and e.g. limiting requests for a user
  - Setting context (like user) specific default values
  - Removing protected properties for external requests
  - Add read- and write permissions on the property level
  - Hashing passwords and validating dynamic password policies

Resolvers usually work together with [schema definitions](./schema.md) but can also be used on their own. You can create a resolver for any data type and resolvers can also be used outside of Feathers.

## Example

Here is an example for a standalone resolver using a custom context:

:::: tabs :options="{ useUrlFragment: false }"

::: tab "JavaScript"
```js
import { resolve } from '@feathersjs/schema';

const context = {
  async getUser (id) {
    return {
      id,
      name: 'David'
    }
  },
  async getLikes (messageId) {
    return 10;
  }
}

const messageResolver = resolve({
  properties: {
    likes: async (value, message, context) => {
      return context.getLikes(message.id);
    },
    user: async (value, message, context) => {
      return context.getUser(message.userId);
    }
  }
});

const resolvedMessage = await messageResolver.resolve({
  id: 1,
  userId: 23,
  text: 'Hello!'
}, context);

// { id: 1, userId: 10, likes: 10, text: 'Hello', user: { id: 23, name: 'David' } }
const partialMessage = await messageResolver.resolve({
  id: 1,
  userId: 23,
  text: 'Hello!'
}, context, {
  properties: [ 'id', 'text', 'user' ]
});

// { id: 1, text: 'Hello', user: { id: 23, name: 'David' } }
```
:::

::: tab "TypeScript"
```ts
import { resolve } from '@feathersjs/schema';

type User = {
  id: number;
  name: string;
}

type Message = {
  id: number;
  userId: number;
  likes: number;
  text: string;
  user: User;
}

const context = {
  async getUser (id) {
    return {
      id,
      name: 'David'
    }
  },
  async getLikes (messageId) {
    return 10;
  }
}

type Context = typeof context;

const messageResolver = resolve<Message, Context>({
  properties: {
    likes: async (value, message, context) => {
      return context.getLikes(message.id);
    },
    user: async (value, message, context) => {
      return context.getUser(message.userId);
    }
  }
});

const resolvedMessage = await messageResolver.resolve({
  id: 1,
  userId: 23,
  text: 'Hello!'
}, context);

// { id: 1, userId: 10, likes: 10, text: 'Hello', user: { id: 23, name: 'David' } }
const partialMessage: Pick<User, 'id'|'text'|'user'> = await messageResolver.resolve({
  id: 1,
  userId: 23,
  text: 'Hello!'
}, context, {
  properties: [ 'id', 'text', 'user' ]
});

// { id: 1, text: 'Hello', user: { id: 23, name: 'David' } }
```
:::

::::

## Options

A resolver takes the following options:

- `schema` (_optional_): The schema used for this resolver
- `validate` (_optional_): Validate the schema `before` or `after` resolving properties or not at all (`false`)
- `properties`: An object of property names and their resolver functions

## Resolver functions

A resolver function is an `async` function that resolves a property on a data object. It gets passed the following parameters:

- `value` - The current value which can also be `undefined`
- `data` - The initial data object
- `context` - The context for this resolver
- `status` - Additional status information like current property resolver path, the properties that should be resolved or a reference to the initial context.

```js
const userResolver = resolve({
  properties: {
    isDrinkingAge: async (value, user, context) => {
      const drinkingAge = await context.getDrinkingAge(user.country);

      return user.age >= drinkingAge;
    },
    fullName: async (value, user, context) => {
      return `${user.firstName} ${user.lastName}`;
    }
  }
})
```

## Feathers resolvers

In a Feathers application, resolvers are normally used together with a [schema definition](./schema.md) to convert service method query, data and responses. When a schema is passed to the resolver it can validate the data before or after the resolver runs. The context for these resolvers is always the [Feathers hook context](../hooks.md#hook-context).

### Data resolvers

`data` resolvers convert the `data` from a `create`, `update` or `patch` [service method](../services.md). This can be used to e.g. hash a password before storing it in the database or to remove properties the user is not allowed to write.

A data resolver can be used on a service with the `resolveData` hook:

```ts
export const userSchema = schema({
  $id: 'UserData',
  type: 'object',
  additionalProperties: false,
  required: ['email'],
  properties: {
    email: { type: 'string' },
    password: { type: 'string' }
  }
} as const);

export type User = Infer<typeof userSchema>;

export const userDataResolver = resolve<User, HookContext<Application>>({
  schema: userSchema,
  validate: 'before',
  properties: {
    password: async (password) => {
      return hashPassword(password);
    }
  }
});

app.service('users').hooks({
  create: [
    resolveData(userDataResolver)
  ]
});
```
 
### Result resolvers

`result` resolvers modify the data that is returned by a service call ([context.result](../hooks.md#context-result) in a hook). This can be used to populate associations or protect properties from being returned for external requests. A result resolver should also have a schema to know the shape of the data that will be returned but it does by default not run any validation.

A result resolver can be registered for all or individual service methods using the `resolveResult` hook.

### Query resolvers

`query` resolvers modify `params.query`. This is often used to set default values or limit the query so a user can only request data they are allowed to see.

```ts
export const messageQuerySchema = schema({
  $id: 'MessageQuery',
  type: 'object',
  additionalProperties: false,
  properties: {
    $limit: {
      type: 'number',
      minimum: 0,
      maximum: 100
    },
    $skip: {
      type: 'number'
    },
    $resolve: {
      type: 'array',
      items: { type: 'string' }
    },
    userId: queryProperty({
      type: 'number'
    })
  }
} as const);

export type MessageQuery = Infer<typeof messageQuerySchema>;

export const messageQueryResolver = resolve<MessageQuery, HookContext<Application>>({
  schema: messageQuerySchema,
  validate: 'before',
  properties: {
    userId: async (value, _query, context) => {
      if (context.params?.user) {
        return context.params.user.id;
      }

      return value;
    }
  }
});
```
