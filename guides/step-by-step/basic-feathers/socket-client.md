# Writing a Feathers Websocket Client

We already have a Feathers REST frontend.
Its simple to convert that to one using websockets.

> **Websockets.** Feathers can use eight of the most popular websocket libraries.
We will use the popular Socket.io in this guide.


### Working example

- Server code: [examples/step/01/websocket/1.js](https://github.com/feathersjs/feathers-guide/blob/master/examples/step/01/websocket/1.js)
- Client code: [common/public/socketio.html](https://github.com/feathersjs/feathers-guide/blob/master/examples/step/01/common/public/socketio.html)
and
[feathers-app.js](https://github.com/feathersjs/feathers-guide/blob/master/examples/step/01/common/public/feathers-app.js)
- Start the server: `node ./examples/step/01/websocket/1`
- Point the browser at: `//localhost:3030/socketio.html`
- Compare with last page's server
[examples/step/01/rest/2.js](https://github.com/feathersjs/feathers-guide/blob/master/examples/step/01/rest/2.js):
[Unified](http://htmlpreview.github.io/?https://github.com/feathersjs/feathers-guide/blob/master/examples/step/_diff/01-websocket-1-line.html)
|
[Split](http://htmlpreview.github.io/?https://github.com/feathersjs/feathers-guide/blob/master/examples/step/_diff/01-websocket-1-side.html)
- Compare with last page's HTML
[common/public/socketio.html](https://github.com/feathersjs/feathers-guide/blob/master/examples/step/01/common/public/socketio.html)
[Unified](http://htmlpreview.github.io/?https://github.com/feathersjs/feathers-guide/blob/master/examples/step/_diff/01-websocket-socketio-line.html)
|
[Split](http://htmlpreview.github.io/?https://github.com/feathersjs/feathers-guide/blob/master/examples/step/_diff/01-websocket-socketio-side.html)


### Change the server to support clients using either Feathers REST **or** websocket calls

Add 2 lines to the server code so it supports
either REST **or** websocket calls from the Feathers client.

```javascript
const rest = require('feathers-rest');
const socketio = require('feathers-socketio'); // new

const app = httpServerConfig()
  .configure(rest())
  .configure(socketio()) // new
  .configure(services)
  .configure(middleware);
```
- See what changed:
[Unified](http://htmlpreview.github.io/?https://github.com/feathersjs/feathers-guide/blob/master/examples/step/_diff/01-websocket-1-line.html)
|
[Split](http://htmlpreview.github.io/?https://github.com/feathersjs/feathers-guide/blob/master/examples/step/_diff/01-websocket-1-side.html)

### Changing the HTML for Feathers client websocket calls

We replace the REST code we had in the HTML with the equivalent Websocket code.

```html
<script type="text/javascript" src="//cdnjs.cloudflare.com/ajax/libs/core-js/2.1.4/core.min.js"></script>
<script src="//unpkg.com/feathers-client@^1.8.0/dist/feathers.js"></script>
<script src="/socket.io.min.js"></script>
<script src="/serverUrl.js"></script>
<script>
  const socket = io(serverUrl);
  const feathersClient = feathers()
      .configure(feathers.socketio(socket))
</script>
<script src="/feathers-app.js"></script>
```
- See what changed:
[Unified](http://htmlpreview.github.io/?https://github.com/feathersjs/feathers-guide/blob/master/examples/step/_diff/01-websocket-socketio-line.html)
|
[Split](http://htmlpreview.github.io/?https://github.com/feathersjs/feathers-guide/blob/master/examples/step/_diff/01-websocket-socketio-side.html)
- `src="/socket.io.min.js"` load the Socket.io client code.
- `const socket = io(serverUrl);` create a websocket.
- `.configure(feathers.socketio(socket))` configure Feathers client to use the websocket.

### Changing the frontend code

We've already said that most of the Feathers frontend doesn't care
if it's communicating with the server using REST or Websockets.
**No more changes are necessary.**

> **REST vs Websockets.**
There is a huge technical difference involved in communicating via REST or Websockets.
Feathers hides this so you can get on with what's important
rather than handling such details.

### Results

And that's all there is to it.
The results are identical to that for [Writing a Feathers REST Client](./rest-client.md)
 
### Is anything wrong, unclear, missing?
[Leave a comment.](https://github.com/feathersjs/feathers-guide/issues/new?title=Comment:Step-Basic-Socket-client&body=Comment:Step-Basic-Socket-client)
