# FAQ

We've been collecting some commonly asked questions here. We'll either be updating the guide directly, providing answers here, or both.

## How do I create custom methods?

One important thing to know about Feathers is that it only exposes the official [service methods](../api/services.md) to clients. While you can add and use any service method on the server, it is __not__ possible to expose those custom methods to clients.

In the [Why Feathers](../guides/about/readme.md) chapter we discussed how the _uniform interface_ of services naturally translates into a REST API and also makes it easy to hook into the execution of known methods and emit events when they return. Adding support for custom methods would add a new level of complexity defining how to describe, expose and secure custom methods. This does not go well with Feathers approach of adding services as a small and well defined concept.

In general, almost anything that may require custom methods can also be done either by creating a [custom service](../api/services.md) or through [hooks](../api/hooks.md). For example, a `userService.resetPassword` method can also be implemented as a password service that resets the password in the `create` method:

```js
const crypto = require('crypto');

class PasswordService {
  create(data) {
    const userId = data.user_id;
    const userService = this.app.service('user');
    
    return userService.patch(userId, {
      passwordToken: crypto.randomBytes(48)
    }).then(user => sendEmail(user))
  }
  
  setup(app) {
    this.app = app;
  }
}
```

For more examples also see [this issue comment](https://github.com/feathersjs/feathers/issues/488#issuecomment-269687714).

## How do I do nested or custom routes?

Normally we find that they actually aren't needed and that it is much better to keep your routes as flat as possible. For example something like `users/:userId/posts` is - although nice to read for humans - actually not as easy to parse and process as the equivalent `/posts?userId=<userid>` that is already [supported by Feathers out of the box](../api/databases/querying.md). Additionaly, this will also work much better when using Feathers through websocket connections which do not have a concept of routes at all.

However, nested routes for services can still be created by registering an existing service on the nested route and mapping the route parameter to a query parameter like this:

```js
app.use('/posts', postService);
app.use('/users', userService);

// re-export the posts service on the /users/:userId/posts route
app.use('/users/:userId/posts', app.service('posts'));

// A hook that updates `data` with the route parameter
function mapUserIdToData(hook) {
  if(hook.data && hook.params.userId) {
    hook.data.userId = hook.params.userId;
  }
}

// For the new route, map the `:userId` route parameter to the query in a hook
app.service('users/:userId/posts').hooks({
  before: {
    find(hook) {
      hook.params.query.userId = hook.params.userId;
    },
    create: mapUserIdToData,
    update: mapUserIdToData,
    patch: mapUserIdToData
  }  
})
```

Now going to `/users/123/posts` will call `postService.find({ query: { userId: 123 } })` and return all posts for that user.

For more information about URL routing and parameters, refer to [the Express chapter](../api/express.md).

> **Note:** URLs should never contain actions that change data (like `post/publish` or `post/delete`). This has always been an important part of the HTTP protocol and Feathers enforces this more strictly than most other frameworks. For example to publish a post you would call `.patch(id, { published: true })`.

## How do I do search?

This depends on the database adapter you are using. Many databases already support their own search syntax:

- Regular expressions (converted in a a hook) for Mongoose, MongoDB and NeDB, see [this comment](https://github.com/feathersjs/feathers/issues/334#issuecomment-234432108)
- [$like for Sequelize](http://docs.sequelizejs.com/en/latest/docs/querying/) which can be set in [params.sequelize](../api/databases/sequelize.md#paramssequelize)
- Some database adapters like [KnexJS](../api/databases/knexjs.md), [RethinkDB](../api/databases/rethinkdb.md) and [Elasticsearch](../api/databases/elasticsearch.md) also support non-standard query parameters which are described in their documentation pages.

For further discussions see [this issue](https://github.com/feathersjs/feathers/issues/334).

## Why am I not getting JSON errors?

If you get a plain text error and a 500 status code for errors that should return different status codes, make sure you have the `feathers-errors/handler` configured as described in the [Express errors](../api/errors.md#rest-express-errors) chapter.

## Why am I not getting the correct HTTP error code

See the above answer.

## How can I do custom methods like `findOrCreate`?

Custom functionality can almost always be mapped to an existing service method using hooks.  For example, `findOrCreate` can be implemented as a before-hook on the service's `get` method.  [See this gist](https://gist.github.com/marshallswain/9fa3b1e855633af00998) for an example of how to implement this in a before-hook.

## How do I render templates?

Feathers works just like Express so it's the exact same. We've created a [helpful little guide right here](../guides/advanced/using-a-view-engine.md).

## How do I create channels or rooms

Although Socket.io has a [concept of rooms](http://socket.io/docs/rooms-and-namespaces/) and you can always fall back to it other websocket libraries that Feathers supports do not. The Feathers way of letting a user listen to e.g. messages on a room is through [event filtering](../api/events.md#event-filtering). There are two ways:

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

## How do I do validation?

If your database/ORM supports a model or schema (ie. Mongoose or Sequelize) then you have 2 options.

#### The preferred way

You perform validation at the service level [using hooks](../api/hooks.md). This is better because it keeps your app database agnostic so you can easily swap databases without having to change your validations much.

If you write a bunch of small hooks that validate specific things it is easier to test and also slightly more performant because you can exit out of the validation chain early instead of having to go all the way to the point of inserting data into the database to find out if that data is invalid.

If you don't have a model or schema then validating with hooks is currently your only option. If you come up with something different feel free to submit a PR!

#### The ORM way

With ORM adapters you can perform validation at the model level:

- [Using Mongoose](../api/databases/mongoose.md#validation)
- [Using Sequelize](http://docs.sequelizejs.com/en/latest/docs/models-definition/#validations)

The nice thing about the model level validations is Feathers will return the validation errors to the client in a nice consistent format for you.

## How do I do associations?

Similar to validation, it depends on if your database/ORM supports models or not.

#### The preferred way

For any of the feathers database/ORM adapters you can just use [hooks](../api/hooks.md) to fetch data from other services.

This is a better approach because it keeps your application database agnostic and service oriented. By referencing the services (using `app.service().find()`, etc.) you can still decouple your app and have these services live on entirely separate machines or use entirely different databases without having to change any of your fetching code.

This has been implemented in the [populate common hook](../api/hooks-common.md#populate).

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

Or set it in a hook as [described here](../api/databases/sequelize.md#associations-and-relations).

## Sequelize models and associations

If you are using the [Sequelize](http://docs.sequelizejs.com/) adapter, understanding SQL and Sequelize first is very important. For further information see [this documentation chapter](https://docs.feathersjs.com/api/databases/sequelize.html#associations-and-relations) and [this answer on Stackoverflow](https://stackoverflow.com/questions/42841810/feathers-js-sequelize-service-with-relations-between-two-models/42846215#42846215).

## What about Koa/Hapi/X?

There are many other Node server frameworks out there like Koa, a *"next generation web framework for Node.JS"* using ES6 generator functions instead of Express middleware or HapiJS etc. Because Feathers 2 is already [universally usable](../clients/feathers.md) we are planning the ability for it to hook into other frameworks on the server as well. More information can be found in [this issue](https://github.com/feathersjs/feathers/issues/258).

## How do I filter emitted service events?

See [this section](../api/events.md#event-filtering).

## How do I access the request object in hooks or services?

In short, you shouldn't need to. If you look at the [hooks chapter](../api/hooks.md) you'll see all the params that are available on a hook.

If you still need something from the request object (for example, the requesting IP address) you can simply tack it on to the `req.feathers` object [as described here](../api/express.md).

## How do I mount sub apps?

It's pretty much exactly the same as Express. More information can be found [here](../api/express.md#sub-apps).

## How do I do some processing after sending the response to the user?

The hooks workflow allows you to handle these situations quite gracefully.  It depends on the promise that you return in your hook. Here's an example of a hook that sends an email, but doesn't wait for a success message.

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

## How do I debug my app

It's really no different than debugging any other NodeJS app but you can refer to the [Debugging](../guides/advanced/debugging.md) section of the guide for more Feathers specific tips and tricks.

## `possible EventEmitter memory leak detected` warning

This warning is not as bad as it sounds. If you got it from Feathers you most likely registered more than 64 services and/or event listeners on a Socket. If you don't think there are that many services or event listeners you may have a memory leak. Otherwise you can increase the number in the [Socket.io configuration](../api/socketio.md) via `io.sockets.setMaxListeners(number)` and with [Primus](../api/primus.md) via `primus.setMaxListeners(number)`. `number` can be `0` for unlimited listeners or any other number of how many listeners you'd expect in the worst case.

## Why can't I pass `params` from the client?

When you make a call like:

```js
const params = { foo: 'bar' };
client.service('users').patch(1, { admin: true }, params).then(result => {
  // handle response
});
```

on the client the `hook.params` object will only be available in your client side hooks. It will not be provided to the server. The reason for this is because `hook.params` on the server usually contains information that should be server-side only. This can be database options, whether a request is authenticated, etc. If we passed those directly from the client to the server this would be a big security risk. Only the client side `hook.params.query` and `hook.params.headers` objects are provided to the server.

If you need to pass info from the client to the server that is not part of the query you need to add it to `hook.params.query` on the client side and explicitly pull it out of `hook.params.query` on the server side. This can be achieved like so:

```js
// client side
client.hooks({
  before: {
    all: [
      hook => {
        hook.params.query.$client = {
          platform: 'ios',
          version: '1.0'
        };
        
        return hook;
      }
    ]
  }
});

// server side, inside app.hooks.js
const hooks = require('feathers-hooks-common');

module.exports = {
  before: {
    all: [
      // remove values from hook.params.query.$client and move them to hook.params
      // so hook.params.query.$client.version -> hook.params.version
      // and hook.params.query.$client is removed.
      hooks.client('version', 'platform')
    ]
  }
}
```

## How do I set up HTTPS?
Check out the Feathers [Express HTTPS docs](../api/express.md#https).

## Is Feathers production ready?

Yes! It's being used in production by a bunch of companies from startups to fortune 500s. For some more details see [this answer on Quora](https://www.quora.com/Is-FeathersJS-production-ready).
