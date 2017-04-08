# MongoDB Native

[feathers-mongodb](https://github.com/feathersjs/feathers-mongodb) is a database adapter for [MongoDB](https://www.mongodb.org/). Unlike [Mongoose](./mongoose.md) this is does not have an ORM. You deal with the database directly.

```bash
$ npm install --save mongodb feathers-mongodb
```

## Getting Started

The following example will create a `messages` endpoint and connect to a local `messages` collection on the `feathers` database.

```js
var MongoClient = require('mongodb').MongoClient;
var service = require('feathers-mongodb');
var app = feathers();

MongoClient.connect('mongodb://localhost:27017/feathers').then(function(db){
  app.use('/messages', service({
    Model: db.collection('messages')
  }));

  app.listen(3030);
});
```

## Options

The following options can be passed when creating a new MongoDB service:

- `Model` (**required**) - The MongoDB collection instance
- `id` (default: '_id') [optional] - The id field for your documents for this service.
- `paginate` [optional] - A pagination object containing a `default` and `max` page size (see the [Pagination chapter](pagination.md))

## Complete Example

To run the complete MongoDB example we need to install

```
$ npm install feathers feathers-rest feathers-socketio feathers-mongodb feathers-errors mongodb body-parser
```

Then add the following into `app.js`:

```js
const feathers = require('feathers');
const rest = require('feathers-rest');
const socketio = require('feathers-socketio');
const errors = require('feathers-errors');
const bodyParser = require('body-parser');
var MongoClient = require('mongodb').MongoClient;
const service = require('feathers-mongodb');

// Create a feathers instance.
const app = feathers()
  // Enable Socket.io
  .configure(socketio())
  // Enable REST services
  .configure(rest())
  // Turn on JSON parser for REST services
  .use(bodyParser.json())
  // Turn on URL-encoded parser for REST services
  .use(bodyParser.urlencoded({extended: true}));

  // Connect to your MongoDB instance(s)
MongoClient.connect('mongodb://localhost:27017/feathers').then(function(db){
  // Connect to the db, create and register a Feathers service.
  app.use('/messages', service({
    Model: db.collection('messages'),
    paginate: {
      default: 2,
      max: 4
    }
  }));

  // A basic error handler, just like Express
  app.use(errors.handler());

  // Start the server
  var server = app.listen(3030);
  server.on('listening', function() {
    console.log('Feathers Message MongoDB service running on 127.0.0.1:3030');
  });
}).catch(function(error){
  console.error(error);
});
```

You can run this example [from the GitHub repository](https://github.com/feathersjs/feathers-mongodb/blob/master/example/app.js) with `npm start` and going to [localhost:3030/messages](http://localhost:3030/messages). You should see an empty array. That's because you don't have any messages yet but you now have full CRUD for your new messages service.
