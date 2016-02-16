# Why Feathers

If you went through the [Getting Started](../getting-started/readme.md) section you probably saw just how quick it is to get an application off the ground. 

Feathers is quite simply the fastest way to build scalable, real-time web and mobile applications. You can literally build prototypes in minutes and production ready applications in days.

We achieve this by being a thin wrapper over top of some amazing battle tested open source technologies and adding a few core pieces like [Hooks](../hooks/readme.md) and [Services](../services/readme.md).

Here are some of the things that you get out of the box with Feathers. All of them are optional. We like to think of Feathers as a _"batteries included but easily swappable"_ framework.

<table>
  <tr>
    <td width="30%"><strong>Instant REST APIs</strong></td>
    <td width="70%">Feathers automatically provides REST APIs for all your services. This industry best practice makes it easy for mobile applications, a web front-end and other developers to communicate with your application.</td>
  </tr>
  <tr>
    <td width="30%"><strong>Unparalleled Database Support</strong></td>
    <td width="70%">With Feathers service adapters you can connect to all of the most popular databases, and query them with a unified interface no matter which one you use. You can even use entirely different DBs in the same app.</td>
  </tr>
  <tr>
    <td width="30%"><strong>Real Time</strong></td>
    <td width="70%">Feathers services can notify clients when something has been created, updated or removed. To get even better performance, you can communicate with your services through websockets, by sending and receiving data directly.</td>
  </tr>
  <tr>
    <td width="30%"><strong>Cross-Cutting Concerns</strong></td>
    <td width="70%">Using "hooks" you have an extremely flexible way to share common functionality or <a href="https://en.wikipedia.org/wiki/Cross-cutting_concern" target="_blank">concerns</a>. Keeping with the Unix philosophy, these hooks are small functions that do one thing and are easily tested but can be chained to create complex processes.</td>
  </tr>
  <tr>
    <td width="30%"><strong>Universal Usage</strong></td>
    <td width="70%">Services and hooks are a powerful and flexible way to build full stack applications. In addition to the server, these constructs also work incredibly well on the client. That's why Feathers works the same in NodeJS, the browser and React Native.</td>
  </tr>
  <tr>
    <td width="30%"><strong>Authentication</strong></td>
    <td width="70%">Almost every app needs authentication so Feathers comes with support for email/password, OAuth and Token (JWT) authentication out of the box.</td>
  </tr>
  <tr>
    <td width="30%"><strong>API Versioning</strong></td>
    <td width="70%">As an application matures the API typically evolves to accommodate business needs or technology changes. With Feathers it's easy to version your API by mounting a sub application or spinning up an entirely new service or app.</td>
  </tr>
  <tr>
    <td width="30%"><strong>Pagination</strong></td>
    <td width="70%">Today's applications are very data rich so most of the time you cannot load all the data for a resource all at once. Therefore, Feathers gives you pagination for every service from the start.</td>
  </tr>
  <tr>
    <td width="30%"><strong>Rate Limiting</strong></td>
    <td width="70%">When an app goes to production you'll need to have some protection against denial of service attacks. With Feathers it's easy to add rate limiting at a service level.</td>
  </tr>
  <tr>
    <td width="30%"><strong>Error Handling</strong></td>
    <td width="70%">Feathers removes the pain of defining errors and handling them. Feathers services automatically return appropriate errors, including validation errors, and return them to the client in a easily consumable format.</td>
  </tr>
  <tr>
    <td width="30%"><strong>Logging</strong></td>
    <td width="70%">Feathers comes with a very simplistic logger that has sane defaults for production. However, it is easily swappable to allow you to customize to your needs.</td>
  </tr>
</table>

If you've decided that Feathers might be for you, you can learn more about the [Feathers philosophy](./philosophy.md), check out [some of our features](./vs/readme.md), or [dive right in](../getting-started/readme.md).
