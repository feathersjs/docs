# Anonymous authentication

Anonymous authentication can be allowed by creating a [custom strategy](../../api/authentication/strategy.md) that returns the `params` that you would like to use to identify an authenticated user.

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

Next, we need to create a hook called `allow-anonymous` that sets [params.authentication]() if it does not exist and if `params.provider` exists (which means it is an external call) to use that `anonymous` strategy:

```js
const { params } = context;

if(params.provider && !params.authentication) {
  params.authentication = {
    strategy: 'anonymous'
  }
}
```

This hook should be added __before__ the [authenticate hook]() wherever anonymous authentication should be allowed:

```
all: [ allowAnonymous(), authenticate('jwt', 'anonymous') ]
```

If an anonymous user now accesses the service externally, the service call will succeed and have `params.anonymous` set to `true`.
