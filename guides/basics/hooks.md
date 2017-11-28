# Hooks

Hooks are pluggable middleware functions that can be registered __before__, __after__ or on __error__s of a [service method](./services.md). You can register a single hook function or create a chain of them to create complex work-flows. Most of the time multiple hooks are registered so the examples show the "hook chain" array style registration.

A hook is **transport independent**, which means it does not matter if it has been called through HTTP(S) (REST), Socket.io, Primus or any other transport Feathers may support in the future. They are also service agnostic, meaning they can be used with ​**any**​ service regardless of whether they have a model or not.

Hooks are commonly used to handle things like validation, logging, populating related entities, sending notifications and more. This pattern keeps your application logic flexible, composable, and much easier to trace through and debug. For more information about the design patterns behind hooks see [this blog post](https://blog.feathersjs.com/api-service-composition-with-hooks-47af13aa6c01).
