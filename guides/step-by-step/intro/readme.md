# Introduction

We will start with writing snippets of Feathers code by hand.
We'll take a step by step approach, introducing a few new concepts each time.

Each step is backed by a working example in `examples/step/`.
The code samples in the guide are extracts from those examples.
Code snippets may be ambiguous, misleading or confusing.
Working examples reduce these problems,
as well as letting you learn more by modifying them yourself.

One example may continue with changes from a previous example.
In such cases, a recap of the differences between the 2 examples may be shown
to help in understanding the changes.

> **Warning.** The clients in the examples log results to the browser console.
So open the console log before pointing the browser at an example URL.

Feathers has a definite **ah-ha** moment,
that moment when you realize how much it accomplishes and how simply.
We want to get to that moment quickly while fulling understanding what is happening.

We'll develop a solid enough understanding of Feathers basics that,
by the time we get to Feathers' generators,
we'll be mostly interested in how they structure projects rather than in the code they produce.

### Our intended audience

Readers should have reasonable JavaScript experience, some experience with
[Node](https://nodejs.org/en/),
the concept of [HTTP REST](http://rest.elkstein.org/),
and an idea of what [Websockets](https://www.html5rocks.com/en/tutorials/websockets/basics/) are.
Having some experience with [ExpressJS](http://expressjs.com/) is an asset.
We assume everyone has worked with database tables.

This guide should be an comfortable introduction to Feathers for people learning new technologies,
such as those coming from PHP, Ruby or Meteor.

It may be productive for seasoned developers, experienced in Node, REST and websockets,
to skim the text, paying more attention to the code extracts.

They should however make sure to absorb fully the [Generators](../generators/readme.md) section.
That should save them some time compared to putting together
their own understanding of how projects are structured.
