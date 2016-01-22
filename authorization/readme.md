# Authorization / Access Control

TODO: This section needs review.

Once we know which user we are working with, we need to know which parts of the app they have access to. This is called Authorization, and it's where hooks really come in handy.

## Adding user information to requests.
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

## User authorization
Since `feathers-authentication` adds the authenticated user information to requests with valid tokens, we can check for the user info in the hook and return with an error if the user is not authorized:

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
