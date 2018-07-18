# Feathers v3 (Buzzard)

Feathers v3 comes with some great improvements and new features and we highly recommend to upgrade as soon as possible. It might look a little daunting at first but in almost every case, the new CLI will get you almost all the way there automatically. This page contains information about the quick upgrade path and more information about all the changes to upgrade from Feathers v2 to v3.

Read the release post at [Flying into 2018](https://blog.feathersjs.com/flying-into-2018-13bda623f089)

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

> The CLI will use the `directories.lib` in your `package.json` to know where your source files are located, defaulting to `src` if none provided. If you have a transpiled app/module, e.g. with babel, including a `lib` AND a `src` folder, then the most simple is to change the `directories.lib` in your `package.json` to `src`instead of `lib` so that the CLI will correctly upgrade the original source files and not the transpiled ones.

In short (for more details see below) this will:

- Upgrade all core packages to the new scoped package names and their latest versions
- Remove all `feathers-hooks` imports and single line `app.configure(hooks());` (chained `.configure(hooks())` calls will have to be removed manually))
- Add Express compatibility to any application that uses `feathers-rest` (other Feathers apps without `feathers-rest` have to be updated manually)
- Remove all `.filter` imports and calls to `service.filter` which has been replaced by channel functionality

### Adding channels

If you are using real-time (with Socket.io or Primus), add the following file as `src/channels.js`:

```js
module.exports = function(app) {
  if(typeof app.channel !== 'function') {
    // If no real-time functionality has been configured just return
    return;
  }

  app.on('connection', connection => {
    // On a new real-time connection, add it to the anonymous channel
    app.channel('anonymous').join(connection);
  });

  app.on('login', (authResult, { connection }) => {
    // connection can be undefined if there is no
    // real-time connection, e.g. when logging in via REST
    if(connection) {
      // Obtain the logged in user from the connection
      // const user = connection.user;
      
      // The connection is no longer anonymous, remove it
      app.channel('anonymous').leave(connection);

      // Add it to the authenticated user channel
      app.channel('authenticated').join(connection);

      // Channels can be named anything and joined on any condition 
      
      // E.g. to send real-time events only to admins use
      // if(user.isAdmin) { app.channel('admins').join(connection); }

      // If the user has joined e.g. chat rooms
      // if(Array.isArray(user.rooms)) user.rooms.forEach(room => app.channel(`rooms/${room.id}`).join(channel));
      
      // Easily organize users by email and userid for things like messaging
      // app.channel(`emails/${user.email}`).join(channel);
      // app.channel(`userIds/$(user.id}`).join(channel);
    }
  });

  app.publish((data, hook) => { // eslint-disable-line no-unused-vars
    // Here you can add event publishers to channels set up in `channels.js`
    // To publish only for a specific event use `app.publish(eventname, () => {})`

    // e.g. to publish all service events to all authenticated users use
    return app.channel('authenticated');
  });

  // Here you can also add service specific event publishers
  // e..g the publish the `users` service `created` event to the `admins` channel
  // app.service('users').publish('created', () => app.channel('admins'));
  
  // With the userid and email organization from above you can easily select involved users
  // app.service('messages').publish(() => {
  //   return [
  //     app.channel(`userIds/${data.createdBy}`),
  //     app.channel(`emails/${data.recipientEmail}`)
  //   ];
  // });
};
```

And require and configure it in `src/app.js` (note that it should be configured after all services so that `channels.js` can register service specific publishers):

```js
const channels = require('./channels');

// After `app.configure(services)`
app.configure(channels);
```

> __Very important:__ The `channels.js` file shown above will publish all real-time events to all authenticated users. This is already safer than the previous default but you should carefully review the [channels](./api/channels.md) documentation and implement appropriate channels so that only the right users are going to receive real-time events.

Once you migrated your application to channels you can remove all `<servicename>.filter.js` files.

### Protecting fields

