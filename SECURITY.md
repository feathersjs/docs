# Feathers Security

We take security very seriously at Feathers. We welcome any peer review of our 100% open source code to ensure nobody's Feathers app is ever compromised or hacked. As a web application developer you are responsible for any security breaches. We do our very best to make sure Feathers is as secure as possible.

## Where should I report security issues?

In order to give the community time to respond and upgrade we strongly urge you report all security issues to us. Send us a PM in [Slack](http://slack.feathersjs.com) or email us at [hello@feathersjs.com](mailto:hello@feathersjs.com) with details and we will respond ASAP. Security issues always take precedence over bug fixes and feature work so we'll work with you to come up with a resolution and plan and document the issue on Github in the appropriate repo.

Issuing releases is typically very quick. Once an issue is resolved it is usually released immediately with the appropriate semantic version.

## Security Considerations

Here are some things that you should be aware of when writing your app to make sure it is secure.

- Escape any HTML and JavaScript to avoid XSS attacks.
- Escape any SQL (typically done by the SQL library) to avoid SQL injection.
- Events are sent by default to any client listening for that event. Lock down any private events that should not be broadcast by adding [filters](http://docs.feathersjs.com/real-time/filtering.html). Feathers authentication does this for all auth services by default.
- JSON Web Tokens (JWT's) are only signed, they are **not** encrypted. Therefore, the payload can be examined on the client. This is by design. **DO NOT** put anything that should be private in the JWT `payload` unless you encrypt it first.
- Don't use a weak `secret` for you token service. The generator creates a strong one for you automatically. No need to change it.
- Use hooks to check security roles to make sure users can only access data they should be permitted to. We've provided some [built in authorization hooks](http://docs.feathersjs.com/authorization/bundled-hooks.html) to make this process easier (many of which are added by default to a generated app).

## Some of the technologies we employ

- Password storage inside `@feathers/authentication-local` uses [bcrypt](https://github.com/dcodeIO/bcrypt.js). We don't store the salts separately since they are included in the bcrypt hashes.
- [JWT](https://jwt.io/) is used instead of cookies to avoid CSRF attacks. We use the `HS512` algorithm by default (HMAC using SHA-512 hash algorithm).
- We run [nsp](https://github.com/nodesecurity/nsp) as part of our CI. This notifies us if we are susceptible to any vulnerabilites that have been reported to the [Node Security Project](https://nodesecurity.io/).


## XSS Attacks

As with any web application **you** need to guard against XSS attacks. Since Feathers persists the JWT in localstorage in the browser, if your app falls victim to a XSS attack your JWT could be used by an attacker to make malicious requests on your behalf. This is far from ideal. Therefore you need to take extra care in preventing XSS attacks. Our stance on this particular attack vector is that if you are susceptible to XSS attacks then a compromised JWT is the least of your worries because keystrokes could be logged and attackers can just steal passwords, credit card numbers, or anything else your users type directly.

For more information see:

- [this issue](https://github.com/feathersjs/authentication/issues/132)
- and [this Auth0 forum thread](https://ask.auth0.com/t/stealing-jwt-from-authenticated-user/352/3).


