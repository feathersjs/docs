# Feathers v3 (Buzzard)

## Quick upgrade

To quickly upgrade any Feathers plugin or application you can use the `upgrade` command from the new CLI. First, if you have it installed, uninstall the old `feathers-cli`:

```
npm uninstall feathers-cli -g
```

Then install `@feathersjs/cli` and upgrade a project:

```
npm install @feathersjs/cli -g
cd path/to/project
feathers upgrade
```

In short (for more details see below) this will:

- Upgrade all core packages to the new scoped package names and their latest versions
- Remove all `feathers-hooks` imports and single line `app.configure(hooks());` (chained `.configure(hooks())` calls will have to be removed manually))
- Add Express compatibility to any application that uses `feathers-rest` (other Feathers apps without `feathers-rest` have to be updated manually)
- Remove all `.filter` imports and calls to `service.filter` which has been replaced by channel functionality


If you are using real-time (with Socket.io or Primus), add the following file as `src/channels.js`:

```js
module.exports = function(app) {
  app.on('connection', connection => {
    // On a new real-time connection, add it to the
    // anonymous channel
    app.channel('anonymous').join(connection);
  });

  app.on('login', (user, { connection }) => {
    // connection can be undefined if there is no
    // real-time connection, e.g. when logging in via REST
    if(connection) {
      // The connection is no longer anonymous, remove it
      app.channel('anonymous').leave(connection);

      // Add it to the authenticated user channel
      app.channel('authenticated').join(connection);

      // Channels can be named anything and joined on any condition 
      // E.g. to send real-time events only to admins use

      // if(user.isAdmin) { app.channel('admins').join(conneciton); }

      // If the user has joined e.g. chat rooms
      
      // user.rooms.forEach(room => app.channel(`rooms/${room.id}`).join(channel))
    }
  });

  app.publish((data, hook) => {
    // Here you can add event publishers to channels set up in `channels.js`
    // To publish only for a specific event use `app.publish(eventname, () => {})`

    // publish all service events to all authenticated users users
    // return app.channel('authenticated');
  });

  // you can also add service specific publisher via

  // for a specific event
  // app.service('name').publish(eventName, (data, hook) => {});

  // For all events on that service
  // app.service('name').publish((data, hook) => {});
};
```

And require and configure it in `src/app.js` (note that it should be configured after all services so that
`channels.js` can register service specific publishers):

```js
const channels = require('./channels');

// after `app.configure(services)`
app.configure(channels);
```

## `@feathersjs` npm scope

All Feathers core modules have been moved to the `@feathersjs` npm scope. This makes it more clear which modules are considered core and which modules are community supported and also allows us to more easily manage publishing permissions. The following modules have been renamed:

### Main Feathers

| Old name | Scoped name
| -- | --
| feathers | @feathersjs/feathers
| feathers-cli | @feathersjs/cli
| feathers-commons | @feathersjs/commons
| feathers-rest | @feathersjs/express/rest
| feathers-socketio | @feathersjs/socketio
| feathers-primus | @feathersjs/primus
| feathers-errors | @feathersjs/errors
| feathers-configuration | @feathersjs/configuration
| feathers-socket-commons | @feathersjs/socket-commons

### Authentication

| Old name | Scoped name
| -- | --
| feathers-authentication | @feathersjs/authentication
| feathers-authentication-jwt | @feathersjs/authentication-jwt
| feathers-authentication-local | @feathersjs/authentication-local
| feathers-authentication-oauth1 | @feathersjs/authentication-oauth1
| feathers-authentication-oauth2 | @feathersjs/authentication-oauth2
| feathers-authentication-client | @feathersjs/authentication-client

### Client side Feathers

| Old name | Scoped name
| -- | --
| feathers/client | @feathersjs
| feathers-client | @feathersjs/client
| feathers-rest/client | @feathersjs/rest-client
| feathers-socketio/client | @feathersjs/socketio-client
| feathers-primus/client | @feathersjs/primus-client
| feathers-authentication/client | @feathersjs/authentication-client

## Framework independent

`@feathersjs/feathers` v3 is framework independent and will work on the client and in Node out of the box. This means that it is not extending Express by default anymore.

Instead `@feathersjs/express` provides the framework bindings and the REST provider (previously `feathers-rest`) in either `require('@feathersjs/express').rest` or `@feathersjs/express/rest`. `@feathersjs/express` also brings Express built-in middleware like `express.static` and the recently included `express.json` and `express.urlencoded` body parsers. Once a Feathers application is "expressified" it can be used like the previous version:

__Before__

```js
const feathers = require('feathers');
const bodyParser = require('body-parser');
const rest = require('feathers-rest');
const errorHandler = require('feathers-errors/handler');

const app = feathers();

app.configure(rest());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Register an Express middleware
app.get('/somewhere', function(req, res) {
  res.json({ message: 'Data from somewhere middleware' });
});
// Statically host some files
app.use('/', feathers.static(__dirname));

// Use a Feathers friendly Express error handler
app.use(errorHandler());
```

