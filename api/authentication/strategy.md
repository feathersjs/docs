# AuthenticationStrategy

Authentication strategies are classes that implement at least an [authenticate]() method and can be registered with the AuthenticationService to authenticate service calls and other requests. The following strategies already come with Feathers:

- The `JWTStrategy` of `@feathersjs/authentication`
- `@feathersjs/authentication-local`
- `@feathersjs/authentication-oauth`

More details on how to customize existing strategies can be found in their respective API documentation. This section describes the common methods for all authentication strategies and how a custom authentication strategy can implemented.

## AuthenticationBaseStrategy

The `AuthenticationBaseStrategy` class provides a base class that already implements some of the strategy methods below with some common functionality:

- `setName` sets `this.name`
- `setApplication` sets `this.app`
- `setAuthentication` sets `this.authentication`
- `configuration` getter returns `this.authentication.configuration[this.name]`
- `entityService` getter returns the entity (usually `/users`) service from `this.app`


```js
const { AuthenticationBaseStrategy } = require('@feathersjs/authentication');

class AnonymousStrategy extends AuthenticationBaseStrategy {
  authenticate(authentication, params) {
    return {
      anonymous: true
    }
  }
}

app.service('authentication').register('anonymous', new AnonymousStrategy());
```

## setName(name)

Will be called with the `name` under which the strategy has been registered.

## setApplication(app)

Will be called with the [application]() instance.

## verifyConfiguration()

Synchronously verify the configuration for this strategy and throw an error if e.g. required fields are not set.

## setAuthentication(service)

Will be called with the [Authentication service]() this strategy has been registered on.

## authenticate(data, params)

Authenticate `data` with additional `params`. A strategy may check for `data.strategy` being set to its `name` and throw an error if it does not match. `authenticate` will be called for all strategies. `authenticate` should throw a `NotAuthenticated` if it failed or return an authentication result object.

## parse(req, res)

Parse a given plain Node HTTP request and response and return `null` or the authentication information it provides. `parse` does not have to implemented.
