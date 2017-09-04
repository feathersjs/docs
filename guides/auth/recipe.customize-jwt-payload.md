# FeathersJS Auth Recipe: Customizing the JWT Payload

The Auk release of FeathersJS includes a powerful new [authentication suite](../../api/authentication/server.md) built on top of [PassportJS](http://www.passportjs.org/).  The new plugins are very flexible, allowing you to customize nearly everything.  One feature added in the latest release is the ability to customize the JWT payload using hooks.  Let's take a look at what this means, how to make it work, and learn about the potential pitfalls you may encounter by using it.

## The JWT Payload
If you read the resources on [how JWT works](./how-jwt-works.md), you'll know that a JWT is an encoded string that can contain a payload.  For a quick example, check out the Debugger on [jwt.io](https://jwt.io/).  The purple section on [jwt.io](https://jwt.io/) is the payload.  You'll also notice that you can put arbitrary data in the payload.  The payload data gets encoded as the section section of the JWT string.

The default JWT payload contains the following claims:

```js
const decode = require('jwt-decode')
// Retrieve the token from wherever you've stored it.
const jwt = window.localStorage.getItem('feathers-jwt')
const payload = decode(jwt)

payload === {
  aud: 'https://yourdomain.com', // audience
  exp: 23852348347, // expires at time
  iat: 23852132232, // issued at time
  iss: 'feathers', // issuer
  sub: 'anonymous', // subject
  userId: 1 // the user's id
}
```

Notice that the payload ***is encoded*** and ***IS NOT ENCRYPTED***.  It's an important difference.  It means that you want to be careful what you store in the JWT payload.

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

Now the payload will contain the `test` attribute:

```js
const decode = require('jwt-decode')
// Retrieve the token from wherever you've stored it.
const jwt = window.localStorage.getItem('feathers-jwt')
const payload = decode(jwt)

payload === {
  aud: 'https://yourdomain.com',
  exp: 23852348347,
  iat: 23852132232,
  iss: 'feathers',
  sub: 'anonymous',
  userId: 1
  test: true // Here's the new claim we just added
}
```
> Note: The payload is not automatically decoded and made available in the hooks, thus, requiring you to implement this functionality in your app. Using `jwt-decode` is a simple solution that could be dropped in a hook as needed.

## Important Security Information
As you add data to the JWT payload the token size gets larger.  Try it out on [jwt.io](https://jwt.io/) to see for yourself.   There is an important security issue to keep in mind when customizing the payload.  This issue involves the default `HS256` algorithm used to sign the token.

With `HS256`, there is a relationship between the length of the secret (which must be a minimum of 256-bits) and the length of the encoded token (which varies with the payload).  A larger secret-to-payload ratio (so the secret is larger than the JWT) will result in a more secure JWT.  This also means that keeping the secret size the same and increasing the payload size will actually make your JWT comparatively less secure.

The Feathers generator creates a 2048-bit secret, by default, so there is a small amount of allowable space for putting additional attributes in the JWT payload.  It's very important to keep the secret-to-payload length ratio as high as possible to avoid brute force attacks.  In a brute force attack, the attacker attempts to retrieve the secret by guessing the secret over and over until getting it right.  If your secret is compromised, they will be able to create signed JWT with whatever payload they wish.  In short, be cautious about what you put in your JWT payload.

Finally, remember that the secret created by the generator is meant for development purposes, only.  You never want to check your **production** secret into your version control system (Git, etc.).  It is best to put your production secret in an environment variable and reference it in the app configuration.
