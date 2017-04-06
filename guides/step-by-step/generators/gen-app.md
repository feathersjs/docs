# Generating an app

Now let's write a new project using the Feathers generators.

This project has users who may be members of one or more teams.
We want to display teams with all their members.

## Create the app

The first thing we do is generate the basic app using:
![Generate app](../assets/gen-app.jpg)

This generated [code](https://github.com/feathersjs/feathers-docs/blob/auk/examples/step/02/gen1/)
with the structure:

![Generate app structure](../assets/gen-app-dir.jpg)


## config/
 
Contains the configuration files for the app.
[production.json](https://github.com/feathersjs/feathers-docs/blob/auk/examples/step/02/gen1/config/production.json)
values override
[default.json](https://github.com/feathersjs/feathers-docs/blob/auk/examples/step/02/gen1/config/default.json)
ones when in production mode,
i.e. when you run `NODE_ENV=production node ./examples/step/02/app/src`.

## public/
 
Contains the public resources.
A sample favicon and
[HTML file](https://github.com/feathersjs/feathers-docs/blob/auk/examples/step/02/gen1/public/index.html)
are included.

## src/
 
Contains the Feathers server.
    
    - **hooks/** contains your custom hooks,
    usually those general enough to used with multiple services.
    A simple but useful
    [logger](https://github.com/feathersjs/feathers-docs/blob/auk/examples/step/02/gen1/src/hooks.logger.js)
    is provided as an example.
    
    - **middleware/** contains your Express middleware.
    
    - **services/** will contains the services.
            
    - [app.hooks.js](https://github.com/feathersjs/feathers-docs/blob/auk/examples/step/02/gen1/src/app.hooks.js)
    configures those hooks which run for all services.
    This initially includes the `logger` hook.
    
    - [app.js](https://github.com/feathersjs/feathers-docs/blob/auk/examples/step/02/gen1/src/app.js)
    configures Feathers.
    
    - [index.js](https://github.com/feathersjs/feathers-docs/blob/auk/examples/step/02/gen1/src.index.js)
    starts the app.
 
## test/

Contains the tests for the app.
[app.test.js](https://github.com/feathersjs/feathers-docs/blob/auk/examples/step/02/gen1/test/app.test.js)
tests that the index page appears, as well as 404 errors for HTML pages and JSON.

### Is anything wrong, unclear, missing?
[Leave a comment.](https://github.com/feathersjs/feathers-guide/issues/new?title=Comment:Step-Generators-App&body=Comment:Step-Generators-App)
