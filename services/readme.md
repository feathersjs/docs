![Feathers Services](/img/header-services.jpg)

# Services

Services are the heart of every Feathers application. They perform the application-level i/o, helping you get data into and out of your app.  

A service is simply a JavaScript object that offers one or more of the available service methods:
 * `find` 
 * `get` 
 * `create` 
 * `update` 
 * `patch` 
 * `remove` 
 * `setup` 

Services can be used just like an [Express middleware](http://expressjs.com/en/guide/using-middleware.html):

```js
 app.use('/path', serviceObject)
```

There are three common uses for services:

 1. Facilitating Data Storage
 2. Communicating with an External API
 3. Real-time proxying a legacy server.
 
## Services for Data Storage
The most common use for a service is data storage.  Thanks to its simple API and zealous community of developers, Feathers supports more data storage options than any other real-time framework.  It also features a familiar query syntax for working with any of the database adapters.  (See the section on [Databases](/databases/readme.md))

![Use Services to connect to a Data Store](/img/services-data-store.jpg)

## Services for External APIs
Services can also be used to communicate with other API providers.  The community has published some great modules:

* [feathers-twilio](https://github.com/feathersjs/feathers-twilio) for handling calls and SMS messages over the Twilio API.
* [feathers-stripe](https://github.com/feathersjs/feathers-stripe) for processing financial transactions and managing customer data through the Stripe API.
* [feathers-mailgun](https://github.com/feathersjs/feathers-mailgun) for sending transactional emails over the Mailgun API.

![Use Services to connect to External APIs](/img/services-external-api.jpg)

## Services that Real-time Proxy a Legacy Server
Services provide an easy path for incrementally upgrading a legacy application to work with a modern API.  This is usually done in three steps:

 1. Logically map service methods to the existing legacy endpoints. This might involve using multiple services.
 2. Set up each service method to make the request to the legacy API, acting as proxy for the user.  
 3. Update client-side applications to use the Feathers service's endpoints.
 
![Use Services as a Real-time Proxy for your Legacy Servers](/img/services-real-time-proxy.jpg)

## A Basic Example

A Feathers application with a very simple service and the [REST provider](../rest/readme.md) set up can look like this:

```js
// app.js
const feathers = require('feathers');
const rest = require('feathers-rest');
const app = feathers();

app.configure(rest());
app.use('/messages', {
  get(id, params) {
    return Promise.resolve({
      id,
      read: false,
      text: `Feathers is great!`,
      createdAt: new Date().getTime()
    });
  }
});

app.listen(3030);
```

After running

```
$ npm install feathers feathers-rest
$ node app.js
```

When going to [localhost:3030/messages/1](http://localhost:3030/messages/1) you will see:

```json
{
  "id": 1,
  "read": false,
  "text": "Feathers is great!",
  "createdAt": 1458490631911
}
```

## Retrieving services

When registering a service with `app.use('/messages', messageService)` Feathers makes a shallow copy of that object and adds its own functionality. This means that to use Feathers functionality (like [real-time events](../real-time/readme.md), [hooks](../hooks/readme.md) etc.) this object has to be used. It can be retrieved using `app.service` like this:

```js
const messages = app.service('messages');
// also works with leading/trailing slashes
const messages = app.service('/messages/');

// Now we can use it on the server
messages.get(1).then(message => console.log(message.text));
```

![Basic flow of a Feathers Service](/img/service-diagram-basic.jpg)

## Service methods

Below is a description of the complete interface for a Feathers service:

```js
const myService = {
  find(params [, callback]) {},
  get(id, params [, callback]) {},
  create(data, params [, callback]) {},
  update(id, data, params [, callback]) {},
  patch(id, data, params [, callback]) {},
  remove(id, params [, callback]) {},
  setup(app, path) {}
}

app.use('/my-service', myService);
```

Or as an [ES6 class](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Classes):

```js
'use strict';

class MyService {
  find(params [, callback]) {}
  get(id, params [, callback]) {}
  create(data, params [, callback]) {}
  update(id, data, params [, callback]) {}
  patch(id, data, params [, callback]) {}
  remove(id, params [, callback]) {}
  setup(app, path) {}
}

app.use('/my-service', new MyService());
```

All of the database adapters are simply wrapper functions that accept a configuration and return an object or class that implements the `service interface`.  Here's a simplified example of what a database adapter looks like.  The callbacks are optional, so they've been removed.  Also, it's using a fake `awesomeDb` package with fake methods for demonstration purposes.

```js
// Bring in the db package.
const awesomeDb = require('some-awesome-db-package-from-node');
const awesomeDbConnection = awesomeDb({
  url: 'https://my-awesome-db-host.com/myDbName'
});

// Create an adapter based on the service interface
const awesomeDatabaseAdapter = function (options) {
  // Model represents the connection to the datasource.
  const Model = options.model;
  return {
    find(params) {
      // Do something with the Model, return a promise.
      return Model.findAll();
    },
    get(id, params) {},
    create(data, params) {},
    update(id, data, params) {},
    patch(id, data, params) {},
    remove(id, params) {},
    setup(app, path) {}
  }
}

// Pass some options into the adapter.  Use the adapter in an API endpoint.
app.use('/my-service', awesomeDatabaseAdapter({
  Model: awesomeDbConnection.useThisTableName('awesome-stuff')
});
```

> **ProTip:** Methods are optional, and if a method is not implemented Feathers will automatically emit a `NotImplemented` error.

Service methods should return a [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) and have the following parameters:

- `id` - the identifier for the resource. A resource is the data identified by a unique id.
- `data` - is the resource data.
- `params` - can contain any extra parameters, for example the authenticated user.
- `callback` - is an optional callback that can be called instead of returning a Promise. It is a Node-style callback function following the `function(error, result) {}` convention.

> **ProTip:** `params.query` contains the query parameters from the client (see the [REST](../rest/readme.md) and [real-time](../real-time/readme.md) providers), `params.data` contains any data submitted in a request body, and `params.result` contains any data returned from a data store after a service method has been called.

These methods basically reflect a [CRUD](https://en.wikipedia.org/wiki/Create,_read,_update_and_delete) interface:

- `find(params [, callback])` - retrieves a list of all resources from the service. Provider parameters will be passed as `params.query`.
- `get(id, params [, callback])` - retrieves a single resource with the given `id` from the service.
- `create(data, params [, callback])` - creates a new resource with `data`. The method should return a Promise with the newly created data. `data` may also be an array which creates and returns a list of resources.
- `update(id, data, params [, callback])` - replaces the resource identified by `id` with `data`. The method should return a Promise with the complete updated resource data. `id` can also be `null` when updating multiple records.
- `patch(id, data, params [, callback])` - merges the existing data of the resource identified by `id` with the new `data`. `id` can also be `null` indicating that multiple resources should be patched. The method should return with the complete updated resource data. Implement `patch` additionally to `update` if you want to separate between partial and full updates and support the `PATCH` HTTP method.
- `remove(id, params [, callback])` - removes the resource with `id`. The method should return a Promise with the removed resource. `id` can also be `null` indicating to delete multiple resources.

![Restful Mapping of Feathers Service Methods](/img/services-restful-actions.jpg)

## The `setup` method

`setup(app, path)` is a special method that initializes the service, passing an instance of the Feathers application and the path it has been registered on. It is called automatically by Feathers when a service is registered.

`setup` is a great place to initialize your service with any special configuration or if connecting services that are very tightly coupled (see below), as opposed to using [hooks](../hooks/readme.md).

```js
// app.js
'use strict';

const feathers = require('feathers');
const rest = require('feathers-rest');

class MessageService {
  get(id, params) {
    return Promise.resolve({
      id,
      read: false,
      text: `Feathers is great!`,
      createdAt: new Date.getTime()
    });
  }
}

class MyService {
  setup(app) {
    this.app = app;
  }

  get(name, params) {
    const messages = this.app.service('messages');
    
    return messages.get(1)
      .then(message => {
        return { name, message };
      });
  }
}

const app = feathers()
  .configure(rest())
  .use('/messages', new MessageService())
  .use('/my-service', new MyService())

app.listen(3030);
```

You can see the combined response when going to [localhost:3030/my-service/test](http://localhost:3030/my-service/test).

## Events

Any registered service will automatically turn into an event emitter that emits events when a resource has changed, that is a `create`, `update`, `patch` or `remove` service call returned successfully. For more information about events, please follow up in the [real-time events chapter](../real-time/events.md).

## Protecting Service Methods

There are some times where you may want to use a service method inside your application or allow other servers in your cluster access to a method, but you don't want to expose a service method publicly. We've created [a bundled hook](../hooks/bundled.md#disable) that makes this really easy.

```js
const hooks = require('feathers-hooks');

app.service('users').before({
  // Users can not be created by external access
  create: hooks.disable('external'),
});
```

## Extending or Customizing Services

Services are really easy to create on their own but you can also customize an existing service by extending it in a few different ways. You can learn more by checking out the [Extending Database Adapters](../databases/extending.md) section.
