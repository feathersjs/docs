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

## How do I do validation?

If your database/ORM supports a model or schema (ie. Mongoose or Sequelize) then you have 2 options:

1. you can perform validation at the model level
    - [Using Mongoose](http://docs.feathersjs.com/databases/mongoose.html#validation)
    - [Using Sequelize](http://docs.sequelizejs.com/en/latest/docs/models-definition/#validations)
2. you do them at the service level [using hooks](http://docs.feathersjs.com/hooks/examples.html#validation).

The nice thing about the model level validations is Feathers will return the validation errors to the client in a nice consistent format for you.

If you don't have a model or schema you're left with option 2 or some other way that we haven't had the need to try yet. If you come up with something different feel free to submit a PR!

## How do I return related entities?

Similar to validation, it depends on if your database/ORM supports models or not.

#### The preferred way

Alternatively for Mongoose, Sequelize or any other adapter you can just use hooks to fetch data from other services [as described here](http://docs.feathersjs.com/hooks/examples.html#fetching-related-items).

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
