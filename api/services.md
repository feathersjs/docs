# Services

"Services" are the heart of every Feathers application. Services are JavaScript objects (or instances of [ES6 classes](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Classes)) that implement [certain methods](#service-methods). Feathers itself will also add some [additional methods and functionality](#feathers-functionality) to its services.

## Service methods

Service methods are pre-defined [CRUD](https://en.wikipedia.org/wiki/Create,_read,_update_and_delete) methods that your service object can implement (or that have already been implemented by one of the [database adapters](./databases/common.md)). Below is a complete example of the Feathers *service interface* as a normal JavaScript object either returning a [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) or using [async/await](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function):

{% codetabs name="Promise", type="js" -%}
const myService = {
  find(params) {
    return Promise.resolve([]);
  },
  get(id, params) {},
  create(data, params) {},
  update(id, data, params) {},
  patch(id, data, params) {},
  remove(id, params) {},
  setup(app, path) {}
}

app.use('/my-service', myService);
{%- language name="async/await", type="js" -%}
const myService = {
  async find(params) {
    return [];
  },
  async get(id, params) {},
  async create(data, params) {},
  async update(id, data, params) {},
  async patch(id, data, params) {},
  async remove(id, params) {},
  setup(app, path) {}
}

app.use('/my-service', myService);
{%- endcodetabs %}

Services can also be an instance of an [ES6 class](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Classes):

{%- codetabs name="Promise", type="js" -%}
class MyService {
  find(params) {
    return Promise.resolve([]);
  }
  get(id, params) {}
  create(data, params) {}
  update(id, data, params) {}
  patch(id, data, params) {}
  remove(id, params) {}
  setup(app, path) {}
}

app.use('/my-service', new MyService());
{%- language name="async/await", type="js" -%}
class MyService {
  async find(params) {
    return [];
  }
  async get(id, params) {}
  async create(data, params) {}
  async update(id, data, params) {}
  async patch(id, data, params) {}
  async remove(id, params) {}
  setup(app, path) {}
}

app.use('/my-service', new MyService());
{%- endcodetabs %}

> **ProTip:** Methods are optional, and if a method is not implemented Feathers will automatically emit a `NotImplemented` error.

> __Important:__ Always use the service returned by `app.service(path)` not the service object (the `myService` object above) directly. See the [app.service documentation](#servicepath) for more information.

Service methods must return a [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) or be declared as `async` and have the following parameters:

- `id` — The identifier for the resource. A resource is the data identified by a unique id.
- `data` — The resource data.
- `params` - Any extra parameters, for example the authenticated user.

> **Important:** `params.query` contains the query parameters from the client, either passed as URL query parameters (see the [REST](./express.md) chapter) or through websockets (see [Socket.io](./socketio.md) or [Primus](./primus.md)).

Once registered, the service can be retrieved and used via [app.service()](./application.md#servicepath):

```js
const myService = app.service('my-service');

myService.find().then(items => console.log('.find()', items));
myService.get(1).then(item => console.log('.get(1)', items));
```

Keep in mind that services don't have to use databases. You could easily replace the database in the example with a package that uses some API to, for example, pull in GitHub stars or stock ticker data.

> **Important:** This section describes the general usage of service methods and how to implement them. They are already implemented by the official Feathers database adapters. For specifics on how to use the database adapters, see the [database adapters common API](./databases/common.md).


### .find(params)

`service.find(params) -> Promise` - Retrieves a list of all resources from the service. Provider parameters will be passed as `params.query`.

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

> **Note:** `find` does not have to return an array; it can also return an object. The database adapters already do this for [pagination](./databases/common.md#pagination).

### .get(id, params)

`service.get(id, params) -> Promise` - Retrieves a single resource with the given `id` from the service.

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

### .create(data, params)

`service.create(data, params) -> Promise` - Creates a new resource with `data`. The method should return a `Promise` with the newly created data. `data` may also be an array.

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


### .update(id, data, params)

`service.update(id, data, params) -> Promise` - Replaces the resource identified by `id` with `data`. The method should return a `Promise` with the complete, updated resource data. `id` can also be `null` when updating multiple records, with `params.query` containing the query criteria.

> **Important:** A successful `update` method call emits the [`updated` service event](./events.md#updated).

### .patch(id, data, params)

`patch(id, data, params) -> Promise` - Merges the existing data of the resource identified by `id` with the new `data`. `id` can also be `null` indicating that multiple resources should be patched with `params.query` containing the query criteria.

The method should return with the complete, updated resource data. Implement `patch` additionally (or instead of) `update` if you want to distinguish between partial and full updates and support the `PATCH` HTTP method.

> **Important:** A successful `patch` method call emits the [`patched` service event](./events.md#patched).


### .remove(id, params)

`service.remove(id, params) -> Promise` - Removes the resource with `id`. The method should return a `Promise` with the removed resource. `id` can also be `null`, which indicates the deletion of multiple resources, with `params.query` containing the query criteria.

> **Important:** A successful `remove` method call emits the [`removed` service event](./events.md#remove).


### .setup(app, path)

`service.setup(app, path) -> Promise` is a special method that initializes the service, passing an instance of the Feathers application and the path it has been registered on. 

For services registered before `app.listen` is invoked, the `setup` function of each registered service is called on invoking `app.listen`. For services registered after `app.listen` is invoked, `setup` is called automatically by Feathers when a service is registered.

`setup` is a great place to initialize your service with any special configuration or if connecting services that are very tightly coupled (see below), as opposed to using [hooks](../hooks/readme.md).

```js
// app.js
'use strict';

const feathers = require('@feathersjs/feathers');
const rest = require('@feathersjs/express/rest');

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


### .hooks(hooks)

Register [hooks](./hooks.md) for this service.


### .publish([event, ] publisher)

Register an event publishing callback. For more information, see the [channels chapter](./channels.md).


### .mixin(mixin)

`service.mixin(mixin) -> service` extends the functionality of a service. For more information see the [Uberproto](https://github.com/daffl/uberproto) project page.


### .on(eventname, listener)

Provided by the core [NodeJS EventEmitter .on](https://nodejs.org/api/events.html#events_emitter_on_eventname_listener). Registers a `listener` method (`function(data) {}`) for the given `eventname`.

> **Important:** For more information about service events, see the [Events chapter](./events.md).


### .emit(eventname, data)

Provided by the core [NodeJS EventEmitter .emit](https://nodejs.org/api/events.html#events_emitter_emit_eventname_args). Emits the event `eventname` to all event listeners.

> **Important:** For more information about service events, see the [Events chapter](./events.md).


### .removeListener(eventname, [ listener ])

Provided by the core [NodeJS EventEmitter .removeListener](https://nodejs.org/api/events.html#events_emitter_removelistener_eventname_listener). Removes all listeners, or the given listener, for `eventname`.

> **Important:** For more information about service events, see the [Events chapter](./events.md).