Feathers v3 has a new mechanism to ensure that sensitive information never gets published to any client. To protect always protect the user password, add the [protect hook](api/authentication/local.md#protect) in `src/services/users/users.hooks.js` instead of the `remove('password')` hook:

```js
const { hashPassword } = require('@feathersjs/authentication-local').hooks;
const { hashPassword, protect } = require('@feathersjs/authentication-local').hooks;

module.exports = {
  before: {
    all: [],
    find: [ authenticate('jwt') ],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [
      // Make sure the password field is never sent to the client
      // Always must be the last hook
      protect('password')
    ],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};
```

## Updating client side applications

Client side Feathers applications can also be updated using the CLI but may need some manual intervention. Most importantly, since Feathers core now natively ships as ES6 code, the module bundler, like Webpack, has to be instructed to transpile it. More information can be found in the [client chapter](./api/client.md). For Webpack and `create-react-app` usage (which both will throw a minification error without changes), see [this section](./api/client.md#webpack).

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
| feathers/client | @feathersjs/feathers
| feathers-client | @feathersjs/client
| feathers-rest/client | @feathersjs/rest-client
| feathers-socketio/client | @feathersjs/socketio-client
| feathers-primus/client | @feathersjs/primus-client
| feathers-authentication/client | @feathersjs/authentication-client

## Documentation changes

With a better focus on Feathers core, the repositories, documentation and guides for non-core module have been moved to more appropriate locations:

- Non-core modules have been moved to the [feathersjs-ecosystem](https://github.com/feathersjs-ecosystem/) and [feathers-plus](https://github.com/feathers-plus/) organizations. _Documentation for those modules can be found in the Readme file of their respective GitHub repositories._
- Database adapter specific documentation can now be found in the respective repositories readme. Links to the repositories can be found in the [database adapters chapter](./api/databases/adapters.md)
- The `feathers-hooks-common` documentation can be found at [feathers-plus.github.io/v1/feathers-hooks-common/](https://feathers-plus.github.io/v1/feathers-hooks-common/)
- Offline and authentication-management documentation can also be found at [feathers-plus.github.io](https://feathers-plus.github.io/)
- The Ecosystem page now points to [awesome-feathersjs](https://github.com/feathersjs/awesome-feathersjs)

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
// On login and if it is a real-time connectionn, add the connection to the `authenticated` channel
app.on('login', (authResult, { connection }) => {
  if(connection) {
    const { user } = connection;

    app.channel('authenticated').join(connection);
  }
});

// Publish only `created` events from the `messages` service
app.service('messages').publish('created', (data, context) => app.channel('authenticated'));

// Publish all real-time events from all services to the authenticated channel
app.publish((data, context) => app.channel('authenticated'));
```

To only publish to rooms a user is in:

```js
// On login and if it is a real-time connection, add the connection to the `authenticated` channel
app.on('login', (authResult, { connection }) => {
  if(connection) {
    const { user } = connection;

    // Join `authenticated` channel
    app.channel('authenticated').join(connection);

    // Join rooms channels for that user
    rooms.forEach(roomId => app.channel(`rooms/${roomId}`).join(connection));
  }
});
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
const feathers = require('@feathersjs/feathers');
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

## A new Socket message format

The websocket messaging format has been updated to support proper error messages when trying to call a non-existing service or method (instead of just timing out). Using the new `@feathersjs/socketio-client` and `@feathersjs/primus-client` will automatically use that format. You can find the details in the [Socket.io client](api/client/socketio.md) and [Primus client](./api/client/primus.md) documentation.

> __Note:__ The old message format is still supported so the clients do not have to be updated at the same time.

## Deprecations and other API changes

- Callbacks are no longer supported in Feathers service methods. All service methods always return a Promise. Custom services must return a Promise or use `async/await`.
- `service.before` and `service.after` have been replaced with a single `app.hooks({ before, after })`
- `app.service(path)` only returns a service and cannot be used to register a new service anymore (via `app.service(path, service)`). Use `app.use(path, service)` instead.
- Route parameters which were previously added directly to `params` are now in `params.route`
- Express middleware like `feathers.static` is now located in `const express = require('@feathersjs/express')` using `express.static`
- Experimental TypeScript definitions have been removed from all core repositories. Development of TypeScript definitions for this version can be follow at [feathersjs-ecosystem/feathers-typescript](https://github.com/feathersjs-ecosystem/feathers-typescript). Help welcome.

## Backwards compatibility polyfills

Besides the steps outlined above, existing hooks, database adapters, services and other plugins should be fully compatible with Feathers v3 without any additional modifications.

This section contains some quick backwards compatibility polyfills for the breaking change that can be used to make the migration easier or continue to use plugins that use deprecated syntax.

### Basic service filter

This is a basic emulation of the previous event filter functionality. It does not use promises or allow modifying the data (which should now be handled by setting `hook.dispatch`).

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
