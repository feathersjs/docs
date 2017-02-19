# Express

## Query, route and middleware parameters

URL query parameters will be parsed and passed to the service as `params.query`. For example:

```
GET /messages?read=true&$sort[createdAt]=-1
```

Will set `params.query` to

```js
{
  "read": "true",
  "$sort": { "createdAt": "-1" }
}
```

> **ProTip:** Since the URL is just a string, there will be **no type conversion**. This can be done manually in a [hook](../hooks/readme.md).

<!-- -->

> **ProTip:** For REST calls, `params.provider` will be set to `rest` so you know which provider the service call came in on.

<!-- -->

> **ProTip:** It is also possible to add information directly to the `params` object by registering an Express middleware that modifies the `req.feathers` property. It must be registered **before** your services are.

<!-- -->

> **ProTip:** Route params will automatically be added to the `params` object.

<!-- -->

> **ProTip:** To get extended query parsing [set](http://expressjs.com/en/4x/api.html#app.set) `app.set('query parser', 'extended')` which will use the [qs](https://www.npmjs.com/package/qs) instead of the built-in [querystring](https://nodejs.org/api/querystring.html) module.

<!-- -->

> **ProTip:** If an array in your request consists of more than 20 items, the [qs](https://www.npmjs.com/package/qs) parser implicitly [converts](https://github.com/ljharb/qs#parsing-arrays) it  to an object with indices as keys. To extend this limit, you can set a custom query parser: `app.set('query parser', str => qs.parse(str, {arrayLimit: 1000}))`

```js
const feathers = require('feathers');
const rest = require('feathers-rest');

const app = feathers();

app.configure(rest())
  .use(function(req, res, next) {
    req.feathers.fromMiddleware = 'Hello world';
    next();
  });

app.use('/users/:userId/messages', {
  get(id, params) {
    console.log(params.query); // -> ?query
    console.log(params.provider); // -> 'rest'
    console.log(params.fromMiddleware); // -> 'Hello world'
    console.log(params.userId); // will be `1` for GET /users/1/messages

    return Promise.resolve({
      id,
      params,
      read: false,
      text: `Feathers is great!`,
      createdAt: new Date().getTime()
    });
  }
});

app.listen(3030);
```

You can see all the passed parameters by going to something like `localhost:3030/users/213/messages/23?read=false&$sort[createdAt]=-1]`. More information on how services play with Express middleware, routing and versioning can be found in the [middleware chapter](../middleware/readme.md).
