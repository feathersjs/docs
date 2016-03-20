# Vanilla Primus

Primus works very similar to [Socket.io](socket-io.md) but supports a number of different real-time libraries. [Once configured on the server](../real-time/primus.md) service methods and events will be available through a Primus socket connection. 

## Establishing the connection

In the browser, the connection can be established by loading the client from `primus/primus.js` and instantiating a new `Primus` instance. Unlike HTTP calls, websockets do not have a cross-origin restriction in the browser so it is possible to connect to any Feathers server.

See the [Primus docs](https://github.com/primus/primus#connecting-from-the-browser) for more details.

> **ProTip**: The socket connection URL has to point to the server root which is where Feathers will set up Primus.

## Calling service methods

Service methods can be called by emitting a `<servicepath>::<methodname>` event with the method parameters. `servicepath` is the name the service has been registered with (in `app.use`) without leading or trailing slashes. An optional callback following the `function(error, data)` Node convention will be called with the result of the method call or any errors that might have occurred.

`params` will be set as `params.query` in the service method call. Other service parameters can be set through a [Primus middleware](../real-time/primus.md).

### `find`

Retrieves a list of all matching resources from the service

```js
primus.send('messages::find', { status: 'read', user: 10 }, (error, data) => {
  console.log('Found all messages', data);
});
```

Will call `messages.find({ query: { status: 'read', user: 10 } })`.

### `get`

Retrieve a single resource from the service.

```js
primus.send('messages::get', 1, (error, message) => {
  console.log('Found message', message);
});
```

Will call `messages.get(1, {})`.

```js
primus.send('messages::get', 1, { fetch: 'all' }, (error, message) => {
  console.log('Found message', message);
});
```

Will call `messages.get(1, { query: { fetch: 'all' } })`.

### `create`

Create a new resource with `data` which may also be an array.

```js
primus.send('messages::create', {
  "text": "I really have to iron"
}, (error, message) => {
  console.log('Message created', message);
});
```

Will call `messages.create({ "text": "I really have to iron" }, {})`.

```js
primus.send('messages::create', [
  { "text": "I really have to iron" },
  { "text": "Do laundry" }
]);
```

Will call `messages.create` with the array.

### `update`

Completely replace a single or multiple resources.

```js
primus.send('messages::update', 2, {
  "text": "I really have to do laundry"
}, (error, message) => {
  console.log('Message updated', message);
});
```

Will call `messages.update(2, { "text": "I really have to do laundry" }, {})`. The `id` can also be `null` to update multiple resources:

```js
primus.send('messages::update', null, {
  complete: true
}, { complete: false });
```

Will call `messages.update(null, { "complete": true }, { query: { complete: 'false' } })`.

> __Note:__ `update` is normally expected to replace an entire resource which is why the database adapters only support `patch` for multiple records.

### `patch`

Merge the existing data of a single or multiple resources with the new `data`.

```js
primus.send('messages::patch', 2, {
  read: true
}, (error, message) => {
  console.log('Patched message', message);
});
```

Will call `messages.patch(2, { "read": true }, {})`. The `id` can also be `null` to update multiple resources:

```js
primus.send('messages::patch', null, {
  complete: true
}, {
  complete: false
}, (error, message) => {
  console.log('Patched message', message);
});
```

Will call `messages.patch(null, { complete: true }, { query: { complete: false } })` to change the status for all read messages.

This is supported out of the box by the Feathers [database adapters](../databases/readme.md) 

### `remove`

Remove a single or multiple resources:

```js
primus.send('messages::remove', 2, { cascade: true }, (error, message) => {
  console.log('Removed a message', message);
});
```

Will call `messages.remove(2, { query: { cascade: true } })`. The `id` can also be `null` to remove multiple resources:

```js
primus.send('messages::remove', null, { read: true });
```

Will call `messages.remove(null, { query: { read: 'true' } })` to delete all read messages.


### Listening to events

Listening to service events allows real-time behaviour in an application. [Service events](../real-time/readme.md) are sent to the socket in the form of `servicepath eventname`.

### created

The `created` event will be published with the callback data when a service `create` returns successfully.

```html
<script>
  primus.on('messages created', function(message) {
    console.log('Got a new Message!', message);
  });
</script>
```

### updated, patched

The `updated` and `patched` events will be published with the callback data when a service `update` or `patch` method calls back successfully.

```html
<script>
  primus.on('my/messages updated', function(message) {
    console.log('Got an updated Message!', message);
  });

  primus.send('my/messages::update', 1, {
    text: 'Updated text'
  }, {}, function(error, callback) {
   // Do something here
  });
</script>
```

### removed

The `removed` event will be published with the callback data when a service `remove` calls back successfully.

```html
<script>
  primus.on('messages removed', function(message) {
    // Remove element showing the Message from the page
    $('#message-' + message.id).remove();
  });
</script>
```
