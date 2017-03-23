# FAQ

We've been collecting some commonly asked questions here. We'll either be updating the guide directly, providing answers here, or both.

## How do I create custom methods?

One important thing to know about Feathers is that it only exposes the official [service methods](../services/readme.md) to clients. While you can add and use any service method on the server, it is __not__ possible to expose those custom methods to clients.

In the [Why Feathers](../why/readme.md) chapter we discussed how the _uniform interface_ of services naturally translates into a REST API and also makes it easy to hook into the execution of known methods and emit events when they return. Adding support for custom methods would add a new level of complexity defining how to describe, expose and secure custom methods. This does not go well with Feathers approach of adding services as a small and well defined concept.

In general, almost anything that may require custom methods can also be done by creating other services. For example, a `userService.resetPassword` method can also be implemented as a password service that resets the password in the `create`:

```js
class PasswordService {
  create(data) {
    const userId = data.user_id;
    const userService = this.app.service('user');
    
    userService.resetPassword(userId).then(user => {
      // Send an email with the new password
      return sendEmail(user);
    })
  }
  
  setup(app) {
    this.app = app;
  }
}
```

## Is Feathers production ready?

## What is the difference between hooks and events?

## What do event filters do?

## How do I do associations?

## I am not getting the right HTTP error code

## I am not getting JSON errors



## How do I debug my app

It's really no different than debugging any other NodeJS app but you can refer to the [Debugging](../debugging/readme.md) section of the guide for more Feathers specific tips and tricks.

## Can I expose custom service methods?

