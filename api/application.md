# Application

[![GitHub stars](https://img.shields.io/github/stars/feathersjs/feathers.png?style=social&label=Star)](https://github.com/feathersjs/feathers/)
[![npm version](https://img.shields.io/npm/v/feathers.png?style=flat-square)](https://www.npmjs.com/package/feathers)
[![Changelog](https://img.shields.io/badge/changelog-.md-blue.png?style=flat-square)](https://github.com/feathersjs/feathers/blob/master/CHANGELOG.md)

```
$ npm install feathers --save
```

The core `feathers` module provides the ability to initialize a new Feathers application which allows to register and retrieve [services](./services.md), configure plugins and set global configuration options. An initialized Feathers application is referred to as the **app object**.

```js
// To create a Feathers server application
const feathers = require('feathers');

// To create a client side application
const feathers = require('feathers/client');

const app = feathers();
```

> **Important:** Additionally to the API outlined below, a Feathers server application also provides the exact same functionality as an [Express 4](http://expressjs.com/en/4x/api.html) application. For a more advanced use of Feathers, being familiar with Express is highly recommended. For the interaction between Express and Feathers also see the [REST](./rest.md) and [Express chapter](./express.md).


## .use(path, service)

`app.use(path, service) -> app` allows to register a [service object](./services.md) on the `path`.

```js
// Add a service.
app.use('/messages', {
  get(id) {
    return Promise.resolve({
      id,
      text: `This is the ${name} message!`
    });
  }
});
```

On the server `.use` will additionally also provide the same functionality as [Express app.use](http://expressjs.com/en/4x/api.html#app.use) if passed something other than a service object (e.g. an Express middleware or other app object).

 > **Important:** [REST](./rest.md) services are registered in the same order as any other middleware. For additional information how services and middleware interact see the [Express chapter](./express.md).


## .service(path)

`app.service(path) -> service` returns the wrapped [service object](./services.md) for the given path. Feathers internally creates a new object from each registered service. This means that the object returned by `app.service(path)` will provide the same methods and functionality as your original service object but also functionality added by Feathers and its plugins (most notably it is possible to listen to [service events](./events.md)). `path` can be the service name with or without leading and trailing slashes.

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


## .configure(callback)

`app.configure(callback) -> app` runs a `callback` function with the application as the context (`this`). It can be used to initialize plugins or services.

```js
function setupService() {
  this.use('/todos', todoService);
}

app.configure(setupService);
```


## .listen(port)

`app.listen([port]) -> HTTPServer` starts the application on the given port. It will first call the original [Express app.listen([port])](http://expressjs.com/api.html#app.listen), then run `app.setup(server)` (see below) with the server object and then return the server object.


## .setup(server)

`app.setup(server) -> app` is used to initialize all services by calling each [services .setup(app, path)](services.md#setupapp-path) method (if available).
It will also use the `server` instance passed (e.g. through `http.createServer`) to set up SocketIO (if enabled) and any other provider that might require the server instance.

Normally `app.setup` will be called automatically when starting the application via `app.listen([port])` but there are cases when it needs to be called explicitly. For more information see the [Express chapter](./express.md).


## .set(name, value)

`app.set(name, value) -> app` assigns setting `name` to `value`. 


## .get(name)

`app.get(name) -> value` retrieves the setting `name`. For more information on server side Express settings see the [Express documentation](http://expressjs.com/en/4x/api.html#app.set).

```js
app.set('port', 3030);

app.listen(app.get('port'));
```


## .hooks(hooks)

`app.hooks(hooks) -> app` allows to register application level hooks. For more information see the [application hooks section](./hooks.md#application-hooks).


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
