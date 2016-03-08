# Creating a /me endpoint

If you're using [feathers-authentication](authentication/readme.md), it's likely that you'll have private information on your user resources that should be available only to the people it belongs to and no one else.

This behavior can easily be accomplished with hooks:
```
app.service('/users').before({
  all: [
    auth.verifyToken(),
    auth.populateUser(),
    auth.requireAuth()
  ]
}).after({
  get: [
    function (hook) {
      // It's not me!
      if (hook.params.user.id !== hook.data.id) {
        // Remove the user's sensitive info
        hook.data.email = undefined;
        delete hook.data.email;
      }
    }
  ]
});
```
This pattern, while effective, leaves something to be desired. For one, we'll have to write another handler for our `find` method to search through the resources and removed undesirable fields (which could be slow)! In addition, this would result in different-shaped resources which could complicate things on our client.

In spite of both being based on the same `user` model, it seems that a user's personal resource and everybody else's are entirely different!

Luckily Feathers is flexible enough to handle this pattern with ease.

Let's keep our old user service, minus any of the "me" hooks we started to add.
```
app.use('/users', service({ Model: User}));
```
And now, let's add another endpoint based on the `User` model. You can make the URL whatever you want, but I'll call this one `/me`.
```
app.use('/me', service({ Model: User }));
```
**How is this possible?** Feathers doesn't care if you use a model more than once, or even at all - it just uses its database adapters to get resources from that model. Since we're creating this service on a new URL, Feathers sees them as unique. Neat, huh?

Now let's add the hooks to `/me` that we'll need to verify ownership of the resource they're requesting.
```
app.service('/me').before({
  all: [
    auth.verifyToken(),
    auth.populateUser(),
    auth.requireAuth(),
    auth.restrictToSelf(),
    function () {
      hook.params.query.id = hook.params.user.id;
    }
  ],
  create: [hooks.disable()],
  find: [hooks.disable()]
});
```
Notice that all-important `auth.restrictToSelf()`. This is a built-in feathers-auth hook that only allows querying the resource for which you are authenticated.

We've gone ahead and disabled hooks that probably don't make sense for this endpoint, namely `create` and `find`. Create *could* be permitted on `/me`, but it probably makes more sense on `/users`. After all, are you making a `me` or a `user`? It also means we can continue to put all of our auth hooks on `all` (you don't need to be authenticated to create a user).

Find is disabled because we'll only ever have a single resource for `/me`, and we'd like it to be returned as a single object and not an array. To make sure that we don't have to query `get` with an id, we use that final hook.
```
hook.params.query.id = hook.params.user.id;
```
This way we know we'll be getting (or patching, or updating) the appropriate resource.

Now it's simply a matter of removing private fields on our `/users` endpoint with the build-in `remove()` hooks.
```
app.service('/users').after({
  all: [
    remove('password', 'email', 'etc')
  ]
})
```
Voila! We have very practically separated two distinct forms of interacting with the User Model across our endpoints.