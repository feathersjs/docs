# Feathers vs. Sails

From a feature standpoint Feathers and Sails are probably the closest. Both provide real-time REST API's, multiple db support, and are client agnostic but Feathers can be used on the client as well as the server. Both frameworks also use Express, but Feathers supports Express 4, while Sails only supports Express 3.

Both Feathers and Meteor are real-time JavaScript platforms that provide front end and back end support. However, in addition to allowing clients to subscribe to events, Feathers allows clients to push data to the server over websockets. Meteor only allows clients to receive messages over websockets.

Sails follows the MVC pattern whereas Feathers provides lightweight services to define your resources. We use hooks to define your business logic including validations, security policies and serialization in reusable, chainable modules, instead of configuration files.

Feathers supports multiple ORMs while Sails only supports their Waterline ORM.

Just like Meteor, Sails allows you to receive messages via websockets on the client but does not support the client sending messages to the server over websockets.

Even though the features are very similar, Feathers achieves this with much less code. We also don't assume how you want to manage your assets by letting you use your build tool of choice and scale by easily splitting into services as opposed to spinning up multiple monolithic apps (which you can also do with Feathers if you want).