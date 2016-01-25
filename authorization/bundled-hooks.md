# Bundled Authorization Hooks

Implementing authorization is not automatic, but is easy to set up with the included hooks.  You can also create your own hooks to handle your app's custom business logic.  For more information about hooks, refer to the [chapter on hooks](hooks/readme.md).

The `feathers-authentication` plugin includes the following hooks to help with the authorization process.

## `hashPassword(passwordField)`
The `hashPassword` hook will automatically hash the data coming in on the provided `passwordField`. It is intended to be used on the user service on the `create`, `update`, or `patch` methods.  The default field is `password`, but you can specify another field by providing its name as a string. [source code](https://github.com/feathersjs/feathers-authentication/blob/master/src/hooks/hash-password.js)

## `requireAuth()`
The `requireAuth` hook throws an error if there's not a logged-in user by checking for the `hook.params.user` object. It can be used on any service method. It doesn't take any arguments. [source code](https://github.com/feathersjs/feathers-authentication/blob/master/src/hooks/require-auth.js)

## `queryWithUserId(idProp, idOnResource)`
The `queryWithUserId` hook will automatically add the user's `idProp` as a parameter in the query. This is useful when you want to only return data that belongs to the logged-in user. The name of the key in the query params will be the string provided as the `idOnResource` variable.  The default `idOnResource` is `"userId"` and the default `idProp` is `"_id"`. This means that the `User._id` will be copied into `query.userId`. [source code](https://github.com/feathersjs/feathers-authentication/blob/master/src/hooks/query-with-user-id.js)

## `setUserId(sourceProp, destProp)`
The `setUserId` is similar to the `queryWithUserId`, but works on the incoming data instead of the query params. It's useful for automatically adding the userId to any resource being created. The default `sourceProp` is `"_id"` and the default `destProp` is `"userId"`.  It can be used on `create`, `update`, or `patch`. [source code](https://github.com/feathersjs/feathers-authentication/blob/master/src/hooks/set-user-id.js)

## `requireAdminToSetAdmin(adminField)`
The `requireAdminToSetAdmin` hook prevents users from making themselves an administrator. It deletes the `adminField` from any request to modify the user, so it's meant to be used on the User service.  It can be used on the `create`, `update`, or `patch` methods. [source code](https://github.com/feathersjs/feathers-authentication/blob/master/src/hooks/require-admin-to-set-admin.js)

## `restrictToSelf(idProp)`
The `restrictToSelf` hook only allows the user to retrieve her own user data. It does this by setting up the `idProp` in the query params. It is meant to be used on the User service on either `find` or `get`. [source code](https://github.com/feathersjs/feathers-authentication/blob/master/src/hooks/restrict-to-self.js)

## `toLowerCase(fieldName)`
The `toLowerCase` hook is useful for making sure things like email addresses and usernames are lowercased before saving them to the database. You wouldn't want, for example, "BabyGorilla" and "babygorilla" to be two different users, so normalizing them to lowercase will make keeping track of things easier. It can be used on `create`, `update`, or `patch`. [source code](https://github.com/feathersjs/feathers-authentication/blob/master/src/hooks/to-lower-case.js)
