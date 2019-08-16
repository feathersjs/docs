# Authentication

By now we created some [services](./services.md) and [hooks](./hooks.md) that make for a fully functional chat application. When we generated the services however, they came with authentication enabled. So in order to use them, we first need to create a new user and get a little bit of an idea how Feathers authentication works. We will look at using and authenticating our REST API as well as Feathers authentication in the browser. Lastly we will also discuss how to add a "Login with GitHub" (oAuth) functionality.

## Registering a user

Although the frontend we will create [in the next chapter](./frontend.md) will allow to register new users, let's have a quick look at how the REST API can be used directly to register a new user. We can do this by sending a POST request to `http://localhost:3030/users` with JSON data like this as the body:

```js
// POST /users
{
  "email": "hello@feathersjs.com",
  "password": "supersecret"
}
```

You can run the request with the [Postman API development tools](https://www.getpostman.com/) with this link:

[![Run in Postman](https://run.pstmn.io/button.svg)](https://app.getpostman.com/run-collection/6bcea48aac6c7494c2ad)

Using a CURL command it would look like this:

```sh
curl 'http://localhost:3030/users/' -H 'Content-Type: application/json' \ 
--data-binary '{ "email": "hello@feathersjs.com", "password": "supersecret" }'
```

> __Note:__ Creating a user with the same email address will only work once, then fail since it already exists in the database.

This will return something like this:

```js
```

Which means our user has been created successfully.

> __Note:__ The password is stored securely in the database but for will never be included in a client response.

## Get a token

By default, Feathers uses [JSON web token](https://jwt.io/) for authentication. It is an access token that is valid for a limited time (one day by default) that is issued by the Feathers server and needs to be sent with every API request that requires authentication. Usually a token is issued for a specific user and in our case we want a JWT for the user we just created.

> __Pro tip:__ If you are wondering why Feathers is using JWT for authentication, have a look at [this FAQ]().

Tokens can be created by sending a POST request to the `/authentication` endpoint (as we've learned, this is the same as calling the `create` method on the authentication service) passing the authentication strategy you want to use. To get a token for a user through a username (email) and password login we can use the built-in `local` authentication strategy with a request payload like this:

```js
// POST /authentication
{
  "strategy": "local",
  "email": "hello@feathersjs.com",
  "password": "supersecret"
}
```

To run in Postman, follow the link to the collection:

[![Run in Postman](https://run.pstmn.io/button.svg)](https://app.getpostman.com/run-collection/6bcea48aac6c7494c2ad)

As a CURL command:

```sh
curl 'http://localhost:3030/authentication/' -H 'Content-Type: application/json' \ 
--data-binary '{ "strategy": "local", "email": "hello@feathersjs.com", "password": "supersecret" }'
```

> __Pro tip:__ For more information about the direct usage of the REST API see the [REST client API](../../api/client/rest.md) and for websockets the [Socket.io client API](../../api/client/socketio.md).

## Browser authentication

When using Feathers on the client, the authentication client does all those authentication steps for us automatically. It stores the access token as long as it is valid so that a user does not have to log in every time they visit our site and sends it with every request. It also takes care of making sure that the user is always authenticated again, for example after they went offline for a few moment.

## GitHub login (oAuth)

oAuth is an open authentication standard supported by almost every major platform. It is what is being used by the login with Facebook, Google, GitHub etc. buttons in a web application. From the Feathers perspective the authentication flow is pretty similar. Instead of authenticating with the `local` strategy by sending a username and password, we direct the user to authorize the application with the login provider. If it is successful we find or create the user on the `users` service with the information we got back from the provider and issue a token for them.

Let's use GitHub as an example for how to set up a "Login with GitHub" button. First, we have to [create a new oAuth application on GitHub]().

Then we have to update our configuration with that application id and secret. Find the `authentication` section in `config/default.json` add them in like this:

```js
{
  "authentication": {
    // Other authentication configuration is here
    // ...
    "oauth": {
      "redirect": "/",
      "github": {
        "key": "<app key>",
        "secret": "<app secret>"
      }
    }
  }
}
```

This tells the oAuth strategy to redirect back to our index page after a successful login and already makes a basic login with GitHub possible. Because of the changes we made in the `users` service in the [services chapter](./service.md) we do need a small customization though. Instead of only adding `githubId` to a new user when they log in with GitHub we also need to include their email from the profile we get back since we use it as their username and to fetch the avatar. We can do this by extending the standard oAuth strategy and registering it as a GitHub specific one and overwriting the `getEntityData` method:

:::: tabs :options="{ useUrlFragment: false }"
::: tab "JavaScript"
Update `src/authentication.ts` as follows:

```js
const { AuthenticationService, JWTStrategy } = require('@feathersjs/authentication');
const { LocalStrategy } = require('@feathersjs/authentication-local');
const { expressOauth, OAuthStrategy } = require('@feathersjs/authentication-oauth');

class GitHubStrategy extends OAuthStrategy {
  async getEntityData(profile) {
    const baseData = await super.getEntityData(profile);

    return {
      ...baseData,
      email: profile.email
    };
  }
}

module.exports = app => {
  const authService = new AuthenticationService(app);

  authService.register('jwt', new JWTStrategy());
  authService.register('local', new LocalStrategy());
  authService.register('github', new GitHubStrategy());

  app.use('/authentication', authService);
  app.configure(expressOauth());
};
```
:::
::: tab "TypeScript"
```ts

```
:::
::::

> __Pro tip:__ For more information about the oAuth flow and strategy see the [oAuth strategy API documentation](../../api/authentication/oauth.md).


## What's next?


