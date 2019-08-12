# Services

Services are the heart of every Feathers application. You might remember the service we created in the [getting started chapter](./starting.md) to create and find messages which looked like this:

:::: tabs :options="{ useUrlFragment: false }"
::: tab "JavaScript"
```js
const feathers = require('@feathersjs/feathers');
const app = feathers();

// A messages service that allows to create new
// and return all existing messages
class MessageService {
  constructor() {
    this.messages = [];
  }

  async find () {
    // Just return all our messages
    return this.messages;
  }

  async create (data) {
    // The new message is the data merged with a unique identifier
    // using the messages length since it changes whenever we add one
    const message = {
      id: this.messages.length,
      text: data.text
    }

    // Add new message to the list
    this.messages.push(message);

    return message;
  }
}

// Register the message service on the Feathers application
app.use('messages', new MessageService());
```
:::
::: tab "TypeScript"
```ts
import feathers from '@feathersjs/feathers';

// This is the interface for the message data
interface Message {
  id: number;
  text: string;
}

// A messages service that allows to create new
// and return all existing messages
class MessageService {
  messages: Message[] = [];

  async find () {
    // Just return all our messages
    return this.messages;
  }

  async create (data: Partial<Message>) {
    // The new message is the data text with a unique identifier added
    // using the messages length since it changes whenever we add one
    const message: Message = {
      id: this.messages.length,
      text: data.text
    }

    // Add new message to the list
    this.messages.push(message);

    return message;
  }
}

const app = feathers();

// Register the message service on the Feathers application
app.use('messages', new MessageService());
```
:::
::::

In this chapter we will dive more into services and update the existing user service in our chat application to include an avatar image.

## Feathers services

In general, a service is an object or instance of [a class](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Classes) that implements certain methods. Services provide a uniform, protocol independent interface for how to interact with any kind of data like:

- Reading and/or writing from a database
- Interacting with the file system
- Call another API
- Call other services like
  - Sending an email
  - Processing a payment
  - Returning the current weather for a location, etc.

Protocol independent means that to a Feathers service it does not matter if it has been called internally, through a REST API, websockets, internally in our application or any other way.

### Service methods

