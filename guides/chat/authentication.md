# Adding authentication

In the previous chapters we [created our Feathers chat application](./creating.md) and [initialized a service](./service.md) for storing messages. For a proper chat application we need to be able to register and authenticate users.

## Generating authentication

To add authentication to our application we can run

```
feathers generate authentication
```

This will first ask us which authentication providers we would like to use. In this guide we will only cover local authentication which is already selected so we can just confirm by pressing enter.

Next we have to define the service we would like to use to store user information. Here we can just confirm the default `users` and the database with the default NeDB:

![Final Configuration](./assets/authentication.png)

> __Note:__ For more information on Feathers authentication see the [authentication server API documentaion](../../api/authentication/server.md).

## Creating a user and logging in

We just created a `users` service and enabled local authentication. When restarting the application we can now create a new user with `email` and `password` similar to what we did with messages and then use the login information to get a JWT (for more information see the [How JWT works guide](../auth/how-jwt-works.md)).

### Creating the user

We will create a new user with the following data:

```
{
  "email": "feathers@example.com",
  "password": "secret"
}
```

The generated user service will automatically securely hash the password in the database for us and also exclude it from the response (passwords should never be transmitted). There are several ways to create a new user, for example via CURL like this:

```
curl 'http://localhost:3030/users/' -H 'Content-Type: application/json' --data-binary '{ "email": "feathers@example.com", "password": "secret" }'
```

With a REST client, e.g. [Postman](https://chrome.google.com/webstore/detail/postman/fhbjgbiflinjbdggehcddcbncdddomop?hl=en) using this button:

[![Run in Postman](https://run.pstmn.io/button.svg)](https://app.getpostman.com/run-collection/9668636a9596d1e4a496)

> **Note:** Creating a user with the same email address will only work once and fail when it already exists in the database. This is a restriction implemented for NeDB and might have to be implemented manually when using a different database.

### Getting a token

To create a JWT we can now post the login information with the strategy we want to use (`local`) to the `authentication` service:

```
{
  "strategy": "local",
  "email": "feathers@example.com",
  "password": "secret"
}
```

Via CURL:

```
curl 'http://localhost:3030/authentication/' -H 'Content-Type: application/json' --data-binary '{ "strategy": "local", "email": "feathers@example.com", "password": "secret" }'
```

With a REST client, e.g. [Postman](https://chrome.google.com/webstore/detail/postman/fhbjgbiflinjbdggehcddcbncdddomop?hl=en):

[![Run in Postman](https://run.pstmn.io/button.svg)](https://app.getpostman.com/run-collection/9668636a9596d1e4a496)

The returned token can then be used to authenticate the user it was created for by adding it to the `Authorization` header of new HTTP requests.

## Securing the messages service

Now we have to restrict our messages service to authenticated users. If we run `feathers generate authentication` *before* generating other services it will ask if the service should be restricted to authenticated users. Because we created the messages service first, however we have to update `src/services/messages/messages.hooks.js` manually to look like this:

```js
const { authenticate } = require('@feathersjs/authentication').hooks;

module.exports = {
  before: {
    all: [ authenticate('jwt') ],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [],
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

This will now only allow users with a valid JWT to access the service and automatically set `params.user`.

## Securing real-time events

The `authenticate` hook that we used above will restrict _access_ to service methods to only authenticated users. No we also have to make sure that [real-time service events](../basics/real-time.md) are only sent to connections that are allowed to see them. Feathers uses channels to accomplish that which the generator already sets up for us in `src/channels.js` (have a look at the comments in the generated file and the [channel API documentation](../../api/channels.md) to get a better idea about channels).

We could use channels to e.g. only send events to users in a specific room or with specific permissions. To make things easier for our basic chat however, let's just send all events to all authenticated users by updating `src/channels.js` to this:

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
    }
  });

  app.publish((data, hook) => { // eslint-disable-line no-unused-vars
    // Publish all service events to all authenticated users
    return app.channel('authenticated');
  });
};
```

This is almost the same as the original file except for the line `return app.channel('authenticated');` being commented in `app.publish()`. Now only authenticated users will receive real-time updates.

## What's next?

In this chapter we initialized authentication and created a user and JWT. We secured the messages service and made sure that only authenticated users get real-time updates. We can now use that user information to [process new message data](./processing.md).
