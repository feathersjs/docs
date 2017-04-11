# A REST API server

Our database connector will now function as a full fledged REST API server.
We need only add a HTTP server to it.

>**HTTP servers.** The Feathers presently is tied into
the popular HTTP server framework [Express](http://expressjs.com/).
Future versions will support multiple frameworks, starting with
[koa](http://koajs.com/).


## Working example

- Source code: [examples/step/01/rest/1.js.](https://github.com/feathersjs/feathers-docs/blob/auk/examples/step/01/rest/1.js)
and
[common/](https://github.com/feathersjs/feathers-docs/blob/auk/examples/step/01/common)
- Run it: `node ./examples/step/01/rest/1.js`
- Compare with last page's [examples/step/01/db-connector/1.js](https://github.com/feathersjs/feathers-docs/blob/auk/examples/step/01/db-connector/1.js):
[Unified](http://htmlpreview.github.io/?https://github.com/feathersjs/feathers-docs/blob/auk/examples/step/_diff/01-rest-1-line.html)
|
[Split](http://htmlpreview.github.io/?https://github.com/feathersjs/feathers-docs/blob/auk/examples/step/_diff/01-rest-1-side.html)

## Implementing a REST API server

This is our previous example with the database method calls removed,
and with an Express server added.
[import](../../../examples/step/01/rest/1.js)

- See what changed:
[Unified](http://htmlpreview.github.io/?https://github.com/feathersjs/feathers-docs/blob/auk/examples/step/_diff/01-rest-1-line.html)
|
[Split](http://htmlpreview.github.io/?https://github.com/feathersjs/feathers-docs/blob/auk/examples/step/_diff/01-rest-1-side.html)

The Express server [common/expressServerConfig.js](https://github.com/feathersjs/feathers-docs/blob/auk/examples/step/01/common/expressServerConfig.js)
is configured as follows.
[import](../../../examples/step/01/common/expressServerConfig.js)

The Express middleware [common/expressMiddleware/index.js](https://github.com/feathersjs/feathers-docs/blob/auk/examples/step/01/common/expressMiddleware/index.js)
handles logging, pages not found, and general errors.
[import](../../../examples/step/01/common/expressMiddleware/index.js)

> **Boilerplate.** The server configuration and middleware are standard Express.
They have little to do with Feathers other than to feed REST requests to it.

## Running the server

We can now made REST API calls to the server.

In the previous example we created 3 user items and then printed the user file.
We can now do the same thing, but using REST, with
[curl](https://en.wikipedia.org/wiki/CURL) commands:
[import](../../../examples/step/01/rest/curl-requests.sh)

First, start the server by running `node ./examples/step/01/rest/1.js` on one terminal.

Then run the curl commands with `./examples/step/01/rest/curl-requests.sh`
on another terminal.

## Results

That console displays:

```text
feathers-guide$ ./examples/step/01/rest/curl-requests.sh
POST Jane Doe
{"email":"jane.doe@gmail.com","password":"X2y6","role":"admin","_id":"sbkXV7LVkMhx1NyY"}
POST John Doe
{"email":"john.doe@gmail.com","password":"i6He","role":"user","_id":"uKhqOp4R4hABw9oO"}
POST Judy Doe
{"email":"judy.doe@gmail.com","password":"7jHw","role":"user","_id":"pvcmh9X2i9VZgqWJ"}
GET all users
[
 {"email":"judy.doe@gmail.com","password":"7jHw","role":"user","_id":"pvcmh9X2i9VZgqWJ"},
 {"email"::"jane.doe@gmail.com","password":"X2y6","role":"admin","_id":"sbkXV7LVkMhx1NyY"},
 {"email":"john.doe@gmail.com","password":"i6He","role":"user","_id":"uKhqOp4R4hABw9oO"}
]
```

> **Feathers.** REST API calls are automatically converted into Feathers database method calls
like the `users.create()` and `users.find()` ones we use in the previous example.
How's that for convenience?
 
### Is anything wrong, unclear, missing?
[Leave a comment.](https://github.com/feathersjs/feathers-guide/issues/new?title=Comment:Step-Basic-Rest-api-server&body=Comment:Step-Basic-Rest-api-server)
