# Creating a Feathers Plugin

The easiest way to create a plugin is with the [Yeoman generator](https://github.com/feathersjs/generator-feathers-plugin).

First install the generator

```js
$ npm install -g generator-feathers-plugin

```

Then in a new directory run: 

```js
$ yo feathers-plugin
```

This will scaffold out everything that is needed to start writing your plugin. 

Output files from generator: 
```
   create package.json
   create .babelrc
   create .editorconfig
   create .jshintrc
   create .travis.yml
   create src/index.js
   create test/index.test.js
   create README.md
   create LICENSE
   create .gitignore
   create .npmignore
```

Simple right? We technically could call it a day as we have created a Plugin. However, we probably want to do just a bit more. Generally speaking a Plugin is a [Service](../../api/services.md). The fun part is that a Plugin can contain multiple Services which we will create below. This example is going to build out 2 services. The first will allow us to find members of the Feathers Core Team & the second will allow us to find the best state in the United States. 


##Verifying our Service

Before we start writing more code we need to see that things are working. 

```
$ cd example && node app.js

Error: Cannot find module '../lib/index'

```

Dang! Running the example app resulted in an error and you said to yourself, "The generator must be broken and we should head over to the friendly Slack community to start our debugging journey". Well, as nice as they may be we can get through this. Let's take a look at the package.json that came with our generator. Most notably the scripts section. 
  
```js
"scripts": {
    "prepublish": "npm run compile",
    "publish": "git push origin && git push origin --tags",
    "release:patch": "npm version patch && npm publish",
    "release:minor": "npm version minor && npm publish",
    "release:major": "npm version major && npm publish",
    "compile": "rimraf lib/ && babel -d lib/ src/",
    "watch": "babel --watch -d lib/ src/",
    "jshint": "jshint src/. test/. --config",
    "mocha": "mocha --recursive test/ --compilers js:babel-core/register",
    "test": "npm run compile && npm run jshint && npm run mocha",
    "start": "npm run compile && node example/app"
  }
  
```

Back in business. That error message was telling us that we need to build our project. In this case it means babel needs to do it's thing. 
For development you can run watch

```
$ npm run watch

> creatingPlugin@0.0.0 watch /Users/ajones/git/training/creatingPlugin
> babel --watch -d lib/ src/

src/index.js -> lib/index.js

```

After that you can run the example app and everything should be good to go. 

```
$ node app.js
Feathers app started on 127.0.0.1:3030

```

## Expanding our Plugin

Now that we did our verification we can safely change things. For this example we want 2 services to be exposed from our Plugin. Let's create a services directory within the src folder.


```js
// From the src directory 
$ mkdir services
$ ls 
index.js services
```

Now let's create our two services. We will just copy the index.js file. 

```js
$ cp index.js services/core-team.js
$ cp index.js services/best-state.js
$ cd services && ls
best-state.js core-team.js

$ cat best-state.js

if (!global._babelPolyfill) { require('babel-polyfill'); }

import errors from 'feathers-errors';
import makeDebug from 'debug';

const debug = makeDebug('creatingPlugin');

class Service {
  constructor(options = {}) {
    this.options = options;
  }

  find(params) {
    return new Promise((resolve, reject) => {
      // Put some async code here.
      if (!params.query) {
        return reject(new errors.BadRequest());
      }

      resolve([]);
    });
  }
}

export default function init(options) {
  debug('Initializing creatingPlugin plugin');
  return new Service(options);
}

init.Service = Service;
```

At this point we have index.js, best-state.js and core-team.js with identical content. The next step will be to change index.js so that it is our main file. 

Our new index.js

```js
if (!global._babelPolyfill) { require('babel-polyfill'); }

import coreTeam from './services/core-team';
import bestState from './services/best-state';

export default { coreTeam, bestState };

```

Now we need to actually write the services. We will only be implementing the find action as you can reference the [service docs](../../api/services.md) to learn more. Starting with core-team.js we want to find out the names of the members listed in the feathers.js org on github. 

```js
//core-team.js
if (!global._babelPolyfill) { require('babel-polyfill'); }

import errors from 'feathers-errors';
import makeDebug from 'debug';

const debug = makeDebug('creatingPlugin');

class Service {
  constructor(options = {}) {
    this.options = options;
  }
  
  //We are only changing the find...
  find(params) {
    return Promise.resolve(['Mikey', 'Cory Smith', 'David Luecke', 'Emmanuel Bourmalo', 'Eric Kryski', 
      'Glavin Wiechert', 'Jack Guy', 'Anton Kulakov', 'Marshall Thompson'])
  }
}

export default function init(options) {
  debug('Initializing creatingPlugin plugin');
  return new Service(options);
}

init.Service = Service;

```

That will now return an array of names when service.find is called. Moving on to the best-state service we can follow the same pattern 

```js
if (!global._babelPolyfill) { require('babel-polyfill'); }

import errors from 'feathers-errors';
import makeDebug from 'debug';

const debug = makeDebug('creatingPlugin');

class Service {
  constructor(options = {}) {
    this.options = options;
  }

  find(params) {
    return Promise.resolve(['Alaska']);
  }
}

export default function init(options) {
  debug('Initializing creatingPlugin plugin');
  return new Service(options);
}

init.Service = Service;

```

Notice in the above service it return a single item array with the best state listed. 

## Usage

The easiest way to use our plugin will be within the same app.js file that we were using earlier. Let's write out some basic usage in that file. 

```js
//app.js
const feathers = require('feathers');
const rest = require('feathers-rest');
const hooks = require('feathers-hooks');
const bodyParser = require('body-parser');
const errorHandler = require('feathers-errors/handler');
const plugin = require('../lib/index');

// Initialize the application
const app = feathers()
  .configure(rest())
  .configure(hooks())
  // Needed for parsing bodies (login)
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: true }))
  // Initialize your feathers plugin
  .use('/plugin/coreTeam', plugin.coreTeam())
  .use('/plugin/bestState', plugin.bestState())
  .use(errorHandler());


var bestStateService = app.service('/plugin/bestState')
var coreTeamService = app.service('/plugin/coreTeam')

bestStateService.find().then( (result) => {
  console.log(result)
}).catch( error => {
  console.log('Error finding the best state ', error)
})

coreTeamService.find().then( (result) => {
  console.log(result)
}).catch( error => {
  console.log('Error finding the core team ', error)
})

app.listen(3030);

console.log('Feathers app started on 127.0.0.1:3030');

```
 

```
$ node app.js

Feathers app started on 127.0.0.1:3030
[ 'Alaska' ]
[ 'Mikey',
  'Cory Smith',
  'David Luecke',
  'Emmanuel Bourmalo',
  'Eric Kryski',
  'Glavin Wiechert',
  'Jack Guy',
  'Anton Kulakov',
  'Marshall Thompson' ]

```

## Testing 

Our generator stubbed out some basic tests. We will remove everything and replace it with the following.

```js
import { expect } from 'chai';
import plugin from '../src';

const bestStateService = plugin.bestState()

describe('bestState', () => {
  it('is Alaska', () => {
    bestStateService.find().then(result => {
      console.log(result)
      expect(result).to.eql(['Alaska']);
      done();
    });
  });
});


```

```
$ npm run test
```

Because this is just a quick sample jshint might fail. You can either fix the syntax or change the test command. 

```

$ npm run compile && npm run mocha

``` 

This should give you the basic idea of creating a Plugin for Feathers. 
