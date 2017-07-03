'use strict';

const path = require('path');
const favicon = require('../../node_modules/serve-favicon');
const compress = require('../../node_modules/compression');
const cors = require('../../node_modules/cors');
const helmet = require('../../node_modules/helmet');
const bodyParser = require('../../node_modules/body-parser');

const feathers = require('../../node_modules/feathers');
const configuration = require('../../node_modules/feathers-configuration');
const hooks = require('../../node_modules/feathers-hooks');

const socketio = require('../../node_modules/feathers-socketio');

const middleware = require('./middleware');
const services = require('./services');
const appHooks = require('./app.hooks');

const app = feathers();

// Load app configuration
app.configure(configuration(path.join(__dirname, '..')));
// Enable CORS, security, compression, favicon and body parsing
app.use(cors());
app.use(helmet());
app.use(compress());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(favicon(path.join(app.get('public'), 'favicon.ico')));
// Host the public folder
app.use('/', feathers.static(app.get('public')));

// Set up Plugins and providers
app.configure(hooks());

app.configure(socketio());

// Set up our services (see `services/index.js`)
app.configure(services);
// Configure middleware (see `middleware/index.js`) - always has to be last
app.configure(middleware);
app.hooks(appHooks);

module.exports = app;
