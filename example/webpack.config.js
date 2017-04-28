import webpack from 'webpack'
import path from 'path'

const pageSrcPath = path.join(__dirname, '/src/')
const pagePolyfills = []
const pageExtendModules = ['webpack-hot-middleware/client']
const publicPath = '/statics/bundle'

module.exports = {
  entry: {
    reduxapp: [...pagePolyfills, pageSrcPath + 'reduxapp.js', ...pageExtendModules]
  },
  output: {
    filename: '[name].js',
    path: path.join(__dirname, publicPath),
    publicPath: publicPath + '/'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: [
          {
            loader: 'babel-loader'
          }
        ]
      }
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
      NODE_ENV: 'development'
    })
  ]
}
