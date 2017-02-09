# Using Webpack

We've loaded our dependencies using script tags so far.
An SPA should package them, along with our app, into a bundle during a build step,
and load that bundle with a single script tag.

[Webpack](https://webpack.github.io/) is commonly used for such a build step,
and we will be using Webpack 2.

### Working example

- Source code: [examples/chat/client/webpack](https://github.com/feathersjs/feathers-guide/tree/master/examples/chat/client/webpack)
- Client code: [public/client.html](https://github.com/feathersjs/feathers-guide/blob/master/examples/chat/client/webpack/public/client.html)
and
[client/app.js](https://github.com/feathersjs/feathers-guide/blob/master/examples/chat/client/webpack/client/app.js)
- Build the bundle: `cd ./examples/chat/client/webpack && webpack`
- Start the server: `node ./src`
- Point the browser at: `//localhost:3030/client.html`
- Compare the HTML with the app on the last page
[Unified](http://htmlpreview.github.io/?https://github.com/feathersjs/feathers-guide/blob/master/examples/chat/_diff/client-webpack-html-line.html)
|
[Split](http://htmlpreview.github.io/?https://github.com/feathersjs/feathers-guide/blob/master/examples/chat/_diff/client-webpack-html-side.html)
- Compare the client with the app on the last page
[Unified](http://htmlpreview.github.io/?https://github.com/feathersjs/feathers-guide/blob/master/examples/chat/_diff/client-webpack-client-line.html)
|
[Split](http://htmlpreview.github.io/?https://github.com/feathersjs/feathers-guide/blob/master/examples/chat/_diff/client-webpack-client-side.html)
- Compare configuration with the app on the last page
[Unified](http://htmlpreview.github.io/?https://github.com/feathersjs/feathers-guide/blob/master/examples/chat/_diff/client-webpack-line.html)
|
[Split](http://htmlpreview.github.io/?https://github.com/feathersjs/feathers-guide/blob/master/examples/chat/_diff/client-webpack-side.html)

### Our bundle

We moved our dependencies from the script tags (
[Unified](http://htmlpreview.github.io/?https://github.com/feathersjs/feathers-guide/blob/master/examples/chat/_diff/client-webpack-html-line.html)
|
[Split](http://htmlpreview.github.io/?https://github.com/feathersjs/feathers-guide/blob/master/examples/chat/_diff/client-webpack-html-side.html)
) to the app itself (
[Unified](http://htmlpreview.github.io/?https://github.com/feathersjs/feathers-guide/blob/master/examples/chat/_diff/client-webpack-client-line.html)
|
[Split](http://htmlpreview.github.io/?https://github.com/feathersjs/feathers-guide/blob/master/examples/chat/_diff/client-webpack-client-side.html)
).

We added a
[Webpack configuration file](https://github.com/feathersjs/feathers-guide/blob/master/examples/chat/client/webpack/webpack.config.js)
along with its dependencies and a build script (
[Unified](http://htmlpreview.github.io/?https://github.com/feathersjs/feathers-guide/blob/master/examples/chat/_diff/client-webpack-package-line.html)
|
[Split](http://htmlpreview.github.io/?https://github.com/feathersjs/feathers-guide/blob/master/examples/chat/_diff/client-webpack-package-side.html)
).

Our Webpack configuration is well explained in
[an introductory article.](https://blog.madewithenvy.com/getting-started-with-webpack-2-ed2b86c68783#.8ica6x1m8).
Its important to remember we are using Webpack 2, not the original Webpack.

### Install dependencies

We have to run Webpack locally, so we have to install our local dependencies.

```text
cd ./examples/chat/client/webpack
npm install
```

### Running the example

- Move to the local directory: `cd ./examples/chat/client/webpack`.
- Build the bundle and start the server with `npm run build`.
- Point a browser tab at `//localhost:3030/client.html`.
    - Switch to Sign Up route.
    - Enter an email and password. Then press `Add user`.
    - On the Sign In route, enter that email and password. Then Press `Sign in`.
    - On the Chat route, type a message and press `Send`.
- On another browser tab, repeat the same process.
- Each tab should be displaying everyone's text messages.

### Is anything wrong, unclear, missing?
[Leave a comment.](https://github.com/feathersjs/feathers-guide/issues/new?title=Comment:Chat-Client-jQuery&body=Comment:Chat-Client-jQuery)
