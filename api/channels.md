# Event channels

On a Feathers server with a real-time transport ([Socket.io](./socketio.md) or [Primus](./primus.md)) set up, event channels determine which connected clients to send [real-time events](./events.md) to and how the sent data should look like.

This chapter describes:

- [Real-time Connections](#connections) and how to acces them
- [Channel usage](#channels) and how to retrieve, join and leave channels
- [Publishing events](#publishing) to channels

> __Important:__ If you are not using a real-time transport server (e.g. when making a REST only API or using Feathers on the client), channel functionality is not going to be available.

Some examples where channels are used:

- Real-time events should only be sent to authenticated users
- Users should only get updates about messages if they joined a certain chat room
- Only users in the same organization should receive real-time updates about their data changes
- Only admins should be notified when new users are created
- When a user is created, modified or removed, non-admins should only receive a "safe" version of the user object (e.g. only `email`, `id` and `avatar`)

## Example

The example below shows the generated `channels.js` file illustrating how the different parts fit together:

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

      // if(user.isAdmin) { app.channel('admins').join(connection); }

      // If the user has joined e.g. chat rooms
      
      // user.rooms.forEach(room => app.channel(`rooms/${room.id}`).join(connection))
    }
  });

  // A global publisher that sends all events to all authenticated clients
  app.publish((data, context) => {
    return app.channel('authenticated');
  });
};
```

## Connections

A connection is an object that represents a real-time connection. It is the same object as `socket.feathers` in a [Socket.io](./socketio.md) and `socket.request.feathers` in a [Primus](./primus.md) middleware. You can add any kind of information to it but most notably, when using [authentication](./authentication/server.md), it will contain the authenticated user. By default it is located in `connection.user` once the client has authenticated on the socket (usually by calling `app.authenticate()` on the [client](./client.md)).

We can get access to the `connection` object by listening to `app.on('connection', connection => {})` or `app.on('login', (user, { connection }) => {})`.

> __Note:__ When a connection is terminated it will be automatically removed from all channels.

### app.on('connection')

`app.on('connection', connection => {})` is fired every time a new real-time connection is established. This is a good place to add the connection to a channel for anonymous users (in case we want to send any real-time updates to them):

```js
app.on('connection', connection => {
  // On a new real-time connection, add it to the
  // anonymous channel
  app.channel('anonymous').join(connection);
});
```

### app.on('login')

`app.on('login', (user, info) => {})` is sent by the [authentication module](./authentication/server.md) and also contains the connection in the `info` object that is passed as the second parameter. Note that it can also be `undefined` if the login happened through e.g. REST which does not support real-time connectivity. 

This is a good place to add the connection to channels related to the user (e.g. chat rooms, admin status etc.)

```js
app.on('login', (user, { connection }) => {
  // connection can be undefined if there is no
  // real-time connection, e.g. when logging in via REST
  if(connection) {
    // The connection is no longer anonymous, remove it
    app.channel('anonymous').leave(connection);

    // Add it to the authenticated user channel
    app.channel('authenticated').join(connection);

    // Channels can be named anything and joined on any condition `
    // E.g. to send real-time events only to admins use
    if(user.isAdmin) {
      app.channel('admins').join(connection);
    }

    // If the user has joined e.g. chat rooms
    user.rooms.forEach(room => {
      app.channel(`rooms/${room.id}`).join(connection);
    });
  }
});
```

> __Note:__ `(user, { connection })` is an ES6 shorthand for `(user, meta) => { const connection = meta.connection; }`, see [Destructuring assignment](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment).

## Channels

A channel is an object that contains a number of connections. It can be created via `app.channel` and allows a connection to join or leave it.

### app.channel(...names)

`app.channel(name) -> Channel`, when given a single name, returns an existing or new named channel:

```js
app.channel('admins') // the admin channel
app.channel('authenticated') // the authenticated channel
```

`app.channel(name1, name2, ... nameN) -> Channel`, when given multiples names, will return a combined channel. A combined channel contains a list of all connections (without duplicates) and re-directs `channel.join` and `channel.leave` calls to all its child channels.

```js
// Combine the anonymous and authenticated channel
const combinedChannel = app.channel('anonymous', 'authenticated')

// Join the `admins` and `chat` channel
app.channel('admins', 'chat').join(connection);

// Leave the `admins` and `chat` channel
app.channel('admins', 'chat').leave(connection);

