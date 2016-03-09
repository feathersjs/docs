# Authenticating With Feathers Client

The Feathers authentication module has a client side component that makes it very easy for you to authenticate with a Feathers API in the browser, from another NodeJS server, or a React Native app.

## API

Feathers authentication adds a few methods to a client side Feathers app. They are as follows:

### authenticate

`app.authenticate()` attempts to authenticate with the server using the data you passed it. It returns a promise.

#### Options

- `type` (**required**) - Either `local` or `token`.

Then you pass whatever other fields you need to send to authenticate. See below for examples.

### logout

`app.logout()` clears the token and the user from you local store. In the future it will call the server to invalidate the token.

### user

`app.user()` is a convenience method to get the user. Currently it only pulls from your local store. In the future it may fall back to fetching from the server if the user isn't available in the client. It returns a promise.

### token

`app.token()` is a convenience method to get your access token. Currently it only pulls from your local store. It returns a promise.

## Usage

> **ProTip:** All the client examples below demonstrate how it works in the browser without a module loader. You can also use Feathers client with a module loader like Webpack, browserify, React Native packager and also in NodeJS. See the [Feathers client section](../clients/readme.md) for more detail.

<!-- -->

> **ProTip:** `feathers-localstorage` provides a localstorage abstraction for the browser, React Native, and NodeJS that `feathers-authentication` uses on the client to persist your `user` and `token`. Therefore, you need to provide a different storage engine depending on your platform. See the [section on setting up Feathers localstorage](../databases/localstorage.md).

<!-- -->

> **ProTip:** `feathers-localstorage` must be set up before `feathers-authentication`.

### REST

#### On the client

```html
<script src="https://code.jquery.com/jquery-1.12.0.min.js"></script>
<script type="text/javascript" src="https://rawgit.com/feathersjs/feathers-client/master/dist/feathers.js"></script>
<script type="text/javascript" src="https://rawgit.com/feathersjs/feathers-localstorage/master/dist/localstorage.js"></script>
<script type="text/javascript">
  var host = 'http://localhost:3030';

  // Set up Feathers client side
  var app = feathers()
    .configure(feathers.rest(host).jquery(jQuery))
    .configure(feathers.hooks())
    .use('storage', feathers.localstorage({ storage: window.localStorage }))
    .configure(feathers.authentication());

  // Authenticate. Normally you'd grab these from a login form rather than hard coding them
  app.authenticate({
    type: 'local',
    'email': 'admin@feathersjs.com',
    'password': 'admin'
  }).then(function(result){
    console.log('Authenticated!', result);
  }).catch(function(error){
    console.error('Error authenticating!', error);
  });
</script>
```

> **ProTip:** You can use other Ajax providers like Superagent or Fetch for REST on the client. Check out the [Feathers client section](../clients/feathers.md) for more info.

#### On the server

```js
let app = feathers()
  .configure(rest())
  .configure(hooks())
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: true }))
  .configure(authentication());
```

### Socket.io

#### On the client

```html
<script type="text/javascript" src="socket.io/socket.io.js"></script>
<script type="text/javascript" src="https://rawgit.com/feathersjs/feathers-client/master/dist/feathers.js"></script>
<script type="text/javascript" src="https://rawgit.com/feathersjs/feathers-localstorage/master/dist/localstorage.js"></script>
<script type="text/javascript">
  // Set up socket.io
  var host = 'http://localhost:3030';
  var socket = io(host, {
    transport: ['websockets']
  });

  // Set up Feathers client side
  var app = feathers()
    .configure(feathers.socketio(socket))
    .configure(feathers.hooks())
    .use('storage', feathers.localstorage({ storage: window.localStorage }))
    .configure(feathers.authentication());

  // Wait for socket connection
  app.io.on('connect', function(){
    // Authenticating using a token instead
    app.authenticate({
      type: 'token',
      'token': 'your token'
    }).then(function(result){
      console.log('Authenticated!', result);
    }).catch(function(error){
      console.error('Error authenticating!', error);
    });
  });
</script>
```

#### On the server

```js
let app = feathers()
  .configure(socketio())
  .configure(hooks())
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: true }))
  .configure(authentication());
```

### Primus

#### On the client

```html
<script type="text/javascript" src="primus/primus.js"></script>
<script type="text/javascript" src="https://rawgit.com/feathersjs/feathers-client/master/dist/feathers.js"></script>
<script type="text/javascript" src="https://rawgit.com/feathersjs/feathers-localstorage/master/dist/localstorage.js"></script>
<script type="text/javascript">
  // Set up primus
  var host = 'http://localhost:3030';
  var primus = new Primus(host);

  // Set up Feathers client side
  var app = feathers()
    .configure(feathers.primus(primus))
    .configure(feathers.hooks())
    .use('storage', feathers.localstorage({ storage: window.localStorage }))
    .configure(feathers.authentication());

  // Wait for socket connection
  app.primus.on('connect', function(){
    // Authenticate. Normally you'd grab these from a login form rather than hard-coding them
    app.authenticate({
      type: 'local',
      'email': 'admin@feathersjs.com',
      'password': 'admin'
    }).then(function(result){
      console.log('Authenticated!', result);
    }).catch(function(error){
      console.error('Error authenticating!', error);
    });
  });
</script>
```

#### On the server

```js
let app = feathers()
  .configure(primus({ transformer: 'websockets' }))
  .configure(hooks())
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: true }))
  .configure(authentication());
```

Now that you've setup authentication you'll probably want to start locking down your application. Head on over to the [Authorization](../authorization/readme.md) chapter to get started.
