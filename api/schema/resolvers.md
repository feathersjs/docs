# Resolvers

Resolvers dynamically resolve individual properties based on a context, in a Feathers application usually the [hook context](../hooks.md).

This provide a flexible way to do things like:
  - Populating associations
  - Securing queries and e.g. limiting requests to a user
  - Setting context (e.g. user) specific default values
  - Removing protected properties for external requests
  - Add read- and write permissions on the property level
  - Hashing passwords and validating dynamic password policies

Resolvers usually work together with [schema definitions](./schema.md) but can also be used on their own. You can create a resolver for any data type and resolvers can also be used outside of Feathers. Here is an example for a standalone resolver using a custom context:

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
  name: 'David'
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

In a Feathers application, resolvers are normally used to convert service method data and responses:

- `data` resolver - Converts the `data` from a `create`, `update` or `patch` [service method](). This can be used to e.g. hash a password before storing it in the database or to remove properties the user is not allowed to write.
- `query` resolver - Resolves [params.query](). This is often used to set default values or limit the query so a user can only request data they are allowed to see.
- `result` resolver - Resolves the data that is returned by a service call ([context.result]() in a hook). This can be used to populate associations or protect properties from being returned for external requests.

The context for these resolvers is always the [Feathers hook context]() so you can access all method call information and other services. are used through the [resolver hooks](./hooks.md).
