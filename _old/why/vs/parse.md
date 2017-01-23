# Feathers vs. Parse

Like Firebase, Parse is a mobile backend as a service (MBaaS). It was acquired by Facebook in 2013 but recently (Jan. 2016) announced it was shutting down and it open sourced [a Parse API compatible Express server](https://github.com/ParsePlatform/parse-server).

Prior to being open sourced Parse was a hosted service and wasn't available locally. Now that it is open source, like Feathers, it can be hosted anywhere that NodeJS can be run. This is left up to the developer to manage.

Parse supports push notifications. Currently Feathers does not, although a plugin is proposed for this functionality. The Express Parse server expects to work with MongoDB whereas Feathers supports [many more databases](../../databases/readme.md), but some experimental Postgres support has been added on version 2.2.19 .

Parse is a server side technology so it is completely front end agnostic and has integration guides and SDK's for virtually every client platform. Feathers is also client agnostic but currently doesn't have the same number of guides and currently only has an official JavaScript SDK (Pull Requests welcome for new SDK's).

Parse is also a real-time framework. This feature is called [LiveQuery](https://parseplatform.github.io/docs/parse-server/guide/#live-queries). A WebSocket server is open next to the main app.

Regarding authentication, Parse supports email/password but also [OAuth](https://parseplatform.github.io/docs/parse-server/guide/#oauth-and-3rd-party-authentication), with Twitter, Meetup, LinkedIn, Google, Instagram and Facebook out of the box. The client provides the token, acquired using a client lib like [hello.js](https://adodson.com/hello.js/), and parse-server returns a Parse.User .
