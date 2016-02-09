# Extending Database Adapters

Now that we talked about [pagination, sorting](pagination.md) and [querying](querying.md) we can look at different ways on how to extend the functionality of the existing database adapters.

> Keep in mind that calling the original service methods will return a Promise that resolves with the value.

### Hooks

The most flexible option is weaving in functionality through hooks. For a more detailed explanation about hook, go to the [hooks chapter](../hooks/readme.md). For example, `createdAt` and `updatedAt` timestamps could be added like this:

```js
const feathers = require('feathers');
const hooks = require('feathers-hooks');

// Import the database adapter of choice
const service = require('feathers-<adapter>');

const app = feathers()
  .configure(hooks())
  .use('/todos', service({
    paginate: {
      default: 2,
      max: 4
    }
  }));

app.service('todos').before({
  create(hook) {
    hook.data.createdAt = new Date();
  },
  
  update(hook) {
    hook.data.updatedAt = new Date();
  }
});

app.listen(3030);
```

Another important hook that you will probably use eventually is limiting the query for the current user (which is set in `params.user` by [authentication](../authentication/readme.html)):

```js
app.service('todos').before({
  // You can create a single hook like this
  find: function(hook) {
    const query = hook.params.query;

    // Limit the entire query to the current user
    query.user_id = hook.params.user.id;
  }
});
```

### Classes (ES6)

All modules also export an ES6 class as `Service` that can be directly extended like this:

```js
'use strict';

const Service = require( 'feathers-<database>').Service;

class MyService extends Service {
  create(data, params) {
    data.created_at = new Date();

    return super.create(data, params);
  }

  update(id, data, params) {
    data.updated_at = new Date();

    return super.update(id, data, params);
  }
}

app.use('/todos', new MyService({
  paginate: {
    default: 2,
    max: 4
  }
}));
```

### Uberproto (ES5)

You can also use `.extend` on a service instance (extension is provided by [Uberproto](https://github.com/daffl/uberproto)):

```js
const myService = memory({
  paginate: {
    default: 2,
    max: 4
  }
}).extend({
  create(data) {
    data.created_at = new Date();
    return this._super.apply(this, arguments);
  }
});

app.use('/todos', myService);
```

> **Note:** this is more for backwards compatibility. We recommend the usage of classes or hooks as they are easier to test, easier to maintain and are more flexible.
