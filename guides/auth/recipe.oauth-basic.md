# FeathersJS Auth Recipe: Set up Basic OAuth Login

Adding OAuth authentication to your app is a great way to quickly allow users to login.  It allows the user to use an existing Internet account with another service to login to your app.  Among lots of good reasons, it often eliminates the need to for the email address verification dance.  This is even more likely for very common OAuth providers, like GitHub, Google, and Facebook.

Simplified login is almost always a good idea, but for many developers implementing OAuth can be difficult.  Let's take a look at how it works, in general.  After that, we'll see how the new [`feathers-authentication`](../../api/authentication/server.md) server plugin makes it easy to get up and running.

## How OAuth Works

There are a couple of different methods you can use to implement OAuth. Here are the basic steps of the flow that the `feathers-authentication-oauth1` and `feathers-authentication-oauth2` plugins use.

1. You register your application with the OAuth Provider.  This includes giving the provider a callback URL (more on this later). The provider will give you an app identifier and an app secret.  The secret is basically a special password for your app.
1. You direct the user's browser to the OAuth provider's site, providing the app identifier in the query string.
1. The content provider uses the app identifier to retrieve information about your app.  That information is then presented to the user with a login form.  The user can grant or deny access to your application.
1. Upon making a decision, the provider redirects the user's browser to the callback URL you setup in the first step. It includes a short-lived authorization code in the querystring.
1. Your server sends a request to the OAuth provider's server.  It includes the authorization code and the secret.  If the authorization code and secret are valid, the provider returns an OAuth access token to your server.  Some user data can also be sent.
1. Your server can save the user information into the `/users` table.  It can also use this access token to make requests to the provider's API.  This same information can also be sent to the browser for use, there.


## Implementing OAuth with Feathers

The [`Feathers-cli`](https://github.com/feathersjs/feathers-cli) allows you to easily setup a new application with OAuth.  Here are the steps to generate an application:

1. `npm install -g feathers-cli@pre `<br/>
or <br/>
`yarn global feathers-cli@pre`
1. `mkdir feathers-demo-oauth; cd feathers-demo-oauth`<br/>
 or a folder name you prefer.
1. `feathers generate app`<br/>
use the default prompts.
1. `feathers generate authentication`
   - Select `Facebook`, `GitHub`, or `Google` when prompted for a provider.
   - Select the defaults for the remaining prompts.

## Setting up the OAuth Provider 

To setup the provider, you must use each provider's website.  Here are links to common providers:

- [Facebook](https://developers.facebook.com/docs/apps/register)
- [GitHub](https://github.com/settings/developers)
- [Google](https://developers.google.com/identity/protocols/OAuth2)

## Wrapping Up

