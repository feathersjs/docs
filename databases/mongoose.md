# Mongoose

[![GitHub stars](https://img.shields.io/github/stars/feathersjs/feathers-mongoose.svg?style=social&label=Star)](https://github.com/feathersjs/feathers-mongoose/)
[![npm version](https://img.shields.io/npm/v/feathers-mongoose.svg?style=flat-square)](https://www.npmjs.com/package/feathers-mongoose)
[![Changelog](https://img.shields.io/badge/changelog-.md-blue.svg?style=flat-square)](https://github.com/feathersjs/feathers-mongoose/blob/master/CHANGELOG.md)

[feathers-mongoose](https://github.com/feathersjs/feathers-mongoose) is a database adapter for [Mongoose](http://mongoosejs.com/), an object modeling tool for [MongoDB](https://www.mongodb.org/).

```bash
$ npm install --save mongoose feathers-mongoose
```

> **Important:** To use this adapter you also want to be familiar with the [common interface](./common.md) for database adapters.

> This adapter also requires a [running MongoDB](https://docs.mongodb.com/getting-started/shell/#) database server.


## API

### `service([options])`

Returns a new service instance intitialized with the given options. `Model` has to be a Mongoose model. See the [Mongoose Guide](http://mongoosejs.com/docs/guide.html) for more information on defining your model.

```js
const mongoose = require('mongoose');
const service = require('feathers-mongoose');

// A module that exports your Mongoose model
const Model = require('./models/message');

// Make Mongoose use the ES6 promise
mongoose.Promise = global.Promise;

// Connect to a local database called `feathers`
mongoose.connect('mongodb://localhost:27017/feathers');

app.use('/messages', service({ Model }));
app.use('/messages', service({ Model, lean, id, events, paginate }));
```

__Options:__

- `Model` (**required**) - The Mongoose model definition
- `lean` (*optional*, default: `false`) - When set to true runs queries faster by returning plain mongodb objects instead of mongoose models.
- `id` (*optional*, default: `'_id'`) - The name of the id field property.
- `events` (*optional*) - A list of [custom service events](../real-time/events.md#custom-events) sent by this service
- `paginate` (*optional*) - A [pagination object](pagination.md) containing a `default` and `max` page size

> **Important:** To avoid odd error handling behaviour, always set `mongoose.Promise = global.Promise`. If not available already, Feathers comes with a polyfill for native Promises.

> **Note:** You can get access to the Mongoose model via `this.Model` inside a [hook](../hooks/readme.md) and use it as usual.


## Example

Here's a complete example of a Feathers server with a `messages` Mongoose service.

```
$ npm install feathers feathers-errors feathers-rest body-parser mongoose feathers-mongoose
```

In `message-model.js`:

```js
const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const MessageSchema = new Schema({
  text: {
    type: String,
    required: true
  },
  read: {
    type: Boolean,
    default: false
  }
});
const Model = mongoose.model('Message', MessageSchema);

module.exports = Model;
```

Then in `app.js`:

```js
const feathers = require('feathers');
const errorHandler = require('feathers-errors/handler');
const rest = require('feathers-rest');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const service = require('feathers-mongoose');

const Model = require('./message-model');

// Tell mongoose to use native promises
// See http://mongoosejs.com/docs/promises.html
mongoose.Promise = global.Promise;

// Connect to your MongoDB instance(s)
mongoose.connect('mongodb://localhost:27017/feathers');

// Create a feathers instance.
const app = feathers()
  // Enable REST services
  .configure(rest())
  // Turn on JSON parser for REST services
  .use(bodyParser.json())
  // Turn on URL-encoded parser for REST services
  .use(bodyParser.urlencoded({extended: true}))
  // Connect to the db, create and register a Feathers service.
  .use('/messages', service({
    Model,
    lean: true, // set to false if you want Mongoose documents returned
    paginate: {
      default: 2,
      max: 4
    }
  }))
  .use(errorHandler());

// Create a dummy Message
app.service('messages').create({
  text: 'Message created on server',
  completed: false
}).then(function(message) {
  console.log('Created message', message);
});

// Start the server.
const port = 3030;
app.listen(port, () => {
    console.log(`Feathers server listening on port ${port}`);
});
```

You can run this example by using `node app` and go to [localhost:3030/messages](http://localhost:3030/messages).


## Querying, Validation

Mongoose by default gives you the ability to add [validations at the model level](http://mongoosejs.com/docs/validation.html). Using an error handler like the one that [comes with Feathers](https://github.com/feathersjs/feathers-errors/blob/master/src/error-handler.js) your validation errors will be formatted nicely right out of the box!

For more information on querying and validation refer to the [Mongoose documentation](http://mongoosejs.com/docs/guide.html).


## Modifying results with the `toObject` hook

Unless you passed `lean: true` when initializing your service, the *records returned from a query are Mongoose documents so they can't be modified directly*. This means you won't be able to add or delete properties from them.

To get around this, you can use the included `toObject` hook to convert the Mongoose documents into plain objects:

```js
app.service('messages').after({
  all: [service.hooks.toObject({})]
});
```

The `toObject` hook must be called before any hook that modifies the result as a function that accepts a configuration object with any of the options supported by [Mongoose's toObject method](http://mongoosejs.com/docs/api.html#document_Document-toObject). Additionally, a second parameter can be specified that determines which attribute of `hook.result` will have its Mongoose documents converted to plain objects (defaults to `data`).
