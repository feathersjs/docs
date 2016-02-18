# Authorization Hooks

These hooks come bundled with the [Feathers authentication](https://github.com/feathersjs/feathers-authentication) plugin.

Implementing authorization is not automatic, but is easy to set up with the included hooks.  You can also create your own hooks to handle your app's custom business logic.  For more information about hooks, refer to the [chapter on hooks](hooks/readme.md).

The `feathers-authentication` plugin includes the following hooks to help with the authorization process.

## `hashPassword({ passwordField })`

The `hashPassword` hook will automatically hash the data coming in on the provided `passwordField`. It is intended to be used on the user service on the `create`, `update`, or `patch` methods.  The default field is `password`, but you can specify another field by providing its name as a string.

## `verifyToken({ secret })`

The `verifyToken` hook will attempt to verify a token if it is present. If no token exists it is bypassed. If token is invalid it returns an error. If token is valid it adds the decrypted payload to `hook.params.payload` which contains the user id.

### Options 

- `secret` (**required**) - Your secret used to encrypt and decrypt JWT's. If this gets compromised you need to rotate it immediately!
- `issuer` (default: 'feathers') [optional] - The JWT issuer field
- `algorithms` (default: ['HS256']) [optional] - The accepted JWT hash algorithms
- `expiresIn` (default: '1d') [optional] - The time a token is valid for

## `populateUser({ userEndpoint, passwordField, idField })`

The `populateUser` hook is for populating a user based on an id. It can be used on all service method as either a before or after hook. It automatically removes the `passwordField` from the user object. It is called internally after a token is created.

### Options 

- `userEndpoint` (default: '/user') [optional] - The endpoint for the user service.
- `passwordField` (default: 'password') [optional] - The database field containing the password on the user service.
- `idField` (default: '_id') [optional] - The database field containing the user id.

## `requireAuth()`

The `requireAuth` hook throws an error if there's not a logged-in user by checking for the `hook.params.user` object. It can be used on any service method. It doesn't take any arguments.

## `queryWithUserId({ id, idOnResource })`

The `queryWithUserId` hook will automatically add the user's `id` as a parameter in the query. This is useful when you want to only return data that belongs to the logged-in user. The name of the key in the query params will be the string provided as the `idOnResource` variable.  The default `idOnResource` is `"userId"` and the default `id` is `"_id"`. This means that the `User._id` will be copied into `query.userId`.

## `setUserId({ sourceProp, destProp })`

The `setUserId` is similar to the `queryWithUserId`, but works on the incoming data instead of the query params. It's useful for automatically adding the userId to any resource being created. The default `sourceProp` is `"_id"` and the default `destProp` is `"userId"`.  It can be used on `create`, `update`, or `patch`.

## `requireAdminToSetAdmin({ adminField })`

The `requireAdminToSetAdmin` hook prevents users from making themselves an administrator. It deletes the `adminField` from any request to modify the user, so it's meant to be used on the User service.  The default value is `admin`. It can be used on the `create`, `update`, or `patch` methods.

## `restrictToSelf({ idField })`
The `restrictToSelf` hook only allows the user to retrieve her own user data. It does this by setting up the `idField` in the query params. The default value is `_id`. It is meant to be used on the User service on either `find` or `get`.
