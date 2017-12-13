# Application structure

## Configure functions

The most common pattern used in the generated application is _configure functions_ which are functions that take the Feathers [app object](../../api/application.md) and then use it to e.g. register services. Those functions are then passed to [app.configure](../../api/application.md#configurecallback).

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

No we can move that function into a separate file like `messages.service.js` and set it as the [default module export](https://nodejs.org/api/modules.html) for that file:

```js
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
const memory = require('feathers-memory');
const configureMessages = require('./messages.service.js');

const app = feathers();

app.configure(configureMessages);
```

This is the most common pattern how the generators split things up into separate files and any documentation example that uses the `app` object can be used in a configure function.

> __Note:__ Keep in mind that the order in which configure functions are called might matter, e.g. if it is using a service, that service has to be registered first.

## Hook functions

We already saw in the [hooks guide](../basics/hooks.md) how we can create a wrapper function that allows to customize the options of a hook with the `setTimestamp` example:

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

## Hook registration

