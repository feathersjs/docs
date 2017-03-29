# Is Feathers production ready?

##### by David Luecke, Dec. 22, 2016

Production ready has always been a loaded question to me but I will try to answer it
based on “Who is using it?” and this
[Stackexchange definition of “production ready”](http://softwareengineering.stackexchange.com/questions/61726/define-production-ready).

### Who is using it?

The best measure for production ready usually is if someone is actually using it in production.
Here are some interesting companies that are using Feathers:

- [BestBuy (API playground)](https://github.com/BestBuy/api-playground)
- [Simpla](https://www.simpla.io/)
- [Haulhound](https://haulhound.com/)
- [Headstart](http://www.headstartapp.com/)
- [Gratify](https://gratifyhq.com/)
- [Shakepay](https://shakepay.co/#/)

There are also at least two other Fortune 100 companies we know of
that unfortunately prefer not to be on the list.

### Programmer's definition of "production-ready":

- it runs

An interesting thing that happened during the 2.0 release earlier this year was that
a surprising amount of people mentioned they have been using Feathers successfully in production
already - some of them for several years - and we never knew about it.
I’d consider it a good sign that it “just works” and is not in the way.

- it satisfies the project requirements

This is where you have to do your due diligence for your project.
Do you want to host it yourself and be able to fully customize the server side application logic
or is a pre-canned hosted service like Firebase an option?
Feathers is more of a connectivity layer to provide REST and real-time APIs between any database
and any client.
This gives a lot of flexibility but you will have to decide on your own frontend
and database/ORM setup.
If you are looking for a one-stop real-time webapp solution
and don’t mind some lock-in then Meteor might be better suited.

- its design was well thought out

The whole project started as my final thesis paper in university in 2010.
The goal was to research and implement a (Java) prototype of an abstraction layer
for RPC calls including REST HTTP. You can read the paper
[here (in German)](https://github.com/daffl/bsc.tex)
and more about the history of Feathers here.
The concept of protocol independent CRUD services and hooks (middleware) for cross cutting concerns
might seem trivial but is based on a combination of established development practises
(AOP, service layer, REST architectural constraints) and 10+ years of experience using APIs
and creating web applications for some of the largest companies in the world.

It is always great to see it “click” when someone gets how it all fits together to make creating and consuming APIs easier.

- it's stable

The core API has been stable since 2013 with the 1.0 release in October 2014 and only
[minor breaking changes](https://docs.feathersjs.com/guides/migrating.html)
for 2.0 in April 2016.
v3 (probably landing in the first half of next year) will introduce some similar breaking changes
to improve performance and security and remove the hard dependency on Express.
There also may be breaking changes in plugins you are using - especially in 0.x releases -
but we try to always document why and how to migrate.

it's maintainable

A pet peeve of mine are frameworks that make things “seem” easy by generating thousands of lines of code for you
and in the process making it almost impossible to implement anything not supported out of the box by their generators.
There are generators for Feathers (that are sometimes taken too seriously,
probably because of the aforementioned experiences with other frameworks)
but a complete database backed CRUD REST and websocket API takes only 30 lines of code to write from scratch.

Less code means less things that can break and that applies to Feathers code itself as well.
Core weighs in at only ~300 LOC and is thoroughly tested.
We also try to keep every plugin just as small and focussed on its task.
With lots of open source experience in the team it was also possible to streamline the release and
maintenance process so that most non-breaking bugfixes are usually released within 24 hours.

- it's scalable

Since Feathers is built on
[Express](http://expressjs.com/) and 
[Socket.IO](http://socket.io/) - probably two of the most battle tested NodeJS libraries -
anything that applies to scaling those also applies to Feathers as well.
Layering the service oriented approach on top also makes it easier to break up your application
into individual parts should the need arise.

You also have the option to use other more performant websocket libraries like µWS and, coming up in v3, other server frameworks like Koa.

- it's documented

There are always opportunities to improve
[documentation](https://docs.feathersjs.com/)
and we are constantly working on it but the feedback so far has been generally good
and even when it was less positive, it was always constructive and gave good pointers on what to improve on.

@daffl

### Is anything wrong, unclear, missing?
[Leave a comment.](https://github.com/feathersjs/feathers-guide/issues/new?title=Comment:Step-Production-ready&body=Comment:Step-Production-ready)

