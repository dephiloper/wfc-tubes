const { resolve } = require('path');
const { merge } = require('webpack-merge');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const commonConfig = require('.');

module.exports = merge(commonConfig, {
  mode: 'production',
  entry: './src/main.ts',
  output: {
    filename: 'js/bundle.[fullhash].min.js',
    path: resolve(__dirname, '../../dist'),
    publicPath: 'auto'
  },
  devtool: 'source-map',
  plugins: [
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