Yes and no. You can create custom methods but they won't be exposed over sockets automatically and they won't be mapped to a REST verb (GET, POST, PUT, PATCH, DELETE). See [this section](../clients/readme.html#no-custom-methods) for more detail.

## I am getting plain text errors with a 500 status code

If you get a plain text error and a 500 status code for errors that should return different status codes, make sure you have `feathers-errors/handler` configured as described in the [error handling](../middleware/error-handling.md) chapter.

## How can I do custom methods like `findOrCreate`?

Custom functionality can almost always be mapped to an existing service method using hooks.  For example, `findOrCreate` can be implemented as a before-hook on the service's `get` method.  [See this gist](https://gist.github.com/marshallswain/9fa3b1e855633af00998) for an example of how to implement this in a before-hook.

## How do I do nested routes?

Normally we find that they actually aren't needed and that it's much better to keep your routes as flat as possible. However, if the need arises there are a couple different ways. Refer to [this section](http://docs.feathersjs.com/middleware/routing.html#nested-routes) for details.

## How do I render templates?

Feathers works just like Express so it's the exact same. We've created a [helpful little guide right here](../guides/using-a-view-engine.md).

## How do I create channels or rooms

Although Socket.io has a [concept of rooms](http://socket.io/docs/rooms-and-namespaces/) and you can always fall back to it other websocket libraries that Feathers supports do not. The Feathers way of letting a user listen to e.g. messages on a room is through [event filtering](http://docs.feathersjs.com/real-time/filtering.html). There are two ways:

1. Update the user object with the rooms they are subscribed to and filter based on those

```
// On the client
function joinRoom(roomId) {
  const user = app.get('user');
  
  return app.service('users').patch(user.id, { rooms: user.rooms.concat(roomId) });
}

// On the server
app.service('messages').filter(function(message, connection) {
  return connection.user.rooms.indexOf(message.room_id) !== -1;
});
```

The advantage of this method is that you can show offline/online users that are subscribed to a room.

2. Create a custom `join` event with a room id and then filter based on it

```js
app.use(socketio(function(io) {
  io.on('connection', function(socket) {
    socket.on('join', function(roomId) {
      socket.feathers.rooms.push(roomId);
    });
  });
}));

app.service('messages').filter(function(message, connection) {
  return connection.rooms.indexOf(message.room_id) !== -1;
});
```

The room assignment will persist only for the duration of the socket connection.

## I got a `possible EventEmitter memory leak detected` warning

This warning is not as bad as it sounds. If you got it from Feathers you most likely registered more than 64 services and/or event listeners on a Socket. If you don't think there are that many services or event listeners you may have a memory leak. Otherwise you can increase the number in the [Socket.io configuration](../real-time/socket-io.md) via `io.sockets.setMaxListeners(number)` and with [Primus](../real-time/primus.md) via `primus.setMaxListeners(number)`. `number` can be `0` for unlimited listeners or any other number of how many listeners you'd expect in the worst case.

## How do I do validation?

If your database/ORM supports a model or schema (ie. Mongoose or Sequelize) then you have 2 options.

#### The preferred way

You perform validation at the service level [using hooks](http://docs.feathersjs.com/hooks/examples.html#validation). This is better because it keeps your app database agnostic so you can easily swap databases without having to change your validations much.

If you write a bunch of small hooks that validate specific things it is easier to test and also slightly more performant because you can exit out of the validation chain early instead of having to go all the way to the point of inserting data into the database to find out if that data is invalid.

If you don't have a model or schema then validating with hooks is currently your only option. If you come up with something different feel free to submit a PR!

#### The ORM way

With ORM adapters you can perform validation at the model level:

- [Using Mongoose](http://docs.feathersjs.com/databases/mongoose.html#validation)
- [Using Sequelize](http://docs.sequelizejs.com/en/latest/docs/models-definition/#validations)

The nice thing about the model level validations is Feathers will return the validation errors to the client in a nice consistent format for you.


## How do I return related entities?

Similar to validation, it depends on if your database/ORM supports models or not.

#### The preferred way

For any of the feathers database/ORM adapters you can just use hooks to fetch data from other services [as described here](http://docs.feathersjs.com/hooks/examples.html#fetching-related-items).

This is a better approach because it keeps your application database agnostic and service oriented. By referencing the services (using `app.service().find()`, etc.) you can still decouple your app and have these services live on entirely separate machines or use entirely different databases without having to change any of your fetching code.

#### The ORM way

With mongoose you can use the `$populate` query param to populate nested documents.

```js
// Find Hulk Hogan and include all the messages he sent
app.service('user').find({
  query: {
    name: 'hulk@hogan.net',
    $populate: ['sentMessages']
  }
});
```

With Sequelize you can do this:

```js
// Find Hulk Hogan and include all the messages he sent
app.service('user').find({
  name: 'hulk@hogan.net',
  sequelize: {
    include: [{
      model: Message,
      where: { sender: Sequelize.col('user.id') }
    }]
  }
});
```

## What about Koa/Hapi/X?

There are many other Node server frameworks out there like Koa, a *"next generation web framework for Node.JS"* using ES6 generator functions instead of Express middleware or HapiJS etc. Because Feathers 2 is already [universally usable](../clients/feathers.md) we are planning the ability for it to hook into other frameworks on the server as well. More information can be found in [this issue](https://github.com/feathersjs/feathers/issues/258).

## How do I filter emitted service events?

See [this section](http://docs.feathersjs.com/real-time/filtering.html).

## How do I access the request object in hooks or services?

In short, you shouldn't need to. If you look at the [hooks chapter](../hooks/readme.md) you'll see all the params that are available on a hook.

If you still need something from the request object (for example, the requesting IP address) you can simply tack it on to the `req.feathers` object [as described here](http://docs.feathersjs.com/middleware/express.html#setting-service-parameters).

## How do I mount sub apps?

It's pretty much exactly the same as Express. There is an example of how to do this in our [Examples repository](https://github.com/feathersjs/feathers-demos/tree/master/examples/app-structure).

## How do I do some processing after sending the response to the user?

The hooks workflow allows you to handle these situations quite gracefully.  It depends on the promise that you return in your hook.  Here's an example of a hook that sends an email, but doesn't wait for a success message.

```js
function (hook) {
  
  // Send an email by calling to the email service.
  hook.app.service('emails').create({
    to: 'user@email.com',
    body: 'You are so great!'
  });
  
  // Send a message to some logging service.
  hook.app.service('logging').create(hook.data);
  
  // Return a resolved promise to immediately move to the next hook
  // and not wait for the two previous promises to resolve.
  return Promise.resolve(hook);
}
```
