# Tests as Examples

The tests in each repo can, unsurprisingly, be a valuable source of information,
especially about details.

I find it frankly amazing that one Mocha test module can act as both the server and the client.
You configure a Feathers server the normal way and have it listen to, say, `localhost:3030`.
You then configure a Feathers WebSockets client the normal way and have it connect to that same url.
Because of Feathers' design, the code runs in exactly the same way as if the server and client were
on separate platforms. Very elegant.

This capability allows us to code integration tests, testing end to end, within one module.
You will see this design being used in the more complicated tests, e.g. feathers-offline-publication.

[**Snapshot**](https://github.com/feathersjs/feathers-offline-snapshot/blob/master/test/snapshot.test.js)
- non-paginated service
- paginated service
- selection

**Realtime**
- [Snapshot](https://github.com/feathersjs/feathers-offline-realtime/blob/master/test/commons/helpers/snapshot.test.js)
    - query
    - publication function (not using feathers-offline-publication)
    - sort
    - change sort order
- [Service events](https://github.com/feathersjs/feathers-offline-realtime/blob/master/test/commons/helpers/service-events.test.js)
    - no publication
    - mutations remaining within publication
    - mutations remaining outside publication
    - mutations moving in/out of publication
- [Optimistic mutation](https://github.com/feathersjs/feathers-offline-realtime/blob/master/test/commons/helpers/optimistic-mutator-online.test.js)
    - throws when not connected
    - no publication
    - no publication, `id` is null
    - no publication, remote service returns error
    
**Publication**
- [adds, removes publication](https://github.com/feathersjs/feathers-offline-publication/blob/master/test/integration.test.js)
- [filtering](https://github.com/feathersjs/feathers-offline-publication/blob/master/test/filter.test.js)
    