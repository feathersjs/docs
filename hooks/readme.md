# Using Feathers Hooks

// TODO: Update these old docs, originally found here: http://feathersjs.com/learn/validation/

Another option is the feathers-hooks plug-in which allows us to add asynchronous hooks before or after a service method call. Hooks work like Express middleware. The following example adds a hook that converts our Todo data and makes sure that nobody submits anything that we don't want to put into MongoDB:

`npm install feathers-hooks`

```js
// app.js
var feathers = require('feathers');
var mongodb = require('feathers-mongodb');
var hooks = require('feathers-hooks');
var bodyParser = require('body-parser');

var app = feathers();
var todoService = mongodb({
  db: 'feathers-demo',
  collection: 'todos'
});

app.configure(feathers.rest())
  .configure(feathers.socketio())
  // Configure hooks
  .configure(hooks())
  .use(bodyParser.json())
  .use('/todos', todoService)
  .use('/', feathers.static(__dirname))
  .listen(3000);

// Get the wrapped todos service object and
// add a `before` create hook modifying the data
app.service('todos').before({
  create: function(hook, next) {
    var oldData = hook.data;
    // Replace the old data by creating a new object
    hook.data = {
      text: oldData.text,
      complete: oldData.complete === 'true' || !!oldData.complete
    };
    next();
  }
});
```

You might have noticed the call to `.service` in `app.service('todos')`. This will basically return the original service object (`todoService` in our case) but contain some functionality added by Feathers. Most notably, the returned service object will be an `EventEmitter` that emits created, updated etc. events.

The `feathers-hooks` plugin also adds `.before` and `.after` methods that allow hooks to be added to that service. 

When you need to access services, always use `app.service(name)` and not the original service object otherwise things will not work as expected.