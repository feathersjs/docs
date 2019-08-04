# The Feathers generator (CLI)

Until now we wrote code by hand in a single file to get a better understanding how Feathers itself works. The Feathers CLI allows us to initialize a new Feathers application with a recommended structure. It also helps with

- Configuring authentication
- Generating database backed services
- Setting up database connections
- Generating hooks (with tests)
- Adding Express middleware

In this chapter we will look at installing the CLI and common patterns the generator uses to structure our server application. Further use of the CLI will be discussed in the [chat application guide](../chat/readme.md).

## Installing the CLI

The CLI should be installed globally via npm:

```
npm install @feathersjs/cli -g
```

Once successful we should now have the `feathers` command available on the command line which we can check with:

```
feathers --version
```

Which should show a version of `3.8.2` or later.

## Configure functions

The most common pattern used in the generated application is _configure functions_, functions that take the Feathers [app object](../../api/application.md) and then use it, e.g. to register services. Those functions are then passed to [app.configure](../../api/application.md#configurecallback).

Let's look at our [basic database example](../basics/databases.md):

```js
const feathers = require('@feathersjs/feathers');
const memory = require('feathers-memory');

const app = feathers();

app.use('messages', memory({
  paginate: {
    default: 10,
    max: 25
  }
}));
```

Which could be split up using a configure function like this:

```js
const feathers = require('@feathersjs/feathers');
const memory = require('feathers-memory');

const configureMessages = function(app) {
  app.use('messages', memory({
    paginate: {
      default: 10,
      max: 25
    }
  }));
};

const app = feathers();

app.configure(configureMessages);
```

Now we can move that function into a separate file like `messages.service.js` and set it as the [default module export](https://nodejs.org/api/modules.html) for that file:

```js
const memory = require('feathers-memory');

module.exports = function(app) {
  app.use('messages', memory({
    paginate: {
      default: 10,
      max: 25
    }
  }));
};
```

And then import it into `app.js` and use it:

```js
const feathers = require('@feathersjs/feathers');
const configureMessages = require('./messages.service.js');

const app = feathers();

app.configure(configureMessages);
```

This is the most common pattern how the generators split things up into separate files and any documentation example that uses the `app` object can be used in a configure function. You can create your own files that export a configure function and `require` and `app.configure` them in `app.js`

> __Note:__ Keep in mind that the order in which configure functions are called might matter, e.g. if it is using a service, that service has to be registered first.

## Hook functions

We already saw in the [hooks guide](./hooks.md) how we can create a wrapper function that allows to customize the options of a hook with the `setTimestamp` example:

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

This is also the pattern the hook generator uses but in its own file like `hooks/set-timestamp.js` which could look like this:

```js
module.exports = ({ name }) => {
  return async context => {
    context.data[name] = new Date();

    return context;
  }
}
```

Now we can use that hook like this:

```js
const setTimestamp = require('./hooks/set-timestamp.js');

app.service('messages').hooks({
  before: {
    create: setTimestamp({ name: 'createdAt' }),
    update: setTimestamp({ name: 'updatedAt' })
  }
});
```

> __Note:__ We are using an options object here which allows us to more easily add new options than function parameters.

## What's next?

In this chapter we installed the Feathers CLI (and generator) and looked at patterns that are used in structuring the generated application. Now we can use the generator to [build a full chat application](../chat/readme.md) complete with authentication and a JavaScript frontend!
