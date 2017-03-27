# Feathers + Angular

`Angular` is an open-source javascript framework maintained by Google that helps to create single-page applications (https://angularjs.org/). By itself already has a module responsible for http requests, however with the power and ease of `feathers` this can become much more practical and productive, mainly because the backend was developed with `feathers`.

A service will be configured for an application that uses `feathers-client` using both `ES5` and `ES6`. And it will be shown how to consume such service.

## Setting up the HTML page

The Angular and the Feathers client module can be individually loaded via a module loader server such as Webpack. To keep this guide simple, an HTML page like `index.html` will be used:

```html
  <!DOCTYPE html>
  <html ng-app="app.module">
    <head>
      <meta charset="utf-8">
    </head>
    <body ng-controller="FooController">
      Hello World!!!
    </body>
    <script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.5.6/angular.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/superagent/3.3.1/superagent.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/1.7.2/socket.io.min.js"></script>
    <script src="https://cdn.rawgit.com/feathersjs/feathers-client/v1.1.0/dist/feathers.js"></script>

    <script src="./feathers.service.js"></script>
    <script src="./foo.controller.js"></script>
  </html>
```

As can be seen above in the loaded scripts, besides the `angular` and `feathers-client`, were also loaded `superagent` and `socketio` which are direct dependencies of `feathers-client`. And some angular settings were made such as specifying the root element in html through `ng-app` passing the module responsible for controlling it and assigning a controller to view through `ng-controller`.

## Creating angular feathers service

### Using ES6

Using the features of `ES6` the service that encapsulates `feathers-client` becomes very simple, as can be seen below:

```javascript
  class FeathersService {
    constructor() {
      this._apiEndPoint = 'http://localhost:3030';
      this._initRestService();
      this._initSocketService();
    }

    get rest() {
      return this._rest;
    }

    get socket() {
      return this._socket;
    }

    _initRestService() {
      this._rest = feathers()
        .configure(feathers.rest(this._apiEndPoint).superagent(superagent))
        .configure(feathers.hooks());
    }

    _initSocketService() {
      this._socket = feathers()
        .configure(feathers.socketio(io(this._apiEndPoint)))
        .configure(feathers.hooks());
    }
  }

  angular.module('app.module', [])
    .service('FeathersService', FeathersService);
```

As it can be seen, the rest service configuration of `feathers` is done in the `_initRestService` method using `superagent`, which is an api for `AJAX` requests, the method only assigns the local variable `_rest` the object that Will be used to gain access to the endpoints of the api developed with feathers. Similarly in the `_initSocketService` method, used to configure `feathers` socket initialization using `socketio`. In this way, two get functions are named respectively `rest` and `socket`.

### Using ES5

With `ES5` the service code becomes a bit more verbose, but still simple.

```javascript
  (function() {
    'use strict';

    angular.module('app.module', [])
      .service('FeathersService', FeathersService);

    function FeathersService() {
      var _apiEndPoint = 'http://localhost:3030';
      var _rest = _initRestService();
      var _socket = _initSocketService();

      var feathersServiceFactory = {
        rest: _rest,
        socket: _socket
      };

      return feathersServiceFactory;

      /////////////////

      function _initRestService() {
        return feathers()
          .configure(feathers.rest(_apiEndPoint).superagent(superagent))
          .configure(feathers.hooks());
      }

      function _initSocketService() {
        return feathers()
          .configure(feathers.socketio(io(_apiEndPoint)))
          .configure(feathers.hooks());
      }
    }
  })();
```

> **ProTip:** The explanation of the service developed with `ES6` is also suitable for this one developed with `ES5`.

## Injecting on a Controller

With the service already effectively developed, they are considered as examples of the injection and use inside an `angular` controller also in `ES6` and `ES5`.

### Using ES6

```javascript
  class FooController {
    constructor(FeathersService) {
      this.app = FeathersService.rest;
      this.getFoo();
    }

    getFoo() {
      this.app.service('foo').find()
      .then(/* response */)
      .catch(/* error */);
    }
  }

  angular.module('app.module')
    .controller('FooController', FooController);
```

The use is very simple, just inject the service and get the `rest` or `socket` properties according to your need, then specify which endPoint api will be accessed, the rest method to be used and the return is a `Promise`.

### Using ES5

```javascript
  (function() {
    'use strict';

    angular.module('app.module')
      .controller('FooController', FooController);

    FooController.$inject = ['FeathersService'];
    function FooController(FeathersService) {
      var app = FeathersService.rest;

      activate();

      /////////////////

      function activate() {
        app.service('foo').find()
        .then(/* response */)
        .catch(/* error */);
      }
    }
  })();
```

> **ProTip:** The use explanation of the service in the controller developed in `ES6` is also suitable for this developed with `ES5`.
