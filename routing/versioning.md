# Versioning Your API

TODO: Make sense of these snippets.  

Note that there are two ways to version your API.  

Directly on the services (`app.use('/api/v1/todos', memory())`)
 - Good if you want to be able to access services from other versions of your API inside hooks.
 - Bad if you want each version of your API to have its own plugins and configuration. All versions will have to use the same setup.
 
Using sub-apps, as described in the next section.
 - Good if you want to have a custom set of plugins and configuration for each version of your API.
 - Bad if you want to be able to access services from other versions of your API inside hooks.
 
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

Now your service will be exposed at /api/todos.  Internally, in hooks, you will still use `hook.app.service('todos')` to lookup services. It won't be possible to lookup services on other versions of the API using this type of versioning.  The advantage to doing versioning as shown above (as opposed to doing it directly on the service) is that you will be able to use custom plugins and a custom configuration in each version of your API.

<hr>

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
