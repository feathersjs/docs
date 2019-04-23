# Overview

The `@feathersjs/authentication` plugins provide a collection of tools for managing username/password, JWT and oAuth (GitHub, Facebook etc.) authentication as well as custom authentication mechanisms and for authenticating on the client.

It consists of the following core modules:

- `@feathersjs/authentication` which includes
  - The [AuthenticationService]() that allows to register [authentication strategies]() and create and manage [JSON web tokens]()
  - The [JWTStrategy]() to use those JWTs to make authenticated requests
  - The [authenticate hook]() to limit service calls to an authentication strategy.
- `@feathersjs/authentication-local` for local username/password authentication
- `@feathersjs/authentication-oauth` for oAuth (GitHub, Facebook etc.) authentication
- `@feathersjs/authentication-client` to use Feathers authentication on the client.

> *Important:* `@feathersjs/authentication` is an abstraction for different authentication mechanisms. It does not handle things like user verification or password reset functionality etc. This can be implemented manually, with the help of libraries like [feathers-authentication-management](https://github.com/feathers-plus/feathers-authentication-management) or a platform like [Auth0](https://auth0.com/).
