# Quick Start

[![Intro to FeathersJS](http://i.imgur.com/MhYLgxb.png)](https://www.youtube.com/watch?v=CuM4vLkBaik "Intro to FeathersJS")

> Mad ♥️ to [Chris Pena](https://twitter.com/dev_coffee) for putting together the video.


[![Comprehensive Guide to FeathersJS with React](http://i.imgur.com/entWb29.jpg)](https://www.youtube.com/playlist?list=PLN3n1USn4xlnulnnBGD2RMid_p7xVj9xU "Fullstack Feathersjs and React Web App")

> Mad ♥️ to [Ben Awad](https://www.youtube.com/channel/UC-8QAzbLcRglXeN_MY9blyw) for putting together an entire video series.


With [NodeJS](https://nodejs.org) installed, you can quickly scaffold your first REST and real-time API by following these few steps.

> **ProTip:** Make sure you have [set up your development environment](./setting-up.md) properly. We recommend node v5.x+.

1. Install the Feathers CLI.

    ```
    $ npm install -g feathers-cli
    ```

2. Create a directory for your new app.

    ```
    $ mkdir feathers-chat
    $ cd feathers-chat/
    ```

3. Generate the app and confirm all the prompts with the default by pressing enter:

    ```
    $ feathers generate
    ```

4. Generate a new service. When asked `What do you want to call your service?`, type `message` and confirm the other prompts with the default:

    ```
    $ feathers generate service
    ```

To exit the feathers command shell, press `CTRL+C`, twice.

5. Start your brand new app! :boom:

    ```
    $ npm start
    ```

6. Go to [localhost:3030](http://localhost:3030) to see the homepage. The message [CRUD](https://en.wikipedia.org/wiki/Create,_read,_update_and_delete) service is available at [localhost:3030/messages](http://localhost:3030/messages)

7. Create a new message on the [localhost:3030/messages](http://localhost:3030/messages) endpoint. This can be done by sending a POST request with a REST client like [Postman](https://chrome.google.com/webstore/detail/postman/fhbjgbiflinjbdggehcddcbncdddomop?hl=en) or via CURL like this:

    ```
    $ curl 'http://localhost:3030/messages/' -H 'Content-Type: application/json' --data-binary '{ "text": "Hello Feathers!" }'
    ```

[![Run in Postman](https://run.pstmn.io/button.png)](https://www.getpostman.com/run-collection/39470d10b78a47070620)

## What's next?

In just a couple minutes we created a real-time API that is accessible via REST and websockets! We now have a database backed API that already provides CORS, authentication, pagination, logging, error handling and a few other goodies.

This is a great start! Let's take this a bit further and [build our first real application](readme.md).

> **ProTip:** If you chose a different database than the default [NeDB](https://github.com/louischatriot/nedb) you will have to start the database server and make sure the connection can be established.
