# Mongoose

[feathers-mongoose](https://github.com/feathersjs/feathers-mongoose) is a database adapter for [Mongoose](http://mongoosejs.com/), an object modeling tool for [MongoDB](https://www.mongodb.org/). Mongoose provides a straight-forward, schema-based solution to model your application data. It includes built-in type casting, validation, query building, business logic hooks and more.

```bash
npm install mongoose feathers-mongoose --save
```

## Getting Started

We can create Mongoose services like this:

```js
import mongoose from 'mongoose';
// A file that exports a Mongoose model
import MongooseModel from './models/mymodel';
import service from 'feathers-mongoose';

// Make Mongoose use the ES6 promise
mongoose.Promise = global.Promise;
// Connect to a local database called `feathers`
mongoose.connect('mongodb://localhost:27017/feathers');

app.use('/todos', mongooseService({
  Model: MongooseModel
}));
```

See the [Mongoose Guide](http://mongoosejs.com/docs/guide.html) for more information on defining your model.

## Options

The following options can be passed when creating a new Mongoose service:

- `Model` (**required**) - The Mongoose model definition
- `id` (default: `_id`) [optional] - The name of the id property
- `paginate` - A pagination object containing a `default` and `max` page size (see the [Pagination chapter](databases/pagination.md))

### Complete Example

Here's a complete example of a Feathers server with a `todos` mongoose-service. In `models/todo.js`:

```js
import mongoose from 'mongoose';

const Schema = mongoose.Schema;
const TodoSchema = new Schema({
  text: {type: String, required: true},
  complete: {type: Boolean, 'default': false},
  createdAt: {type: Date, 'default': Date.now},
  updatedAt: {type: Date, 'default': Date.now}
});
const Model = mongoose.model('Todo', TodoSchema);

export default Model;
```

Then in `server.js`:

```js
import feathers from 'feathers';
import rest from 'feathers-rest';
import bodyParser from 'bodyParser';
import mongoose from 'mongoose';
import service from 'feathers-mongoose';
// Load the Model
import Model from './models/todo';

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
app.use('/todos', service({ Model }));

// Start the server.
const port = 3030;
app.listen(port, function() {
    console.log(`Feathers server listening on port ${port}`);
});
```

You can run this example by using `node examples/app` and going to [localhost:3030/todos](http://localhost:3030/todos). You should see an empty array. That's because you don't have any Todos yet but you now have full CRUD for your new todos service, including mongoose validations!

## Migrating

Version 3 of this adapter no longer brings its own Mongoose dependency, only accepts mongoose models and doesn't set up a database connection for you anymore. This means that you now need to make your own mongoose database connection and you need to pass in mongoose models changing something like

```js
var MySchema = require('./models/mymodel')
var mongooseService = require('feathers-mongoose');
app.use('todos', mongooseService('todo', MySchema, options));
```

To

```js
var mongoose = require('mongoose');
var MongooseModel = require('./models/mymodel')
var mongooseService = require('feathers-mongoose');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/feathers');

app.use('/todos', mongooseService({
  Model: MongooseModel
}));
```

## Validation

Mongoose by default gives you the ability to add [validations at the model level](http://mongoosejs.com/docs/validation.html). Using an error handler like the [middleware that comes with Feathers](https://github.com/feathersjs/generator-feathers/blob/master/app/templates/src/middleware/error-handler.js) your validation errors will be formatted nicely right out of the box!

For more complex validations you really have two options. You can combine Mongoose's validation mechanism with a validation library like [validator.js](https://github.com/chriso/validator.js) or you can do your validations at the service level using [feathers-hooks](https://github.com/feathersjs/feathers-hooks).

__With Validator.js__

Here's an example of doing more complex validations at the model level with the [validator.js](https://github.com/guillaumepotier/validator.js) validation library.

```js
import validator from 'validator.js';
import mongoose from 'mongoose';

const Schema = mongoose.Schema;
const userSchema = new Schema({
  email: {
    type: String,
    validate: {
      validator: validator.email,
      message: '{VALUE} is not a valid email!'
    }
  },
  phone: {
    type: String,
    validate: {
      validator: function(v) {
        return /d{3}-d{3}-d{4}/.test(v);
      },
      message: '{VALUE} is not a valid phone number!'
    }
  }
});

const User = mongoose.model('user', userSchema);
```

## Modifying retrieved data

The records returned from a query are Mongoose documents, so they can't be modified directly (You won't be able to delete properties from them).  To get around this, you can use the included `toObject` hook to convert the Mongoose documents into plain objects.  Let's modify the before-hooks setup in the feathers-hooks example, above, to this:

```js
app.service('todos').before({
  all: [feathersMongoose.hooks.toObject({})]
});
```

The `toObject` hook must be called as a function and accepts a configuration object with any of the options supported by [Mongoose's toObject method](http://mongoosejs.com/docs/api.html#document_Document-toObject).
