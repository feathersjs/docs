# Token Authentication

The JSON web token (JWT) auth strategy is enabled by default with Feathers authentication. Currently it cannot be disabled because right now session or cookie based authentication is not supported and [token based auth is better](https://auth0.com/blog/2014/01/07/angularjs-authentication-with-cookies-vs-token/).

## Server Options

This is what a typical sever setup looks like:

```js
app.configure(authentication({
  token: {
    secret: 'my-secret'
  }
}));
```

Normally the only option you might want to pass when registering the `feathers-authentication` module sever side is your token `secret`. That's all. If you need to customize your configuration further you can use these options:

> **ProTip:** If you don't pass a token `secret` a secure one will be randomly generated for you each time your app starts.

- `secret` (**required**) (default: a strong auto generated one) - Your secret used to encrypt and decrypt JWT's. If this gets compromised you need to rotate it immediately!
- `passwordField` (default: 'password') [optional] - The database field containing the password on the user service.
- `userEndpoint` (default: '/users') [optional] - The user service endpoint
- `tokenEndpoint` (default: '/auth/token') [optional] - The JWT auth service endpoint
- `issuer` (default: 'feathers') [optional] - The JWT issuer field
- `algorithms` (default: ['HS256']) [optional] - The accepted JWT hash algorithms
- `expiresIn` (default: '1d') [optional] - The time a token is valid for

## Client Options

Normally you don't need to pass any options when registering the `feathers-authentication` module client side. However, if you need to customize your configuration on the client you can do this:

```js
app.configure(authentication({
  tokenEndpoint: '/token',
  localEndpoint: '/login'
}));
```

- `tokenEndpoint` (default: '/auth/token') [optional] - The JWT auth service endpoint.
- `localEndpoint` (default: '/auth/local') [optional] - The local auth service endpoint

### Using Feathers Client

The Feathers authentication module has a client side component that makes it very easy for you to add authentication to your app. It can be used in the browser, NodeJS and React Native. Refer to the [feathers client authentication section](./client.md) for more detail.

### Other Clients

Of course, if you don't want to use the feathers authentication client you can also just use vanilla sockets or ajax. It's a bit more work but honestly, not much more. We have some examples [here](https://github.com/feathersjs/feathers-authentication/tree/master/examples/basic).
