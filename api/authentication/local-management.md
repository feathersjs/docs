# Local Authentication Management

[![GitHub stars](https://img.shields.io/github/stars/feathers-plus/feathers-authentication-management.png?style=social&label=Star)](https://github.com/feathers-plus/feathers-authentication-management/)
[![npm version](https://img.shields.io/npm/v/feathers-authentication-management.png?style=flat-square)](https://www.npmjs.com/package/feathers-authentication-management)
[![Changelog](https://img.shields.io/badge/changelog-.md-blue.png?style=flat-square)](https://github.com/feathers-plus/feathers-authentication-management/blob/master/CHANGELOG.md)


```
$ npm install feathers-authentication-management --save
```

Sign up verification, forgotten password reset, and other capabilities for local authentication.

[feathers-authentication-management](https://github.com/feathers-plus/feathers-authentication-management) is both a server and client side module that adds the method `authManagement` to your app.

This module contains 2 core pieces:

1. The server initialization function
2. The client initialization function

## Configuration server side

Initialize the module server side like this:

```js
const feathers = require('feathers');
const authentication = require('feathers-authentication');
const local = require('feathers-authentication-local');
const management = require('feathers-authentication-management');

const app = feathers();

app.configure(authentication(settings));
app.configure(local());
app.configure(management());
// make sure you have a user service too


// allow only signed in users to use passwordChange and identityChange

const isAction = (...args) => hook => args.includes(hook.data.action);

app.service('authManagement').before({
  create: [
    hooks.iff(isAction('passwordChange', 'identityChange'), auth.hooks.authenticate('jwt')),
  ],
});
```

```

This will add the service `authManagement` to your app. Default options are given below.

### Default options server side

```js
{
  service: '/users',  // path to user service
  path: 'authManagement',  // path for auth management service, see multiple services below
  notifier: (type, user, notifierOptions) => Promise.resolve(),  // function which sends notifications to user through email, SMS, etc
  longTokenLen: 15, // URL-token's length will be twice this
  shortTokenLen: 6,  // length of SMS tokens
  shortTokenDigits: true,  // if SMS token should be digits only
  resetDelay: 1000 * 60 * 60 * 2, // expiration for sign up email verification token in ms
  delay: 1000 * 60 * 60 * 24 * 5, // expiration for password reset token in ms
  skipIsVerifiedCheck: false, // allow sendResetPwd and resetPwd for unverified users
  identifyUserProps: ['email'], // property in user-item which uniquely identifies the user,
                                // at least one of these props must be provided whenever a short token is used
  sanitizeUserForClient: sanitizeUserForClient
}
```

`notifier` arguments:
- `type`: type of notification, may be
  - `'resendVerifySignup'`    From `resendVerifySignup` API call
  - `'verifySignup'`          From `verifySignupLong` and `verifySignupShort` API calls
  - `'sendResetPwd'`          From `sendResetPwd` API call
  - `'resetPwd'`              From `resetPwdLong` and `resetPwdShort` API calls
  - `'passwordChange'`        From `passwordChange` API call
  - `'identityChange'`        From `identityChange` API call
- `user`: user's item, minus password.
- `notifierOptions`: `notifierOptions` from `resendVerifySignup` and `sendResetPwd` API calls

## Configuration client side

Initialize the module server side like this:

```js
import AuthManagement from 'feathers-authentication-management/lib/client'

const app = feathers()
const authManagement = new AuthManagement(app);
```

Here `authManagement` is a wrapper around the `authManagement` service. `authManagement` has several methods, and all of them returns a promise. The methods are:

- `checkUnique(identifyUser, ownId, ifErrMsg)`: check props are unique in the users items
  - `identifyUser`: `{ email, username }`. Props with null or undefined are ignored.
  - `ownId` Excludes your current user from the search. Allows the "current" item to be ignored when checking if a field value is unique amoung users.
  - `ifErrMsg` Determines if the returned error.message contains text. This may simplify your client side validation.

- `resendVerifySignup(identifyUser, notifierOptions)`: resend sign up verification notification
  - `identifyUser` `{ email }`, `{ token: verifyToken }`
  - `notifierOptions` Options passed to options.notifier, e.g. `{ preferredComm: 'cellphone' }`.

- `verifySignupLong(verifyToken)`: sign up or identityChange verification with long token
  - `verifyToken` Compares to `verifyToken` FIXME: Unclear.

- `verifySignupShort(verifyShortToken, identifyUser)`: sign up or identityChange verification with short token
  - `verifyShortToken` Compares to .verifyShortToken FIXME: Unclear.
  - `identifyUser` Identify user, e.g. `'a@a.com'`. See `options.identifyUserProps`.

- `sendResetPwd(identifyUser, notifierOptions)`: send forgotten password notification
  - `identifyUser` Identify user, e.g. `'a@a.com'`. See `options.identifyUserProps`.
  - `notifierOptions` Options passed to options.notifier, e.g. `{ preferredComm: 'cellphone' }`.

- `resetPwdLong(resetToken, password)`: forgotten password verification with long token
  - `resetToken` Compares to .resetToken FIXME: Unclear.
  - `password` New password.

- `resetPwdShort(resetShortToken, identifyUser, password)`: forgotten password verification with short token
  - `resetShortToken` Compares to .resetToken FIXME: Unclear.
  - `identifyUser` Identify user, e.g. `'a@a.com'`. See `options.identifyUserProps`.
  - `password` New password.

- `passwordChange(oldPassword, password, identifyUser)`: change password
  - `oldPassword` Old password for verification.
  - `password` New password.
  - `identifyUser` Identify user, e.g. `'a@a.com'`. See `options.identifyUserProps`.

- `identityChange(password, changesIdentifyUser, identifyUser)`: change identity
  - `password` Current password for verification.
  - `changesIdentifyUser` New identity. E.g. `'a@a.com'` or `'+1-800-555-1212'`.
  - `identifyUser` Identify user, e.g. `'a@a.com'`. See `options.identifyUserProps`.

## Direct usage with HTTP requests

We recomend to use the client side wrapper, but if you need access on a limited client, you may use HTTP requests. All methods above are available through

```js
app.service('authmanagement').create({
  action: nameOfMethod,
  value: someValue
})
```

Which means you can access the methods [directly](/api/rest.md#direct-connection) if you have initialized the [REST inferface](/api/rest.md) server side.

Here `nameOfMethod` should be `'checkUnique'`, `'resendVerifySignup'`, `'verifySignupLong'`, `'verifySignupShort'`, `'sendResetPwd'`, `'resetPwdLong'`, `'resetPwdShort'`, `'passwordChange'`, or `'identityChange'`.

Example:
```
curl -D "{ TODO }" -X POST http://localhost:3030/authManagement/
```

## Added properties in the user item

The service creates and maintains the following properties in the `user` item:

- `isVerified`:       If the user's email addr has been verified (boolean)
- `verifyToken`:      The 30-char token generated for email addr verification (string)
- `verifyShortToken`: The 6-digit token generated for cellphone addr verification (string)
- `verifyExpires`:    When the email addr token expire (Date)
- `verifyChanges`     New values to apply on verification to some identifyUserProps (string array)
- `resetToken`:       The 30-char token generated for forgotten password reset (string)
- `resetShortToken`:  The 6-digit token generated for forgotten password reset (string)
- `resetExpires`:     When the forgotten password token expire (Date)

The `user` item might also contain the following props:

- `preferredComm`:    The preferred way to notify the user. One of `identifyUserProps`.

The user service `patch` method is used to update the password. This module hashes the
password before it is passed to `patch`, therefore make sure `patch` *does not* use the
`authentication.hashPassword()` hook.

## React Redux

You can use feathers redux to use authManagement through a reducer. For more information, see [feathers-redux documentation](https://github.com/feathers-plus/feathers-redux).

### Example with Redux

```js
import feathers from 'feathers-client';
import reduxifyServices from 'feathers-reduxify-services';
const app = feathers().configure(feathers.socketio(socket)).configure(feathers.hooks());
const services = reduxifyServices(app, ['users', 'authManagement', ...]);
...
// hook up Redux reducers
export default combineReducers({
  users: services.users.reducer,
  authManagement: services.authManagement.reducer,
});
...

// email addr verification with long token
// Feathers is now 100% compatible with Redux. Use just like [Feathers method calls.](#methods)
store.dispatch(services.authManagement.create({ action: 'verifySignupLong',
    value: verifyToken,
  }, {})
);
```

-------------- EDITED UNTIL HERE -----------------

### Dispatching authentication

User must be verified to sign in. v0.x only.

```javascript
const reduxifyAuthentication = require('feathers-reduxify-authentication');
const signin = reduxifyAuthentication(app, { isUserAuthorized: (user) => user.isVerified });

// Sign in with the JWT currently in localStorage
if (localStorage['feathers-jwt']) {
  store.dispatch(signin.authenticate()).catch(err => { ... });
}

// Sign in with credentials
store.dispatch(signin.authenticate({ type: 'local', email, password }))
  .then(() => { ... )
  .catch(err => { ... });
```

## Hooks
The service does not itself handle creation of a new user account nor the sending of the initial
sign up verification request.
Instead hooks are provided for you to use with the `users` service `create` method. If you set a service path other than the default of `'authManagement'`, the custom path name must be passed into the hook.

### `verifyHooks.addVerification( path = 'authManagement' )`

```javascript
const verifyHooks = require('feathers-authentication-management').hooks;
// users service
module.exports.before = {
  create: [
    auth.hashPassword(),
    verifyHooks.addVerification() // adds .isVerified, .verifyExpires, .verifyToken, .verifyChanges to the incoming data
  ]
};
module.exports.after = {
  create: [
    hooks.remove('password'),
    aHookToEmailYourVerification(),
    verifyHooks.removeVerification() // removes verification/reset fields other than .isVerified from the outgoing response
  ]
};
```

### `verifyHooks.isVerified()`

A hook is provided to ensure the user's email addr is verified:

```javascript
const auth = require('feathers-authentication').hooks;
const verifyHooks = require('feathers-authentication-management').hooks;
export.before = {
  create: [
    auth.authenticate('jwt'),
    verifyHooks.isVerified(),
  ]
};
```

## Multiple services

We have considered until now situations where authentication was based on a user item.
`feathers-authorization` however allows users to sign in with group and organization
credentials as well as user ones.

You can easily configure `feathers-authentication-management` to handle such situations.
Please refer to `test/multiInstances.test.js`.


## Database

The service adds the following optional properties to the user item.
You should add them to your user model if your database uses models.

```javascript
{
  isVerified: { type: Boolean },
  verifyToken: { type: String },
  verifyShortToken: { type: String },
  verifyExpires: { type: Date }, // or a long integer
  verifyChanges: // an object (key-value map), e.g. { field: "value" }
  resetToken: { type: String },
  resetShortToken: { type: String },
  resetExpires: { type: Date }, // or a long integer
}
```

## Routing

The client handles all interactions with the user.
Therefore the server must serve the client app when, for example, a URL link is followed
for email addr verification.
The client must do some routing based on the path in the link.

Assume you have sent the email link:
`http://localhost:3030/socket/verify/12b827994bb59cacce47978567989e`

The server serves the client app on `/socket`:

```javascript
// Express-like middleware provided by Feathersjs.
app.use('/', serveStatic(app.get('public')))
   .use('/socket', (req, res) => {
    res.sendFile(path.resolve(__dirname, '..', 'public', 'socket.html')); // serve the client
  })
```

The client then routes itself based on the URL.
You will likely use you favorite client-side router,
but a primitive routing would be:

```javascript
const [leader, provider, action, slug] = window.location.pathname.split('/');

switch (action) {
  case 'verify':
    verifySignUp(slug);
    break;
  case 'reset':
    resetPassword(slug);
    break;
  default:
    // normal app startup
}
```

## Security
- The user must be identified when the short token is used, making the short token less appealing
as an attack vector.
- The long and short tokens are erased on successful verification and password reset attempts.
New tokens must be acquired for another attempt.
- API params are verified to be strings. If the param is an object, the values of its props are
verified to be strings.
- options.identifyUserProps restricts the prop names allowed in param objects.
- In order to protect sensitive data, you should set a hook that prevent `PATCH` or `PUT` calls on
authentication-management related properties:
```javascript
// in user service hook
before: {
  update: [
    iff(isProvider('external'), preventChanges(
      'isVerified',
      'verifyToken',
      'verifyShortToken',
      'verifyExpires',
      'verifyChanges',
      'resetToken',
      'resetShortToken',
      'resetExpires'
    )),
  ],
  patch: [
    iff(isProvider('external'), preventChanges(
      'isVerified',
      'verifyToken',
      'verifyShortToken',
      'verifyExpires',
      'verifyChanges',
      'resetToken',
      'resetShortToken',
      'resetExpires'
    )),
  ],
},
```
