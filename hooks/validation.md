# Validation

## validate
`validate(validator: function): HookFunc`

Call a validation function from a `before` hook. The function may be sync or return a Promise.

- Used as a `before` hook for `create`, `update` or `patch`.

> **ProTip:** If you have a different signature for the validator then pass a wrapper as the validator e.g. `(values) => myValidator(..., values, ...)`.

> **ProTip:** If your validator uses a callback, wrap your validator in a Promise

```javascript
const fnPromisify = require('feathers-hooks-common/lib/promisify').fnPromisifyCallback;
function myCallbackValidator(values, cb) { ... }
const myValidator = fnPromisifyCallback(myCallbackValidator, 1); // function requires 1 param
app.service('users').before({ create: validate(myValidator) });
```     
#### Options

- `validator` [required] - Validation function with signature `function validator(formValues)`.

Sync functions return either an error object or null. Validate will throw on an error
object with `throw new errors.BadRequest({ errors: errorObject });`.

Promise functions should throw on an error. Their `.then` returns either sanitized values to
replace hook.data, or null.

## validation example

Comprehensive validation may include the following:

- Object schema validation. Checking the item object contains the expected properties with values in the expected format. The values might get sanitized. Knowing the item is well formed makes further validation simpler.
- Re-running any validation supposedly already done on the front-end. It would an asset if the server can re-run the same code the front-end used.
- Performing any validation and sanitization unique to the server.

A full featured example of such a process appears below. It validates and sanitizes a new user before adding the user to the database.

- The form expects to be notified of errors in the format `{ email: 'Invalid email.', password: 'Password must be at least 8 characters.' }`.
- The form calls the server for async checking of selected fields when control leaves those fields. This for example could check that an email address is not already used by another user.
- The form does local sync validation when the form is submitted.
- The code performing the validations on the front-end is also used by the server.
- The server performs schema validation using `Joi`.
- The server does further validation and sanitization.

### Validation without using validate

The `before` hooks module for service `users`. It includes hooks for the above validations. These validations use sync, Promise and callback functions to show how the 3 different types of functions are integrated into hooks. Imported modules are listed at the end of this article.

```javascript
// file /server/services/users/hooks/index.js
import errors from 'feathers-errors';
const auth = require('feathers-authentication').hooks;
const hooks = require('feathers-hooks-common');
const hookUtils = require('feathers-hooks-common/lib/utils');
const validateSchema = require('feathers-hooks-validate-joi');

const clientValidations = require('/common/usersClientValidations');
const serverValidations = require('/server/validations/usersServerValidations');
const schemas = require('/server/validations/schemas');

const { checkContext, getItems, replaceItems } = hookUtils;

// hook for validation on form submit - sync
const validateSignupSubmit = () => (hook) => {
  checkContext(hook, 'before', ['create', 'update', 'patch'], 'validateSignupSubmit');

  const formErrors = clientValidations.signup(getItems(hook)); // sync function

  if (formErrors && Object.keys(formErrors).length) {
    throw new errors.BadRequest({ errors: formErrors });
  }

  return hook;
};

// hook for form async validation - Promise
const validateSignupAsync = () => (hook) => {
  checkContext(hook, 'before', ['create', 'update', 'patch'], 'validateUsingPromise');

  return clientValidations.signupAsync(getItems(hook))
    .then(convertedValues => {
      if (convertedValues) { // if values have been sanitized
        replaceItems(hook, convertedValues);
      }

      return hook;
    });
};

// hook for server async validation - callback
const validateSignupServer = () => (hook, next) => {
  checkContext(hook, 'before', ['create', 'update', 'patch'], 'validateSignupServer');

  serverValidations.signup(getItems(hook), cb);

  function cb(formErrors, convertedValues) {
    if (formErrors) {
      return next(formErrors instanceof Error ? formErrors :
        new errors.BadRequest('Invalid data', { errors: formErrors }), hook);
    }

    if (convertedValues) { // if values have been sanitized
      replaceItems(hook, convertedValues);
    }

    return next(null, hook);
  }
};

exports.before = {
  create: [
    validateSchema.form(schemas.signup, schemas.options), // schema validation
    validateSignupSubmit(), // re-run form sync validation
    validateSignupAsync(), // re-run form async validation
    validateSignupServer(), // run server validation
    hooks.remove('confirmPassword'),
    auth.hashPassword()
  ]
};
```

### Validation using Validate

```javascript
// file /server/services/users/hooks/index.js
const auth = require('feathers-authentication').hooks;
const hooks = require('feathers-hooks-common');
const fnPromisifyCallback = require('feathers-hooks-common/lib/promisify').fnPromisifyCallback;
const validateSchema = require('feathers-hooks-validate-joi');

const clientValidations = require('/common/usersClientValidations');
const serverValidations = require('/server/validations/usersServerValidations');
const schemas = require('/server/validations/schemas');

const validate = hooks.validate;
const serverValidationsSignup = fnPromisifyCallback(serverValidations.signup, 1);

exports.before = {
  create: [
    validateSchema.form(schemas.signup, schemas.options), // schema validation
    validate(clientValidations.signup), // re-run form sync validation
    validate(values => clientValidations.signupAsync(values, 'someMoreParams')), // re-run form async
    validate(serverValidationsSignup), // run server validation
    hooks.remove('confirmPassword'),
    auth.hashPassword()
  ]
};
```

### Validation routines for front and back-end.

Validations used on front-end. They are re-run by the server.

```javascript
// file /common/usersClientValidations
// Validations for front-end. Also re-run on server.
const clientValidations = {};

// sync validation of signup form on form submit
clientValidations.signup = values => {
  const errors = {};

  checkName(values.name, errors);
  checkUsername(values.username, errors);
  checkEmail(values.email, errors);
  checkPassword(values.password, errors);
  checkConfirmPassword(values.password, values.confirmPassword, errors);

  return errors;
};

// async validation on exit from some fields on form
clientValidations.signupAsync = values =>
  new Promise((resolve, reject) => {
    const errs = {};

    // set a dummy error
    errs.email = 'Already taken.';

    if (!Object.keys(errs).length) {
      resolve(null); // 'null' as we did not sanitize 'values'
    }
    reject(new errors.BadRequest('Values already taken.', { errors: errs }));
  });

module.exports = clientValidations;

function checkName(name, errors, fieldName = 'name') {
  if (!/^[\\sa-zA-Z]{8,30}$/.test((name || '').trim())) {
    errors[fieldName] = 'Name must be 8 or more letters or spaces.';
  }
}
```

Schema definitions used by the server.

```javascript
// file /server/validations/schemas
const Joi = require('joi');

const username = Joi.string().trim().alphanum().min(5).max(30).required();
const password = Joi.string().trim().regex(/^[\sa-zA-Z0-9]+$/, 'letters, numbers, spaces')
  .min(8).max(30).required();
const email = Joi.string().trim().email().required();

module.exports = {
  options: { abortEarly: false, convert: true, allowUnknown: false, stripUnknown: true },
  signup: Joi.object().keys({
    name: Joi.string().trim().min(8).max(30).required(),
    username,
    password,
    confirmPassword: password.label('Confirm password'),
    email
  })
};
```

Validations run by the server.

```javascript
// file /server/validations/usersServerValidations
// Validations on server. A callback function is used to show how the hook handles it.
module.exports = {
  signup: (data, cb) => {
    const formErrors = {};
    const sanitized = {};

    Object.keys(data).forEach(key => {
      sanitized[key] = (data[key] || '').trim();
    });

    cb(Object.keys(formErrors).length > 0 ? formErrors : null, sanitized);
  }
};
```