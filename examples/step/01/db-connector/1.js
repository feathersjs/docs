
// Example - Create service on server with NeDB database

/// [dependencies]
const feathers = require('feathers');
const NeDB = require('nedb');
const path = require('path');
const service = require('feathers-nedb');
//! [dependencies]

/// [feathers]
const app = feathers()
  .configure(services);
//! [feathers]

/// [create]
const users = app.service('/users');

Promise.all([
  users.create({ email: 'jane.doe@gmail.com', password: '11111', role: 'admin' }),
  users.create({ email: 'john.doe@gmail.com', password: '22222', role: 'user' }),
  users.create({ email: 'judy.doe@gmail.com', password: '33333', role: 'user' })
])
//! [create]
/// [results]
  .then(results => {
    console.log('created Jane Doe item\n', results[0]);
    console.log('created John Doe item\n', results[1]);
    console.log('created Judy Doe item\n', results[2]);
    
    return users.find()
      .then(results => console.log('find all items\n', results));
  })
  .catch(err => console.log('Error occurred:', err));
//! [results]

/// [services]
function services() {
  this.use('/users', service({ Model: userModel() }));
}

function userModel() {
  return new NeDB({
    filename: path.join('examples', 'step', 'data', 'users.db'),
    autoload: true
  });
}
//! [services]