Service methods are [CRUD](https://en.wikipedia.org/wiki/Create,_read,_update_and_delete) methods that a service can implement. Feathers service methods are:

- `find` - Find all data (potentially matching a query)
- `get` - Get a single data entry by its unique identifier
- `create` - Create new data
- `update` - Update an existing data entry by completely replacing it
- `patch` - Update one or more data entries by merging with the new data
- `remove` - Remove one or more existing data entries

Below is an example of Feathers service interface as a class and a normal object:

:::: tabs :options="{ useUrlFragment: false }"

::: tab "JavaScript class"
```js
class MyService {
  async find(params) {}
  async get(id, params) {}
  async create(data, params) {}
  async update(id, data, params) {}
  async patch(id, data, params) {}
  async remove(id, params) {}
}

app.use('/my-service', new MyService());
```
:::

::: tab "TypeScript class"
```typescript
import { Service, Params, Id, NullableId Application } from '@feathersjs/feathers';

class MyService implements Service<any> {
  async find(params: Params) {}
  async get(id: Id, params: Params) {}
  async create(data: any, params: Params) {}
  async update(id: NullableId, data: any, params: Params) {}
  async patch(id: NullableId, data: any, params: Params) {}
  async remove(id: NullableId, params: Params) {}
}

app.use('/my-service', new MyService());
```
:::

::: tab "Object"
```js
const myService = {
  async find(params) {
    return [];
  },
  async get(id, params) {},
  async create(data, params) {},
  async update(id, data, params) {},
  async patch(id, data, params) {},
  async remove(id, params) {}
}

app.use('/my-service', myService);
```
:::

::::

The parameters for service methods are:

- `id` - The unique identifier for the data
- `data` - The data sent by the user (for creating, updating and patching)
- `params` (*optional*) - Additional parameters, for example the authenticated user or the query

> __Note:__ A service does not have to implement all those methods but must have at least one.

<!-- -->

> __Pro tip:__ For more information about service, service methods and parameters see the [Service API documentation](../../api/services.md).

### Registering services

As we have seen, a service can be registered on the Feathers application by calling [app.use(name, service)](../../api/application.md#use-path-service) with a name and the service instance:

```js
const app = feathers();

// Register the message service on the Feathers application
app.use('messages', new MessageService());
```

To get the service object and use the service methods (and events) we can use [app.service(name)](../../api/application.md#service-path):

```js
const messageService = app.service('messages');
const messages = await messageService.find();
```

### Service events

A registered service will automatically become a [NodeJS EventEmitter](https://nodejs.org/api/events.html) that sends events with the new data when a service method that modifies data (`create`, `update`, `patch` and `remove`) returns. Events can be listened to with `app.service('messages').on('eventName', data => {})`. Here is a list of the service methods and their corresponding events:

| Service method     | Service event           |
| ------------------ | ----------------------- |
| `service.create()` | `service.on('created')` |
| `service.update()` | `service.on('updated')` |
| `service.patch()`  | `service.on('patched')` |
| `service.remove()` | `service.on('removed')` |

This is how Feathers does real-time and how we updated the messages automatically by listening to `app.service('messages').on('created')`.

## Database adapters

Now that we have all those service methods we could go ahead and implement any kind of custom logic. Very often, that means creating, reading, updating and removing data from a database and this is also how Feathers can work with any database or backend.

Writing all that code yourself is pretty repetitive and cumbersome though which is why Feathers has a collection of pre-built services for different popular databases. They offer most the basic functionality and can always be fully customized (which we will look at in a bit). Feathers database adapters support a common [usage API](../../api/databases/common.md), pagination and [querying syntax](../../api/databases/querying.md) for many popular databases and NodeJS ORMs:

| Database | Adapter |
|---|---|
| In memory | [feathers-memory](https://github.com/feathersjs-ecosystem/feathers-memory), [feathers-nedb](https://github.com/feathersjs-ecosystem/feathers-nedb) |
| Localstorage, AsyncStorage | [feathers-localstorage](https://github.com/feathersjs-ecosystem/feathers-localstorage) |
| Filesystem | [feathers-nedb](https://github.com/feathersjs-ecosystem/feathers-nedb) |
| MongoDB | [feathers-mongodb](https://github.com/feathersjs-ecosystem/feathers-mongodb), [feathers-mongoose](https://github.com/feathersjs-ecosystem/feathers-mongoose) |
| MySQL, PostgreSQL, MariaDB, SQLite, MSSQL | [feathers-knex](https://github.com/feathersjs-ecosystem/feathers-knex), [feathers-sequelize](https://github.com/feathersjs-ecosystem/feathers-sequelize), [feathers-objection](https://github.com/feathersjs-ecosystem/feathers-objection) |
| Elasticsearch | [feathers-elasticsearch](https://github.com/feathersjs-ecosystem/feathers-elasticsearch) |

> __Pro tip:__ Each one of the linked adapters has a complete standalone REST API example in their readme.

When we [generated our application](./generator.md) the default database is [NeDB](https://github.com/feathersjs-ecosystem/feathers-nedb/) which is a database that writes to the filesystem and does not require any additional setup. In larger applications you probably want to choose something like PostgreSQL or MongoDB but NeDB is great for this guide because it gets us started quickly without having to learn a new database system.

## Generating a service

In our [newly generated](./generator.md) `feathers-chat` application, we can create database backed services with a single command:

```sh
feathers generate service
```

For this service we will use NeDB which we can just confirm by pressing enter. We will use `messages` as the service name and can confirm all other prompts with the defaults by pressing enter. This is it, we now have a database backed messages service with authentication enabled.

## Customizing a service

Feathers has two ways for customizing services. Either by using hooks, which we will look at [in the next chapter](./hooks.md) or by extending the existing database adapter service class. Let's update our `users` service to add a link to the [Gravatar](http://en.gravatar.com/) image associated with the user's email address, so we can display a user avatar.

:::: tabs :options="{ useUrlFragment: false }"
::: tab "JavaScript"
Update `src/services/users/users.class.js` with the following:

```js
// This is the database adapter service class
const { Service } = require('feathers-nedb');
// We need this to create the MD5 hash
const crypto = require('crypto');

// The Gravatar image service
const gravatarUrl = 'https://s.gravatar.com/avatar';
// The size query. Our chat needs 60px images
const query = 's=60';

exports.Users = class Users extends Service {
  create (data, params) {
    // The user email
    const { email, password } = data;
    // Gravatar uses MD5 hashes from an email address (all lowercase) to get the image
    const hash = crypto.createHash('md5').update(email.toLowerCase()).digest('hex');
    // The full avatar URL
    const avatar = `${gravatarUrl}/${hash}?${query}`;
    // The complete user
    const userData = {
      email,
      password,
      avatar
    };

    // Call the original `create` method with existing `params` and new data
    return super.create(userData, params);
  }  
};
```
:::
::: tab "TypeScript"
Update `src/services/users/users.class.ts` with the following:

```ts
// This is the database adapter service class
import { Service } from 'feathers-nedb';
// We need this to create the MD5 hash
import crypto from 'crypto';

// The Gravatar image service
const gravatarUrl = 'https://s.gravatar.com/avatar';
// The size query. Our chat needs 60px images
const query = 's=60';

export class Users extends Service {
  create (data, params) {
    // The user email
    const { email, password } = data;
    // Gravatar uses MD5 hashes from an email address (all lowercase) to get the image
    const hash = crypto.createHash('md5').update(email.toLowerCase()).digest('hex');
    // The full avatar URL
    const avatar = `${gravatarUrl}/${hash}?${query}`;
    // The user data we want to store in the database
    const userData = {
      email,
      password,
      avatar
    };

    // Call the original `create` method with existing `params` and new data
    return super.create(userData, params);
  }
};
```
:::
::::

Now we can sign up users with email and password and it will automatically set an avatar image for them (if there is none Gravatar will return a placeholder).

## What's next?

In this chapter we learned about services as Feathers core concept for abstracting data operations. We also saw how a service sends events which we will use later to create real-time applications. After that, we updated our users service to include an avatar image. Next, we will look at [Hooks](./hooks.md) which is the other key part of how Feathers works.
