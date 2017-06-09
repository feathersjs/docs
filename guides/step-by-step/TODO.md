## Example for custom services
jay
Are there any patterns or best pratices to follow when one has a huge domain with dozens of type definitions that you need to expose for  CRUD operations? (edited)
So far  I have been creating a service for each type in my domain, but even with lots of effort to avoid code duplication I’m no sure this is the right approach (edited)
Another approach would be to make a single service that would be able to CRUD serveral types by passing a “type” property along with the actual object payload
I just think that this is such a common scenario that maybe there is a pattern out there that could be used when you’d have to create so many services
In order words… does the code file structure for service creation proposed in the Feathers generator really scale?  Or should  I be looking looking at a different structure for my code? (edited)

ryan.wheale [6:16 PM] 
@jay - what you are describing is common in software. There are two types of operations which happen - 1) updating an entitity (typical REST) and  2) "services" (not the same as feathers services) which orchestrate updating lots of entities in a transactional manner. The latter is what you are needing. You would create a feathers service to do something complex like updating multiple entities in a particular order. In such cases, I suggest creating just a basic ES6 class as your service. You would then define a `create` method which takes care of all of your complex stuff and then sets the "result" to something meaningful (a success object, or an error object). You would then issues a single `POST` request to this service, sending all the information required for the service to do it's thing. (edited)
So, for example, if you are using feathers-mongoose, this doesn't mean that every endpoint in your app must be backed by a feathers-mongoose service. Use feathers-mongoose for your RESTful stuff, and use custom ES6 classes for other transactional stuff. Does that make sense?