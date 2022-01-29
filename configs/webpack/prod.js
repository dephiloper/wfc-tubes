const CopyWebpackPlugin = require('copy-webpack-plugin');
const { resolve } = require('path');
const { merge } = require('webpack-merge');

const commonConfig = require('.');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = merge(commonConfig, {
  mode: 'production',
  entry: './src/main.ts',
  output: {
    filename: 'js/bundle.[fullhash].min.js',
    path: resolve(__dirname, '../../dist'),
    publicPath: '/',
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
