# Hooks

Additionally to [Services](./services.md) which we jus learned about, as one of the key concepts behind Feathers. Hooks, the other key concept, are pluggable middleware functions that can be registered __before__, __after__ or on __error__s of a service method. You can register a single hook function or create a chain of them to create complex work-flows. 

Just like services themselves, hooks are *transport independent*. They are also service agnostic, meaning they can be used with ​*any*​ service regardless of the database (or none) a service might use.

Hooks are commonly used to handle things like validation, logging, populating related entities, sending notifications and more. This pattern keeps your application logic flexible, composable, and much easier to trace through and debug. For more information about the design patterns behind hooks see [this blog post](https://blog.feathersjs.com/api-service-composition-with-hooks-47af13aa6c01).
