# Token Authentication

The JSON web token (JWT) auth strategy is enabled by default with Feathers authentication.

If you already have an app started, you can simply add the following line to your server setup.

```js
app.configure(authentication({
    token: {
        secretL 'my-secret'
    }
}));
```

## Server Options

- `secret` (**required**) (default: a strong auto generated one) - Your secret used to encrypt and decrypt JWT's. If this gets compromised you need to rotate it immediately!
- `passwordField` (default: 'password') [optional] - The database field containing the password on the user service.
- `userEndpoint` (default: '/users') [optional] - The user service endpoint
- `tokenEndpoint` (default: '/auth/token') [optional] - The JWT auth service endpoint
- `issuer` (default: 'feathers') [optional] - The JWT issuer field
- `algorithms` (default: ['HS256']) [optional] - The accepted JWT hash algorithms
- `expiresIn` (default: '1d') [optional] - The time a token is valid for

## Client Options
