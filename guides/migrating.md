# Migrating

This guide explains the new features and changes necessary to migrate to the Feathers v5 (Dove) release. It expects applications to be using the previous Feathers v4 (Crow). See the [v4 (Crow) migration guide](https://crow.docs.feathersjs.com/guides/migrating.html) for upgrading the the previous version.

## Koa transport

## Deprecations

- The request library has been deprecated and request support has been removed from the REST clients.
- Due to low usage `@feathersjs/primus` and `@feathers/primus-client` have been removed from Feathers core and moved into [feathersjs-ecosystem/feathers-primus](). It will continue to work as is but rely on community support for future updates.
