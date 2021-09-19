# API Key Authentication

We will start by providing the required configuration for this strategy. You should change all of these values as per your requirement.

```js
{
  "authentication": {
    ...otherConfig,
    "authStrategies": [ ...otherStrategies, "apiKey" ],
    "apiKey": {
      "allowedKeys": [ "API_KEY_1", "API_KEY_2" ]
      "header": "x-access-token"
    }
  }
}
```

Next we will be creating a [custom strategy](../../api/authentication/strategy.md) that returns the `params` that you would like to use to identify an authenticated user/request.

:::: tabs :options="{ useUrlFragment: false }"
::: tab "JavaScript"
In `src/authentication.js`:

```js
const { AuthenticationBaseStrategy, AuthenticationService } = require('@feathersjs/authentication');
const { NotAuthenticated } = require('@feathersjs/errors');

class ApiKeyStrategy extends AuthenticationBaseStrategy {
  async authenticate(authentication) {
    const { token } = authentication;
  
    const config = this.authentication.configuration[this.name];

    const match = config.allowedKeys.includes(token);
    if (!match) throw new NotAuthenticated('Incorrect API Key');
  
    return {
      apiKey: true
    }
  }
}

module.exports = app => {
  const authentication = new AuthenticationService(app);
  // ... authentication service setup
  authentication.register('apiKey', new ApiKeyStrategy());
}
```
:::
::: tab "TypeScript"
```ts
import { AuthenticationBaseStrategy, AuthenticationResult, AuthenticationService } from '@feathersjs/authentication';
import { NotAuthenticated } from '@feathersjs/errors': 

class ApiKeyStrategy extends AuthenticationBaseStrategy {
  async authenticate(authentication: AuthenticationResult) {
    const { token } = authentication;
  
    const config = this.authentication.configuration[this.name];

    const match = config.allowedKeys.includes(token);
    if (!match) throw new NotAuthenticated('Incorrect API Key');
  
    return {
      apiKey: true
    }
  }
}

export default function(app: Application) {
  const authentication = new AuthenticationService(app);
  // ... authentication service setup
  authentication.register('apiKey', new ApiKeyStrategy());
}
```
:::
::::


Next, we create a hook called `allow-apiKey` that sets `params.authentication` if it does not exist and if `params.provider` exists (which means it is an external call) to use that `apiKey` strategy. We will also provide the capability for the apiKey to be read from the request header: (you could also read the token as a query parameter but you will have to filter it out before it's passed to Feathers calls like `get` and `find`.

:::: tabs :options="{ useUrlFragment: false }"
::: tab "JavaScript"
```js
/* eslint-disable require-atomic-updates */
module.exports = function (options = {}) { // eslint-disable-line no-unused-vars
  return async context => {
    const { params, app } = context;
    
    const headerField = app.get('authentication').apiKey.header;
    const token = params.headers[headerField];

    if (token && params.provider && !params.authentication) {
      context.params = {
        ...params,
        authentication: {
          strategy: 'apiKey',
          token
        }
      };
    }

    return context;
  };
};
```
:::
::: tab "TypeScript"
```ts
import { Hook, HookContext } from '@feathersjs/feathers';

export default (): Hook => {
  return async (context: HookContext) => {
    const { params, app } = context;

    const headerField = app.get('authentication').apiKey.header;
    const token = params.headers[headerField];

    if (token && params.provider && !params.authentication) {
      context.params = {
        ...params,
        authentication: {
          strategy: 'apiKey',
          token
        }
      };
    }

    return context;
  }
}
```
:::
::::

This hook should be added __before__ the [authenticate hook](../../api/authentication/hook.md) wherever API Key authentication should be allowed:

```js
all: [ allowApiKey(), authenticate('jwt', 'apiKey') ],
```

If a user now accesses the service externally with the correct apiKey, the service call will succeed and have `params.apiKey` set to `true`.
