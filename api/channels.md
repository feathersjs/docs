# Event channels

Event channels determine

## Connections

A connection is an object that represents a real-time connection in Feathers. It is the same object as `socket.feathers` in a [Socket.io]() and `socket.request.feathers` in a [Primus]() middleware. You can attach anything to it but most notably, when using [authentication](), it will contain the authenticated user (by default in `connection.user`) once the client has authenticated on the socket (usually by calling `app.authenticate()`).

You can get access to the `connection` object by listening to `app.on('connection', connection => {})` or `app.on('login', (user, { connection }) => {})`. The standard channel setup file in a generated application looks like this:

```js
module.exports = function(app) {
  if(!app.channel) {
    // If no real-time functionality has been configured just return
    return;
  }

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
};
```

## app.on('connection')

## app.on('login')

## Channels

## app.channel(...names)

When given one argument `app.channel(name)` returns an existing or new named [channel](#channels):

```js
app.channel('admins') // the admin channel
app.channel('authenticated') // the authenticated channel
```

When given multiples names, `app.channel(...names)` will return a combined channel. A combined channel contains a list of all connections (without duplicates) and re-directs `channel.join` and `channel.leave` calls to all its child channels.

```js
// Combine the anonymous and authenticated channel
const combinedChannel = app.channel('anonymous', 'authenticated')

// Join the admins and chat channel
app.channel('admins', 'chat').join(connection);

// Make user with id 5 leave the admins and chat channel
app.channel('admins', 'chat').leave(connection => {
  return connection.user._id === 5;
});
```

## app.channels

`app.channels` returns a list of all existing channel names.

```js
app.channel('authenticated');
app.channel('admins', 'users');

app.channels // [ 'authenticated', 'admins', 'users' ]
```

This is especially useful to e.g. remove a connection from all channels:

```js
// When a user is removed, make them leave every channel
app.service('users').on('removed', user => {
  app.channel(app.channels).leave(connection => {
    return user._id === connection.user._id;
  });
});
```

`app.channel` returns a named or combined channel both of which offer the same methods outlined below.

### channel.join(connection)

Add a connection to this channel.

### channel.leave(connection|fn)

### channel.filter(fn)

Returns a new channel filtered by a given function which gets passed the connection.

### channel.send(data)

### channel.connections

A list of all connections in 

### channel.length

Return

## Publishing events

## service.publish([event,] fn)

Register a publishing function for for a specific event or all events if no event name was given. A publishing function gets the event data and hook object (`function(data, hook)`) and returns a named or combined channel.

## app.publish([event,] fn)

