# Overview

The `@feathersjs/authentication` plugins provide a collection of tools for managing username/password, JWT and oAuth (GitHub, Facebook etc.) authentication as well as custom authentication mechanisms and for authenticating on the client.

It consists of the following core modules:

- `@feathersjs/authentication` which includes
  - The [AuthenticationService](./service.md) that allows to register [authentication strategies](./strategy.md) and create and manage access tokens
  - The [JWTStrategy](./jwt.md) to use JWTs to make authenticated requests
  - The [authenticate hook](./hook.md) to limit service calls to an authentication strategy.
- [Local authentication](./local.md) for local username/password authentication
- [oAuth authentication](./oauth.md) for GitHub, Facebook etc. authentication
- [The authentication client](./client.md) to use Feathers authentication on the client.

## Important ##
`@feathersjs/authentication` is an abstraction for different authentication mechanisms. It does not handle things like user email verification, access control, roles or password reset functionality etc. This can be implemented manually, with the help of a platform like [Auth0](https://auth0.com/) or the following libraries:

- For email verification, password resets, 2-step etc [feathers-authentication-management](https://github.com/feathers-plus/feathers-authentication-management)
- For access control, permissions, ACLs and RBAC [feathers-permissions](https://github.com/feathersjs-ecosystem/feathers-permissions)
- Basic restrictions to owner [feathers-authentication-hooks](https://github.com/feathersjs-ecosystem/feathers-authentication-hooks)
