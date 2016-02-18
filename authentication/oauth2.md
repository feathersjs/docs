# OAuth2 Authentication

The OAuth2 strategy is only enabled if you pass in a top level config object other than `local` and `token`.

If you already have an app started, you can simply add the following lines to your server setup.

```js
var FacebookStrategy = require('passport-facebook').Strategy;

app.configure(authentication({
  facebook: {
    strategy: FacebookStrategy,
    'clientID': 'your-facebook-client-id',
    'clientSecret': 'your-facebook-client-secret',
    'permissions': {
      authType: 'rerequest',
      'scope': ['public_profile', 'email']
    }
  }
}));
```

## Server Options

- `clientID` (**required**) - Your OAuth2 clientID
- `clientSecret` (**required**) - Your OAuth2 clientSecret
- `permissions` (**required**) - An object with the permissions you are requesting. See your passport provider docs for details.
- `strategy` (**required**) - The Passport OAuth strategy for your oauth provider (ie. passport-facebook)
- `tokenStrategy` [optional] - The Passport OAuth token strategy if you want to support mobile authentication without a browser.
- `successRedirect` (default: '/auth/success') [optional] - The endpoint to redirect to after successful authentication or signup.
- `userEndpoint` (default: '/users') [optional] - The user service endpoint
- `tokenEndpoint` (default: '/auth/token') [optional] - The JWT auth service endpoint
- `passReqToCallback` (default: true) [optional] - A Passport option to pass the request object to the oauth callback handler.
- `callbackSuffix` (default: 'callback') [optional] - This gets added to the provider endpoint to form the callback url. For example `/auth/facebook/callback`.

## Client Options

TODO

## Mobile Authentication

TODO