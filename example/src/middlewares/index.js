// This is a place to put middleware list for your application
import { serviceMiddleware } from 'reservice'
import debugLogger from './debugLogger'

const middlewares = [
  serviceMiddleware
]

// You can adopt middlewares for development
if (process.env.NODE_ENV === 'development') {
  /* eslint-disable import/no-extraneous-dependencies */
  /* eslint-disable global-require */
  if (global.window) {
    middlewares.push(require('redux-logger').default)
  } else {
    middlewares.push(debugLogger)
  }
}

export default middlewares
