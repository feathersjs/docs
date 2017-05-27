# FeathersJS Auth Recipe: Customizing the JWT Payload

The Auk release of FeathersJS includes a powerful new [authentication suite](../../api/authentication/server.md) built on top of [PassportJS](http://www.passportjs.org/).  The new plugins are very flexible, allowing you to customize nearly everything.  One feature added in the latest release is the ability to customize the JWT payload using hooks.  Let's take a look at what this means, how to make it work, and learn about the potential pitfalls you may encounter by using it.

## The JWT Payload
If you read the resources on [how JWT works](./how-jwt-works.md), you'll know that a JWT is an encoded string that can contain a payload.  For a quick example, check out the Debugger on [jwt.io](https://jwt.io/).  The purple section on [jwt.io](https://jwt.io/) is the payload.  You'll also notice that you can put arbitrary data in the payload.  The payload data gets encoded as the section section of the JWT string.

## Customizing the Payload with Hooks
The authentication services uses the `params.payload` object in the hook context for the JWT payload.  This means you can customize the JWT by adding a before hook after the `authenticate` hook.

```js
app.service('authentication').hooks({
  before: {
    create: [
      authentication.hooks.authenticate(config.strategies),

      // This hook adds the `test` attribute to the JWT payload by
      // modifying params.payload.
      hook => {
        // make sure params.payload exists
        hook.params.payload = hook.params.payload || {}
        // merge in a `test` property
        Object.assign(hook.params.payload, {test: 'test'})
      }
    ],
    remove: [
      authentication.hooks.authenticate('jwt')
    ]
  }
})
```

## Important Security Information
Back on [jwt.io](https://jwt.io/), as you add data to the JWT payload the token size gets larger.  There is an important security issue to keep in mind when customizing the payload.  This issue involves the `HS256` algorithm that `feathers-authentication` uses, by default.

With `HS256`, there is a level-of-security relationship between the length of the key (which must be a minimum of 256-bits) and the length of the encoded payload.  A larger secret-to-payload ratio will result in a more secure JWT.  This also means that keeping the secret size the same and increasing the payload size will actually make your JWT less secure.

The Feathers generator creates a 2048-bit secret, by default, so there is a small amount of allowable space for putting additional attributes in the JWT payload.  It's very important to keep the secret-to-payload length ratio as high as possible to avoid brute force attacks.  Brute force attacks attempt to retrieve the secret by guessing the secret over and over until getting it right.  If an attacker guesses your secret, they will be able to create signed JWT with whatever payload they wish.

Remember that the secret created by the generator is meant for development purposes, only.  You never want to check your secret into your version control system (Git, etc.).  It is best to put your secret in an environment variable and reference it in the app configuration.