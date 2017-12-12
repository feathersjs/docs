# Hooks

As we have seen the [previous chapter](./services.md), Feathers services are a great way to implement data storage and modification. Technically, we could implement all our application logic within services but very often an application requires similar functionality across multiple services. For example, we might want to check for all services if a user is allowed to even call the service method or add the current date to all data that we are saving. With just using services we would have to implement this every time again.

This is where Feathers hooks come in. Hooks are pluggable middleware functions that can be registered __before__, __after__ or on __error__s of a service method. You can register a single hook function or create a chain of them to create complex work-flows. 

Just like services themselves, hooks are *transport independent*. They are usually also service agnostic, meaning they can be used with ​*any*​ service. This pattern keeps your application logic flexible, composable, and much easier to trace through and debug.

> __Note:__ A full overview of the hook API can be found in the [hooks API documentation](../../api/hooks.md).

Hooks are commonly used to handle things like validation, authorization, logging, populating related entities, sending notifications and more. 

> __Pro tip:__ For more information about the design patterns behind hooks see [this blog post](https://blog.feathersjs.com/api-service-composition-with-hooks-47af13aa6c01).

## Quick example

Here is a quick example for a hook that adds a `createdAt` property to the data before calling the actual `create` service method:

```js
app.service('messages').hooks({
  before: {
    create: async context => {
      context.data.createdAt = new Date();

      return context;
    }
  }
})
```

## Hook functions

A hook function is a function that takes the [hook context](#hook-context) as the parameter and returns that context or nothing. A common pattern to make hooks more re-usable (e.g. making the `createdAt` property name from the example above configurable) is to create a wrapper function that takes those options and returns a hook function:

```js
const setTimestamp = name => {
  return async context => {
    context.data[name] = new Date();

    return context;
  }
} 

app.service('messages').hooks({
  before: {
    create: setTimestamp('createdAt'),
    update: setTimestamp('updatedAt')
  }
});
```

Now we have a re-usable hook that can set the timestamp on any property.

## Hook context

The hook `context` is an object which contains information about the service method call. It has read-only and writable properties. Read-only properties are:

- `context.app` - The Feathers application object
- `context.service` - The service this hook is currently running on
- `context.path` - The path of the service
- `context.method` - The service method
- `context.type` - The hook type (`before`, `after` or `error`)

Writeable properties are:

- `context.params` - The service method call `params`
- `context.id` - The `id` for a `get`, `remove`, `update` and `patch` service method call
- `context.data` - The `data` sent by the user in a `create`, `update` and `patch` service method call
- `context.error` - The error that was thrown (in `error` hooks)
- `context.result` - The result of the service method call (in `after` hooks)

> __Note:__ For more information about the hook context see the [hooks API documentation](../../api/hooks.md).

## Registering hooks


## Validating data

If a hook throws an error, all following hooks will be skipped and the error will be returned to the user. This makes `before` hooks a great place to validate incoming data.  We will only need the hook for `create`, `update` and `patch` since those are the only service methods that allow user submitted data:

```js
const validate = async context => {
  const { data } = context;

  // Check if there is `text` property
  if(!data.text) {
    throw new Error('Message text must exist');
  }

  // Check if it is a string and not just whitespace
  if(typeof data.text !== 'string' || data.text.trim() === '') {
    throw new Error('Message text is invalid');
  }

  // Change the data to be only the text
  // This prevents people from adding other properties to our database
  context.data = {
    text: data.text.toString()
  }

  return context;
};

app.service('messages').hooks({
  before: {
    create: validate,
    update: validate,
    patch: validate
  }
});
```

Feathers comes with its own [error library](../../api/errors.md). Throwing a Feathers error allows us to return additional information and will make sure that the error will be formatter
> __Note:__ Throwing an appropriate [Feathers errors](../../api/errors.md) allows to add more information and return the correc

## Associating data

Let's take our messages service from the previous chapter and add three things:

1. Before the services `create` or `patch` is called we will add a `createdAt` and `updatedAt` property with the current date
2. After a `find` (getting all messages) wrap the result in an object with a `data` property and some additional information.
3. Whenever an error happens (e.g. when a message wasn't found), log it to the console

## Application hooks

Sometimes we want to automatically add a hook to every service in our Feathers application. This is what application hooks can be used for. They work the same as service specific hooks but run in a more specific order:

- `before` application hooks will always run _before_ all service `before` hooks
- `after` application hooks will always run _after_ all service `after` hooks
- `error` application hooks will always run _after_ all service `error` hooks

## Error logging

A good use for application hooks is to log any service method call error. The following example logs every service method error with the path and method name as well as the error stack:

```js
app.hooks({
  error: async context => {
    console.error(`Error in '${context.path}' service method '${context.method}`, context.error.stack);
  }
});
```

## What's next?

 how to turn the messages service we just created into a REST API in the [next chapter](./rest.md).