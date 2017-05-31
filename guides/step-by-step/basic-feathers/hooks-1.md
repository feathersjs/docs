# Hooks, part 1

## Common hooks

Hooks allows us to combine simple functions to build complicated solutions.
Most hooks will be general in nature and they may be used with multiple services.

Feathers comes with a set of
[commonly useful hooks](../../../api/hooks-common.md).
Let's work with some of them.


## Working example

- Server code: [examples/step/01/hooks/1.js](https://github.com/feathersjs/feathers-docs/blob/master/examples/step/01/hooks/1.js)
- Client code: [common/public/rest.html](https://github.com/feathersjs/feathers-docs/blob/master/examples/step/01/common/public/rest.html)
and
[feathers-app.js](https://github.com/feathersjs/feathers-docs/blob/master/examples/step/01/common/public/feathers-app.js)
- Start the server: `node ./examples/step/01/hooks/1`
- Point the browser at: `localhost:3030/rest.html`
- Compare with last page's server
[examples/step/01/hooks/1.js](https://github.com/feathersjs/feathers-docs/blob/master/examples/step/01/hooks/1.js):
[Unified](http://htmlpreview.github.io/?https://github.com/feathersjs/feathers-docs/blob/master/examples/step/_diff/01-hooks-1-line.html)
|
[Split](http://htmlpreview.github.io/?https://github.com/feathersjs/feathers-docs/blob/master/examples/step/_diff/01-hooks-1-side.html)

## Writing hooks

Let's add some hooks to the server we've used with the Feathers REST and WebSocket clients.

```javascript
const authHooks = require('feathers-authentication-local').hooks;
const hooks = require('feathers-hooks');
const commonHooks = require('feathers-hooks-common');

const app = httpServerConfig()
  .configure(hooks())

function services() {
  this.configure(user);
}

function user() {
  const app = this;

  app.use('/users', service({ Model: userModel() }));
  const userService = app.service('users');

  const { validateSchema, setCreatedAt, setUpdatedAt, unless, remove } = commonHooks;

  userService.before({
    create: [
      validateSchema(userSchema(), Ajv), authHooks.hashPassword(), setCreatedAt(), setUpdatedAt()
    ]});
  userService.after({
    all: unless(hook => hook.method === 'find', remove('password')),
  });
}

function userSchema() {
  return {
    title: 'User Schema',
    $schema: 'http://json-schema.org/draft-04/schema#',
    type: 'object',
    required: [ 'email', 'password', 'role' ],
    additionalProperties: false,
    properties: {
      email: { type: 'string', maxLength: 100, minLength: 6 },
      password: { type: 'string', maxLength: 30, minLength: 8 },
      role: { type: 'string' }
    }
  };
}
```
- See what changed:
[Unified](http://htmlpreview.github.io/?https://github.com/feathersjs/feathers-docs/blob/master/examples/step/_diff/01-hooks-1-line.html)
|
[Split](http://htmlpreview.github.io/?https://github.com/feathersjs/feathers-docs/blob/master/examples/step/_diff/01-hooks-1-side.html)


### - .configure(hooks())

We include support for hooks in the configuration.

### - this.configure(user);

The user service is now more complex, so we configure it on its own.

### - const { validateSchema, setCreatedAt, setUpdatedAt, unless, remove } = commonHooks;

Feathers comes with a library of useful hooks.
Here we get some common hooks from
[`feathers-hooks-common`](../../../api/hooks-common.md).
More specialized hooks come bundled with their specialized packages.

### - userService.before({ ... });

These hooks will be run before the operation on the database.

### - create: [ ... ]

These hooks will be run before all `create` operations on the database.
`all` (all service methods), `get`, `update`', `patch`, `remove`, `find` may also be included.

### - validateSchema(userSchema(), Ajv)

Validate the data we are to add using [ajv](https://github.com/epoberezkin/ajv).
The service's [JSON schema](https://github.com/json-schema-org/json-schema-spec)
is provided by `function userSchema`.

There are
[good tutorials](https://code.tutsplus.com/tutorials/validating-data-with-json-schema-part-1--cms-25343)
on validating data with JSON schema.

### - authHooks.hashPassword()

The data has a `password` field.
This specialized authentication hook will replace it with a hashed version
so the password may be stored safely.

> **bcrypt.** Feathers hashes passwords using [bycrypt](https://www.npmjs.com/package/bcryptjs).
Bcrypt has the best kind of repute that can be achieved for a cryptographic algorithm:
it has been around for quite some time, used quite widely, "attracted attention",
and yet remains unbroken to date.
[(Reference.)](http://security.stackexchange.com/questions/4781/do-any-security-experts-recommend-bcrypt-for-password-storage)

> **JSON webtoken.** Feathers Authentication uses JSON webtoken (JWT) for secure authentication
between a client and server as opposed to cookies and sessions.
The cookies vs token debate
[favors token-based authentication](https://auth0.com/blog/cookies-vs-tokens-definitive-guide/).
The avoidance of sessions makes Feathers apps more easily scalable.

### - setCreatedAt(), setUpdatedAt()

These hooks add `createdAt` and `updatedAt` properties to the data.

### - userService.after({ ... });

These hooks are run after the operation on the database.
They act on all the results returned by the operation.

### - unless(hook => hook.method === 'find', remove('password'))

- `hook => hook.method === 'find'` returns true if the database operation was a `find`.
All hooks are passed a [hook object](../../../api/hooks.md#hook-objects)
which contains information about the operation.

- `remove('password')`
removes the `password` property from the results.

- `unless(predicate, ...hooks)`
runs the hooks if the predicate is false.

Its not secure to return the encoded password to the client, so this hook removes it.
We have made an exception for the find operation because we want you to see something
in the results.

> **Hooks.** We are now doing some processing typical of apps.
Before we add a new user, we verify the data, encode the password,
and add createdAt plus updatedAt properties.
We remove the password field before we return the results to the client.

## Hooks

Many of your common needs are already handled by hooks in the
[common hooks library](../../../api/hooks-common.md).
This may significantly reduce the code you need to write.

Hooks are just small middleware functions that get applied before and after a service method executes.

Hooks are transport independent. It does not matter if the service request come through
HTTP REST, Feathers REST, Feathers WebSockets, or any other transport Feathers may support in the future.

Most hooks can be used with any service.
This allows you to easily decouple the actual service logic from things like
authorization, data pre-processing (sanitizing and validating),
data post processing (serialization),
or sending notifications like emails or text messages after something happened.

You can swap databases with minimal application code changes.
You can also share validations for multiple databases in the same app, across multiple apps,
and with your client.

## Results

The browser console displays

```text
created Jane Doe item
  Object {email: "jane.doe@gmail.com", role: "admin", createdAt: "2017-05-31T08:33:07.642Z", updatedAt: "2017-05-31T08:33:07.643Z", _id: "VNSm7SxZnMeVxN6Z"}
created John Doe item
  Object {email: "john.doe@gmail.com", role: "user", createdAt: "2017-05-31T08:33:07.643Z", updatedAt: "2017-05-31T08:33:07.643Z", _id: "SHyBbGehbEiZGpQS"}
created Judy Doe item
  Object {email: "judy.doe@gmail.com", role: "user", createdAt: "2017-05-31T08:33:07.645Z", updatedAt: "2017-05-31T08:33:07.645Z", _id: "2zFj0CoGjczuQP5B"}
find all items
  [Object, Object, Object]
    0: Object
      email: "judy.doe@gmail.com"
      password: "$2a$10$TnuSw.O9Jfss61BUFB0TteT9dDOdtSX00C.19vX484eICygo7xXMe"
      role: "user"
      createdAt: "2017-05-31T08:33:07.645Z"
      updatedAt: "2017-05-31T08:33:07.645Z"
      _id: "2zFj0CoGjczuQP5B"
    1: Object
      email: "john.doe@gmail.com"
      password: "$2a$10$jI7lypIIiImLw7Kf9mN.NOfaRkdP0sM0CeR1anH0J/f6p3fI9s2nu"
      role: "user"
      createdAt: "2017-05-31T08:33:07.643Z"
      updatedAt: "2017-05-31T08:33:07.643Z"
      _id: "SHyBbGehbEiZGpQS"
    2: Object
      email: "jane.doe@gmail.com"
      password: "$2a$10$Dx3e/3vSn4Eq2MRvKAUGYeUMWMUeuTG6PCJpxx9/Uyov5IZRb1B.6"
      role: "admin"
      createdAt: "2017-05-31T08:33:07.642Z"
      updatedAt: "2017-05-31T08:33:07.643Z"
      _id: "VNSm7SxZnMeVxN6Z"
    length: 3
```

- `createdAt` and `updatedAt` have been added to the items.
- `password` is not included in the data returned for the create and delete operations.
- An encoded `password` is included for the find operation,
because of the special coding we included in the example.

### Is anything wrong, unclear, missing?
[Leave a comment.](https://github.com/feathersjs/feathers-docs/issues/new?title=Comment:Step-Basic-Hooks-1&body=Comment:Step-Basic-Hooks-1)
