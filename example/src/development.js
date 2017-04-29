// * This is main entry code for development.
// * When you run `npm start`, this script will be used
// * You can do app.listen(port) here,
//   please write port logic for development only.
// * You CAN NOT add any extra for production here,
//   please add production related logic in production.js
// * You can change NODE_ENV to development here

// Because this file is for development only,
// Add these eslint options
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-console */

import webpack from 'webpack'
import express from 'express'

import app from './server'
import webpackConfig from '../webpack.config'

const compiler = webpack(webpackConfig)
const port = process.env.port || 3000
const pwd = process.cwd()

// webpack-dev-middleware provide bundled entry files on the fly
app.use(require('webpack-dev-middleware')(compiler, {
  stats: {
    colors: true,
    cached: false,
    hash: false,
    assets: false,
    timings: false,
    chunks: false,
    version: false
  },
  publicPath: webpackConfig.output.publicPath
}))

// webpack-hot-middleware deliver hotreload feature
app.use(require('webpack-hot-middleware')(compiler))

// Serve all other static files
app.use('/statics', express.static(`${pwd}/statics`))

app.listen(port, () => console.log(`Server start! Listening on port ${port}`))
