# Client

## Individual Packages
Many of the main `feathers-` packages include a bundled client package.

| Server package            | Client package                   | API page            |
| ------------------------- | -------------------------------- | ------------------- |
| `feathers`                | `feathers/client`                | [Application API](./application.md) |
| `feathers-hooks`          | `feathers-hooks`                 | [Hooks API](./hooks.md) |
| `feathers-errors`         | `feathers-errors`                | [Errors API](./errors.md) |
| `feathers-rest`           | `feathers-rest/client`           | [REST Transport API](./rest.md) |
| `feathers-socketio`       | `feathers-socketio/client`       | [Socket.io Transport API](./socketio.md) |
| `feathers-primus`         | `feathers-primus/client`         | [Primus Transport API](./primus.md) |
| `feathers-authentication` | `feathers-authentication-client` | [Feathers Authentication Client API]() |

> Note: In the Auk release, the client version of `feathers-authentication` was put into its own repo: `feathers-authentication-client`.

## The `feathers-client` package
The [`feathers-client`](https://npmjs.com/feathers-client) package is a quick way to get all of the client packages.  Below is an example of the scripts you would use to load `feathers-client` from `unpkg.com`.  It's possible to use it with a module loader,  but using individual client packages will allow you to take advantage of Feathers' modularity.

```html
<script src="//unpkg.com/feathers-client@2.0.0-pre.2/dist/feathers.js"></script>
<script src="//unpkg.com/socket.io-client@1.7.3/dist/socket.io.js"></script>
<script>
  // Socket.io is exposed as the `io` global.
  var socket = io('http://localhost:3030', {transports: ['websocket']});
  // feathers-client is exposed as the `feathers` global.
  var feathersClient = feathers()
    .configure(feathers.hooks())
    .configure(feathers.socketio(socket))
    .configure(feathers.authentication())
    .configure(feathers.errors())
</script>
```

## Single Transport
On the client, each Feathers instance only supports one transport (rest, socketio, or primus) at a time.  You cannot register multiple transport plugins in the same way as on the server.  This is the same whether you use the individual client packages or the `feathers-client` package.  Here's an example that only uses the `feathers-rest` transport.

```js
import feathers from 'feathers/client';
import hooks from 'feathers-hooks';
import rest from 'feathers-socketio/client';

const app = feathers()
  .configure(hooks())
  .configure(rest()) // Only uses feathers-rest
```

Or here's an example that only uses the `feathers-socketio` transport.

```js
import feathers from 'feathers/client';
import hooks from 'feathers-hooks';
import socketio from 'feathers-socketio/client';
import io from 'socket.io-client/dist/socket.io';

const socket = io('http://localhost:3030', {transports: ['websocket']})

const app = feathers()
  .configure(hooks())
  .configure(socketio(socket)) // Only uses feathers-socketio
```
