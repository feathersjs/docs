
// Example - Create service on server with mongoDB database

const mongoose = require('mongoose');
const path = require('path');

const feathers = require('feathers');
const service = require('feathers-mongoose');

databaseConnect();

const app = feathers()
  .configure(services);

const users = app.service('users');

Promise.all([
  users.create({ email: 'jane.doe@gmail.com', password: 'X2y6', role: 'admin' }),
  users.create({ email: 'john.doe@gmail.com', password: 'i6He', role: 'user' }),
  users.create({ email: 'judy.doe@gmail.com', password: '7jHw', role: 'user' })
])
  .then(results => {
    console.log('created Jane Doe item\n', results[0]);
    console.log('created John Doe item\n', results[1]);
    console.log('created Judy Doe item\n', results[2]);
    
    users.find()
      .then(results => console.log('find all items\n', results))
  })
  .catch(err => console.log(err));

function services() {
  this.use('/users', service({ Model: userModel() }));
}

function databaseConnect() {
  mongoose.connect('mongodb://localhost:27017/feathersMongodb');
  mongoose.Promise = global.Promise;
}

function userModel() {
  const tableSchema =  new mongoose.Schema({
    email: {type: String, required: true, unique: true},
    password: { type: String, required: true },
    role: {type: String, required: true},
    
    createdAt: { type: Date, 'default': Date.now },
    updatedAt: { type: Date, 'default': Date.now }
  });
  
  return mongoose.model('user', tableSchema);
}
