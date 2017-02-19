
// Example - Create REST API, and serve static files

const expressServerConfig = require('../common/expressServerConfig');
const expressMiddleware = require('../common/expressMiddleware');
const rest = require('feathers-rest');
const NeDB = require('nedb');
const path = require('path');
const service = require('feathers-nedb');

const app = expressServerConfig()
  .configure(rest())
  .configure(services)
  .configure(expressMiddleware);

const server = app.listen(3030);
server.on('listening', () => console.log(`Feathers application started on port 3030`));

function services() {
  this.use('/users', service({ Model: userModel() }));
}

function userModel() {
  return new NeDB({
    filename: path.join('examples', 'step', 'data', 'users.db'),
    autoload: true
  });
}
