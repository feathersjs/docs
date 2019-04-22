# authenticate hook

The `authenticate` hook will use `params.authentication` of the service method call and run [authenticationService.authenticate()]().

It should be used as a `before` hook and either takes a list of strategy names (using `app.service('authentication')` as the authentication service) or an object with `service` set to the authentication service name and `strategies` set to a list of strategy names to authenticate with:

```js
const { authenticate } = require('@feathersjs/authentication');

// Authenticate with `jwt` and `api-key` strategy
// using app.service('authentication') as the authentication service
app.service('messages').hooks({
  before: authenticate('jwt', 'api-key')
});

// Authenticate with `jwt` and `api-key` strategy
// using app.service('v1/authentication') as the authentication service
app.service('messages').hooks({
  before: authenticate({
    service: 'v1/authentication',
    strategies: [ 'jwt', 'api-key' ]
  })
});
```

It will either throw an error if all strategies failed or merge `params` with the result from the first successful authentication strategy. For example, a successful [JWT strategy]() authentication will set:

```js
params.authentication.payload // The decoded payload
params.authentication.strategy === 'jwt' // The strategy name
params.user // or params[entity] if entity is not `null`
```

In the following hooks and for the service method call.
