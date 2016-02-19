# Authorization Hooks

These hooks come bundled with the [Feathers authentication](https://github.com/feathersjs/feathers-authentication) plugin.

Implementing authorization is not automatic, but is easy to set up with the included hooks.  You can also create your own hooks to handle your app's custom business logic.  For more information about hooks, refer to the [chapter on hooks](hooks/readme.md).

The `feathers-authentication` plugin includes the following hooks to help with the authorization process.

## hashPassword

The `hashPassword` hook will automatically hash the data coming in on the provided `passwordField`. It is intended to be used on the user service on the `create`, `update`, or `patch` methods.  The default field is `password`, but you can specify another field by providing its name as a string.

#### Options

- `passwordField` (default: 'password') [optional] - The field you use to denote the password on your user object.

## verifyToken

The `verifyToken` hook will attempt to verify a token if it is present. If no token exists it is bypassed. If token is invalid it returns an error. If token is valid it adds the decrypted payload to `hook.params.payload` which contains the user id.

#### Options

- `secret` (**required**) - Your secret used to encrypt and decrypt JWT's. If this gets compromised you need to rotate it immediately!
- `issuer` (default: 'feathers') [optional] - The JWT issuer field
- `algorithms` (default: ['HS256']) [optional] - The accepted JWT hash algorithms
- `expiresIn` (default: '1d') [optional] - The time a token is valid for

## populateUser

The `populateUser` hook is for populating a user based on an id. It can be used on all service method as either a before or after hook. It automatically removes the `passwordField` from the user object. It is called internally after a token is created.

#### Options

- `userEndpoint` (default: '/user') [optional] - The endpoint for the user service.
- `passwordField` (default: 'password') [optional] - The database field containing the password on the user service.
- `idField` (default: '_id') [optional] - The database field containing the user id.

## requireAuth

The `requireAuth` hook throws an error if there's not a logged-in user by checking for the `hook.params.user` object. It can be used on any service method. It doesn't take any arguments.

## queryWithUserId

The `queryWithUserId` hook will automatically add the user's `id` as a parameter in the query. This is useful when you want to only return data, for example "messages", that belong to the logged-in user.

#### Options

- `id` (default: '_id') [optional] - The id field on your user object.
- `idOnResource` (default: userId') [optional] - The id field for a user on the resource you are requesting.

When using this hook with the default options the `User._id` will be copied into `query.userId`.

## setUserId

The `setUserId` is similar to the `queryWithUserId`, but works on the incoming data instead of the query params. It's useful for automatically adding the userId to any resource being created. It can be used on `create`, `update`, or `patch`.

#### Options

- `sourceProp` (default: '_id') [optional] - The id field on your user object.
- `destProp` (default: userId') [optional] - The id field for a user that you want to set on your resource.

## requireAdminToSetAdmin

The `requireAdminToSetAdmin` hook prevents users from making themselves an administrator. It deletes the `adminField` from any request to modify the user, so it's meant to be used on the User service.  The default value is `admin`. It can be used on the `create`, `update`, or `patch` methods.

#### Options

- `adminField` (default: 'admin') [optional] - The field on your user object that denotes whether they are an admin.

## restrictToSelf

The `restrictToSelf` hook only allows the user to retrieve their own user data. It does this by setting up the `idField` in the query params.

#### Options

- `idField` (default: '_id') [optional] - The id field on your user object.
