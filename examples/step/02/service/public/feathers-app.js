
feathersClient
  .configure(feathers.hooks())
  .configure(feathers.authentication({
    storage: window.localStorage
  }));

const teams = feathersClient.service('/teams');

feathersClient.authenticate({
  type: 'local',
  'email': 'jane.doe@gmail.com',
  'password': '11111'
})
  .then(() => {
    // Find team items, and join the user items of their members
    teams.find({ query: { type: 'dungeon' }})
      .then(results => {
        console.log('\nAll dungeon teams\n', JSON.stringify(results.data, null, 2));
      });
    
    teams.find({ query: { name: 'Lee family' }})
      .then(results => {
        console.log('\nLee family\n', JSON.stringify(results.data, null, 2));
      });
  })
  .catch(err => console.log('\nError occurred:', err));
