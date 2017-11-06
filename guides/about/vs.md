# Feathers vs X

The following sections compare Feathers to other software choices that seem similar or may overlap with the use cases of Feathers.

Due to the bias of these comparisons being on the Feathers website, we attempt to only use facts. Below you can find a feature comparison table and in each section you can get more detailed comparisons.

If you find something invalid or out of date in the comparisons, please [create an issue](https://github.com/feathersjs/feathers-docs/issues/new) (or better yet, a [pull request](https://github.com/feathersjs/feathers-docs/compare)) and we'll address it as soon as possible.

## Feature Comparison

> Due to the fact that ease of implementation is subjective and primarily related to a developer's skill-set and experience we only consider a feature supported if it is officially supported by the framework or platform, regardless of how easy it is to implement (aka. are there official plugins, guides or SDKs?).

<!-- -->

#### Legend

 :white_check_mark: : Officially supported with a guide or core module

 :x: : Not supported

 :revolving_hearts: : Community supported or left to developer

<table>
    <thead>
        <tr>
            <th><strong>Feature</strong></th>
            <th><strong>Feathers</strong></th>
            <th><strong>Express</strong></th>
            <th><strong>Meteor</strong></th>
            <th><strong>Sails</strong></th>
            <th><strong>Firebase</strong></th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td><strong>REST API</strong></td>
            <td> :white_check_mark: </td>
            <td> :white_check_mark: </td>
            <td> :white_check_mark: </td>
            <td> :white_check_mark: </td>
            <td> :white_check_mark: </td>
        </tr>
        <tr>
            <td><strong>Real Time From Server</strong></td>
            <td> :white_check_mark: </td>
            <td> :x:   :revolving_hearts: </td>
            <td> :white_check_mark: </td>
            <td> :white_check_mark: </td>
            <td> :white_check_mark: </td>
        </tr>
        <tr>
            <td><strong>Real Time From Client</strong></td>
            <td> :white_check_mark: </td>
            <td> :x:    :revolving_hearts: </td>
            <td> :white_check_mark:  (DDP)</td>
            <td> :x:    :revolving_hearts: </td>
            <td> :white_check_mark: </td>
        </tr>
        <tr>
            <td><strong>Universal JavaScript</strong></td>
            <td> :white_check_mark: </td>
            <td> :x: </td>
            <td> :white_check_mark:  (sort of)</td>
            <td> :x: </td>
            <td> :x: </td>
        </tr>
        <tr>
            <td><strong>React Native Support</strong></td>
            <td> :white_check_mark: </td>
            <td> :x: </td>
            <td> :x:    :revolving_hearts: </td>
            <td> :x: </td>
            <td> :x: </td>
        </tr>
        <tr>
            <td><strong>Client Agnostic</strong></td>
            <td> :white_check_mark: </td>
            <td> :white_check_mark: </td>
            <td> :x:    :revolving_hearts: </td>
            <td> :white_check_mark: </td>
            <td> :white_check_mark:    :revolving_hearts:  (SDKs)</td>
        </tr>
        <tr>
            <td><strong>Email/Password Auth</strong></td>
            <td> :white_check_mark: </td>
            <td> :x:    :revolving_hearts: </td>
            <td> :white_check_mark: </td>
            <td> :x:    :revolving_hearts: </td>
            <td> :white_check_mark: </td>
        </tr>
        <tr>
            <td><strong>Token Auth</strong></td>
            <td> :white_check_mark: </td>
            <td> :x:    :revolving_hearts: </td>
            <td> :white_check_mark: </td>
            <td> :x:    :revolving_hearts: </td>
            <td> :white_check_mark: </td>
        </tr>
        <tr>
            <td><strong>OAuth</strong></td>
            <td> :white_check_mark: </td>
            <td> :x:    :revolving_hearts: </td>
            <td> :white_check_mark: </td>
            <td> :x:    :revolving_hearts: </td>
            <td> :white_check_mark: </td>
        </tr>
        <tr>
            <td><strong>Self Hosted</strong></td>
            <td> :white_check_mark: </td>
            <td> :white_check_mark: </td>
            <td> :white_check_mark: </td>
            <td> :white_check_mark: </td>
            <td> :x: </td>
        </tr>
        <tr>
            <td><strong>Hosting Support</strong></td>
            <td> :x: </td>
            <td> :x: </td>
            <td> :white_check_mark: </td>
            <td> :x: </td>
            <td> :white_check_mark: </td>
        </tr>
        <tr>
            <td><strong>Pagination</strong></td>
            <td> :white_check_mark: </td>
            <td> :x:    :revolving_hearts: </td>
            <td> :x:    :revolving_hearts: </td>
            <td> :white_check_mark: </td>
            <td> :white_check_mark: </td>
        </tr>
        <tr>
            <td><strong>Databases</strong></td>
            <td>10+ databases. Multiple ORMs</td>
            <td> :x:    :revolving_hearts: </td>
            <td>MongoDB</td>
            <td>10+ databases. 1 ORM</td>
            <td>Unknown</td>
        </tr>
        <tr>
            <td><strong>Analytics</strong></td>
            <td> :x:    :revolving_hearts: </td>
            <td> :x:    :revolving_hearts: </td>
            <td> :x:    :revolving_hearts: </td>
            <td> :x:    :revolving_hearts: </td>
            <td> :white_check_mark: </td>
        </tr>
        <tr>
            <td><strong>Admin Dashboard</strong></td>
            <td> :x:    :revolving_hearts: </td>
            <td> :x:    :revolving_hearts: </td>
            <td> :x:    :revolving_hearts: </td>
            <td> :x:    :revolving_hearts: </td>
            <td> :white_check_mark: </td>
        </tr>
        <tr>
            <td><strong>Push Notifications</strong></td>
            <td> :x:    :revolving_hearts: </td>
            <td> :x:    :revolving_hearts: </td>
            <td> :x:    :revolving_hearts: </td>
            <td> :x:    :revolving_hearts: </td>
            <td> :x: </td>
        </tr>
        <tr>
            <td><strong>Offline Mode</strong></td>
            <td> :x:    :revolving_hearts: </td>
            <td> :x:    :revolving_hearts: </td>
            <td> :white_check_mark: </td>
            <td> :x:    :revolving_hearts: </td>
            <td> :white_check_mark: </td>
        </tr>
        <tr>
            <td><strong>Hot Code Push</strong></td>
            <td> :x:    :revolving_hearts: </td>
            <td> :x:    :revolving_hearts: </td>
            <td> :white_check_mark: </td>
            <td> :x:    :revolving_hearts: </td>
            <td> :x: </td>
        </tr>
    </tbody>
</table>

## Feathers vs Firebase

Firebase is a hosted platform for mobile or web applications. Just like Feathers, Firebase provides REST and real-time APIs but also includes CDN support. Feathers on the other hand leaves setting up a CDN and hosting your Feathers app up to the developer.

Firebase is a closed-source, paid hosted service starting at 5$/month with the next plan level starting at 49$/month. Feathers is open source and can run on any hosting platform like Heroku, Modulus or on your own servers like Amazon AWS, Microsoft Azure, Digital Ocean and your local machine. Because Firebase can't be run locally you typically need to pay for both a shared development environment on top of any production and testing environment.

Firebase has JavaScript and mobile clients and also provides framework specific bindings. Feathers currently focuses on universal usage in JavaScript environments and does not have any framework specific bindings. Mobile applications can use Feathers REST and websocket endpoints directly but at the moment there are no Feathers specific iOS and Android SDKs.

Firebase currently supports offline mode whereas that is currently left up to the developer with Feathers. We do however have [a proposal](https://github.com/feathersjs/feathers-client/issues/29) for this feature.

Both Firebase and Feathers support email/password, token, and OAuth authentication. Firebase has not publicly disclosed the database technology they use to store your data behind their API but it seems to be an SQL variant. Feathers supports [multiple databases](../../api/databases/common.md), NoSQL and SQL alike.

For more technical details on the difference and how to potentially migrate an application you can read [how to use Feathers as an open source alternative to Firebase](https://medium.com/all-about-feathersjs/using-feathersjs-as-an-open-source-alternative-to-firebase-b5d93c200cee#.olu25brld).


## Feathers vs Meteor

Both Feathers and Meteor are open source real-time JavaScript platforms that provide front end and back end support. They both allow clients to send and receive messages over websockets. Feathers lets you choose which real-time transport(s) you want to use via [socket.io](../../api/socketio.md) or [Primus](../../api/primus.md), while Meteor relies on SockJS.

Feathers is community supported, whereas Meteor is venture backed and has raised 31.2 million dollars to date.

Meteor only has official support for MongoDB but there are some community modules of various levels of quality that support other databases. Meteor has it's own package manager and package ecosystem. They have their own template engine called Blaze which is based off of Mustache along with their own build system, but also have guides for Angular and React.

Feathers has official support for [many more databases](../../api/databases/common.md) and supports any front-end framework or view engine that you want by working seamlessly [on the client](../../api/client.md).

Feathers uses the defacto JavaScript package manager [npm](http://npmjs.org). As a result you can utilize the hundreds of thousands of modules published to npm. Feathers lets you decide whether you want to use Gulp, Grunt, Browserify, Webpack or any other build tool.

Meteor has optimistic UI rendering and oplog tailing whereas currently Feathers leaves that up to the developer. However, we've found that being universal and utilizing websockets for both sending and receiving data alleviates the need for optimistic UI rendering and complex data diffing in most cases.

Both Meteor and Feathers provide support for email/password and OAuth authentication. Once authenticated Meteor uses sessions to maintain a logged in state, whereas Feathers keeps things stateless and uses [JSON Web Tokens](https://jwt.io/) (JWT) to assess authentication state.

One big distinction is how Feathers and Meteor provide real-time across a cluster of apps. Feathers does it at the service layer or using another pub-sub service like Redis whereas Meteor relies on having access to and monitoring MongoDB operation logs as the central hub for real-time communication.

## Feathers vs Sails

From a feature standpoint, Feathers and Sails are probably the most similar of the comparisons offered here. Both provide real-time REST API's, multiple DB support, and are client-agnostic. Sails is bound to the server whereas Feathers can also be used in the browser and in React Native apps. Both frameworks use Express, with Feathers supporting the latest Express 4, while Sails supports Express 3.

Sails follows the MVC pattern while Feathers provides lightweight services to define your resources. Feathers uses hooks to define your business logic including validations, security policies, and serialization in reusable, chainable modules, whereas with Sails, these reside in more of a configuration file format.

Feathers supports multiple ORMs while Sails only supports its own Waterline ORM.

Sails allows you to receive messages via websockets on the client, but, unlike Feathers, does not directly support data being sent from the client to the server over websockets. Additionally, Sails uses Socket.io for its websocket transport. Feathers also supports Socket.io but also many other socket implementations via [Primus](../../api/primus.md).

Even though the features are very similar, Feathers achieves this with much less code. Feathers also doesn't assume how you want to manage your assets or that you even have any (because you might be making a JSON API). Instead of coming bundled with Grunt, Feathers lets you use your build tool of choice.

Sails doesn't come with any built-in authentication support. Instead, it offers guides on how to configure Passport. By contrast, Feathers supports an [official authentication plugin](https://github.com/feathersjs/feathers-authentication) that is a drop-in, minimal configuration, module that provides email/password, token, and OAuth authentication much more like Meteor. Using this you can authenticate using those providers over REST **and/or** sockets interchangeably.

Scaling a Sails app is as simple as deploying your large app multiple times behind a load balancer with some pub-sub mechanism like Redis. With Feathers you can do the same but you also have the option to mount sub-apps more like Express, spin up additional services in the same app, or split your services into small standalone microservice applications.
