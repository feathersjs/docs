
const bodyParser = require('body-parser');
const compress = require('compression');
const cors = require('cors');
const path = require('path');
const feathers = require('feathers');

module.exports = () => {
  const app = feathers()
    .use(compress())
    .options('*', cors())
    .use(cors())
    .use('/', feathers.static(path.join(__dirname, 'public')))
    .use(bodyParser.json())
    .use(bodyParser.urlencoded({ extended: true }));
  
  return app;
};
