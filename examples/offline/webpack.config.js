
const webpack = require('webpack'); // eslint-disable-line import/no-unresolved
const path = require('path');

const example = process.env.EXAMPLE;
const exPath = example ? `/${example}` : '';

const config = {
  context: path.join(__dirname, `.${exPath}/client`),
  entry: './index.js',
  output: {
    path: path.join(__dirname, `.${exPath}/public/dist`),
    filename: 'bundle.js',
  },
  module: {
    loaders: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        loaders: [
          'babel-loader',
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': { NODE_ENV: JSON.stringify(process.env.NODE_ENV || 'development') },
    }),
  ],
  devtool: 'source-map',
};

if (JSON.stringify(process.env.NODE_ENV || 'development') === 'development') {
  config.watch = true;
  config.watchOptions = {
    aggregateTimeout: 300,
      poll: 1000
  };
}

module.exports = config;
