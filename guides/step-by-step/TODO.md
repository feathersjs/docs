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

## Services
jay [3:41 PM] 
I notice each service has a .class.js file in it’s own folder
can I instead re-use the same generic class file for multiple services?\
I have over a dozen services that are all look like each other, so for me it would not make much sense to have individual class files in each folder (edited)
Let me know if that would work, thanks

ryan.wheale [3:50 PM] 
That's one way to do it. The generators are not to be taken "seriously" - they're just a starting point.
You could also create a single service which accepts a query param to determine what to do - `GET /foo-service?action=[1-12]` (edited)

## Solid example

genyded commented on Mar 8
We cannot find a solid and complete example anywhere to use as a Feathers reference app. The docs are OK and getting better with with auk reorg, but they:

- Only show the simplest examples usually in app.js in isloated scenarios
- Lack completeness even in those simple examples (e.g. talk mostly about what can be done and not so much how
- Do not show complete example files (with requires and such). so when you see something like a reference you have no idea where it even came from
It would be great to have a simple app that has auth, 3 or 4 services that interact with each others, maybe a non-db service in the mix that sends email, talks to an external api, or something similar. It should be laid out in the full preferred app structure. So some of the services could have hooks that talk to other services, modify queries and such, and all the pieces are in there owns files and referenced like a real app.

It seems time spent here with the focus on the Feathers parts and maybe less on the other integration pieces like clients, comparisons to other frameworks, and such would be optimal. Show us the full way(s) to glue all the core feathers pieces together in a single semi-real-world app. Once we get a handle on that and most of us can handle the client stuff in our flavor of choice, continue to know Feathers JS blows the doors off of Sails or whoever, and do the integrations. If getting what we need to (fully) integrate with on the Feathers side that seems to be missing in even a basic form.

It doesn't have to be anything huge, just enough to show all the concepts actually working in tandem in a sort of real app with a few different services talking to each other, some basic auth, and so on. Not one Todo service or Voting service displaying real-time updates in some client. We'd be happy to help with this as much as we can, but are time constrained trying to figure all this out for ourselves and improve our rethink and Vue knowledge in parallel. We also don't really know all of Feathers stuff this well enough (yet) to tackle something like this ourselves.

Not even sure if this is the right place for this issue since most of the stuff here hasn't been touched in months, but I guess we'll start here and see. If we're the only ones wanting/needing something like this, maybe we're missing something and if so we'll shut up, but we won't go away because we love flying ;-)

marshallswain commented on Mar 8
@genyded some of what you're asking for is already in the works. I've been working on a seamless Feathers + VueJS experience for the last few weeks. It's really coming quite nicely. I'll keep you posted.

ekryski commented on Mar 31
@genyded some great feedback! Thanks! I wrote most of these demo examples in responses to people's feedback but didn't get much feedback on them. 1 single example that shows a more realistic app is going to be easier to keep up to date.

I think this is the route we're are going to take with the feathers-chat example. Have multiple stages, so you can see how an app progresses.

pedrogk commented 29 days ago
I completely agree with @genyded. I am trying to get feathers auk to use Auth0 and everybody points me to the example here but I can't sort it out because as mentioned, it isn't really complete/well structured, also I don't know if it is still valid with auk. Hopefully updated examples for auth are coming. Let me know if I can help somehow.

@pedrogk agree with you entirely - when I run the code in the example, it works, but when I try to port to my new app (using the same version of feathers-authenticate and passport-auth0), made with feathers generate, I get a 404 when It tries to travel to /auth/auth0 - yet for the life of me I can't find any mention of where or how it sets up that auth route.
