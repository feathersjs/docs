# Authentication & Authorization

At some point, you are probably going to put information in your databases that you want to keep private. You'll need to implement `authentication` to verify the identity of your users, and `authorization` to control access to resources.  

There are two common methods of putting server-side authentication into practice: cookie-based and token-based. Cookie-based authentication relies on server-side cookies to remember the user.  Token-based authentication requires an encrypted auth token with each request.