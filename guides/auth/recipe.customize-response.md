# FeathersJS Auth Recipe: Customizing the Login Response

The Auk release of FeathersJS includes a powerful new [authentication suite](../../api/authentication/server.md) built on top of [PassportJS](http://www.passportjs.org/).  The new plugins are very flexible, allowing you to customize nearly everything.  This flexibility required making some changes.  In this guide, we'll look at the changes to the login response and how you can customize it.

## Changes to the Login Response
The previous version of `feathers-authentication` always returned the same response.  It looked something like this:

```js
{
  token: '<the jwt token>',
  user: {
    id: 1,
    email: 'my@email.com'
  }
}
```

The JWT also contained a payload which held an `id` property representing the user `id`.  We found that this was too restrictive for some of our more technical apps.  For instance, what if you wanted to authenticate a device instead of a user?  Or what if you want to authenticate both a device **and** a user?  The old plugin couldn't handle those situations.  The new one does.  To make it work, we started by simplifying the response.  The default response now looks like this:

```js
{
  accessToken: '<the jwt token>'
}
```

The JWT also contains a payload which has a `userId` property.  

Based on the above, you can see that we still authenticate a `user` by default.  In this case, the `user` is what we call the `entity`.  It's the generic name of what is being authenticated.  It's customizable, but that's not covered in this guide.  Instead, let's focus on what it takes to add the user in the login response.

## Customizing the Login Response
The `/authentication` endpoint is now a Feathers service.  It uses the `create` method for login and the `remove` method for logout.  Just like with all Feathers services, you can customize the response with the [`hook` API](../../api/hooks.md).  For what we want to do, the important part is the `context.result`, which becomes the response body.  We can use an `after` hook to customize the `context.result` to return anything that we want:

```js
app.service('/authentication').hooks({
  after: {
    create: [
      context => {
        context.result.foo = 'bar';
      }
    ]
  }
});
```

After a successful login, the `context.result` already contains the `accessToken`.  The above example modified the response to look like this:

```js
{
  accessToken: '<the jwt token>',
  foo: 'bar'
}
```

## Accessing the User Entity
Let's see how to include the `user` in the response, as was done in previous versions.  The `/authentication` service modifies the `context.params` object to contain the entity object (in this case, the `user`).  With that information, you might have already figured out how to get the user into the response.  It just has to be copied from `context.params.user` to the `context.result.user`:

```js
app.service('/authentication').hooks({
  after: {
    create: [
      context => {
        context.result.user = context.params.user;

        // Don't expose sensitive information.
        delete context.result.user.password;
      }
    ]
  }
});
```

At this point, the response now includes the `accessToken` and the `user`.  Now the client won't have to make an additional request for the `user` data.  *As is shown in the above example, be sure to not expose any sensitive information.*

## Wrapping Up
You've now learned some of the differences in the new `feathers-authentication` plugin.  Instead of using two endpoints, it's using a single service.  It also has a simplified response, compared to before.  Now, you can customize the response to include whatever information you need.
