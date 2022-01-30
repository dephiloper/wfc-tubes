/* eslint-disable */

const { merge } = require('webpack-merge');
const { DefinePlugin } = require('webpack');
const commonConfig = require('./');

const ASSET_PATH = process.env.ASSET_PATH || '/';

module.exports = merge(commonConfig, {
  mode: 'development',
  entry: [
    'webpack-dev-server/client?http://localhost:8080', // bundle the client for webpack-dev-server and connect to the provided endpoint
    'webpack/hot/only-dev-server', // bundle the client for hot reloading, only- means to only hot reload for successful updates
    './src/main.ts' // the entry point of our app
  ],
  devServer: {
    hot: true, // enable HMR on the server
    port: 8080,
    static: ['./src', './public'],
  },
  output: {
    publicPath: ASSET_PATH
  },
  plugins: [
    new DefinePlugin({
      'process.env.ASSET_PATH' : JSON.stringify(ASSET_PATH)
    })
  ]
});