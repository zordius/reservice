// * This is the default express application.
//   You can setup common middlewares for both
//   production or development environment here,
//   then export the express app.
// * You CAN NOT do anything related to development here,
//   please do development setup inside development.js.
// * You CAN NOT do any production only logic here,
//   please do production setup inside production.js.
// * You CAN NOT app.listen() here,
//   the port logic should be decided by
//   production.js or development.js
// * You can adopt polyfills here for only server side,
//   this file should not be bundled to client side.
// * You may need to add same polyfills to require in .nycrc file
//   or you will see error when you do npm test
// * You can not add polyfill for client side here
//   please add client side polyfill to pagePolyfills in webpack.config.js

// Adopt fetch polyfill
import 'isomorphic-fetch'

import express from 'express'
import bodyParser from 'body-parser'
import { createMiddlewareByServiceList, settleRequest } from 'reservice'
import { configureStore } from './reduxapp'
import { setRoute } from './actions/routing'
import services from './services/index'
import renderFullHtml from './lib/renderFullHtml'
import routing from './routing'

const app = express()

// reservice need to access body as json
app.use(bodyParser.json())

// adopt reservice here
app.use(createMiddlewareByServiceList(services))

// Set up middleware for redux app to do server side rendering.
app.use((req, res, next) => {
  const route = routing.getRoute(req.url, { method: req.method })

  if (!route) {
    return next()
  }

  const store = configureStore()
  store.dispatch(settleRequest(req))
  store.dispatch(setRoute(route))

  return route.config.handler(store, route)
  .then(() => res.send(renderFullHtml(store)), err => next(err))
})

export default app
