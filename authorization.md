# Authorization / Access Control

TODO: Show how to implement access control with `feathers-hooks`.

Once we know which user we are working with, we need to know which parts of the app they have access to. This is called Authorization, and it's where hooks really come in handy.

## Adding user information to requests.
The `feathers-authentication` plugin, upon login, gives back an encrypted token containing information about the user.  The auth plugin also includes a special middleware that decrypts any tokens coming found in the Authorization header of requests that come through the REST provider.

## User authorization
Since `feathers-authentication` adds the authenticated user information to the service call parameters we can just check those in the hook and return with an error if the user is not authorized:

```js
app.service('todos').before({
  create: function(hook, next) {
    // We only allow creating todos with an authenticated user
    if(!hook.params.user) {
      return next(new Error('You need to be authenticated'));
    }

    // Check if the user belongs the `admin` group
    var groups = hook.params.user.groups;
    if(groups.indexOf('admin') === -1) {
      // Return with an error if not
      return next(new Error('User is not allowed to create a new Todo'));
    }

    // Otherwise just continue on to the
    // next hook or the service method
    next();
  }
});
```
