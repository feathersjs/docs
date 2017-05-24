# FeathersJS Auth Recipe: Customizing the JWT Payload

The Auk release of FeathersJS includes a powerful new [authentication suite](../../api/authentication/server.md) built on top of [PassportJS](http://www.passportjs.org/).  The new plugins are very flexible, allowing you to customize nearly everything.  One feature added in the latest release is the ability to customize the JWT payload using hooks.  Let's take a look at what this means, how to make it work, and learn about the potential pitfalls you may encounter by using it.

## The JWT Payload
If you read the resources on [how JWT works](./how-jwt-works.md), you'll know that a JWT is an encoded string that can contain a payload.  For a quick example, check out the Debugger on [jwt.io](https://jwt.io/).  The purple section, there, is the payload.  You also notice that you can put arbitrary data in the payload.  The payload data gets encoded and becomes the middle section of the JWT string.

## Customizing the Payload with Hooks


## Important Security Implications
Back on [jwt.io](https://jwt.io/), you might notice that as you add data to the JWT payload, the token size gets larger.  There is an important security issue to keep in mind when customizing the payload.  This issue only involves the `HS256` algorithm that `feathers-authentication` uses, by default.