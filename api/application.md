# Application

[![GitHub stars](https://img.shields.io/github/stars/feathersjs/feathers.png?style=social&label=Star)](https://github.com/feathersjs/feathers/)
[![npm version](https://img.shields.io/npm/v/feathers.png?style=flat-square)](https://www.npmjs.com/package/feathers)
[![Changelog](https://img.shields.io/badge/changelog-.md-blue.png?style=flat-square)](https://github.com/feathersjs/feathers/blob/master/changelog.md)

```
$ npm install @feathersjs/feathers --save
```

The core `@feathersjs/feathers` module provides the ability to initialize new Feathers application instances. It works in Node, React Native and the browser (see the [client](./client.md) chapter for more information). Each instance allows for registration and retrieval of [services](./services.md), [hooks](./hooks.md), plugin configuration, and getting and setting configuration options. An initialized Feathers application is referred to as the **app object**.

```js
const feathers = require('@feathersjs/feathers');

const app = feathers();
```

## .use(path, service)

`app.use(path, service) -> app` allows registering a [service object](./services.md) on a given `path`.

```js
// Add a service.
app.use('/messages', {
  get(id) {
    return Promise.resolve({
      id,
      text: `This is the ${id} message!`
    });
  }
});
```

## .service(path)

`app.service(path) -> service` returns the wrapped [service object](./services.md) for the given path. Feathers internally creates a new object from each registered service. This means that the object returned by `app.service(path)` will provide the same methods and functionality as your original service object but also functionality added by Feathers and its plugins like [service events](./events.md) and [additional methods](./services.md#feathers-functionality). `path` can be the service name with or without leading and trailing slashes.

```js
const messageService = app.service('messages');

messageService.get('test').then(message => console.log(message));

app.use('/my/todos', {
  create(data) {
    return Promise.resolve(data);
  }
});

const todoService = app.service('my/todos');
// todoService is an event emitter
todoService.on('created', todo => 
  console.log('Created todo', todo)
);
```

## .hooks(hooks)

`app.hooks(hooks) -> app` allows registration of application-level hooks. For more information see the [application hooks section in the hooks chapter](./hooks.md#application-hooks).

## .publish([event, ] publisher)

`app.publish([event, ] publisher) -> app` registers a global event publisher. For more information see the [channels publishing](./channels.md#publishing) chapter.

## .configure(callback)

`app.configure(callback) -> app` runs a `callback` function that gets passed the application object. It is used to initialize plugins or services.

```js
function setupService(app) {
  app.use('/todos', todoService);
}

app.configure(setupService);
```

## .listen(port)

`app.listen([port]) -> HTTPServer` starts the application on the given port. It will set up all configured transports (if any) and then run `app.setup(server)` (see below) with the server object and then return the server object.

`listen` will only be available if a server side transport (REST, Socket.io or Primus) has been configured.

## .setup([server])

`app.setup([server]) -> app` is used to initialize all services by calling each [services .setup(app, path)](services.md#setupapp-path) method (if available).
It will also use the `server` instance passed (e.g. through `http.createServer`) to set up SocketIO (if enabled) and any other provider that might require the server instance.

Normally `app.setup` will be called automatically when starting the application via `app.listen([port])` but there are cases when it needs to be called explicitly.

## .set(name, value)

`app.set(name, value) -> app` assigns setting `name` to `value`. 

## .get(name)

`app.get(name) -> value` retrieves the setting `name`. For more information on server side Express settings see the [Express documentation](http://expressjs.com/en/4x/api.html#app.set).

```js
app.set('port', 3030);

app.listen(app.get('port'));
```

## .on(eventname, listener)

Provided by the core [NodeJS EventEmitter .on](https://nodejs.org/api/events.html#events_emitter_on_eventname_listener). Registers a `listener` method (`function(data) {}`) for the given `eventname`.

```js
app.on('login', user => console.log('Logged in', user));
```

## .emit(eventname, data)

Provided by the core [NodeJS EventEmitter .emit](https://nodejs.org/api/events.html#events_emitter_emit_eventname_args). Emits the event `eventname` to all event listeners.

```js
app.emit('myevent', {
  message: 'Something happened'
});

app.on('myevent', data => console.log('myevent happened', data));
```

## .removeListener(eventname, [ listener ])

Provided by the core [NodeJS EventEmitter .removeListener](https://nodejs.org/api/events.html#events_emitter_removelistener_eventname_listener). Removes all or the given listener for `eventname`.

## .mixins

`app.mixins` contains a list of service mixins. A mixin is a callback (`(service, path) => {}`) that gets run for every service that is being registered. Adding your own mixins allows to add functionality to every registered service.

```js
const feathers = require('@feathersjs/feathers');
const app = feathers();

// Mixins have to be added before registering any services
app.mixins.push((service, path) => {
  service.sayHello = function() {
    return `Hello from service at '${path}'`;
  }
});

app.use('/todos', {
  get(id) {
    return Promise.resolve({ id });
  }
});

app.service('todos').sayHello();
// -> Hello from service at 'todos'
```

## .services

`app.services` contains an object of all [services](./services.md) keyed by the path they have been registered via `app.use(path, service)`. This allows to return a list of all available service names:

```js
const servicePaths = Object.keys(app.services);

servicePaths.forEach(path => {
  const service = app.service(path);

  console.log(path, service);
});
```

> __Note:__ To retrieve services, the [app.service(path)](#servicepath) method should be used (not `app.services.path` directly).

A Feathers [client](client.md) does not know anything about the server it is connected to. This means that `app.services` will _not_ automatically contain all services available on the server. Instead, the server has to provide the list of its services, e.g. through a [custom service](./services.md):

```js
app.use('/info', {
  async find() {
    return {
      services: Object.keys(app.services)
    }
  }
});
```

## .defaultService

`app.defaultService` can be a function that returns an instance of a new standard service for `app.service(path)` if there isn't one registered yet.

```js
const memory = require('feathers-memory');

// For every `path` that doesn't have a service automatically return a new in-memory service
app.defaultService = function(path) {
  return memory();
}
```

This is used by the [client transport adapters](./client.md) to automatically register client side services that talk to a Feathers server.
