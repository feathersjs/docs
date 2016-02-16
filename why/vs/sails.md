# Feathers vs. Sails

From a feature standpoint Feathers and Sails are probably the closest. Both provide real-time REST API's, multiple db support, and are client agnostic but beyond the server Feathers can also be used in the browser and in React Native apps. Both frameworks use Express, but Feathers supports Express 4, while Sails only supports Express 3.

Sails follows the MVC pattern whereas Feathers provides lightweight services to define your resources. Feathers uses hooks to define your business logic including validations, security policies and serialization in reusable, chainable modules, whereas with Sails these reside in more of a configuration file format.

Feathers supports multiple ORMs while Sails only supports their Waterline ORM.

Sails allows you to receive messages via websockets on the client but, unlike Feathers, does not directly support data being sent from the client to the server over websockets. Additionally, Sails uses Socket.io for it's websocket transport while Feathers support that and many other socket implementations via [Primus](../../real-time/primus.md).

Even though the features are very similar, Feathers achieves this with much less code. Feathers also doesn't assume how you want to manage your assets or that you even have any (you might be making a JSON API). Instead of coming bundled with Grunt Feathers let's you use your build tool of choice.

Sails doesn't come with any built in authentication support. Instead they have guides on how to configure Passport. By contrast, Feathers supports an [official authentication plugin](https://github.com/feathersjs/feathers-authentication) that is a drop-in, minimal configuration, module that provides email/password, token, and OAuth authentication much more like Meteor. Using this you can authenticate using those methods over REST **and/or** sockets interchangeably.

Scaling a Sails app is as simple as deploying your large app multiple times behind a load balancer with some pub-sub mechanism like Redis. With Feathers you can do the same but you also have the option to mount sub-apps more like Express, spin up additional services in the same app or split your services into small standalone microservice applications.