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

`app.logout()` clears the token and the user from you local store.

### user

`app.token()` is a convenience method to get the user. Currently it only pulls from your local store. In the future it may fall back to fetching from the server if the user isn't available in the client.

## Usage

### REST

#### On the client

```js
const host = 'http://localhost:3030';

// Set up Feathers client side
let app = feathers()
  .configure(feathers.rest(host).jquery(jQuery))
  .configure(hooks())
  .configure(authentication());

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
```

> **ProTip:** You can use other Ajax providers like Superagent or Fetch for REST on the client. Check out the [Feathers client section](../clients/feathers.md) for more info.

#### On the server

```js
let app = feathers()
  .configure(socketio())
  .configure(hooks())
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: true }))
  .configure(authentication());
```

### Socket.io

#### On the client

```js
// Set up socket.io
const host = 'http://localhost:3030';
let socket = io(host, {
  transport: ['websockets']
});

// Set up Feathers client side
let app = feathers()
  .configure(feathers.socketio(socket))
  .configure(hooks())
  .configure(authentication());

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

```js
// Set up primus
const host = 'http://localhost:3030';
let primus = new Primus(host);

// Set up Feathers client side
let app = feathers()
  .configure(feathers.primus(primus))
  .configure(hooks())
  .configure(authentication());

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

You find working examples of all these in the [feathers-authentication repo](https://github.com/feathersjs/feathers-authentication/tree/master/examples).