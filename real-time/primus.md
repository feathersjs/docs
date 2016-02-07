# The Primus Provider

[Primus](https://github.com/primus/primus) is a universal wrapper for real-time frameworks that supports Engine.IO, WebSockets, Faye, BrowserChannel, SockJS and Socket.IO.

## Usage

Install the provider module with:

```
npm install feathers-primus ws --save
```

Then import the module and pass `primus(configuration [, fn])` to `app.configure`. The following example will start a server on port 3030 and also set up Primus using the 'ws' websocket module.

```js
import feathers from 'feathers';
import primus from 'feathers-primus';

const app = feathers().configure(primus({
  transformer: 'websockets'
},));

app.listen(3030);
```

In the Browser you can connect, call service methods and listen to events like this:

```html
<script type="text/javascript" src="primus/primus.js"></script>
<script type="text/javascript">
  var primus = new Primus(url);

  primus.on('todos created', function(todo) {
    console.log('Someone created a Todo', todo);
  });

  primus.send('todos::create', { description: 'Do something' }, {}, function() {
    primus.send('todos::find', {}, function(error, todos) {
      console.log(todos);
    });
  });
</script>
```

## Configuration

The second parameter to the configuration function can be a callback that gets called with the Primus server instance that can e.g. be used for setting up [authorization](https://github.com/primus/primus#authorization):

```js
// Set up Primus with SockJS
app.configure(feathers.primus({
  transformer: 'sockjs'
}, function(primus) {
  // Set up Primus authorization here
  primus.authorize(function (req, done) {
    var auth;

    try { auth = authParser(req.headers['authorization']) }
    catch (ex) { return done(ex) }

    // Do some async auth check
    authCheck(auth, done);
  });
}));
```

## Middleware and service parameters

Just like [REST](../rest.md) and [SocketIO](socket-io.md), the Primus request object has a `feathers` property that can be extended with additional service `params` during authorization:

```js
app.configure(primus({
  transformer: 'sockjs'
}, function(primus) {
  // Set up Primus authorization here
  primus.authorize(function (req, done) {
    req.feathers.user = { name: 'David' };

    done();
  });
}));

app.use('todos', {
  create(data, params, callback) {
    // When called via Primus:
    params.provider // -> primus
    params.user // -> { name: 'David' }
  }
});
```
