# Testing using Mocha and Chai with Authentication
This is a small tutorial that will take you through testing using Mocha and Chai along with how to handle authentication inside your test case. This tutorial will take you from project creation straight to testing.
To get started install using the instructions on the FeathersJS website:
```js
$ npm install -g feathers-cli
$ mkdir test
$ cd test
$ feathers generate
```
After you type the generate command, it will ask a few questions to generate a base project depending on your needs:
```js
? Project name test
? Description A simple featherjs test project
? What type of API are you making? REST
? CORS configuration Enabled for all domains
? What database do you primarily want to use? MongoDB
? What authentication providers would you like to support? local
```
You also need to install the following dependencies:
```js
npm install --save-dev chai chai-http
```
When the project was generated, it created a user service. To make this a more realistic example, add another service using the following command:
```js
feathers generate service
```
This brings up another list of options:
```js
? What do you want to call your service? menu
? What type of service do you need? database
? For which database? MongoDB
? Does your service require users to be authenticated? yes
```
That will generate a menu folder under src/services and test/services. By saying yes to requiring users to authenticate, feathersjs generated some default authentication in src/services/menu/hooks/index.js.
```js
exports.before = {
  all: [
    auth.verifyToken(),
    auth.populateUser(),
    auth.restrictToAuthenticated()
  ]
  ....
}
```
In addition to regular authentication, you can add role based authentication in src/services/menu/hooks/index.js by changing the previous code to the following:
```js
exports.before = {
  all: [
    auth.verifyToken(),
    auth.populateUser(),
    auth.restrictToAuthenticated()
  ],
  find: [
    auth.restrictToRoles({
      roles: ['admin']
    })
  ],
  get: [
    auth.restrictToRoles({
      roles: ['admin', 'user']
    })
  ],
  create: [
    auth.restrictToRoles({
      roles: ['admin']
    })
  ],
  update: [
    auth.restrictToRoles({
      roles: ['admin']
    })
  ],
  patch: [
    auth.restrictToRoles({
      roles: ['admin']
    })
  ],
  remove: [
    auth.restrictToRoles({
      roles: ['admin']
    })
  ]
};
```
You can also add role based authentication to the user hook if you want to additional restrictions. Go ahead and update src/services/menu/menu-model.js to the following:
```js
name: {
  type: String,
  required: true,
  unique: true
},
price: {
  type: Number,
  required: true
},
categories: [{
  type: String,
  required: true
}],
createdAt: {
  type: Date,
  'default': Date.now
},
updatedAt: {
  type: Date,
  'default': Date.now
}
```
Now update the src/services/menu/user-model.js to the following:
```js
username: {
  type: String,
  required: true,
  unique: true
},
password: {
  type: String,
  require: true
},
roles: [{
  type: String,
  required: true
}],
createdAt: {
type: Date,
'default': Date.now
},
updatedAt: {
type: Date,
'default': Date.now
}
```
Due to the change of the name field in the user-model.js you will also need to update the config/default.json file to the following:
```js
"local": {
  "usernameField": "username"
}
```
Finally change the test/menu/index.test.js file to the following:
```js
'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const assert = require('assert');
const app = require('../../../src/app');
const Menu = app.service('menus');
const User = app.service('users');
const authentication = require('feathers-authentication/client');
const bodyParser = require('body-parser');
var token;
//config for app to do authentication
app
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: true }))
  .configure(authentication());
//use http plugin
chai.use(chaiHttp);
//use should
var should = chai.should();

describe('menu service', () => {
  //setup
  before((done) => {
    //start the server
    this.server = app.listen(3030);
    //once listening do the following
    this.server.once('listening', () => {
      //create some mock menu items
      Menu.create({
        name: 'hamburger',
        price: 7.99,
        categories: ['lunch', 'burgers', 'dinner']
      });
      Menu.create({
        name: 'spinach omlete',
        price: 4.99,
        categories: ['breakfast', 'omlete']
      });
      Menu.create({
        name: 'steak',
        price: 12.99,
        categories: ['dinner', 'entree']
      });
      Menu.create({
        name: 'reuben',
        price: 6.99,
        categories: ['lunch', 'sandwhich']
      });
      Menu.create({
        name: 'soft drink',
        price: 1.99,
        categories: ['drinks', 'soda']
      });
      //create mock user
      User.create({
         'username': 'resposadmin',
         'password': 'igzSwi7*Creif4V$',
         'roles': ['admin']
      }, () => {
        //setup a request to get authentication token
        chai.request(app)
            //request to /auth/local
            .post('/auth/local')
            //set header
            .set('Accept', 'application/json')
            //send credentials
            .send({
               'username': 'resposadmin',
               'password': 'igzSwi7*Creif4V$'
            })
            //when finished
            .end((err, res) => {
              //set token for auth in other requests
              token = res.body.token;
              done();
            });
      });

    });
  });
  //teardown after tests
  after((done) => {
    //delete contents of menu in mongodb
    Menu.remove(null, () => {
      User.remove(null, () => {
        //stop the server
        this.server.close(function() {});
        done();
      });
    });

  });
  it('registered the menus service', () => {
    assert.ok(app.service('menus'));
  });
  it('should post the menuitem data', function(done) {
      //setup a request
      chai.request(app)
          //request to /store
          .post('/menus')
          .set('Accept', 'application/json')
          .set('Authorization', 'Bearer '.concat(token))
          //attach data to request
          .send({
              name: 'shrimp fettuccine',
              price: 12.99,
              categories: 'dinner, pasta'
          })
          //when finished do the following
          .end((err, res) => {
              res.body.should.have.property('name');
              res.body.name.should.equal('shrimp fettuccine');
              res.body.should.have.property('price');
              res.body.price.should.equal(12.99);
              res.body.categories.should.be.an('array')
                  .to.include.members(['dinner, pasta']);
              done();
          });
  });
});
```
This test file create some mock menu items and a user with admin rights in the before section. This section also has some logic to get a token. The token is then passed as a part of the request. With this code in place you can run it using either of the following commands:
```js
mocha test/services/menu/index.test.js

npm run test
```
#Testing Routes
The above example showed how to make a post request. Included here are other code snippets for making requests to different routes:
```js
//test for put for /menuitem
it('should update the menuitem data', function(done) {
  //test for put for /menuitem
  chai.request(app)
      //request to /menuitem
      .put('/menus/' + res.body.data[2]._id)
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer '.concat(token))
      //attach data to request
      .send({
            name: 'steak sub',
            price: 10.99,
            categories: 'dinner, sandwhich'
          }
      )
      //when finished do the following
      .end(function(err, res) {
          res.body.should.have.property('name');
          res.body.name.should.equal('steak sub');
        });
      });
```
```js
it('should delete the menu item data', function(done) {
  //test for delete for /menuitem
  chai.request(app)
      //request to /menuitem
      .delete('/menus/' + res.body.data[4]._id)
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer '.concat(token))
      //when finished do the following
      .end(function(err, res) {
          //check returned json against expected value
          res.body.name.should.be.a('string');
          res.body.name.should.equal('soft drink');
        });
      });
    });
```
```js
//test for /menu get request
it('should get menu items', (done) => {
          //setup a request
          chai.request(app)
          //request to /menu
          .get('/menus')
          .set('Accept', 'application/json')
          .set('Authorization', 'Bearer '.concat(token))
          //when finished do the following
          .end((err, res) => {
              //ensure menu items have specific properties
              res.body.data.should.be.a('array');
              res.body.data[0].should.have.property('name');
              res.body.data[0].name.should.equal('hamburger');
            });
          });
```
The following code denotes that I have gotten the id used in MongoDB and passed that value into the route:
```js
res.body.data[4]._id
```
You can view a demo of the files in [the following link](https://github.com/feathersjs/feathers-demos/tree/master/examples/testing/testing-mocha-chai-auth). These files are based on using FeathersJS generate file structure.
