
feathersClient
  .configure(feathers.hooks())
  .configure(feathers.authentication({
    storage: window.localStorage
  }));

let jackId;
const users = feathersClient.service('/users');

Promise.all([
  users.create({ email: 'jane.doe@gmail.com', password: '11111', role: 'admin' }),
  users.create({ email: 'john.doe@gmail.com', password: '22222', role: 'user' }),
  users.create({ email: 'judy.doe@gmail.com', password: '33333', role: 'user' }),
  users.create({ email: 'jack.doe@gmail.com', password: '44444', role: 'user' })
])
  .then(results => {
    console.log('created Jane Doe item\n', results[0]);
    console.log('created John Doe item\n', results[1]);
    console.log('created Judy Doe item\n', results[2]);
    console.log('created Jack Doe item\n', results[3]);
    
    jackId = results[3]._id;
    
    return feathersClient.authenticate({
      type: 'local',
      'email': 'jane.doe@gmail.com',
      'password': '11111'
    })
      .then(() => console.log('\nAuthenticated successfully.\n '))
      .catch(err => console.error('\nError authenticating:', err));
  })
  .then(() => users.remove(jackId)
    .then(results => console.log('deleted Jack Doe item\n', results))
  )
  .then(() => users.find()
    .then(results => console.log('find all items\n', results))
  )
  .catch(err => console.log('Error occurred:', err));
