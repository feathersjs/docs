const NeDB = require('../../../node_modules/nedb');
const path = require('path');

module.exports = function (app) {
  const dbPath = app.get('nedb');
  const Model = new NeDB({
    inMemoryOnly: true, // added to generated code
    filename: path.join(dbPath, 'remote-service.db'),
    autoload: true
  });

  return Model;
};
