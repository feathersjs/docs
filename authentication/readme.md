# Authentication

At some point, you are probably going to put information in your databases that you want to keep private. You'll need to implement an _authentication_ scheme to identify your users, and _authorization_ to control access to resources.  

Cookie based and token based authentication are the two most common methods of putting server side authentication into practice. Cookie based authentication relies on server side cookies to remember the user. Token based authentication requires an encrypted auth token with each request. While cookie based authentication is the most common, token based authentication offers several advantages for modern web apps. Two primary advantages are security and scalability.

The Auth0 blog has a [great article on the advantages that token authentication offers](https://auth0.com/blog/2014/01/07/angularjs-authentication-with-cookies-vs-token/).

## Feathers Authentication

The [feathers-authentication](https://github.com/feathersjs/feathers-authentication) plugin makes it easy to add token-based auth to your app.

### Usage

If you are using the default options, setting up JWT auth for your Feathers app is as simple as the example below.

> **ProTip:** You must set up the `body-parser`, `feathers-hooks` and possibly `cors` modules before setting up `feathers-authentication`. The Feathers generator does this for you already.

```js
let app = feathers()
  .configure(feathers.rest())
  .configure(feathers.socketio())
  .configure(hooks())
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: true }))
  .configure(authentication());
```

#### Options

The options passed to the authentication plugin are wrapped in an object with the following top level keys:

- `local` (default: [see options](./local.md#server-options)) [optional] - The local auth provider config. By default this is included in a Feathers app. If set to `false` it will not be initialized.
- `token` (default: [see options](./token.md#server-options)) [optional] - The JWT auth provider config. By default this is included in a Feathers app even if you don't pass in any options. You can't disable it like `local` auth.
- `<oauth-provider>` [optional] - A lowercased oauth provider name (ie. `facebook` or `github`)

#### Example Configuration

Below is an example config providing some common override options.

```js
{
  local: {
    userEndpoint: '/api/users',
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

## How does it work?

Regardless of whether you use OAuth, a token, or email + password the `feathers-authentication` plugin, upon successful login, gives back an encrypted JSON web token containing the user `id` as the payload and the user object associated with that id.

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

For REST the token needs to be passed with each request. Therefore if you did `.configure(rest())` in your Feathers app, the auth plugin also includes a [special middleware](https://github.com/feathersjs/feathers-authentication/blob/master/src/middleware/index.js#L34-L73) that ensures that a token, if sent, is available on the Feathers `params` object by setting it on `req.feathers.token`.

> **ProTip:** The `req.feathers` object is special because its attributes are made available inside Feathers hooks on the `hook.params` object.

This middleware uses graceful fall-back to check for a token in order from most secure/appropriate to least secure:

1. Authorization header
2. Cookie
3. The request body
4. The query string (not recommended but supported)

### Authentication Over Sockets

After a socket is connected an `authenticate` event needs to be emitted from the client to initiate the socket authentication. The data passed with it can either be a username and password, a JWT or OAuth access tokens. After successful authentication an `authenticated` event is emitted from the server and just like with REST you get back a JWT and the current user. From then on you are now using an authenticated socket until that socket is disconnected, the token expires, or you log out.

### What Happens During Authentication?

Regardless of the mechanism the person used to authenticate and no matter if it was over sockets or REST, the high level order of execution is as follows:

1. The credentials passed in are verified or you go through a series of OAuth redirects and are verified by the OAuth provider.
2. Once credentials are verified the user associated with those credentials is looked up and if a user does not exist they are created by calling your `user` service.
3. The user id is encrypted into the JWT by an asymmetric hashing function using your `secret` inside the `token` service.
4. The user is added to the response _after_ a token is created using the `populateUser()` hook and the new token and user are returned to the client.

### Authorizing Future Requests

Regardless of the protocol, once a valid auth token as been returned to the client, for any subsequent request the token (if present) is normalized and the `[verifyToken()](../authorization/bundled-hooks.md#verifyToken)` hook should be called by you prior to any restricted service methods. 

This hook decrypts the token found in `hook.params.token`. After the JWT is decrypted, the `[populateUser()](../authorization/bundled-hooks.md#populateUser)` hook should be called. This is used to look up the user by id in the database and attach them to `hook.params.user` so that any other hooks in the chain can reference the current user, for example the `[requireAuth()](../authorization/bundled-hooks.md#requireAuth)` hook.

For more information on refer to the [Authorization chapter](../authorization/readme.md).

## What's next?

Adding authentication allows you to know **who** users are. Now you'll want to specify **what** they can do. This is done using authorization hooks. Learn more about it in the [Authorization section](../authorization/readme.md) or dive deeper into each of the individual authentication schemes:

- [Setting Up Local Auth](local.md) (username and password)
- [Setting Up Token Auth](token.md) (JWT)
- [Setting Up OAuth1](oauth1.md) (Twitter)
- [Setting Up OAuth2](oauth2.md) (Facebook, LinkedIn, etc.)
- [Setting Up 2 Factor](two-factor.md)
- [Auth with Feathers client](client.md)
