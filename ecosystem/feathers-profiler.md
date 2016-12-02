# feathers-profiler
*Log service calls and gather profile information on them.*

[![GitHub stars](https://img.shields.io/github/stars/feathersjs/feathers-profiler.png?style=social&label=Star)](https://github.com/feathersjs/feathers-profiler/)
[![npm version](https://img.shields.io/npm/v/feathers-profiler.png?style=flat-square)](https://www.npmjs.com/package/feathers-profiler)
[![Changelog](https://img.shields.io/badge/changelog-.md-blue.png?style=flat-square)](https://github.com/feathersjs/feathers-profiler/blob/master/CHANGELOG.md)


## Summary

Service calls transported by websockets are not passed through Express middleware.
`feathers-profiler` logs service calls from all transports
and gathers performance information on them.

##### `import { profiler, getProfile, clearProfile, getPending, timestamp } from 'feathers-profiler';`

### `app.configure(profiler(options))`

Start logging and/or profiling service calls.

__Options:__

- logger
    - defaults to logging on `console.log`.
    - `null` disables logging.
    - `require('winston')` routes logs to the popular winston logger.
    - `{ log: payload => {} }` routes logs to your customized logger.
- logMsg
    - default message is shown [below](#logs-service-calls).
    - `hook => {}` returns a custom string or object payload for the logger.
    `hook._log` contains log information;
    `hook.original` and `hook.error` contain error information.
- stats
    - `null` or `'none'` profile information will not be gathered.
    - `total` gathers profile information by service and method only. The default.
    - `detail` gathers profile information by characteristics of the call.
- statsDetail
    - default is shown [below](#gathers-profile-information-on-service-calls).
    - `hook => {}` returns a custom category for the call.


### `getProfile()`

Returns profile information as an object.

### `clearProfile()`

Re-initializes the profile information.
The profile internal counts may not add up perfectly unless `getPending() === 0`.
    
### `getPending()`

Returns the number of currently pending service calls.

### `timestamp()`

Returns a timestamp suitable for logging to the console.

## Example

```js
const feathers = require('feathers');
const rest = require('feathers-rest');
const sockets = require('feathers-socketio');
const hooks = require('feathers-hooks');
const bodyParser = require('body-parser');
const errorHandler = require('feathers-errors/handler');

const { profiler, getProfile, getPending }  = require('feathers-profiler');

// Initialize the application
const app = feathers()
  .configure(rest())
  .configure(sockets())
  .configure(hooks())
  .use(bodyParser.json()) // Needed for parsing bodies (login)
  .use(bodyParser.urlencoded({ extended: true }))
  .use('users', { ...}) // services
  .use('messages', { ... })
  .configure(profiler({ stats: 'detail' }) // must be configured after all services
  .use(errorHandler());
  
  // ... once multiple service calls have been made
  console.log('pending', getPending());
  console.log(require('util').inspect(getProfile(), {
    depth: 5,
    colors: true
  }));
```

## Usage

### Logs service calls

The log message may be customized. The default log message includes:

- Service name, method and transport provider.
- Elapsed time between the method being called and its completion.
- Number of service calls pending when call was made.
- Where service call failed and why.

![logs](../img/profiler-log.jpg)

### Gathers profile information on service calls

Profile information is:

- Grouped by service and method.
- Grouped by characteristics of the call. These may be customized.
- Average pending count provides information on how busy the server was during these calls.
- Average, min and max elapsed time provide information on how responsive the server is.
- The number of returned items provides information on how large the `find` results were.

![stats](../img/profiler-stats.jpg)
