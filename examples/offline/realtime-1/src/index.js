
const logger = require('../../node_modules/winston');
const app = require('../../common/src1/app');

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
