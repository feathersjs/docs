# Setting up Local Authentication

The local auth strategy makes it easy to add _username_ and _password_ authentication for your app. Once a user has successfully authenticated they get a JSON Web Token (JWT) in return to user for future authentication with your feathers app.

## Server Options

This is what a typical server setup looks like:

```js
app.configure(authentication());
```

Normally you don't need to pass any options for local auth when registering the `feathers-authentication` module server side. However, if you need to customize your configuration on the server you use these options:

- `usernameField` (default: 'email') [optional] - The database field on the user service you want to use as the username.
- `passwordField` (default: 'password') [optional] - The database field containing the password on the user service.
- `userEndpoint` (default: '/users') [optional] - The user service endpoint
- `localEndpoint` (default: '/auth/local') [optional] - The local auth service endpoint
- `tokenEndpoint` (default: '/auth/token') [optional] - The JWT auth service endpoint
- `successRedirect` (default: '/auth/success') [optional] - The endpoint to redirect to after successful authentication or signup.

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
