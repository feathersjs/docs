# Authorization / Access Control

Once we know which user is logged in, we need to know which parts of the app they can access. This is called Authorization, and it's where [hooks](../hooks/readme.md) really come in handy.

## Security

By default Feathers is pretty loose and is not locked down. This is to allow for rapid prototyping. Before you go to production there are a few things you should do.

#### Remove passwords from responses

Make sure that your user's passwords are not being sent to the client. There could very likely be a password on your `user` object. Read the [section on bundled auth hooks](bundled-hooks.md) to find out how to make sure passwords don't go out to the public.

> **ProTip:** Feathers authentication automatically removes the password field from the user object that is sent in the response to a successful login and if you used the generator we've already set up the hook to remove passwords on the user service for you.

#### Lock down restricted services

Make sure any restricted endpoints are actually locked down appropriately by adding the appropriate hooks to your services. Check out the [bundled authentication hooks](bundled-hooks.md). They probably do most of what you need.

#### Filter socket events

[Filter socket events](http://docs.feathersjs.com/real-time/filtering.html) so only authenticated and authorized users can receive restricted ones.

To make this easy we've created [a bunch of hooks](./bundled-hooks.md) to help you out. Their interfaces are documented so if you are unsure how to use hooks check out the [Hooks chapter](../hooks/usage.md). Below is an example of how you can create your own.

## Creating a custom authorization hook

In the example below, only a user in the `feathers` group can delete messages.

```js
// Create a hook that requires that a user is logged in.
var isFeathersUser = function(options = {}) {
  return function(hook) {
    // We can assume hook.params.user exists because the auth.restrictToAuthenticated()
    // hook is called before this and will throw an error if it doesn't
    if (hook.params.user.group !== 'feathers') {
      throw new Error('You must be a feathers user to do that.');
    }
  };
};

// Must be logged in to do anything a feathers user to delete a message.
app.service('messages').before({
  all: [
    auth.verifyToken(),
    auth.populateUser(),
    auth.restrictToAuthenticated()
  ],
  remove: [isFeathersUser()]
});
```
