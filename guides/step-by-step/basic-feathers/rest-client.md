# A Feathers REST Client

We already have a Feathers REST API server from the previous example.
Let's write a Javascript frontend for it.

## Working example

- Server code: [examples/step/01/rest/2.js](https://github.com/feathersjs/feathers-docs/blob/master/examples/step/01/rest/2.js)
- Client code:
[common/public/rest.html](https://github.com/feathersjs/feathers-docs/blob/master/examples/step/01/common/public/rest.html)
and
[feathers-app.js](https://github.com/feathersjs/feathers-docs/blob/master/examples/step/01/common/public/feathers-app.js)
- Start the server: `node ./examples/step/01/rest/2`
- Point the browser at: `localhost:3030/rest.html`
- Compare with last page's server
[examples/step/01/rest/1.js](https://github.com/feathersjs/feathers-docs/blob/master/examples/step/01/rest/1.js):
[Unified](http://htmlpreview.github.io/?https://github.com/feathersjs/feathers-docs/blob/master/examples/step/_diff/01-rest-2-line.html)
|
[Split](http://htmlpreview.github.io/?https://github.com/feathersjs/feathers-docs/blob/master/examples/step/_diff/01-rest-2-side.html)

## Writing a server for Feathers client REST calls

[rest/2.js](https://github.com/feathersjs/feathers-docs/blob/master/examples/step/01/rest/2.js)
, our server for Feathers REST clients, is exactly the same as
[rest/1.js.](https://github.com/feathersjs/feathers-docs/blob/master/examples/step/01/rest/1.js)
, our previous server for HTTP REST API calls. 
**No new server code is required to handle Feathers REST clients.**

Compare the two:
[Unified](http://htmlpreview.github.io/?https://github.com/feathersjs/feathers-docs/blob/master/examples/step/_diff/01-rest-2-line.html)
|
[Split](http://htmlpreview.github.io/?https://github.com/feathersjs/feathers-docs/blob/master/examples/step/_diff/01-rest-2-side.html).


## Writing the frontend HTML

We'll soon see most of the frontend doesn't care if we're communicating with the server
using REST or WebSockets.
To keep things DRY, we are isolating in
[common/public/rest.html](https://github.com/feathersjs/feathers-docs/blob/master/examples/step/01/common/public/rest.html)
the code which is unique to REST.
[import](../../../examples/step/01/common/public/rest.html)

- `//cdnjs.cloudflare.com/ajax/libs/core-js/2.1.4/core.min.js`
loads a polyfill for [fetch](https://davidwalsh.name/fetch) if required.
- `src="//unpkg.com/feathers-client@^2.0.0/dist/feathers.js"` loads the Feathers client code.
- `src="/serverUrl.js"` loads the URL of the server.
The default is `var serverUrl = 'http:localhost:3030';`.
Change the value if you need to.
- `const feathersClient  = feathers()` instantiates a Feathers client.
- `.configure(feathers.rest(serverUrl).fetch(fetch))` configures the client to use REST
when communicating with the server.
It points to the server,
and passes the `fetch` instruction as the interface for fetching resources.
- `src="/feathers-app.js"` loads the main application.

## Writing the Feathers frontend

Writing the HTML was actually the hard part.
The frontend
[common/public/feathers-app.js.](https://github.com/feathersjs/feathers-docs/blob/master/examples/step/01/common/public/feathers-app.js)
is essentially the same as the server code we used in
[Writing a Database Connector](./database-connector.md)!
[import](../../../examples/step/01/common/public/feathers-app.js)

- See what changed:
[Unified](http://htmlpreview.github.io/?https://github.com/feathersjs/feathers-docs/blob/master/examples/step/_diff/01-rest-2-client-line.html)
|
[Split](http://htmlpreview.github.io/?https://github.com/feathersjs/feathers-docs/blob/master/examples/step/_diff/01-rest-2-client-side.html).

> **Feathers "a-ha!" moment.**
We can run **exactly** the same code on the frontend as on the server.
We can code the frontend as if the database was sitting on it.
That's part of the magic of Feathers,
and it makes frontend development significantly simpler.

## Results

The results in the console window of the browser are the same as they were
running [Writing a Database Connector](./database-connector.md).

```text`
created Jane Doe item
 Object {email: "jane.doe@gmail.com", password: "11111", role: "admin", _id: "8zQ7mXay3XqiqP35"}
created John Doe item
 Object {email: "john.doe@gmail.com", password: "22222", role: "user", _id: "l9dOTxh0xk1h94gh"}
created Judy Doe item
 Object {email: "judy.doe@gmail.com", password: "33333", role: "user", _id: "3BeFPGkduhM6mlwM"}
find all items
 [Object, Object, Object]
   0: Object
     _id: "3BeFPGkduhM6mlwM"
     email: "judy.doe@gmail.com"
     password: "33333"
     role: "user"
   1: Object
     _id: "8zQ7mXay3XqiqP35"
     email: "jane.doe@gmail.com"
     password: "11111"
     role: "admin"
   2: Object
     _id: "l9dOTxh0xk1h94gh"
     email: "john.doe@gmail.com"
     password: "22222"
     role: "user"
  length: 3
```
 
### Is anything wrong, unclear, missing?
[Leave a comment.](https://github.com/feathersjs/feathers-docs/issues/new?title=Comment:Step-Basic-Rest-client&body=Comment:Step-Basic-Rest-client)
