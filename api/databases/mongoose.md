# Mongoose

[![GitHub stars](https://img.shields.io/github/stars/feathersjs/feathers-mongoose.png?style=social&label=Star)](https://github.com/feathersjs/feathers-mongoose/)
[![npm version](https://img.shields.io/npm/v/feathers-mongoose.png?style=flat-square)](https://www.npmjs.com/package/feathers-mongoose)
[![Changelog](https://img.shields.io/badge/changelog-.md-blue.png?style=flat-square)](https://github.com/feathersjs/feathers-mongoose/blob/master/CHANGELOG.md)

[feathers-mongoose](https://github.com/feathersjs/feathers-mongoose) is a database adapter for [Mongoose](http://mongoosejs.com/), an object modeling tool for [MongoDB](https://www.mongodb.org/).

```bash
$ npm install --save mongoose feathers-mongoose
```

> **Important:** To use this adapter you also want to be familiar with the [database adapter common API](./common.md) and [querying mechanism](./querying.md).

> This adapter also requires a [running MongoDB](https://docs.mongodb.com/getting-started/shell/#) database server.


## API

### `service(options)`

Returns a new service instance initialized with the given options. `Model` has to be a Mongoose model. See the [Mongoose Guide](http://mongoosejs.com/docs/guide.html) for more information on defining your model.

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
- `lean` (*optional*, default: `true`) - Runs queries faster by returning plain objects instead of Mongoose models.
- `id` (*optional*, default: `'_id'`) - The name of the id field property.
- `events` (*optional*) - A list of [custom service events](../real-time/events.md#custom-events) sent by this service
- `paginate` (*optional*) - A [pagination object](./pagination.md) containing a `default` and `max` page size

> **Important:** To avoid odd error handling behaviour, always set `mongoose.Promise = global.Promise`. If not available already, Feathers comes with a polyfill for native Promises.

<!-- -->

> **Important:** When setting `lean` to `false`, Mongoose models will be returned which can not be modified unless they are converted to a regular JavaScript object via `toObject`.

<!-- -->

> **Note:** You can get access to the Mongoose model via `this.Model` inside a [hook](../hooks/readme.md) and use it as usual. See the [Mongoose Guide](http://mongoosejs.com/docs/guide.html) for more information on defining your model.

### params.mongoose

When making a [service method](./services.md) call, `params` can contain an `mongoose` property which allows to modify the options used to run the Mongoose query. Normally this wil be set in a before [hook](./hooks.md):

```js
app.service('messages').hooks({
  before: {
    patch(hook) {
      // Set some additional Mongoose options
      // The adapter tries to use sane defaults
      // but they can always be changed here
      hook.params.mongoose = {
        runValidators: true,
        setDefaultsOnInsert: true
      }
    }
  }
});
```


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
  text: 'Message created on server'
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
