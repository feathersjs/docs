# Authentication

At some point, you are probably going to put information in your databases that you want to keep private. You'll need to implement an _authentication_ scheme to identify your users, and _authorization_ to control access to resources.  

Cookie-based and token-based authentication are the two most-common methods of putting server-side authentication into practice. Cookie-based authentication relies on server-side cookies to remember the user.  Token-based authentication requires an encrypted auth token with each request. While cookie-based authentication is the most common, token-based authentication offers several advantages for modern web apps. The Auth0 blog has a [great article on the advantages that token authentication offers](https://auth0.com/blog/2014/01/07/angularjs-authentication-with-cookies-vs-token/).

## The `feathers-authentication` plugin
The [feathers-authentication](https://github.com/feathersjs/feathers-authentication) plugin makes it easy to add token-based auth to your app. Choose a tutorial below to get started.

- [Setting Up Local Auth](local.md) (username and password)
- [Setting Up Token Auth](token.md) (JWT)
- [Setting Up OAuth1](oauth1.md) (Twitter)
- [Setting Up OAuth2](oauth2.md) (Facebook, LinkedIn, etc.)
- [Setting Up 2 Factor](two-factor.md)

### Usage
If you are using the default options, setting up JWT auth for your Feathers app is as simple as the below example.

> **ProTip:** You must set up the `body-parser` and `feathers-hooks` modules before setting up `feathers-authentication`.

```js
let app = feathers()
  .configure(feathers.rest())
  .configure(feathers.socketio())
  .configure(hooks())
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: true }))
  // Provide a config object to the feathers-authentication plugin
  .configure(authentication({
    token: {
      secret: 'feathers-rocks'
    }
  }));
```


### Options

The options passed to the authentication plugin is an object with the following top level keys:

- `local` (default: [see options](./local.md#server-options)) [optional] - The local auth provider config. By default this is included in a Feathers app. If set to `false` it will not be initialized.
- `token` (default: [see options](./token.md#server-options)) [optional] - The JWT auth provider config. By default this is included in a Feathers app.
- `<oauth-provider>` [optional] - A lowercased oauth provider name (ie. `facebook` or `github`)

## The Internals
The `feathers-authentication` plugin, upon successful login, gives back an encrypted JSON web token containing the user `id` and the user object associated with that id.

### REST

For REST the token needs to be passed with each request. Therefore if `rest` has been configured for a Feathers app, the auth plugin also includes a special middleware that ensures a token, if sent, is available on the Feathers `params` object by setting it on `req.feathers.token`.

> **ProTip:** The `req.feathers` object is special because its attributes are made available inside Feathers hooks on the `hook.params` object.

This middleware gracefully falls back to checking these locations in this order:

1. Authorization header
2. Cookie
3. The request body
4. The query string (not recommended but supported)

### Sockets

For sockets and `authenticate` event needs to be emitted. The data passed with it can either be a username and password, a JWT or OAuth access tokens. After successful authentication an `authenticated` event is emitted from the server and just like with REST you get back a JWT and the current user. From then on you are now using an authenticated socket until that socket is disconnected, the token expires, or you log out.

Regardless of the protocol, once the token is normalized the `verifyToken` hook should be called prior to any restricted service methods. This hook decrypts the token found in `hook.params.token`. After the JWT is decrypted, the `populateUser` hook should be used to look up the user by id in the database and attach them to `hook.params.user` so that any other hooks in the chain can reference the current user.



