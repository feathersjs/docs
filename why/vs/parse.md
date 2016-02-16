# Feathers vs. Parse

Like Firebase, Parse is a mobile backend as a service (MBaaS). It was acquired by Facebook in 2013 but recently (Jan. 2016) announced it was shutting down and it open sourced a Parse API compatible Express server.

Prior to being open sourced Parse was a hosted service and wasn't available locally. Now that it is open source, like Feathers, it can be hosted anywhere that NodeJS can be run. This is left up to the developer to manage.

Parse supports push notifications. Currently Feathers does not, although a plugin is proposed for this functionality. The Express Parse server expects to work with MongoDB whereas Feathers supports [many more databases](../../databases/readme.md).

Parse is a server side technology so it is completely front end agnostic and has integration guides and SDK's for virtually every client platform. Feathers is also client agnostic but currently doesn't have the same number of guides and currently only has an official JavaScript SDK (Pull Requests welcome for new SDK's).

Parse is not a real-time framework. Although they provided a push notification service, user authentication, and analytics the only way to support real-time without polling (ie. websockets) is to use a third party service. Feathers, on the other hand supports real-time and user authentication but currently leaves analytics and push notifications up to the developer.

Regarding authentication, Parse supports email and password and facebook authentication whereas Feathers supports both those, token authentication and any other OAuth provider.