// Make user with `_id` 5 leave the admins and chat channel
app.channel('admins', 'chat').leave(connection => {
  return connection.user._id === 5;
});
```

### app.channels

`app.channels -> [string]` returns a list of all existing channel names.

```js
app.channel('authenticated');
app.channel('admins', 'users');

app.channels // [ 'authenticated', 'admins', 'users' ]

app.channel(app.channels) // will return a channel with all connections
```

This is useful to e.g. remove a connection from all channels:

```js
// When a user is removed, make all their connections leave every channel
app.service('users').on('removed', user => {
  app.channel(app.channels).leave(connection => {
    return user._id === connection.user._id;
  });
});
```

### channel.join(connection)

`channel.join(connection) -> Channel` adds a connection to this channel. If the channel is a combined channel, add the connection to all its child channels. If the connection is already in the channel it does nothing. Returns the channel object.

```js
app.on('login', (user, { connection }) => {
  if(connection && user.isAdmin) {
    // Join the admins channel
    app.channel('admins').join(connection);

    // Calling a second time will do nothing
    app.channel('admins').join(connection);
  }
});
```

### channel.leave(connection|fn)

`channel.leave(connection|fn) -> Channel` removes a connection from this channel. If the channel is a combined channel, remove the connection from all its child channels. Also allows to pass a callback that is run for every connection and returns if the connection should be removed or not. Returns the channel object.

```js
// Make the user with `_id` 5 leave the `admins` channel
app.channel('admins').leave(connection => {
  return connection.user._id === 5;
});
```

### channel.filter(fn)

`channel.filter(fn) -> Channel` returns a new channel filtered by a given function which gets passed the connection.

```js
// Returns a new channel with all connections of the user with `_id` 5
const userFive = app.channel(app.channels)
  .filter(connection => connection.user._id === 5);
```

### channel.send(data)

`channel.send(data) -> Channel` returns a copy of this channel with customized data that should be sent for this event. Usually this should be handled by modifying either the service method result or setting client "safe" data in `context.dispatch` but in some cases it might make sense to still change the event data for certain channels.

What data will be sent as the event data will be determined by the first available in the following order:

1. `data` from `channel.send(data)`
2. `context.dispatch`
3. `context.result`

```js
app.on('connection', connection => {
  // On a new real-time connection, add it to the
  // anonymous channel
  app.channel('anonymous').join(connection);
});

// Send the `users` `created` event to all anonymous
// users but use only the name as the payload
app.service('users').publish('created', data => {
  return app.channel('anonymous').send({
    name: data.name
  });
});
```

> __Note:__ If a connection is in multiple channels (e.g. `users` and `admins`) it will get the data from the _first_ channel that it is in.

### channel.connections

`channel.connections -> [ object ]` contains a list of all connections in this channel.

### channel.length

`channel.length -> integer` returns the total number of connections in this channel.

## Publishing

Publishers are callback functions that return which channel(s) to send an event to. They can be registered at the application and the service level and for all or specific events. A publishing function gets the event data and context object (`(data, context) => {}`) and returns a named or combined channel or an array of channels. Multiple publishers can be registered. Besides the standard [service event names](./events.md#service-events) an event name can also be a [custom event](./events.md#custom-events). `context` is the [context object](./hooks.md) from the service call or an object containing `{ path, service, app, result }` for custom events.

### service.publish([event,] fn)

`service.publish([event,] fn) -> service` registers a publishing function for a specific service for a specific event or all events if no event name was given.

```js
app.on('login', (user, { connection }) => {
  // connection can be undefined if there is no
  // real-time connection, e.g. when logging in via REST
  if(connection && user.isAdmin) {
    app.channel('admins').join(connection);
  }
});

// Publish all messages service events only to its room channel
app.service('messages').publish((data, context) => {
  return app.channel(`rooms/${data.roomId}`);
});

// Publish the `created` event only to admins
app.service('users').publish('created', (data, context) => {
  return app.channel('admins');
});
```

### app.publish([event,] fn)

`app.publish([event,] fn) -> app` registers a publishing function for all services for a specific event or all events if no event name was given.

```js
app.on('login', (user, { connection }) => {
  // connection can be undefined if there is no
  // real-time connection, e.g. when logging in via REST
  if(connection) {
    app.channel('authenticated').join(connection);
  }
});

// Publish all events to all authenticated users
app.publish((data, context) => {
  return app.channel('authenticated');
});

// Publish the `log` custom event to all connections
app.publish('log', (data, context) => {
  return app.channel(app.channels);
});
```
