# Authenticating With Feathers Client

The Feathers authentication module has a client side component that makes it very easy for you to authenticate with a Feathers API in the browser, from another NodeJS server, or a React Native app.

## API

Feathers authentication adds a few methods to a client side Feathers app. They are as follows:

### authenticate

`app.authenticate()` attempts to authenticate with the server using the data you passed it. If you don't provide any options it will attempt to authenticate using a token stored in memory or in your `storage` engine. It returns a promise.

#### Options

- `type` (optional) - Either `local` or `token`.
- `endpoint` (optional) - eg. `/auth/facebook` - especially helpful for mobile clients, this option allows (for example) the client to authenticate with Facebook via a native SDK, and post the `access_token` Facebook's returned to Feathers (for Feathers to communicate with Facebook using the FacebookTokenStrategy).

Then you pass whatever other fields you need to send to authenticate. See below for examples.

### logout

`app.logout()` clears the token and the user from your local store. In the future it will call the server to invalidate the token.

### user

`app.get('user')` is a convenience method to get the user. Currently it only pulls from your local store. In the future it may fall back to fetching from the server if the user isn't available in the client.

### token

`app.get('token')` is a convenience method to get your access token. Currently it only pulls from your local store.

## Usage

> **ProTip:** All the client examples below demonstrate how it works in the browser without a module loader. You can also use Feathers client with a module loader like Webpack, browserify, React Native packager and also in NodeJS. See the [Feathers client section](../clients/readme.md) for more detail.

<!-- -->

> **ProTip:** If you pass a `storage` engine when configuring `feathers-authentication` it will persist your token there, otherwise it will just store it in memory. This is highly recommended to use a storage engine as it allows you to refresh without having to authenticate.


### REST

#### On the client

```html
<script src="//code.jquery.com/jquery-1.12.0.min.js"></script>
<script type="text/javascript" src="//cdnjs.cloudflare.com/ajax/libs/core-js/2.1.4/core.min.js"></script>
<script type="text/javascript" src="//unpkg.com/feathers-client@^1.0.0/dist/feathers.js"></script>
<script type="text/javascript">
  var host = 'http://localhost:3030';

  // Set up Feathers client side
  var app = feathers()
    .configure(feathers.rest(host).jquery(jQuery))
    .configure(feathers.hooks())
    .configure(feathers.authentication({ storage: window.localStorage }));

  // Authenticate. Normally you'd grab these from a login form rather than hard coding them
  app.authenticate({
    type: 'local',
    'email': 'admin@feathersjs.com',
    'password': 'admin'
  }).then(function(result){
    console.log('Authenticated!', app.get('token'));
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

Socket.io is capable of using many different transports.  By default, upon connecting it will use XHR, then will progressively try to upgrade to "better" transports until it arrives at WebSockets.  If an older client doesn't support WebSockets, it will be able to stay connected over one of the lower transports.  **If the transport changes you have to call authenticate again.**

#### On the client

```html
<script type="text/javascript" src="/socket.io/socket.io.js"></script>
<script type="text/javascript" src="//cdnjs.cloudflare.com/ajax/libs/core-js/2.1.4/core.min.js"></script>
<script type="text/javascript" src="//unpkg.com/feathers-client@^1.0.0/dist/feathers.js"></script>
<script type="text/javascript">
  // Set up socket.io
  var host = 'http://localhost:3030';
  var socket = io(host);

  // Set up Feathers client side
  var app = feathers()
    .configure(feathers.socketio(socket))
    .configure(feathers.hooks())
    .configure(feathers.authentication({ storage: window.localStorage }));

  // Authenticating using a token instead
  app.authenticate({
    type: 'token',
    'token': 'your token'
  }).then(function(result){
    console.log('Authenticated!', app.get('token'));
  }).catch(function(error){
    console.error('Error authenticating!', error);
  });
  
  // If the transport changes, you have to call authenticate() again.
  socket.io.engine.on('upgrade', function(transport) {
    console.log('transport changed');
    app.authenticate();
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
<script type="text/javascript" src="/primus/primus.js"></script>
<script type="text/javascript" src="//cdnjs.cloudflare.com/ajax/libs/core-js/2.1.4/core.min.js"></script>
<script type="text/javascript" src="//unpkg.com/feathers-client@^1.0.0/dist/feathers.js"></script>
<script type="text/javascript">
  // Set up primus
  var host = 'http://localhost:3030';
  var primus = new Primus(host);

  // Set up Feathers client side
  var app = feathers()
    .configure(feathers.primus(primus))
    .configure(feathers.hooks())
    .configure(feathers.authentication({ storage: window.localStorage }));

  // Authenticate. Normally you'd grab these from a login form rather than hard-coding them
  app.authenticate({
    type: 'local',
    'email': 'admin@feathersjs.com',
    'password': 'admin'
  }).then(function(result){
    console.log('Authenticated!', app.get('token'));
  }).catch(function(error){
    console.error('Error authenticating!', error);
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
