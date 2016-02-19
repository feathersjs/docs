# Setting up Local Authentication

The local auth strategy makes it easy to add _username_ and _password_ authentication for your app. Once a user has successfully authenticated they get a JSON Web Token (JWT) in return to user for future authentication with your feathers app.

## Usage

### Server Side

This is what a typical server setup looks like:

```js
app.configure(authentication());
```

Normally you don't need to pass any options for local auth when registering the `feathers-authentication` module server side.

#### Local Service Specific Options

All of the top level authentication options are passed to the local authentication service. If you need to customize your local specific configuration further you can use these options:

- `usernameField` (default: 'email') [optional] - The database field on the user service you want to use as the username.
- `passwordField` (default: 'password') [optional] - The database field containing the password on the user service.

### Client Side

#### Using Feathers Client

The Feathers authentication module has a client side component that makes it very easy for you to add authentication to your app. It can be used in the browser, NodeJS and React Native. Refer to the [feathers client authentication section](./client.md) for more detail.

#### Other Clients

Of course, if you don't want to use the feathers authentication client you can also just use vanilla sockets or ajax. It's a bit more work but honestly, not much more. We have some examples [here](https://github.com/feathersjs/feathers-authentication/tree/master/examples/basic).
