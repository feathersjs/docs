# Feathers vs. Meteor

Both Feathers and Meteor are real-time JavaScript platforms that provide front end and back end support. However, in addition to allowing clients to subscribe to events, Feathers allows clients to push data to the server over websockets. Meteor only allows clients to receive messages over websockets.

Feathers is completely open source and is community supported, whereas Meteor, although open source, is venture backed and has raised $31.2 million to date.

Meteor only has official support for MongoDB but there are some community modules of various levels of quality that support other databases. Meteor has it's own package manager and package ecosystem. They also have their own template engine based off of Mustache, but have guides for Angular and React, and their own build tools.

Feathers has official support for [many more databases](../../databases/readme.md) and supports any front-end framework or view engine that you want. We have [guides](../../guides/readme.md) for integrating Feathers with many of the most popular.

Feathers uses the defacto JavaScript package manager [npm](http://npmjs.org) and so you can utilize the hundreds of thousands of modules published to npm and lets you decide whether you want to use Gulp, Grunt, Browserify, Webpack or any other build tool.

Meteor has optimistic UI rendering and oplog tailing whereas currently Feathers leaves that up to the developer. However, we've found that being isomorphic and utilizing websockets for both sending and receiving data alleviates the need for optimistic UI rendering and complex data diffing.

One big distinction is how Feathers and Meteor provide real-time across a cluster of apps. Feathers does it at the service layer or using another pub-sub service like Redis whereas Meteor relies on having access and monitoring MongoDB operation logs as the central hub for real-time communication.