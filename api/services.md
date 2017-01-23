# Services

Services are the heart of every Feathers application and JavaScript objects (or instances of [ES6 classes](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Classes)) with providing certain methods.

Below is a complete example of the Feathers `service interface`.

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

Service methods should return a [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) and have the following parameters:

- `id` - the identifier for the resource. A resource is the data identified by a unique id.
- `data` - the resource data.
- `params` - can contain any extra parameters, for example the authenticated user.

> **Important:** `params.query` contains the query parameters from the client (see the [REST](../rest/readme.md) and [real-time](../real-time/readme.md) providers).

Keep in mind that services don't have to use databases.  You could easily replace the database in the example with a package that uses some API, like pulling in GitHub stars or stock ticker data.

## find

`find(params)` - retrieves a list of all resources from the service. Provider parameters will be passed as `params.query`.

## get

`get(id, params) -> Promise` - retrieves a single resource with the given `id` from the service.

## create

`create(data, params) -> Promise` - creates a new resource with `data`. The method should return a Promise with the newly created data. `data` may also be an array which creates and returns a list of resources.

## udpate

`update(id, data, params) -> Promise` - replaces the resource identified by `id` with `data`. The method should return a Promise with the complete updated resource data. `id` can also be `null` when updating multiple records.

## patch

`patch(id, data, params) -> Promise` - merges the existing data of the resource identified by `id` with the new `data`. `id` can also be `null` indicating that multiple resources should be patched. The method should return with the complete updated resource data. Implement `patch` additionally to `update` if you want to separate between partial and full updates and support the `PATCH` HTTP method.

## remove

`remove(id, params) -> Promise` - removes the resource with `id`. The method should return a Promise with the removed resource. `id` can also be `null` indicating to delete multiple resources.

## setup

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

## on

## emit

## removeListener

## hooks

## filter
