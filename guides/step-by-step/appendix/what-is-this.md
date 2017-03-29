# What is 'this'?

#### In a service configuration

Its the Feathers configuration's app object.

```javascript
// src/services/user/index.js
module.exports = function () {
  const app = this;
  // ...
}
```

#### In a hook definition

Its the service object.

```javascript
// src/hooks/index.js
function myHook (...params) {
  // ...
  return function (hook) {
    const service = this;
    // ...
  };
}
```

> **Bonus.** `hook.path` is the route the service is defined on.

### Is anything wrong, unclear, missing?
[Leave a comment.](https://github.com/feathersjs/feathers-guide/issues/new?title=Comment:Step-Appendix-What-is-this&body=Comment:Step-Appendix-What-is-this)
