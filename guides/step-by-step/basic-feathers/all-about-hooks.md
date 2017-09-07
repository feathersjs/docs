# All About Hooks

## Method hooks

Each service method may have its own hooks.
After all, you'll likely need to do something different for `create` than for a `find`.

![method hooks](../assets/hook-flow-2-methods.jpg)

The Feathers code would be:
```javascript
const messagesHooks = {
  before: {
    find: hook11(),
    get: hook21(),
    create: [ hook31(), hook32() ],
    update: hook41(),
    patch: hook51(),
    remove: hook61(),
  },
  after: {
    find: [ hook15(), hook16() ],
    create: hook35(),
    update: hook45(),
    patch: hook55(),
    remove: hook65(),
  }
};
const messages = app.service('messages');
messages.hooks(messagesHooks);
```

> **ProTip:** The Feathers service call handler expects the functions it calls to have the
signature `context => {}`.
So if you have such a hook you would code `{ before: { all: myHook } }`.
You however commonly want to pass params to the hook, such as which field in the record to delete.
So you need to use a signature like `params => context => { /* use params */ }` and code
`all: myHook(params)`.
The common hooks and the Feathers community tend to use the latter signature for consistency.
So it would be best to set up your hooks to use `myHook()`.

## Service hooks

Some hooks, such as authentication, may need to be run for every method.
You can specify them once rather than repeating them for every method.

![service hooks](../assets/hook-flow-3-service.jpg)

Your Feathers code would *additionally* include:
```javascript
const messagesHooks = {
  before: {
    all: hook01(),
  },
  after: {
    all: hook05(),
  }
};
```

## App hooks

You may want to run some hooks for every service.
The [Feathers profiler](https://github.com/feathersjs/feathers-profiler),
for example, adds before and after hooks to time each service call.

![app hooks](../assets/hook-flow-4-app.jpg)

The Feathers code for these application level hooks would be:
```javascript
app.hooks({
  before: {
    create: hook30a()
  },
  after: {
    create: hook39a()
  },
});
```

## Errors and error hooks

Errors may be thrown inside hooks - by JavaScript, by the Feathers database adapter,
or by your own code.

Your hook can, for example, return a formatted message as follows:
```javascript
// On server
const errors = require('feathers-errors');
throw new errors.BadRequest('Invalid request', {errors: {email: 'Invalid Email'} }); // inside hook

// On client
messages.create(...)
  .then(data => ...)
  .catch(err => {
    console.log(err.messages); // Invalid request
    console.log(err.errors.email); // Invalid Email
  });
```

You can optionally deal with thrown errors in the service:

![full hooks](../assets/hook-flow-5.jpg)

Your Feathers code would *additionally* include:
```javascript
app.hooks({
  error: {
    all: hook00e(),
    create: hook30e()
  }
});
```

### Is anything wrong, unclear, missing?
[Leave a comment.](https://github.com/feathersjs/feathers-docs/issues/new?title=Comment:Step-Basic-About-Hooks-2&body=Comment:Step-Basic-About-Hooks-2)

