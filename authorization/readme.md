# Authorization / Access Control

Once we know which user is logged in, we need to know which parts of the app they can access. This is called Authorization, and it's where hooks really come in handy.

## Adding user information to requests
The `feathers-authentication` plugin, upon login, gives back an encrypted token containing information about the user.  The auth plugin also includes a special middleware that decrypts any tokens coming found in the Authorization header of requests that come through the REST provider.  Here's an example of that middleware:

```js
// Make the Passport user available for REST services.
app.use(function(req, res, next) {
  if (req.headers.authorization) {
    var token = req.headers.authorization.split(' ')[1];
    jwt.verify(token, settings.secret, function(err, data) {
      if (err) {
        // Return a 401 Unauthorized if the token has expired.
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json(err);
        }
        return next(err);
      }
      // A valid token's data is set up on feathers.user.
      req.feathers = _.extend({ user: data }, req.feathers);
      return next();
    });
  } else {
    return next();
  }
});
```

If the token in any request is valid, the token will be unencrypted and the payload data is set up on `req.feathers.user`.  The `req.feathers` object is special because its attributes are made available inside feathers-hooks on the `hook.params` object. We will cover how you can use this data soon, but first let's talk about some guidelines for creating your `User` schema.

## Getting your User schema just right
Since `feathers-authentication` adds the authenticated user's info to requests, we can use it to implement our app's authorization logic. This also means that the authorization logic we will be able to put in place depends completely on the data that's available in the `User` service's schema. There is one general guideline to follow:

> Keep your user schema simple.

Remember, the more information you put in your `User` schema, the larger the JWT token will get. If you have a huge token, you're adding a huge payload to *every* authenticated request. It's not only an issue of having more bytes to transfer, though. Once it arrives at the server, the token will have to be unencrypted every time, so it requires more processing power, too. Try experimenting with the payload on [jwt.io](http://jwt.io) to get an idea of the impact your schema will have.

The simplest `User` schema would look something like the one below.

```js
{
  "username": "LeanAndClean"
}
```

**Pro Tip:** There could very likely be a password on your `User` schema. Read the [section on bundled auth hooks](bundled-hooks.md) to find out how to make sure passwords don't go out to the public or into the JWT token payload.

But suppose we want to create an app with a more-expansive `User` schema like this one:

```js
{
  "username": "ChunkyMonkey",
  "email": "chunky@monkey.com"
  "country": "Canada",
  "city": "Alberta",
  "favoriteWord": "Hoser",
  "dateOfBirth": "4-24-1980",
  "friends": [
    "Larry",
    "Curly",
    "Moe",
    "Bonnie",
    "Clyde",
    "Butch Cassidy",
    "The Sundance Kid"
  ]
}
```

While all of the above attributes do have something to do with the user, they're not very useful for our authorization logic.  We can optimize the setup by splitting the large model into two.  We'll keep the most useful or identifying attributes in the `User` schema and move everything else out to a `profile` schema. Each application will potentially have different requirements, but here's an example split.

```js
// User schema
{
  "username": "ChunkyMonkey",
  "email": "chunky@monkey.com"
}

// Profile schema
{
  "country": "Canada",
  "city": "Alberta",
  "favoriteWord": "Hoser",
  "dateOfBirth": "4-24-1980",
  "friends": [
    "Larry",
    "Curly",
    "Moe",
    "Bonnie",
    "Clyde",
    "Butch Cassidy",
    "The Sundance Kid"
  ]
}
```

## Adapting your schema to your app

Your `User` schema will change based on your how your application is structured. If you're making an app that will only be used by a single person, or if all users have the same permissions, the schema can probably stay as simple as in the previous examples.  However, if the specifications for your app require that some users are administrators with greater access, you will have options on how you are going to implement authorization.  If your application is more complex, you may want to put administrators in an `Admin` schema and create a separate administrative app.  But for smaller apps it might make sense to simply add an attribute to the `User` schema that flags certain users as administrators:

```js
// User schema
{
  "username": "ElJefe",
  "admin": true
}
```

Now you'll know when a user gets more access by checking for the `admin` attribute. Let's take a look at how to identify users and administrators by creating our first hooks.

## Creating an authorization hook
In the example below, only a logged-in user would be able to create a todo.  The other methods on the `todos` service continue to be unprotected.  The `orders` service requires an authenticated user to perform any of its methods because it uses the `all` key to register the hook.

```js
// Create a hook that requires that a user is logged in.
var requireAuth = function(hook) {
  if(!hook.params.user) {
    throw new Error('You must be logged in to do that.');
  }
};
// Create a hook that requires a user who is an admin.
var requireAdmin = function(hook) {
  if (!hook.params.user) {
    throw new Error('You must be logged in to do that.');
  }
  if(!hook.params.user.admin) {
    throw new Error('Only admins can do that.');
  }
};


// Must be logged in to create a todo.
app.service('todos').before({
  create: [requireAuth]
});
// Must be logged in to do anything with orders.
app.service('orders').before({
  all: [requireAuth]
});
// Must be a logged-in administrator to do anything with secrets.
app.service('secrets').before({
  all: [requireAdmin]
});
```

We created two simple hooks in the above example. The `requireAuth` hook simply checks for a logged-in user at `hook.params.user` and throws an error if there's no user data.  The `requireAdmin` hook is similar, but does an extra check for if the user has an `admin = true` attribute.

We have prepared some useful hooks for you to use in your Authorization schema.  Keep reading to learn about them.
