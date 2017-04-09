'use strict';

const path = require('path');
const serveStatic = require('feathers').static;
const favicon = require('serve-favicon');
const compress = require('compression');
const feathers = require('feathers');
const configuration = require('feathers-configuration');
const hooks = require('feathers-hooks');
const rest = require('feathers-rest');
const bodyParser = require('body-parser');
const socketio = require('feathers-socketio');
const middleware = require('./middleware');
const services = require('./services');

const app = feathers();

app.configure(configuration(path.join(__dirname, '..')));

app.use(compress())
  .use(favicon( path.join(app.get('public'), 'favicon.ico') ))
  .use('/', serveStatic( app.get('public') ))
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: true }))
  .configure(hooks())
  .configure(rest())
  .configure(socketio())
  .configure(services)
  .configure(middleware);

loadDatabases(app);

module.exports = app;

function loadDatabases(app) {
  let userIds = [];
  const teams = app.service('/teams');
  const users = app.service('/users');
  
  console.log('\nClear databases.');
  Promise.all([
    teams.remove(null),
    users.remove(null)
  ])
    .then (() => {
      console.log('\nLoad users.');
      return  Promise.all([
        users.create({ email: 'jane.doe@gmail.com', password: '11111', role: 'admin, tank' }),
        users.create({ email: 'john.doe@gmail.com', password: '22222', role: 'user, heals' }),
        users.create({ email: 'judy.doe@gmail.com', password: '33333', role: 'user' }),
        users.create({ email: 'jack.doe@gmail.com', password: '44444', role: 'user' }),
        users.create({ email: 'tom.smith@gmail.com', password: '55555', role: 'user' }),
        users.create({ email: 'bob.smith@gmail.com', password: '66666', role: 'user' }),
        users.create({ email: 'joe.smith@gmail.com', password: '77777', role: 'user' }),
        users.create({ email: 'tim.lee@gmail.com', password: '88888', role: 'user, damage' }),
        users.create({ email: 'tod.lee@gmail.com', password: '99999', role: 'user' }),
        users.create({ email: 'sam.lee@gmail.com', password: '00000', role: 'user' }),
      ])
    })
    .then(results => {
      userIds = results.map(user => user._id); // This way is not elegant but easy to understand.
  
      console.log('\nLoad teams.');
      return Promise.all([
        teams.create({ name: 'Doe family', type: 'family', memberIds: [userIds[0], userIds[1], userIds[2], userIds[3]]}),
        teams.create({ name: 'Smith family', type: 'family', memberIds: [userIds[4], userIds[5], userIds[6]]}),
        teams.create({ name: 'Lee family', type: 'family', memberIds: [userIds[7], userIds[8], userIds[9]]}),
        teams.create({ name: 'Fires of Heaven', type: 'dungeon', memberIds: [userIds[0], userIds[1], userIds[7]]}),
      ]);
    })
    .then(() => {
      console.log('\nDatabases loaded.');
    })
}
