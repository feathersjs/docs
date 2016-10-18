# Feathers + Angular 2

Angular 2 and Feathers work together wonderfully through Angular's [services](https://angular.io/docs/ts/latest/tutorial/toh-pt4.html). Go ahead and read up on them if you aren't familiar with services or how they differ in Angular 2.x from 1.x.

We'll be setting up the basic service structure for an application that uses `feathers-socketio` but you should find this structure is flexible enough to accommodate other setups.

> Note: If you're interested in learning about how to use RxJS Observables with Angular2 with Feathers, check out [this blog post](https://berndsgn.ch/angular2-and-feathersjs/).

## Using TypeScript

If you're using TypeScript to develop with Angular 2, Feathers and its related modules should be loaded into your app through npm packages. `npm install` the ones you'll need:

```bash
npm install feathers feathers-hooks feathers-rest feathers-socketio socket.io-client feathers-authentication
```

You'll also need a module loader, a commonly used one is [Webpack](https://webpack.github.io/). If you've gone through the [Angular 2 quickstart](https://angular.io/docs/ts/latest/quickstart.html) you should be good to go.

Finally you'll need to load the feathers modules you need in a TypeScript file. Make a new file (I called mine `feathers.service.ts`) and include the following.

```js
const feathers = require('feathers/client');
const socketio = require('feathers-socketio/client');
const io = require('socket.io-client');
const localstorage = require('feathers-localstorage');
const hooks = require('feathers-hooks');
const rest = require('feathers-rest/client');
const authentication = require('feathers-authentication/client');
```

Notice that we **aren't using the ES6 import syntax**. As of the time of writing this, Feathers does not have TypeScript definitions, so TypeScript is unable to load the packages in that manner. As an alternative, we can use the standard CommonJS `require` syntax. It'll work the same, we just won't have the helpful intellisense that some IDE's provide.

## Using ES5
Feathers has a single convenient file for the client which you can include in script tags called [feathers-client](https://github.com/feathersjs/feathers-client).

```html
<script src="/path/to/feathers-client.js"></script>
```

## Setup

Now let's jump right in! We'll be using TypeScript from this point forward but all of this has a JS equivalent, which you can find on the [Angular 2](https://angular.io/docs/js/latest/index.html) JavaScript docs. 

Make a `feathers.service.ts` file if you haven't already. This will contain the setup for our application to interact with Feathers.

### REST

Let's create a new Angular service that uses REST to communicate with our server. In addition to the packages we previously installed, we also have to include a client REST library. In this guide, we'll be using [Superagent](http://visionmedia.github.io/superagent/).

```ts
import { Injectable } from '@angular/core';
const superagent = require('superagent');

const HOST = 'http://localhost:3000'; // Your base server URL here
@Injectable()
export class RestService extends Service {
  private _app: any;

  constructor() {
  	super();

    this._app = feathers() // Initialize feathers
      .configure(rest(HOST).superagent(superagent)) // Fire up rest
      .configure(hooks()) // Configure feathers-hooks
  }
}
```

Notice the `@Injectable()` decorator at the top of our service. This is important to make sure this service can be used by the rest of our app correctly.

### Socket.io
Our socket.io app setup doesn't look much different!

```ts
@Injectable()
export class SocketService extends Service {
  public socket: SocketIOClient.Socket;
  private _app: any;
  
  constructor() {
  	super();
  	
    this.socket = io(HOST);
    this._app = feathers()
      .configure(socketio(this.socket))
      .configure(hooks())
  }
}
```

Remember, the `io` is the `socket.io-client` package that we included earlier in the guide. I also recommend keeping `socket` public as I've done in the above code example so you can use socket.io outside of the Feathers service in case you need to.

If we so choose, we can leave both the socket.io and REST app setups in the same file and use them both equally. That way, we can selectively use either one depending on the action we're doing!

## Creating our first resource

That's all the setup we need to start interacting with our Feathers API. For the purpose of demonstration, lets make a `message.service.ts`. It will serve as a template for other services.

```ts
import { RestService, SocketService } from './feathers.service';

@Injectable()
export class MessageService {
  private _socket;
  private _rest;

  constructor(
    private _socketService: SocketService,
    private _restService: RestService
  ) {
    // Let's get both the socket.io and REST feathers services for messages!
    this._rest = _restService.getService('messages');
    this._socket = _socketService.getService('messages');
  }
}
```

As you can see, we imported the `feathers.service.ts` code we previously wrote, and set class instance variables to the services we want to interact with. 

> **ProTip:** Remember that funny-looking `@Injectable()` decorator we used earlier? Angular 2 uses it to emit metadata about a service. Without it, we wouldn't be able to inject one service into another, like we just did.

Now let's write methods that will abstractly allow for our components to access our API! 

```ts
  find(query: any) {
    return this._rest.find(query);
  }

  get(id: string, query: any) {
    return this._rest.get(id, query);
  }

  create(message: any) {
    return this._rest.create(message);
  }
  
  remove(id: string, query: any) {
    return this._socket.remove(id, query);
  }
```

You can write similar functions for other REST methods (PATCH, UPDATE) as well.

Notice that in these methods we're essentially just returning the promise that feathers gives us. This is a necessary step of abstraction, however, for a couple reasons.

1) We can switch between socket.io and REST whenever we want, and component code doesn't need to change. Look at our remove method! We made it use socket.io, but our component doesn't need to care!
2) We can create more complex behaviors whenever a method is called (e.g. a user is logged in after they are created, custom error handling, etc.)

Think you're done? **Not so fast!**
If we run our code now, we're going to get an error. In Angular, we have to instantiate our services somewhere, and right now we have nothing creating our RestService or SocketService (if you're wondering about MessageService, sit tight)! 
Add them to your bootstrap call.

```js
bootstrap(YourMainComponent, [
  SocketService,
  RestService
])
```

We'll explain more later, but believe it or not, that's all we need for our components to start handling our data!

## Using a service in a component

Let's go to our `app.component.ts` which you should have from [Angular 2 getting started](https://angular.io/docs/ts/latest/quickstart.html). First things first, we import our newly created service.

```ts
import {MessageService} from '../services/message.service';
```

### Providers
Now let's add it as a *provider* to the Angular 2 App Component.

```ts
import {Component} from '@angular/core';
@Component({
    selector: 'my-app',
    template: '<h1>My First Angular 2 App</h1>',
    providers: [ MessageService ]
})
export class AppComponent { }
```
So what does `providers` do? Every time you add MessageService as a provider to a component, **a new instance of the service is created.** In our application, in all likelihood we only ever need one instance of MessageService, so this should be **the only time we provide it**. If you want to make this service accessible globally throughout our application, rather than tying the service to a specific component, we can *bootstrap* it in our `main.ts`.

```ts
bootstrap(AppComponent, [
    SocketService,
    RestService,
    MessageService
])
```

That's what we did earlier! We created a global instance of RestService and SocketService, since we won't be providing them directly in any component (they're just for MessageService).

**TL;DR** Either *provide* your service on a single top-level component or *bootstrap* it. Don't do both, and don't `provide` to a component's children.

### Injecting our Service

Now that we've created an instance of our service, let's give our component access to it. Simply providing it is not enough - you'll need to add it to the component's constructor.

```ts
  constructor (
    private _messageService: MessageService
  ) { }
```
Adding that type information, `: MessageService` gives Angular the information it needs to inject our service into the component!

Declaring our reference to the service instance private does a couple things. First, TypeScript's compiler will throw an error if we're trying to access this reference to the service from outside our component. Second, it is equivalent to writing the following 

```ts
constructor (_messageService: MessageService) {
   this._messageService = _messageService;
}
```

And we all need a little less of `this` in our lives.

### Using our service

Now we can access the service methods from our component. Let's get a list of all of our messages.

```ts
export class AppComponent {
  private _messages: any[] = [];
  // Called once when the component is early in its creation
  ngOnInit() {
    this._messageService.find().then(messages => {
       this._messages = messages;
    });
  }
}
```
And that's it! Our component now has access to our messages via `_messages`. From here we can do all sorts of fun Angular-y things. Let's display our Messages in a list.

```ts
@Component({
    ...
    template: `
      <div class="message" *ngFor="let message of _messages">
         <h1 class="title">{{message.title}}</h1>
         <div class="description">{{message.description}}</div>
      </div>
    `,
})
```

There are nicer ways of doing this, but you get the idea. What if we want to remove a message when a user clicks it?

```ts
@Component({
    ...
    template: `
      <div class="message" *ngFor="let message of _messages" (click)="removeMessage(message)">
        ...
      </div>
    `,
})
export class AppComponent () {
  removeMessage (message) {
    this._messageService.remove(message.id);
  }
}
```

## Wrapping up

Structuring our interactions with Feathers in this way is very powerful. It allows us to create new services easily with only the methods and behaviors that we need, and inject services only where they are needed. This code is also completely isomorphic, so we can run it on the server or in the client!
