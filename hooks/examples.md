# Hook examples

There are many ways in which hooks can be used. Below are some examples that show how to quickly add useful functionality to a service. The [authentication chapter](../authentication/readme.md) has more examples on how to use hooks for user authorization.

## Setting Timestamps

If the [database adapter](../databases/readme.md) does not support it already, timestamps can be easily added as a *before* hook like this:

```js
app.service('todos').before({
  create: function(hook) {
    hook.data.created_at = new Date();
  },
  
  update(hook) {
    hook.data.updated_at = new Date();
  },
  
  patch(hook) {
    hook.data.updated_at = new Date();
  }
})
```

## Fetching Related Items

Hooks can also be used to fetch related items from other services. The following hook checks for a `related` query parameter in `get` and if it exists, includes all todos for the user in the response:

```js
app.service('users').after({
  get(hook) {
    // The user id
    const id = hook.result.id;
    
    if(hook.params.query.related) {
      return hook.app.service('todos').find({
        query: { user_id: id }
      }).then(todos => {
        // Set the todos on the user property
        hook.result.todos = todos;
        // Always return the hook object or `undefined`
        return hook;
      });
    }
  }
});
```

## Validation

For a production app you need to do validation. With hooks it's actually pretty easy and validation methods can easily be reused.

```js
app.service('users').before({
  create: function(hook) {
    // Don't create a user unless they accept our terms
    if (!hook.data.acceptedTerms) {
      throw new errors.BadRequest(`Invalid request`, {
        errors: [
          {
            path: 'acceptedTerms',
            value: hook.data.acceptedTerms,
            message: `You must accept the terms`
          }
        ]
      });
    }
  }
});

```

## Sanitization

You might also need to correct or sanitize data that is sent to your app. Also pretty easy and you can check out some of our [bundled hooks](./bundled.md) that cover some common use cases.

```js
app.service('users').before({
  update: function(hook) {
    // Convert the user's age to an integer
    const sanitizedAge = parseInt(hook.data.age, 10);

    if (isNaN(age)) {
      throw new errors.BadRequest(`Invalid 'age' value ${hook.data.age}`, {
        errors: [
          {
            path: 'age',
            value: hook.data.age,
            message: `Invalid 'age' value ${hook.data.age}`
          }
        ]
      });
    }

    hook.data.age = sanitizedAge;
  }
});

```

## Soft Delete

Sometimes you might not want to actually delete items in the database but just mark them as deleted. We can do this by adding a `remove` *before* hook, marking the todo as deleted and then setting `hook.result`. That way we can completely skip the original service method.

```js
app.service('todos').before({
  remove: function(hook) {
    // Instead of calling the service remote, call `patch` and set deleted to `true`
    return this.patch(hook.id, { deleted: true }, hook.params).then(data => {
      // Set the result from `patch` as the method call result
      hook.result = data;
      // Always return the hook or `undefined`
      return hook;
    });
  },
  
  find(hook) {
    // Only query items that have not been marked as deleted
    hook.params.query.deleted = { $ne: true };
  }
});
```

> **ProTip:** Setting `hook.result` will only skip the actual method. _after_ hooks will still run in the order they have been registered.
