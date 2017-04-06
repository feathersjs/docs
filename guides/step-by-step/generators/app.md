# Generating an app

Let's generate a new project.

## Working example

- Server code: [examples/step/02/app/](https://github.com/feathersjs/feathers-docs/blob/auk/examples/step/02/app/)
- Client code: [app/public/socketio.html](https://github.com/feathersjs/feathers-docs/blob/auk/examples/step/02/app/public/socketio.html)
and
[feathers-app.js](https://github.com/feathersjs/feathers-docs/blob/auk/examples/step/02/app/public/feathers-app.js)
- Start the server: `node ./examples/step/02/app/src`
- Point the browser at: `localhost:3030/socketio.html`
- Compare with our last frontend
[common/public/feathers-app-del.js](https://github.com/feathersjs/feathers-docs/blob/auk/examples/step/01/common/public/feathers-app-del.js):
[Unified](http://htmlpreview.github.io/?https://github.com/feathersjs/feathers-docs/blob/auk/examples/step/_diff/02-app-feathers-app-line.html)
|
[Split](http://htmlpreview.github.io/?https://github.com/feathersjs/feathers-docs/blob/auk/examples/step/_diff/02-app-feathers-app-side.html)

## Creating an app

The [app generator](https://docs.feathersjs.com/getting-started/scaffolding.html#generate-the-app)
wrote most of
[app/](https://github.com/feathersjs/feathers-docs/blob/auk/examples/step/02/app/)
after the following prompts:

```text
feathers-guide$ mkdir ./examples/step/02/app/src
feathers-guide$ cd ./examples/step/02/app/src
app$ feathers generate

Project name: Feathers-guide-02-app
Description: (enter)
What type of API are you making: REST & Realtime via Socket.io
CORS configuration: Disabled
What database do you primarily want to use?: NeDB
What authentication providers would you like to support?: local
Do you want to update this generator?: No

app$ rm -rf node_modules
```

After generating the code, the generator ran `npm install` in order to load the app's dependencies.
We remove those dependencies as they already installed at the root of feathers-guide.

## App structure

The app structure is

- **config/** The configuration files.
`production.json` values override `default.json` ones when in production mode,
i.e. when you run `NODE_ENV=production node ./examples/step/02/app/src`.

- **data/** Where the NeDB tables reside.

- **public/** The contents have been copied from our previous examples.

- **src/** The server.
    
    - **hooks/** Your custom hooks which are general enough to used with multiple services.
    
    - **middleware/** Standard Express middleware is set up for your convenience.
    
    - **services/** Contains the services.
    `services/index.js` runs through the services, configuring them.
    
        - **authentication/** The local authentication service.
        
        - **user/** The user service. It was added because its a dependency of local authentication.
        
            - **user/index.js** Configures the service.
            It includes `paginate: { default: 5, max: 25 }` which is something we have not seem before.
            It means the find method may never return more than 25 items at a time,
            and that by default it will return 5 items.
        
            - **hooks/** The hooks for the service. Called by `user/index.js`.
            
    - **app.js** Configures Feathers.
    
    - **index.js** Starts the HTTP server.
 
- **test/** Test folder with some simple tests.

## Authentication

Let's add authentication to the frontend we last used.
[app/public/feathers-app.js](https://github.com/feathersjs/feathers-docs/blob/auk/examples/step/02/app/public/feathers-app.js)

```javascript
app.authenticate({
  type: 'local',
  'email': 'jane.doe@gmail.com',
  'password': '11111'
})
  .then(() => console.log('\nAuthenticated successfully.\n '))
  .catch(err => console.error('\nError authenticating:', err));
```
- See what changed:
[Unified](http://htmlpreview.github.io/?https://github.com/feathersjs/feathers-docs/blob/auk/examples/step/_diff/02-app-feathers-app-line.html)
|
[Split](http://htmlpreview.github.io/?https://github.com/feathersjs/feathers-docs/blob/auk/examples/step/_diff/02-app-feathers-app-side.html)


This attempts to authenticate the user.

> ** Promise Refresher.** Should an error occur during execution of a Promise
or anywhere in its then chain, the next `.catch(err => ...)` is executed.

## The app

The app is very similar to [Writing a Feathers websocket Client](../basic-feathers/socket-client.md)
and you should have little trouble understanding the generated code.

What's important is that you pay attention to how the app is structured.
This structure is recommended by the Feathers team and is considered best practice.

> **App structure.** Feathers, unlike some other frameworks,
does not have seemingly endless discussions about the best way to structure an app.

## The results

The results are similar to
[Writing a Feathers websocket Client](../basic-feathers/socket-client.md).
The result for find is different because the user service was configured with pagination.

```text
created Jane Doe item
 Object {email: "jane.doe@gmail.com", role: "admin", _id: "UmH30nDOBjnn7QBB"}
created John Doe item
 Object {email: "john.doe@gmail.com", role: "user", _id: "edz7y7QF6ipR00z7"}
created Judy Doe item
 Object {email: "judy.doe@gmail.com", role: "user", _id: "QGqa4DxOtOFT4XPY"}
created Jack Doe item
 Object {email: "jack.doe@gmail.com", role: "user", _id: "HTel2m2xgDvHOFc7"}

Authenticated successfully.
 
deleted Jack Doe item
 Object {email: "jack.doe@gmail.com", role: "user", _id: "HTel2m2xgDvHOFc7"}
find all items
 Object {total: 3, limit: 5, skip: 0, data: Array[3]}
   data: Array[3]
     0: Object
       _id: "QGqa4DxOtOFT4XPY"
       email: "judy.doe@gmail.com"
       role: "user"
     1: Object
       _id: "UmH30nDOBjnn7QBB"
       email: "jane.doe@gmail.com"
       role: "admin"
     2: Object
       _id: "edz7y7QF6ipR00z7"
       email: "john.doe@gmail.com"
       role: "user"
     length: 3
   limit: 5
   skip: 0
   total: 3
```

### Is anything wrong, unclear, missing?
[Leave a comment.](https://github.com/feathersjs/feathers-guide/issues/new?title=Comment:Step-Generators-App&body=Comment:Step-Generators-App)
