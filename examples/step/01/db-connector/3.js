
// Example - Create service on server with postgres database

const Sequelize = require('sequelize');
const path = require('path');

const feathers = require('feathers');
const service = require('feathers-sequelize');

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
  const sequelize = new Sequelize('postgres://postgres:@localhost:5432/feathers', {
    dialect: 'postgres',
    logging: false
  });
  return sequelize;
  // app isn't defined at that moment
  //app.set('sequelize', sequelize);
}

function userModel() {
  // app isn't defined at that moment
  //const sequelize = app.get('sequelize');
  const sequelize = databaseConnect();

  const tableSchema = sequelize.define('users', {
      email: { type: Sequelize.STRING, allowNull: false, unique: true },
      password: { type: Sequelize.STRING, allowNull: false },
      role: { type: Sequelize.STRING, allowNull: false }
    },
    { freezeTableName: true });
  
  tableSchema.sync();
  
  return tableSchema;
}
