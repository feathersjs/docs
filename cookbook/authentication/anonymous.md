# Anonymous strategy

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
