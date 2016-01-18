# Versioning Your API

TODO: Make sense of these snippets
 
<hr>
**Snippets from here:** https://github.com/feathersjs/feathers/issues/207#issuecomment-172619648

Unfortunately Router can't use services, only an application instance can (with app.use). Basically for REST APIs, a service can be considered as its own router. The problem is that with something like router.use(service) we won't know what the service path is so it is impossible to set up Sockets for it and Routers don't send a mount event like sub-apps do.

If you would like to use sub-routes that can be done by using sub-apps:

```js
// api.js
module.exports = feathers().use('/todos', todoService);

// app.js
var main = feathers();
var api = require('./api');

main.use('/api', api);
```

Now your service will be exposed at /api/todos.

**Another note:** In 1.x you will still have to call api.setup() manually and the websocket routes will not be updated (meaning you still listen to things like socket.on('todo created')) like this:

```js
// api.js
module.exports = feathers().use('/todos', todoService);

// app.js
var main = feathers();
var api = require('./api');

main.use('/api', api);

var server = main.listen(8080);
api.setup(server);
```

In v2 this will be socket.on('api/todo created') and you won't have to call api.setup (see feathersjs/feathers-commons#14)