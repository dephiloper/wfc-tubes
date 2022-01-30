const { resolve } = require('path');
const { merge } = require('webpack-merge');
const { DefinePlugin } = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const commonConfig = require('.');
const ASSET_PATH = process.env.ASSET_PATH || '/wfc-tubes';

module.exports = merge(commonConfig, {
  mode: 'production',
  entry: './src/main.ts',
  output: {
    filename: 'js/bundle.[fullhash].min.js',
    path: resolve(__dirname, '../../dist'),
    publicPath: ASSET_PATH
  },
  devtool: 'source-map',
  plugins: [
    new DefinePlugin({
      'process.env.ASSET_PATH': JSON.stringify(ASSET_PATH)
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'src/prototypes.yaml',
        },
        {
          from: 'src/models/',
          to: './models/',
        },
        {
          from: 'src/models/',
          to: './models/',
        },
        {
          from: 'public/style.css'
        }
      ]
    }),
    new CleanWebpackPlugin(),
  ],
});
