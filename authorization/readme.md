# Authorization / Access Control

Once we know which user is logged in, we need to know which parts of the app they can access. This is called Authorization, and it's where hooks really come in handy.

## Security

By default Feathers is pretty loose and is not locked down. This is to allow for rapid prototyping. Before you go to production there are a few things you should do.

### Remove passwords from responses

Make sure that your user's passwords are not being sent to the client. There could very likely be a password on your `user` object. Read the [section on bundled auth hooks](bundled-hooks.md) to find out how to make sure passwords don't go out to the public.

> **ProTip:** Feathers authentication automatically removes the password field from the user object that is sent in the response to a successful login.

### Lock down restricted services

Make sure any restricted endpoints are actually locked down appropriately by adding appropriate hooks to your services. Check out the [bundled authentication hooks](bundled-hooks.md). They probably do most of what you need.

### Filter socket events

[Filter socket events](http://docs.feathersjs.com/real-time/filtering.html) so only authenticated and authorized users get can receive restricted ones.


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
