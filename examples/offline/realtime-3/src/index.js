
const serverPublication = require('feathers-offline-publication/lib/server');
const commonPublications = require('feathers-offline-publication/lib/common-publications');
const { stashBefore } = require('feathers-hooks-common');

const logger = require('../../node_modules/winston');
const app = require('../../common/src1/app');


// "publication" support
const stockRemote = app.service('stock');
stockRemote.hooks({
  before: {
    update: stashBefore(),
    patch: stashBefore(),
    remove: stashBefore(),
  },
});

serverPublication(app, commonPublications, 'stock');



const port = app.get('port');
const server = app.listen(port);

const testSetup = require('./test-setup');

process.on('unhandledRejection', (reason, p) =>
  logger.error('Unhandled Rejection at: Promise ', p, reason)
);

server.on('listening', () =>
  logger.info(`Feathers application started on ${app.get('host')}:${port}`)
);

testSetup(app)
  .then(() => logger.info('Server ready'));
