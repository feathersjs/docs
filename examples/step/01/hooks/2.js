
// Example - Use soft deletes with a service

const expressServerConfig = require('../common/expressServerConfig');
const expressMiddleware = require('../common/expressMiddleware');
const rest = require('feathers-rest');
const socketio = require('feathers-socketio');
const NeDB = require('nedb');
const path = require('path');
const service = require('feathers-nedb');

const Ajv = require('ajv');
const authHooks = require('feathers-authentication-local').hooks;
const hooks = require('feathers-hooks');
const commonHooks = require('feathers-hooks-common');

const app = expressServerConfig()
  .configure(hooks())
  .configure(rest())
  .configure(socketio())
  .configure(services)
  .configure(expressMiddleware);

const server = app.listen(3030);
server.on('listening', () => console.log(`Feathers application started on port 3030`));

function services() {
  this.configure(user);
}

function user() {
  const app = this;

  app.use('/users', service({ Model: userModel() }));
  const userService = app.service('users');

  const {
    softDelete, when,
    setCreatedAt, setUpdatedAt, unless, remove, validateSchema
  } = commonHooks;

  userService.before({
    all: when(hook => hook.method !== 'find', softDelete()),
    create: [
      validateSchema(userSchema(), Ajv),
      authHooks.hashPassword(),
      setCreatedAt(),
      setUpdatedAt()
    ]});
  userService.after({
    all: unless(hook => hook.method === 'find', remove('password')),
  });
}

function userModel() {
  return new NeDB({
    filename: path.join('examples', 'step', 'data', 'users.db'),
    autoload: true
  });
}

function userSchema() {
  return {
    title: 'User Schema',
    $schema: 'http://json-schema.org/draft-04/schema#',
    type: 'object',
    required: [ 'email', 'password', 'role' ],
    additionalProperties: false,
    properties: {
      email: { type: 'string', maxLength: 100, minLength: 6 },
      password: { type: 'string', maxLength: 30, minLength: 8 },
      role: { type: 'string' }
    }
  };
}
