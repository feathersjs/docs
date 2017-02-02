# jQuery chat client

Its now time to use our chat server with a comprehensive client.
Here's an SPA written using jQuery.

### Working example

- Source code: [examples/chat/client/jquery](https://github.com/feathersjs/feathers-guide/tree/master/examples/chat/client/jquery)
- Client code: [public/client.html](https://github.com/feathersjs/feathers-guide/blob/master/examples/chat/client/jquery/public/client.html)
and
[client-app.js](https://github.com/feathersjs/feathers-guide/blob/master/examples/chat/client/jquery/public/client-app.js)
- Start the server: `node ./examples/chat/client/jquery/src`
- Point the browser at: `//localhost:3030/client.html`
- Compare servers with the app on the last page
[Unified](http://htmlpreview.github.io/?https://github.com/feathersjs/feathers-guide/blob/master/examples/chat/_diff/client-jquery-line.html)
|
[Split](http://htmlpreview.github.io/?https://github.com/feathersjs/feathers-guide/blob/master/examples/chat/_diff/client-jquery-side.html)

### The client

This jQuery client uses only Feathers features we have already covered.
Nothing new is introduced.

The client is very straight forward.
There are a huge number of online resources for jQuery if you have any questions
regarding the jQuery code.

### Running the example

Our chat room design obtains user avatars from [Gravatar](http://en.gravatar.com/).
Gravatar allows you to select an image for yourself in one place
that many sites will use.
This includes many WordPress sites, github, stackoverflow and more.

Its easy to create your own avatar and it'll make running this client more interesting.
You can also add local user items in this example
using email addresses which should have existing avatars.
These email addresses are:
- daff@neyeon.com
- e.kryski@gmail.com
- cory.m.smith@gmail.com
- johnsz9999@gmail.com

#### To run this client:

- Start the server with `node ./examples/chat/client/jquery/src`.
- Point a browser tab at `//localhost:3030/client.html`.
    - Switch to Sign Up route.
    - Enter an email and password. Then press `Add user`.
    - On the Sign In route, enter that email and password. Then Press `Sign in`.
    - On the Chat route, type a message and press `Send`.
- On another browser tab, repeat the same process.
- Each tab should be displaying everyone's text messages.

### Is anything wrong, unclear, missing?
[Leave a comment.](https://github.com/feathersjs/feathers-guide/issues/new?title=Comment:Chat-Client-jQuery&body=Comment:Chat-Client-jQuery)
