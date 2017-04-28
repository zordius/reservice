import React from 'react'
import { render } from 'react-dom'
import PropTypes from 'prop-types'
import { applyMiddleware, createStore, compose } from 'redux'
import { Provider } from 'react-redux'
import reduxLogger from 'redux-logger'

import reducer from './reducers/index'
import middlewares from './middlewares/index'
import Main from './containers/MainComponent'

// create the redux store with initial state
export const configureStore = (initState) => {
  const devTool = global.window ? global.window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ : undefined
  const composeEnhancers = devTool || compose

  if (global.window && !devTool) {
    middlewares.push(reduxLogger)
  }

  return createStore(
    reducer,
    initState,
    composeEnhancers(applyMiddleware(...middlewares))
  )
}

export const MainComponent = ({ store }) => <Provider store={store}>
  <Main />
</Provider>

MainComponent.propTypes = {
  store: PropTypes.object.isRequired
}

if (global.window) {
  render(<MainComponent store={configureStore(global.window.REDUXDATA)} />, global.window.document.getElementById('main'))
}

if (module.hot) {
  module.hot.accept()
}
