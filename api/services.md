# Services

Services are the heart of every Feathers application and JavaScript objects (or instances of [ES6 classes](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Classes)) that implements [certain methods](#service-methods). Feathers itself will also add some [additional methods and functionality](#feathers-functionality) to its services.

## Service methods

Service methods are pre-defined [CRUD](https://en.wikipedia.org/wiki/Create,_read,_update_and_delete) methods that your service object can implement (or that has already been implemented by one of the [database adapters](./databases/common.md)). Below is a complete example of the Feathers *service interface*:

```js
const myService = {
  find(params) {},
  get(id, params) {},
  create(data, params) {},
  update(id, data, params) {},
  patch(id, data, params) {},
  remove(id, params) {},
  setup(app, path) {}
}

app.use('/my-service', myService);
```

Or as an [ES6 class](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Classes):

```js
'use strict';

class MyService {
  find(params) {}
  get(id, params) {}
  create(data, params) {}
  update(id, data, params) {}
  patch(id, data, params) {}
  remove(id, params) {}
  setup(app, path) {}
}

app.use('/my-service', new MyService());
```

> **ProTip:** Methods are optional, and if a method is not implemented Feathers will automatically emit a `NotImplemented` error.

Service methods have to return a [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) and have the following parameters:

- `id` - the identifier for the resource. A resource is the data identified by a unique id.
- `data` - the resource data.
- `params` - can contain any extra parameters, for example the authenticated user.

> **Important:** `params.query` contains the query parameters from the client, either passed as URL query paramters (see the [REST](./rest.md) chapter) or through websockets (see [Socket.io](./socketio.md) or [Primus](./primus.md)).

Once registered the service can be retrieved and used via [app.service()](./application.md#servicepath):

```js
const myService = app.service('my-service');

myService.find().then(items => console.log('.find()', items));
myService.get(1).then(item => console.log('.get(1)', items));
```

Keep in mind that services don't have to use databases.  You could easily replace the database in the example with a package that uses some API, like pulling in GitHub stars or stock ticker data.

> **Important:** This section describes the general use of service methods and how to implement them. They are already implemented by Feathers official database adapters. For specifics on how to use the database adapters see the [database adapters common API](./databases/common.md).


## .find(params)

`find(params) -> Promise` - retrieves a list of all resources from the service. Provider parameters will be passed as `params.query`.

```js
app.use('/messages', {
  find(params) {
    return Promise.resolve([
      {
        id: 1,
        text: 'Message 1'
      }, {
        id: 2,
        text: 'Message 2'
      }
    ]);
  }
});
```

> **Note:** `find` does not have to return an array it can also return an object. The database adapters already do this for [pagination](./databases/common.md#pagination).

## .get(id, params)

`get(id, params) -> Promise` - retrieves a single resource with the given `id` from the service.

```js
app.use('/messages', {
  get(id, params) {
    return Promise.resolve({
      id,
      text: `You have to do ${id}!`
    });
  }
});
```

## .create(data, params)

`create(data, params) -> Promise` - creates a new resource with `data`. The method should return a Promise with the newly created data. `data` may also be an array.

```js
app.use('/messages', {
  messages: [],

  create(data, params) {
    this.messages.push(data);

    return Promise.resolve(data);
  }
});
```

> **Important:** A successful `create` method call emits the [`created` service event](./events.md#created).


## .update(id, data, params)

`update(id, data, params) -> Promise` - replaces the resource identified by `id` with `data`. The method should return a Promise with the complete updated resource data. `id` can also be `null` when updating multiple records with `params.query` containing the query criteria.

> **Important:** A successful `update` method call emits the [`updated` service event](./events.md#updated).

## .patch(id, data, params)

`patch(id, data, params) -> Promise` - merges the existing data of the resource identified by `id` with the new `data`. `id` can also be `null` indicating that multiple resources should be patched with `params.query` containing the query criteria.

The method should return with the complete updated resource data. Implement `patch` additionally (or instead of) `update` if you want to separate between partial and full updates and support the `PATCH` HTTP method.

> **Important:** A successful `patch` method call emits the [`patched` service event](./events.md#patched).


## .remove(id, params)

`remove(id, params) -> Promise` - removes the resource with `id`. The method should return a Promise with the removed resource. `id` can also be `null` indicating to delete multiple resources with `params.query` containing the query criteria.

> **Important:** A successful `remove` method call emits the [`removed` service event](./events.md#remove).


## .setup(app, path)

`setup(app, path) -> Promise` is a special method that initializes the service, passing an instance of the Feathers application and the path it has been registered on. 

For services registered before `app.listen` is invoked, the `setup` function of each registered service is called upon invoking `app.listen`.  For services registered after `app.listen` is invoked, `setup` is called automatically by Feathers when a service is registered.

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


## Feathers functionality

When registering a service, Feathers (or its plugins) can also add its own methods to a service. Most notably, every service will automatically become an instance of a [NodeJS EventEmitter](https://nodejs.org/api/events.html#events_class_eventemitter).


## .hooks(hooks)

Register [hooks](./hooks.md) for this service.


## .filter(filters)

Register a set of [event filters](./events.md#event-filtering) to filter Feathers real-time events to specific clients.


## .on(eventname, listener)

Provided by the core [NodeJS EventEmitter .on](https://nodejs.org/api/events.html#events_emitter_on_eventname_listener). Registers a `listener` method (`function(data) {}`) for the given `eventname`.

> **Important:** For more information about service event see the [Events chapter](./events.md).


## .emit(eventname, data, hook)

Provided by the core [NodeJS EventEmitter .emit](https://nodejs.org/api/events.html#events_emitter_emit_eventname_args). Emits the event `eventname` to all event listeners.

> **Important:** For more information about service event see the [Events chapter](./events.md).


## .removeListener(eventname, [ listener ])

Provided by the core [NodeJS EventEmitter .removeListener](https://nodejs.org/api/events.html#events_emitter_removelistener_eventname_listener). Removes all or the given listener for `eventname`.

> **Important:** For more information about service event see the [Events chapter](./events.md).

