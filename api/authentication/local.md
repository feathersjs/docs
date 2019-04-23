# Local Authentication

[![npm version](https://img.shields.io/npm/v/@feathersjs/authentication-local.png?style=flat-square)](https://www.npmjs.com/package/@feathersjs/authentication-local)
[![Changelog](https://img.shields.io/badge/changelog-.md-blue.png?style=flat-square)](https://github.com/feathersjs/feathers/blob/master/packages/authentication-local/CHANGELOG.md)

```
$ npm install @feathersjs/authentication-local --save
```

`@feathersjs/authentication-local` provides a `LocalStrategy` for authentication with a username/email and password combination.

## Configuration

The following settings are available:

- `usernameField`: Name of the username field in the (e.g. `'email'`)
- `passwordField`: Name of the password field (e.g. `'password'`)
- `entityUsernameField`: Name of the username field on the entity if authentication data and entity field names are different (default: `usernameField`)
- `entityPasswordField`: Name of the password field on the entity if authentication data and entity field names are different (default: `passwordField`)
- `hashSize`: The BCrypt hash size (default: `10`)
- `errorMessage`: The error message (default: `'Invalid login'`)

Standard local authentication can be configured with those options in `config/default.json` like this:

```json
{
  "authentication": {
    "local": {
      "usernameField": "email",
      "passwordField": "password"
    }
  }
}
```

## LocalStrategy

### getEntityQuery(query, params)

Returns the query for finding the entity. `query` includes the `usernameField` or `entityUsernameField` as `{ [entityUsernameField]: username }` and returns a promise that resolves with `{ $limit: 1, ...query }`.

### findEntity(username, params)

Returns a promise that resolves with the entity.

### hashPassword(password)

### comparePassword(entity, password)

### authenticate(authentication, params)
