# Chat clients

We wrote a chat client in the previous section that was sufficient to test the chat server.
We now want to write clients which do what we expect of chat room clients.

Communicating with the server is not the only thing a client does.
Many frameworks are available to help with the remaining tasks,
such as React, Angular, Vue and so on.

> How do we integrate the Feathers client with such frameworks?

So the question arises:
what are the best practices for integrating Feathers with each of them?
This question is what the following sections will address.

First we will write a client using jQuery.
That's a framework which is easy to understand as it contains little cognitive overhead.
Also, many people are familiar with it.

We will then look at chat clients written using several different frameworks.
These clients were written for a
[slightly different Feathers server](https://docs.feathersjs.com/getting-started/readme.html),
but they clearly indicate have to integrate Feathers with different frameworks.

Finally we will move beyound local email, password authentication by
converting our jQuery client to use oAuth.

> **Feathers authentication.** Feathers has very powerful authentication capabilities
which we cover in later chapters.
This oAuth example is a teaser in the meantime.

### Is anything wrong, unclear, missing?
[Leave a comment.](https://github.com/feathersjs/feathers-guide/issues/new?title=Comment:Chat-Client-Readme&body=Comment:Chat-Client-Readme)
