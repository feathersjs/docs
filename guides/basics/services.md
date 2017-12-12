# Services

Services are the heart of every Feathers application and JavaScript objects or instances of [a class](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Classes) that implement certain methods. Services provide a uniform, protocol independent interface for how to interact with any kind of data like:

- Reading and/or writing from a database
- Interacting with the file system
- Call another API
- Call other services like
  - Send an email,
  - Process a payment,
  - Return the current weather for a location, etc.

Protocol independent means that to a Feathers service it does not matter if it has been called internally, through a REST API or websockets (both of which we will look at later).

## Service methods

Service methods are [CRUD](https://en.wikipedia.org/wiki/Create,_read,_update_and_delete) methods that a service object can implement. Feathers service methods are:

- `find` - Find all data (potentially matching a query)
- `get` - Get a single data entry by its unique identifier
- `create` - Create new data
- `update` - Update an existing data entry by completely replacing it
- `patch` - Update one or more data entries by merging with the new data
- `remove` - Remove one or more existing data entries

Below is an example of Feathers service interface as a normal object and a JavaScript class:

{% codetabs name="Object", type="js" -%}
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
{%- language name="Class", type="js" -%}
class myService {
  async find(params) {
    return return [];
  }
  async get(id, params) {}
  async create(data, params) {}
  async update(id, data, params) {}
  async patch(id, data, params) {}
  async remove(id, params) {}
}

app.use('/my-service', myService);
{%- endcodetabs %}

The parameters for service methods are:

- `id` - The unique identifier for the data
- `data` - The data sent by the user (for creating and updating)
- `params` (*optional*) - Additional parameters, for example the authenticated user or the query.

> __Note:__ A service does not have to implement all those methods but must have at least one.

<!-- -->

> __Pro tip:__ For more information about service, service methods and parameters see the [Service API documentation](../../api/services.md).

## A messages service

Now that we know how service methods look like we can implement our own chat message service that allows us to find, create, remove and update messages in-memory. Here we will use a JavaScript class to work with our messages but as we've above it could als be a normal object.

Below is the complete updated `app.js` with comments:

```js
const feathers = require('@feathersjs/feathers');

class Messages {
  constructor() {
    this.messages = [];
    this.currentId = 0;
  }
  
  async find(params) {
    // Return the list of all messages
    return this.messages;
  }

  async get(id, params) {
    // Find the message by id
    const message = this.messages.find(message => message.id === parseInt(id, 10));

    // Throw an error if it wasn't found
    if(!message) {
      throw new Error(`Message with id ${id} not found`);
    }

    // Otherwise return the message
    return message;
  }

  async create(data, params) {
    // Create a new object with the original data and an id
    // taken from the incrementing `currentId` counter
    const message = Object.assign({
      id: ++this.currentId
    }, data);

    this.messages.push(message);

    return message;
  }

  async patch(id, data, params) {
    // Get the existing message. Will throw an error if not found
    const message = await this.get(id);

    // Merge the existing message with the new data
    // and return the result
    return Object.assign(message, data);
  }

  async remove(id, params) {
    // Get the message by id (will throw an error if not found)
    const message = await this.get(id);
    // Find the index of the message in our message array
    const index = this.messages.indexOf(message);

    // Remove the found message from our array
    this.messages.splice(index, 1);

    // Return the removed message
    return message;
  }
}

const app = feathers();

// Initialize the messages service by creating
// a new instance of our class
app.use('messages', new Messages());
```

## Using services

A service object can be registered on a Feathers application by calling `app.use(path, service)`. `path` will be the name of the service (and the URL if it is exposed as an API which we will learn later).

We can retrieve that service via `app.service(path)` and then call any of its service methods. Add the following to the end of `app.js`:

```js
async function processMessages() {
  await app.service('messages').create({
    text: 'First message'
  });

  await app.service('messages').create({
    text: 'Second message'
  });

  const messageList = await app.service('messages').find();

  console.log('Available messages', messageList);
}

processMessages();
```

And run it with

```
node app
```

We should see this:

```
Available messages [ { id: 0, text: 'First message' },
  { id: 1, text: 'Second message' } ]
```

> __Important:__ Always use the service returned by `app.service(path)` not the service object (what we called `messageService` above) directly. See the [app.service API documentation](../../api/application.md#servicepath) for more information.

## Service events

When you register a service it will automatically become a [NodeJS EventEmitter](https://nodejs.org/api/events.html) that sends events with the new data when a service method that modifies data (`create`, `update`, `patch` and `remove`) returns. Events can be listened to with `app.service('messages').on('eventName', data => {})`. Here is a list of the service methods and their correspondingn events:

| Service method     | Service event           |
| ------------------ | ----------------------- |
| `service.create()` | `service.on('created')` |
| `service.update()` | `service.on('updated')` |
| `service.patch()`  | `service.on('patched')` |
| `service.remove()` | `service.on('removed')` |

We will see later that this is the key to how Feathers enables real-time functionality. For now, let's update the `processMessage` function in `app.js` as follows:

```js
async function processMessages() {
  app.service('messages').on('created', message => {
    console.log('Created a new message', message);
  });

  app.service('messages').on('removed', message => {
    console.log('Deleted message', message);
  });

  await app.service('messages').create({
    text: 'First message'
  });

  const lastMessage = await app.service('messages').create({
    text: 'Second message'
  });

  // Remove the message we just created
  await app.service('messages').remove(lastMessage.id);

  const messageList = await app.service('messages').find();

  console.log('Available messages', messageList);
}

processMessages();
```

If we now run the file via

```
node app
```

We will see how the event handlers are logging the information of created and deleted message like this:

```
Created a new message { id: 0, text: 'First message' }
Created a new message { id: 1, text: 'Second message' }
Deleted message { id: 1, text: 'Second message' }
Available messages [ { id: 0, text: 'First message' } ]
```

## What's next?

In this chapter we learned about services as Feathers core concept for abstracting data manipulation and other operations. We also saw how a service sends events which we will use later to create real-time applications. First, we will look at [Feathers Hooks](./hooks.md) which is the other key part of how Feathers works.