__Now__

```js
const feathers = require('@feathersjs/feathers');
const express = require('@feathersjs/express');

// Create an Express compatible Feathers application
const app = express(feathers());

// Add body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Initialize REST provider (previous in `feathers-rest`)
app.configure(express.rest());

// Register an Express middleware
app.get('/somewhere', function(req, res) {
  res.json({ message: 'Data from somewhere middleware' });
});
// Statically host some files
app.use('/', express.static(__dirname));

// Use a Feathers friendly Express error handler
app.use(express.errorHandler());
```

## Hooks in core

The `feathers-hooks` plugin is now a part of core and no longer has to be imported and configured. All services will have hook functionality included right away. Additionally it is now also possible to define different data that should be sent to the client in `hook.dispatch` which allows to properly secure properties that should not be shown to a client.

__Before__

```js
const feathers = require('feathers');
const hooks = require('feathers-hooks');

const app = feathers();

app.configure(hooks());
app.use('/todos', {
  get(id) {
    return Promise.resolve({
      message: `You have to do ${id}`
    });
  }
});

app.service('todos').hooks({
  after: {
    get(hook) {
      hook.result.message = `${hook.result.message}!`;
    }
  }
});
```

__Now__

```js
const feathers = require('feathers');

const app = feathers();

app.use('/todos', {
  get(id) {
    return Promise.resolve({
      message: `You have to do ${id}`
    });
  }
});

app.service('todos').hooks({
  after: {
    get(hook) {
      hook.result.message = `${hook.result.message}!`;
    }
  }
});
```

## Event channels and publishing

Previously, filters were used to run for every event and every connection to determine if the event should be sent or not.

Event channels are a more secure and performant way to define which connections to send real-time events to. Instead of running for every event and every connection you define once which channels a connection belongs to when it is established or authenticated.

```js
// TODO more details and examples for channesl
```

## Better separation of client and server side modules

Feathers core was working on the client and the server since v2 but it wasn't always entirely clear which related modules should be used how. Now all client side connectors are located in their own repositories while the main Feathers repository can be required the same way on the client and the server.

__Before__

```js
const io = require('socket.io-client');
const feathers = require('feathers/client');
const hooks = require('feathers-hooks');
const socketio = require('feathers-socketio/client');
const auth = require('feathers-authentication-client');

const socket = io();
const app = feathers()
  .configure(hooks())
  .configure(socketio(socket))
  .configure(auth());
```

__Now__

```js
const io = require('socket.io-client');
const feathers = require('@feathers/feathers');
const socketio = require('@feathersjs/socketio-client');
const auth = require('@feathersjs/authentication-client');

const socket = io();
const app = feathers()
  .configure(socketio(socket))
  .configure(auth());
```

## Node 6+

The core repositories mentioned above also have been migrated to be directly usable (e.g. when npm installing the repository as a Git/GitHub dependency) without requiring a Babel transpilation step.

Since all repositories make extensive use of ES6 that also means that Node 4 is no longer supported.

Also see [/feathers/issues/608](https://github.com/feathersjs/feathers/issues/608).

## Deprecations and other API changes

- Callbacks are no longer supported in Feathers service methods. All service methods always return a Promise. Custom services must return a Promise or use `async/await`.
- `service.before` an `service.after` have been replaced with a single `app.hooks({ before, after })`
- `app.service(path)` only returns a service and can not be used to register a new service anymore (via `app.service(path, service)`). Use `app.use(path, service)` instead.
- Route parameters which were previously added directly to `params` are now in `params.route`
- Express middleware like `feathers.static` is now located in `const express = require('@feathersjs/express')` using `express.static`

## Backwards compatibility

Besides the steps outlined above, existing hooks, database adapters, services and other plugins should be fully compatible with Feathers v3 without any additional modifications.

This section contains some quick backwards compatibility polyfills for the breaking change that can be used to make the migration easier or continue to use plugins that use deprecated syntax.

### Basic service filter

This is a basic emulation of the previous event filter functionality. It does not use promises or allows modifying the data (which should now be handled by setting `hook.dispatch`).

```js
app.mixins.push(service => {
  service.mixin({
    filter(eventName, callback) {
      const args = callback ? [ eventName ] : [];

      // todos.filter('created', function(data, connection, hook) {});
      if(!callback) {
        callback = eventName;
      }

      // A publisher function that sends to the `authenticated`
      // channel that we defined in the quick upgrade section above
      args.push((data, hook) => app.channel('authenticated')
        .filter(connection =>
          callback(data, connection, hook)
        )
      );

      service.publish(... args);
    }
  });
});
```

### Route parameters

```js
app.hooks({
  before(hook) {
    Object.assign(hook.params, hook.params.route);

    return hook;
  }
})
```

### `.before` and `.after` hook registration

```js
app.mixins.push(service => {
  service.mixin({
    before(before) {
      return this.hooks({ before });
    },

    after(after) {
      return this.hooks({ after });
    },    
  })
});
```
