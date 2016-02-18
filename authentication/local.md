# Setting up Local Authentication

The local auth strategy makes it easy to add _username_ and _password_ authentication for your app. 

If you already have an app started, you can simply add the following line to your server setup.

```js
app.configure(authentication());
```

## Server Options

- `usernameField` (default: 'email') [optional] - The database field on the user service you want to use as the username.
- `passwordField` (default: 'password') [optional] - The database field containing the password on the user service.
- `userEndpoint` (default: '/users') [optional] - The user service endpoint
- `localEndpoint` (default: '/auth/local') [optional] - The local auth service endpoint
- `tokenEndpoint` (default: '/auth/token') [optional] - The JWT auth service endpoint
- `successRedirect` (default: '/auth/success') [optional] - The endpoint to redirect to after successful authentication or signup.

## Client Options

TODO

## Getting Started Tutorial

Here's an example server that uses the [feathers-mongoose](https://github.com/feathersjs/feathers-mongoose) database adapter.  You can use the following examples to get an idea of how it works.

```js
import feathers from 'feathers';
import hooks from 'feathers-hooks';
import bodyParser from 'body-parser';
import authentication from 'feathers-authentication';
import { hooks as authHooks } from 'feathers-authentication';
import mongoose from 'mongoose';
import service from 'feathers-mongoose';

const port = 3030;
const Schema = mongoose.Schema;
const UserSchema = new Schema({
  email: {type: String, required: true, unique: true},
  password: {type: String, required: true },
  createdAt: {type: Date, 'default': Date.now},
  updatedAt: {type: Date, 'default': Date.now}
});
let UserModel = mongoose.model('User', UserSchema);

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/feathers');

/* * * Initialize the App and Plugins * * */
let app = feathers()
  .configure(feathers.rest())
  .configure(feathers.socketio())
  .configure(hooks())
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: true }))
  // Configure feathers-authentication
  .configure(authentication({
    token: {
      secret: 'feathers-rocks'
    }
  }));

app.use('/users', new service('user', {Model: UserModel}))

let userService = app.service('/users');
userService.before({
  create: [authHooks.hashPassword()]
});

let server = app.listen(port);
server.on('listening', function() {
  console.log(`Feathers application started on localhost:${port}`);
});
```

Please note that the above User service does not include any kind of authorization or access control.  That will require setting up additional hooks, later.  For now, leaving out the access control will allow us to easily create a user.  Here's an example request to create a user (make sure your server is running):

```js
// Create User (POST http://localhost:3030/users)
jQuery.ajax({
  url: 'http://localhost:3030/users',
  type: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  contentType: 'application/json',
  data: JSON.stringify({
    'email': 'admin@feathersjs.com',
    'password': 'fowlplay'
  })
})
.done(function(data, textStatus, jqXHR) {
    console.log('HTTP Request Succeeded: ' + jqXHR.status);
    console.log(data);
})
.fail(function(jqXHR, textStatus, errorThrown) {
    console.log('HTTP Request Failed', arguments);
});
```

Once you've created a user, logging in is as simple as `POST`ing a request to the `localEndpoint`, which is `/auth/local` by default.  Here's an example request for logging in:

```js
// Login by email (POST http://localhost:3030/auth/local)
jQuery.ajax({
  url: 'http://localhost:3030/api/login',
  type: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  contentType: 'application/json',
  data: JSON.stringify({
    'email': 'admin@feathersjs.com',
    'password': 'fowlplay'
  })
})
.done(function(data, textStatus, jqXHR) {
  console.log('HTTP Request Succeeded: ' + jqXHR.status);
  console.log(data);
})
.fail(function(jqXHR, textStatus, errorThrown) {
  console.log('HTTP Request Failed', arguments);
});
```

The server will respond with an object that contains two properties, `data` and `token`.  The `data` property contains an object with the current user.  

You'll notice that it currently includes the password.  You really don't want it exposed, so when you're ready to secure the service, you'll need an additional feathers-hook to remove the password property from the response. 

The `token` property contains a JWT token that you can use to authenticate REST requests or for socket connections.  You can learn more about how JWT tokens work on [jwt.io](http://jwt.io/).


### Authenticating REST Requests

Authenticated REST requests must have an `Authorization` header in the format `'Bearer <token>'`, where the <token> is the JWT token. The header should have the following format:
```
Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IklseWEgRmFkZWV2IiwiYWRtaW4iOnRydWV9.YiG9JdVVm6Pvpqj8jDT5bMxsm0gwoQTOaZOLI-QfSNc
```

Assuming you've set up a todos service, here is full request example you can try out. Be sure to replace `<token>` with a token you've retrieved from your `loginEndpoint`:

```js
// List Todos (GET http://localhost:3030/todos)
jQuery.ajax({
  url: 'http://localhost:3030/todos',
  type: 'GET',
  headers: {
    "Authorization": "Bearer <token>",
    "Accept": "application/json",
  },
})
.done(function(data, textStatus, jqXHR) {
    console.log("HTTP Request Succeeded: " + jqXHR.status);
    console.log(data);
})
.fail(function(jqXHR, textStatus, errorThrown) {
    console.log("HTTP Request Failed", arguments);
});
```

### Authenticating Socket.io Connections

TODO

### What's next?
Adding authentication allows you to know **who** users are. Now you'll want to specify **what** they can do. This is done using authorization hooks. Learn more about it in the [Authorization section](../authorization/readme.md).