# Authentication

At some point, you are probably going to put information in your databases that you want to keep private. You'll need to implement an _authentication_ scheme to identify your users, and _authorization_ to control access to resources. The [feathers-authentication](https://github.com/feathersjs/feathers-authentication) plugin makes it easy to add token-based auth to your app.

Cookie based and token based authentication are the two most common methods of putting server side authentication into practice. Cookie based authentication relies on server side cookies to remember the user. Token based authentication requires an encrypted auth token with each request. While cookie based authentication is the most common, token based authentication offers several advantages for modern web apps. Two primary advantages are security and scalability.

The Auth0 blog has a [great article on the advantages that token authentication offers](https://auth0.com/blog/2014/01/07/angularjs-authentication-with-cookies-vs-token/).

## Usage

### Server Side

If you are using the default options, setting up [JSON Web Token](https://jwt.io/) auth for your Feathers app is as simple as the example below. This example would typically be used alongside a User Service to keep track of the users within your app.

```js
let app = feathers()
  .configure(rest())
  .configure(socketio())
  .configure(hooks())
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: true }))
  .configure(authentication());
```

> **ProTip:** You must set up the `body-parser`, `feathers-hooks` and possibly `cors` modules before setting up `feathers-authentication`. The Feathers CLI generator does this for you already.

#### Options

The options passed to the authentication plugin are wrapped in an object with the following top level keys:

- `local` (default: [see options](./local.md#server-options)) [optional] - The local auth provider config. By default this is included in a Feathers app. If set to `false` it will not be initialized.
- `token` (default: [see options](./token.md#server-options)) [optional] - The JWT auth provider config. By default this is included in a Feathers app even if you don't pass in any options. You can't disable it like `local` auth.
- `<oauth-provider>` (default: [see options](./oauth2.md#server-options)) [optional] - A lowercased oauth provider name (ie. `facebook` or `github`)
- `successRedirect` (default: '/auth/success') [optional] - The endpoint to redirect to after successful authentication or signup. Only used for requests not over Ajax or sockets. Can be set to `false` to disable redirects.
- `failureRedirect` (default: '/auth/failure') [optional] - The endpoint to redirect to for a failed authentication or signup. Only used for requests not over Ajax or sockets. Can be set to `false` to disable redirects.
- `shouldSetupSuccessRoute` (default: `true`) [optional] - Can be set to `false` to disable setting up the default success redirect route handler. **Required** if you want to render your own custom page on auth success.
- `shouldSetupFailureRoute` (default: `true`) [optional] - Can be set to `false` to disable setting up the default failure redirect route handler. **Required** if you want to render your own custom page on auth failure.
- `idField` (default: '_id') [optional] - the id field for you user's id. This is use by many of the [authorization hooks](../authorization/bundled-hooks.md).
- `localEndpoint` (default: '/auth/local') [optional] - The local authentication endpoint used to create new tokens using [local auth](./local.md)
- `userEndpoint` (default: '/users') [optional] - The user service endpoint
- `tokenEndpoint` (default: '/auth/token') [optional] - The JWT auth service endpoint
- `header` (default: 'authorization') [optional] - The header field to check for the token. **This is case sensitive**.
- `cookie` (default: [see options](#cookie-options)) [optional] - The cookie options used when sending the JWT in a cookie for OAuth or plain form posts. You can disable sending the cookie by setting this to `false`.

#### Cookie Options

All the options get passed to Express' `res.cookie` function. See the [Express docs](http://expressjs.com/en/4x/api.html#res.cookie) for more detail.

- `name` (default: 'feathers-jwt') [optional] - The cookie name. **This is case sensitive**.
- `httpOnly` (default: 'false') [optional] - Prevents JavaScript from accessing the cookie on the client. Should be set to `true` if you are not using OAuth or Form Posts for authentication.
- `secure` (default: 'true' in production) [optional] - Marks the cookie to be used with HTTPS only.
- `expires` (default: 30 seconds from current time) [optional] - The time when the cookie should expire. Must be a valid `Date` object.

#### Example Configuration

Below is an example config providing some common override options:

```js
{
  userEndpoint: '/api/users',
  tokenEndpoint: '/api/tokens',
  idField: 'id',
  local: {
    usernameField: 'username'
  },
  token: {
    secret: 'shhh secrets'
  },
  facebook: {
    strategy: FacebookStrategy,
    'clientID': 'your facebook client id',
    'clientSecret': 'your facebook client secret',
    'permissions': {
      authType: 'rerequest',
      'scope': ['public_profile', 'email']
    }
  }
}
```

### Client Side

If you are using the default options setting up Feathers authentication client side is a breeze.

```js
// Set up socket.io
const host = 'http://localhost:3030';
let socket = io(host);

// Set up Feathers client side
let app = feathers()
  .configure(feathers.socketio(socket))
  .configure(hooks())
  .configure(authentication());

// Authenticate. Normally you'd grab these from a login form rather than hard-coding them
app.authenticate({
  type: 'local',
  'email': 'admin@feathersjs.com',
  'password': 'admin'
}).then(function(result){
  console.log('Authenticated!', result);
}).catch(function(error){
  console.error('Error authenticating!', error);
});
```

> **ProTip:** You can also use Primus or a handful of Ajax providers instead of Socket.io. Check out the [Feathers client authentication](./client.md) section for more detail.

<!-- -->

> **ProTip:** You can only have one provider client side per "app". For example if you want to use both Socket.io and a REST Ajax provider then you need to configure two apps.

#### Options

- `tokenEndpoint` (default: '/auth/token') [optional] - The JWT auth service endpoint.
- `localEndpoint` (default: '/auth/local') [optional] - The local auth service endpoint
- `header` (default: 'authorization') [optional] - The header field to set the token. **This is case sensitive**.
- `cookie` (default: 'feathers-jwt') [optional] - The cookie field to check for the token. **This is case sensitive**.
- `tokenKey` (default: 'feathers-jwt') [optional] - The key to use to store the JWT in localStorage. **This is case sensitive**.

#### Example Configuration

Below is an example config providing some common override options:

```js
app.configure(authentication({
  tokenEndpoint: '/token',
  localEndpoint: '/login',
  header: 'X-Authorization',
  cookie: 'app-token',
  tokenKey: 'app-token'
}));
```

## How does it work?

Regardless of whether you use OAuth, a token, or email + password to authenticate (even if you don't use the Feathers client), after successful login the `feathers-authentication` plugin gives back a signed JSON web token containing the user `id` as the payload and the user object associated with that id.

```js
// successful auth response
{
  token: 'your encrypted json web token',
  data: {
    email: 'hulk@hogan.net'
  }
}
```

### Authentication Over REST

#### Creating Tokens

To create a new token with an HTTP request make a `POST` request to the local authentication endpoint with a valid set of user credentials. By default this endpoint is `/auth/local`. If you have not already set up a User Service you should do that first. See the README for [a complete example](https://github.com/feathersjs/feathers-authentication#complete-example).

The following cURL request can be used to authenticate a user from the command line using the default options. If the authentication request was successful you will receive a response back with your token.

 ```bash
 # Assuming a user exists with the following credentials
$ curl -X POST \
-H 'Content-Type: application/json' \
-d '{ "email": "hulk@hogan.net", "password": "bandana" }' \
http://127.0.0.1:3000
 ```

> **ProTip** These defaults can all be overridden as described in the [server-side config options](#options) and [local auth config options](./local.md#local-service-specific-options).

#### Using Tokens

For REST the token needs to be passed with each request. Therefore if you did `.configure(rest())` in your Feathers app, the auth plugin also includes a [special middleware](https://github.com/feathersjs/feathers-authentication/blob/master/src/middleware/index.js#L34-L73) that ensures that a token, if sent, is available on the Feathers `params` object that is passed to services and hooks by setting it on `req.feathers.token`.

> **ProTip:** The `req.feathers` object is special because its attributes are made available inside Feathers hooks on the `hook.params` object.

This middleware uses graceful fall-back to check for a token in order from most secure/appropriate to least secure:

1. Authorization header (recommended)
2. Cookie
3. The request body
4. The query string (not recommended but supported)

So you can send your token using any of those methods. Using the `authorization` header it should look like this:

```
Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IklseWEgRmFkZWV2IiwiYWRtaW4iOnRydWV9.YiG9JdVVm6Pvpqj8jDT5bMxsm0gwoQTOaZOLI-QfSNc
```

> **ProTip:** The `Bearer` part can be omitted and the case doesn't matter.

<!-- -->

> **ProTip:** You can use a custom header name for your token by passing a `header` option as described above.

### Authentication Over Sockets

After a socket is connected an `authenticate` event needs to be emitted from the client to initiate the socket authentication. The data passed with it can either be an email and password, a JWT or OAuth access tokens. After successful authentication an `authenticated` event is emitted from the server and just like with REST you get back a JWT and the current user. From then on you are now using an authenticated socket until that socket is disconnected, the token expires, or you log out.

### What Happens During Authentication?

Regardless of the mechanism, the credentials used to authenticate, and the transport, the high level order of execution is as follows:

1. The credentials passed in are verified or you go through a series of OAuth redirects and are verified by the OAuth provider.
2. Once credentials are verified the user associated with those credentials is looked up and if a user does not exist they are created by calling your `user` service.
3. The user id is encrypted into the JWT by an asymmetric hashing function using your `secret` inside the `token` service.
4. The user is added to the response _after_ a token is created using the `populateUser()` hook and the new token and user are returned to the client.

### Authorizing Future Requests

Regardless of the protocol, once a valid auth token as been returned to the client, for any subsequent request the token (if present) is normalized and the [verifyToken()](../authorization/bundled-hooks.md#verifytoken) hook should be called by you prior to any restricted service methods.

This hook decrypts the token found in `hook.params.token`. After the JWT is decrypted, the [populateUser()](../authorization/bundled-hooks.md#populateuser) hook should be called. This is used to look up the user by id in the database and attach them to `hook.params.user` so that any other hooks in the chain can reference the current user, for example the [requireAuth()](../authorization/bundled-hooks.md#requireauth) hook.

For more information on refer to the [Authorization chapter](../authorization/readme.md).

## What's next?

Adding authentication allows you to know **who** users are. Now you'll want to specify **what** they can do. This is done using authorization hooks. Learn more about it in the [Authorization section](../authorization/readme.md) or dive deeper into each of the individual authentication schemes:

- [Setting Up Local Auth](local.md) (username and password)
- [Setting Up Token Auth](token.md) (JWT)
- [Setting Up OAuth1](oauth1.md) (Twitter)
- [Setting Up OAuth2](oauth2.md) (Facebook, LinkedIn, etc.)
- [Setting Up 2 Factor](two-factor.md)
- [Auth with Feathers client](client.md)
