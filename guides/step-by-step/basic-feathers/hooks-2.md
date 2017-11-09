# Hooks, part 2

If you have an archive of stock movements,
you cannot simply delete a stock item you no longer want to keep.
You would not be able to properly present historical data if you did so.

The solution is to keep the data but mark it as deleted.
We can ignore the `deleted` flag when we know we are accessing historical, and possibly deleted, items.
Otherwise we want the application to act as if the item didn't exist.

It would be fairly complex to implement **soft delete** support yourself,
however its easy to do using the `softDelete` hook.

## Working example

- Server code: [examples/step/01/hooks/2.js](https://github.com/feathersjs/feathers-docs/blob/master/examples/step/01/hooks/2.js)
- Client code: [common/public/rest-del.html](https://github.com/feathersjs/feathers-docs/blob/master/examples/step/01/common/public/rest.html)
and
[common/public/feathers-app-del.js](https://github.com/feathersjs/feathers-docs/blob/master/examples/step/01/common/public/feathers-app-del.js)
- Start the server: `node ./examples/step/01/hooks/2`
- Point the browser at: `localhost:3030/rest-del.html`
- Compare with last page's server
[hooks/1.js.](https://github.com/feathersjs/feathers-docs/blob/master/examples/step/01/hooks/1.js):
[Unified](http://htmlpreview.github.io/?https://github.com/feathersjs/feathers-docs/blob/master/examples/step/_diff/01-hooks-2-line.html)
|
[Split](http://htmlpreview.github.io/?https://github.com/feathersjs/feathers-docs/blob/master/examples/step/_diff/01-hooks-2-side.html)

## Using softDelete

We need to make just one change to our previous server example.
We use the when hook to run the softDelete hook if the service method is not find.

```javascript
const {
  softDelete, when, // new
  setCreatedAt, setUpdatedAt, unless, remove
} = commonHooks;
// ...
userService.before({
    all: when(context => context.method !== 'find', softDelete()), // new
    create: [ /* ... */ ]
});
```
- See what changed:
[Unified](http://htmlpreview.github.io/?https://github.com/feathersjs/feathers-docs/blob/master/examples/step/_diff/01-hooks-2-line.html)
|
[Split](http://htmlpreview.github.io/?https://github.com/feathersjs/feathers-docs/blob/master/examples/step/_diff/01-hooks-2-side.html)

## The results

The browser console displays

```text
created Jane Doe item
  Object {email: "jane.doe@gmail.com", role: "admin", createdAt: "2017-05-31T08:41:48.640Z", updatedAt: "2017-05-31T08:41:48.640Z", _id: "CfLheOpJ3rve1IPh"}
created John Doe item
  Object {email: "john.doe@gmail.com", role: "user", createdAt: "2017-05-31T08:41:48.623Z", updatedAt: "2017-05-31T08:41:48.623Z", _id: "sQy34FUrDC8gJOUR"}
created Judy Doe item
  Object {email: "judy.doe@gmail.com", role: "user", createdAt: "2017-05-31T08:41:48.641Z", updatedAt: "2017-05-31T08:41:48.641Z", _id: "eKNolHDBO6qXH2MU"}
created Jack Doe item
  Object {email: "jack.doe@gmail.com", role: "user", createdAt: "2017-05-31T08:41:48.641Z", updatedAt: "2017-05-31T08:41:48.641Z", _id: "5iQCl2oDLbVXMfHo"}
deleted Jack Doe item
  Object
    email: "jack.doe@gmail.com",
    role: "user",
    deleted: true
    createdAt: "2017-05-31T08:41:48.641Z",
    updatedAt: "2017-05-31T08:41:48.641Z",
    _id: "5iQCl2oDLbVXMfHo"
find all items
  [Object, Object, Object, Object]
    0: Object
      email: "jack.doe@gmail.com"
      role: "user"
      password: "$2a$10$So9MhiVGW.P31CZnUefXXOcuacwKMm7nTgCAPSBZB9rO10how.X.G"
      deleted: true
      createdAt: "2017-05-31T08:41:48.641Z"
      updatedAt: "2017-05-31T08:41:48.641Z"
      _id: "5iQCl2oDLbVXMfHo"
    1: Object
      email: "jane.doe@gmail.com"
      password: "$2a$10$TAz6SD6WxEostxvCNMOubuEY68pS8Jv9pLvrrgCiWTIOjIs3yIlO."
      role: "admin"
      createdAt: "2017-05-31T08:41:48.640Z"
      updatedAt: "2017-05-31T08:41:48.640Z"
      _id: "CfLheOpJ3rve1IPh"
    2: Object
      email: "judy.doe@gmail.com"
      password: "$2a$10$GvUEJfPTQLGY8JKTuH8yeeML9auVLo1IGDVyGFOOImZ0Nuxtd7uji"
      role: "user"
      createdAt: "2017-05-31T08:41:48.641Z"
      updatedAt: "2017-05-31T08:41:48.641Z"
      _id: "eKNolHDBO6qXH2MU"
    3: Object
      email: "john.doe@gmail.com"
      password: "$2a$10$MX0LJerCfLoGx31mGh2x0eR7CyE2t2STeHhpcV9vYbpD3m8i8OZ.S"
      role: "user"
      createdAt: "2017-05-31T08:41:48.623Z"
      updatedAt: "2017-05-31T08:41:48.623Z"
      _id: "sQy34FUrDC8gJOUR"
    length: 4
```

- The result returned when the Jack Doe item was deleted contains `deleted: true`.
- The results returned for find also contain `deleted: true` for Jack Doe
because of how we conditioned the softDelete hook.

### Is anything wrong, unclear, missing?
[Leave a comment.](https://github.com/feathersjs/feathers-docs/issues/new?title=Comment:Step-Basic-Hooks-2&body=Comment:Step-Basic-Hooks-2)
