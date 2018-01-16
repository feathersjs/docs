# FeathersJS Auth Recipe: Set up Basic OAuth Login

The Auk release of FeathersJS includes a powerful new [authentication suite](../../api/authentication/server.md) built on top of [PassportJS](http://www.passportjs.org/).  This now gives the Feathers community access to hundreds of authentication strategies from the Passport community.  Since many of the Passport strategies are for OAuth, we've created two auth plugins, [`feathers-authentication-oauth1`](../../api/authentication/oauth1.md) and [`feathers-authentication-oauth2`](../../api/authentication/oauth2.md).  These new plugins use a Passport strategy to allow OAuth logins into your app.

Adding OAuth authentication to your app is a great way to quickly allow users to login.  It allows the user to use an existing Internet account with another service to login to your app.  Among lots of good reasons, it often eliminates the need for the email address verification dance.  This is even more likely for very common OAuth providers, like GitHub, Google, and Facebook.

Simplified login is almost always a good idea, but for many developers implementing OAuth can be difficult.  Let's take a look at how it works, in general.  After that, we'll see how the new [`feathers-authentication`](../../api/authentication/server.md) server plugin makes it easy to get up and running.

## How OAuth Works

There are a couple of different methods you can use to implement OAuth. Here are the basic steps of the flow that the `feathers-authentication-oauth1` and `feathers-authentication-oauth2` plugins use.

1. You register your application with the OAuth Provider.  This includes giving the provider a callback URL (more on this later). The provider will give you an app identifier and an app secret.  The secret is basically a special password for your app.
1. You direct the user's browser to the OAuth provider's site, providing the app identifier in the query string.
1. The content provider uses the app identifier to retrieve information about your app.  That information is then presented to the user with a login form.  The user can grant or deny access to your application.
1. Upon making a decision, the provider redirects the user's browser to the callback URL you setup in the first step. It includes a short-lived authorization code in the querystring.
1. Your server sends a request to the OAuth provider's server.  It includes the authorization code and the secret.  If the authorization code and secret are valid, the provider returns an OAuth access token to your server.  Some user data can also be sent.
1. Your server can save the user information into the `/users` table.  It can also use this access token to make requests to the provider's API.  This same information can also be sent to the browser for use.
1. With Feathers, there is an additional step.  After logging in, a JWT access token is stored in a cookie and sent to the browser.  The client uses the JWT to authenticate with the server on subsequent requests.


## Implementing OAuth with Feathers

The Feathers CLI allows you to easily setup a new application with OAuth.  Here are the steps to generate an application:

1. `npm install -g @feathersjs/cli`<br/>
1. `mkdir feathers-demo-oauth; cd feathers-demo-oauth`<br/>
 or a folder name you prefer.
1. `feathers generate app`<br/>
use the default prompts.
1. `feathers generate authentication`
   - Select `Facebook`, `GitHub`, or `Google` when prompted for a provider.<br/>
   **This guide will show how to use GitHub.**
   - Select the defaults for the remaining prompts.

## Setting up the OAuth Provider 

To setup the provider, you use each provider's website.  Here are links to common providers:

- [Facebook](https://developers.facebook.com/docs/apps/register)
- [GitHub](https://github.com/settings/developers)
- [Google](https://developers.google.com/identity/protocols/OAuth2)

Once your app is setup, the OAuth provider will give you a `Client ID` and `Client Secret`.

## Configuring Your Application
Once you have your app's `Client ID` and `Client Secret`, it's time to setup the app to communicate with the provider.  Open the `default.json` configuration file.  The generator added a key to the config for the provider you selected.  The below configuration example has a `github` config.  Copy over and replace the placeholders with the `clientID` and `clientSecret`.

**config/default.json**
```json
{
  "host": "localhost",
  "port": 3030,
  "public": "../public/",
  "paginate": {
    "default": 10,
    "max": 50
  },
  "authentication": {
    "secret": "cc71e4f97a80c878491197399aabf74e9c0b115c9f8071e75b306c99c891a54b7171852f8c5508e1fe4dcfaedbb603178b0935261928592e487e628f2f669f3a752f2beb3661b29d521b36c8a39e1be6823c0362df5ef1e212d7f2daae789df1065293b98ec9b43309ffe24dba3a2ec2362c5ce5c9155c6438ec380bc7c56d6a169988c0f6754077c5129e8a0ee5fd85b2182d87f84312387e1bbefebe49ad1bf2dcf783e7d8cbee40272b141358b8e23150eee5ea8fc04b2a0f3d824e7fa9d46c025c619c3281af91b7a19fd760bccedae379b735c85024b25a9c91749935b2f29d5b69b2c1ff29368b4aa9cf426d9960302e5e7b903d53e18ccbe2325cf3b6",
    "strategies": [
      "jwt"
    ],
    "path": "/authentication",
    "service": "users",
    "jwt": {
      "header": {
        "typ": "access"
      },
      "audience": "https://yourdomain.com",
      "subject": "anonymous",
      "issuer": "feathers",
      "algorithm": "HS256",
      "expiresIn": "1d"
    },
    "github": {
      "clientID": "your github client id", // Replace this with your app's Client ID
      "clientSecret": "your github client secret", // Replace this with your app's Client Secret
      "successRedirect": "/"
    },
    "cookie": {
      "enabled": true,
      "name": "feathers-jwt",
      "httpOnly": false,
      "secure": false
    }
  },
  "nedb": "../data"
}
```

## Test Login with OAuth
Your app is ready for OAuth logins.  We've made it that simple!  Let's try it out.  Open the file `public/index.html` and scroll to the bottom.  Add the following code just under the `h2`:

```html
<p class="center-text"><br/>
  <a href="/auth/github">Login With GitHub</a>
</p>
```

Now add the following code to the same page.  The first script tag loads Feathers Client from a CDN.  The second script loads Socket.io.  The third script creates a Feathers Client instance and attempts to authenticate with the JWT strategy upon page load.  The authentication client plugin has been configured with a `cookie` value of `feathers-jwt`.

> Note: This code loads the `feathers-client` package from a CDN.  This is **not** the recommended usage for most apps, but is good for demonstration purposes.  We recommend using a bundler as described in the [Feathers Client API docs](../../api/client.md).

```html
<script src="//unpkg.com/feathers-client@2.0.0/dist/feathers.js"></script>
<script src="//unpkg.com/socket.io-client@1.7.3/dist/socket.io.js"></script>
<script>
  // Socket.io is exposed as the `io` global.
  var socket = io('http://localhost:3030', {transports: ['websocket']});
  // feathers-client is exposed as the `feathers` global.
  var feathersClient = feathers()
    .configure(feathers.hooks())
    .configure(feathers.socketio(socket))
    .configure(feathers.authentication({
      cookie: 'feathers-jwt'
    }));

  feathersClient.authenticate()
    .then(response => {
      console.info('Feathers Client has Authenticated with the JWT access token!');
      console.log(response);
    })
    .catch(error => {
      console.info('We have not logged in with OAuth, yet.  This means there\'s no cookie storing the accessToken.  As a result, feathersClient.authenticate() failed.');
      console.log(error);
    });
</script>
```

Now, run the server, open `http://localhost:3030`.  Before you click the "Login with GitHub" link, open the console.  If you refresh you'll see the message in the catch block.  Since we haven't logged in, yet, we don't have a stored JWT access token.  Now, click the `Login with GitHub` button.  Assuming you haven't logged in to Github with this application, before, you'll see a GitHub login page.  Once you login to GitHub, you'll be redirected back to `http://localhost:3030`.  Now, if you look at your console, you should see a success message.

What just happened?  When you clicked on that link, it opened the `/auth/github` link, which is just a shortcut for redirecting to GitHub with your `Client ID`.  The entire OAuth process that we described earlier took place.  The browser received a `feathers-jwt` cookie from the server.  Finally the script that we added in the last step used the `feathers-authentication-client` to authenticate using the JWT returned from the server.  There were a lot of steps that happened in a very short time.  The best news is that you're authenticated with OAuth.

## Wrapping Up
You've now seen how OAuth login is greatly simplified with the new Feathers Authentication plugins.  Having plugins built on top of PassportJS allows for a lot of flexibility.  You can now build nearly any authentication experience imaginable.  In the final part of this guide, you were able to authenticate the Feathers client.  Hopefully this will get you started integrating OAuth into your application.
