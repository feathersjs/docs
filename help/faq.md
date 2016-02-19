# FAQ

We've been collecting some commonly asked questions here. We'll either be updating the guide directly, providing answers here, or both.

## I heard Express is dying. What about Koa/Hapi/X?

Koa is a *"next generation web framework for Node.JS"* using ES6 generator functions instead of Express middleware. This approach unfortunately does not  play well with current Feathers services. However, we have discussed making Feathers framework agnostic in v3.0, especially considering what is occurring with Express, so we are watching [this issue](https://github.com/strongloop/express/issues/2844) closely.

## Can I expose custom service methods?

Yes and no. You can create custom methods but they won't be exposed over sockets automatically and they won't be mapped to a REST verb (GET, POST, PUT, PATCH, DELETE). See [this section](http://docs.feathersjs.com/clients/readme.html#no-custom-methods) for more detail.

## How do I do nested routes?

Normally we find that they actually aren't needed and that it's much better to keep your routes as flat as possible. However, if the need arises there are a couple different ways. Refer to [this section](http://docs.feathersjs.com/middleware/routing.html#nested-routes) for details.

## How do I filter emitted service events?

See [this section](http://docs.feathersjs.com/real-time/filtering.html).

## How do I access the request object in hooks or services?

In short, you shouldn't need to. If you look at the [hooks chapter](../hooks.readme.md) you'll see all the params that are available on a hook.

If you still need something from the request object (for example, the requesting IP address) you can simply tack it on to the `req.feathers` object [as described here](http://docs.feathersjs.com/middleware/express.html#setting-service-parameters).

## How do I do validation?

If your database/ORM supports a model or schema (ie. Mongoose or Sequelize) then you have 2 options.

#### The preferred way

You perform validation at the service level [using hooks](http://docs.feathersjs.com/hooks/examples.html#validation). This is better because it keeps you database agnostic so you can easily swap databases without having to change your validations much.

If you write a bunch of small hooks that validate specific things it is easier to test and also slightly more performant because you can exit out of the validation chain early instead of having to go all the way to the point of inserting data into the database to find out if that data is invalid.

If you don't have a model or schema then validating with hooks is currently your only option. If you come up with something different feel free to submit a PR!

#### The ORM way

With ORM adapters you can perform validation at the model level:

- [Using Mongoose](http://docs.feathersjs.com/databases/mongoose.html#validation)
- [Using Sequelize](http://docs.sequelizejs.com/en/latest/docs/models-definition/#validations)

The nice thing about the model level validations is Feathers will return the validation errors to the client in a nice consistent format for you.


## How do I return related entities?

Similar to validation, it depends on if your database/ORM supports models or not.

#### The preferred way

For any of the feathers database/ORM adapters you can just use hooks to fetch data from other services [as described here](http://docs.feathersjs.com/hooks/examples.html#fetching-related-items).

This is a better approach because it keeps your application database agnostic and service oriented. By referencing the services (using `app.service().find()`, etc.) you can still decouple your app and have these services live on entirely separate machines or use entirely different databases without having to change any of your fetching code.

#### The ORM way

With mongoose you can use the `$populate` query param to populate nested documents.

```js
// Find Hulk Hogan and include all the messages he sent
app.service('user').find({
  name: 'hulk@hogan.net',
  $populate: ['sentMessages']
});
```

With Sequelize you can do this:

```js
// Find Hulk Hogan and include all the messages he sent
app.service('user').find({
  name: 'hulk@hogan.net',
  sequelize: {
    include: [{
      model: Message,
      where: { sender: Sequelize.col('user.id') }
    }]
  }
});
```


## How do I mount sub apps?

It's pretty much exactly the same as Express. There is an example of how to do this in the [Feathers authentication plugin](https://github.com/feathersjs/feathers-authentication/tree/master/examples).
