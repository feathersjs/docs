# OAuth2 Authentication

The OAuth2 strategy is only enabled if you pass in a top level config object other than `local` and `token`. Once a user has successfully authenticated, if they aren't in your database they get created, and a JSON Web Token (JWT) along with the current user are returned to use for future authentication with your feathers app.

Because OAuth relies on a series of redirects we need to get the user their JWT somehow without putting it in the query string, which is potentially insecure.

To solve this problem, Feathers redirects to a configurable `successRedirect` route and puts the user's JWT token in a cookie with the default name `feathers-jwt`. Your client side app can then parse the cookie for the token and use it to further authenticate. This is exactly what the client side component of the Feathers authentication module does for you automatically.

> **ProTip:** Many other frameworks either use sessions for auth or if using a token + OAuth just shove the token in the query string. This is potentially insecure as a intermediary could be logging these URLs with the token in them. Even over HTTPS this is not secure.

## Usage

### Server Side

This is what a typical server setup looks like:

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

#### OAuth2 Service Specific Options

All of the top level authentication options are passed to an OAuth2 authentication service and the passport strategies. If you need to customize your OAuth2 specific configuration you can use these options:

- `clientID` (**required**) - Your OAuth2 clientID
- `clientSecret` (**required**) - Your OAuth2 clientSecret
- `permissions` (**required**) - An object with the permissions you are requesting. See your passport provider docs for details.
- `strategy` (**required**) - The Passport OAuth strategy for your oauth provider (ie. passport-facebook)
- `tokenStrategy` [optional] - The Passport OAuth token strategy if you want to support mobile authentication without a browser.
- `passReqToCallback` (default: true) [optional] - A Passport option to pass the request object to the oauth callback handler.
- `callbackSuffix` (default: 'callback') [optional] - This gets added to the provider endpoint to form the callback url. For example `/auth/facebook/callback`.

> **ProTip:** Feathers just uses [Passport](http://passportjs.org/) authentication strategies so you can pass any strategy specific options in your provider config and it will be automatically passed on to the strategy you are using.

### Client Side

#### Using Feathers Client

The Feathers authentication module has a client side component that makes it very easy for you to add authentication to your app. It can be used in the browser, NodeJS and React Native. Refer to the [feathers client authentication section](./client.md) for more detail.

#### Other Clients

Of course, if you don't want to use the feathers authentication client you can also just use vanilla sockets or ajax. It's a bit more work but honestly, not much more. We have some examples [here](https://github.com/feathersjs/feathers-authentication/tree/master/examples/basic).