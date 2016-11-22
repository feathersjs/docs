# Mongoose

[feathers-mongoose](https://github.com/feathersjs/feathers-mongoose) is a database adapter for [Mongoose](http://mongoosejs.com/), an object modeling tool for [MongoDB](https://www.mongodb.org/). Mongoose provides a straight-forward, schema-based solution to model your application data. It includes built-in type casting, validation, query building, business logic hooks and more.

```bash
$ npm install --save mongoose feathers-mongoose
```

## Getting Started

We can create Mongoose services like this:

```js
const mongoose = require('mongoose');
const service = require('feathers-mongoose');

// A module that exports your Mongoose model
const Message = require('./models/message');

// Make Mongoose use the ES6 promise
mongoose.Promise = global.Promise;

// Connect to a local database called `feathers`
mongoose.connect('mongodb://localhost:27017/feathers');

app.use('/messages', service({ Model: Message }));
```

> __Important:__ To avoid odd error handling behaviour, always set `mongoose.Promise = global.Promise`. If not available already, Feathers comes with a polyfill for native Promises.

> You can get aceess to Mongoose model via `this.Model` inside any hook and use it as usual.

See the [Mongoose Guide](http://mongoosejs.com/docs/guide.html) for more information on defining your model.

## Options

The following options can be passed when creating a new Mongoose service:

- `Model` (**required**) - The Mongoose model definition
- `id` (default: `_id`) [optional] - The name of the id property
- `paginate` - A pagination object containing a `default` and `max` page size (see the [Pagination chapter](databases/pagination.md))
- `lean` (default: `false`) [optional] - When set to true runs queries faster by returning plain mongodb objects instead of mongoose models.
- `overwrite` (default: `true`) [optional] - Updates completely replace existing documents.

### Complete Example

Here's a complete example of a Feathers server with a `messages` Mongoose service.

```
$ npm install feathers feathers-rest body-parser mongoose feathers-mongoose
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
app.use('/messages', service({
  Model,
  lean: true, // set to false if you want Mongoose documents returned
  paginate: {
    default: 2,
    max: 4
  }
}));

// Create a dummy Message
app.service('messages').create({
  text: 'Server message'
}).then(function(message) {
  console.log('Created message', message);
});

// Start the server.
const port = 3030;
app.listen(port, function() {
    console.log(`Feathers server listening on port ${port}`);
});
```

You can run this example by using `npm start` and going to [localhost:3030/messages](http://localhost:3030/messages). You should see a paginated object with the message that we created on the server.

## Migrating

Version 3 of this adapter no longer brings its own Mongoose dependency, only accepts mongoose models and doesn't set up a database connection for you anymore. This means that you now need to make your own mongoose database connection and you need to pass in mongoose models changing something like

```js
var MySchema = require('./models/mymodel')
var mongooseService = require('feathers-mongoose');
app.use('messages', mongooseService('message', MySchema, options));
```

To

```js
var mongoose = require('mongoose');
var MongooseModel = require('./models/mymodel')
var mongooseService = require('feathers-mongoose');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/feathers');

app.use('/messages', mongooseService({
  Model: MongooseModel
}));
```

## Validation

Mongoose by default gives you the ability to add [validations at the model level](http://mongoosejs.com/docs/validation.html). Using an error handler like the one [comes with Feathers](https://github.com/feathersjs/feathers-errors/blob/master/src/error-handler.js) your validation errors will be formatted nicely right out of the box!

## Modifying results with the `toObject` hook

Unless you passed `lean: true` when initializing your service, the records returned from a query are Mongoose documents, so they can't be modified directly (You won't be able to delete properties from them).

To get around this, you can use the included `toObject` hook to convert the Mongoose documents into plain objects.  Let's modify the after hook's setup in the feathers-hooks example, above, to this:

```js
app.service('messages').after({
  all: [service.hooks.toObject({})]
});
```

The `toObject` hook must be called as a function and accepts a configuration object with any of the options supported by [Mongoose's toObject method](http://mongoosejs.com/docs/api.html#document_Document-toObject). Additionally, a second parameter can be specified that determines which attribute of `hook.result` will have its Mongoose documents converted to plain objects (defaults to `data`).
