import webpack from 'webpack';
import fs from 'fs';

const pageSrcPath = __dirname + '/src/';
const pagePolyfills = [];
const pageExtendModules = ['webpack-hot-middleware/client'];
const publicPath = '/statics/bundle';

module.exports = {
  entry: {
    reduxapp: [...pagePolyfills, pageSrcPath + 'reduxapp.js', ...pageExtendModules],
  },
  output: {
    filename: '[name].js',
    path: __dirname + publicPath,
    publicPath: publicPath + '/'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: [
          {
            loader: 'babel-loader',
          },
        ],
      },
    ]
  },
  node: {
    console: true,
    fs: 'empty',
    net: 'mock',
    tls: 'mock'
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'development',
    }),
  ],
};
