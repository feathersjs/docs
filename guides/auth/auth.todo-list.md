# Authentication

[**Add Local Auth to an existing Feathers application**]()<br/>
Learn the general steps that are required to setup OAuth-based login for your application.

[**Migration Guide**]()<br/>
Learn what options are available to upgrade an existing application from `feathers-authentication@0.7.x` to version `1.x`.  *Be sure to mention [feathers-authentication-compatibility](https://github.com/MichaelErmer/feathers-authentication-compatibility)*

[**Understanding the Basics of JSON Web Token (JWT) Security**]()<br/>
Learn what sets Feathers' authentication plugins apart from solutions you may have encountered in the past.  You'll learn  about JSON Web Tokens and the basics of how to use them wisely.

[**JWT Authentication and Server Side Rendering**]()<br/>
Learn how to keep the benefits of JWT authentication while you setup your application for Server Side Rendering (SSR).

### OAuth

[**Setup OAuth Through Client Redirect**]()<br/>
Learn how to setup the default OAuth experience that ships with the new Feathers authentication plugins.  This guide will show you how to upgrade the Feathers Chat application to use Facebook OAuth2 login.

- `feathers generate app`
- `feathers generate authentication`: github
- add cookie config
```json
"cookie": {
  "enabled": true, // whether cookie creation is enabled
  "name": "feathers-jwt", // the cookie name
  "httpOnly": false, // when enabled, prevents the client from reading the cookie.
  "secure": false // whether cookies should only be available over HTTPS
}
```
- 

[**Setup Popup-based OAuth**]()<br/>
Learn how to use popup windows to keep the user's context while authenticating with OAuth.

[**Setup Popup-based, Cross-Domain OAuth**]()<br/>
Learn what's needed to use popup-based OAuth when the web client and server are on different domains.

[**Customize the OAuth Payload**]()<br/>
Learn how to change the user data that you receive back from an OAuth provider.

[**Combining local auth and OAuth data**]()<br/>
Learn how to use hooks to make OAuth data fit your `/users` service validation settings.

