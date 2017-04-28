import React from 'react'
import { render } from 'react-dom'
import PropTypes from 'prop-types'
import { applyMiddleware, createStore } from 'redux'
import { Provider } from 'react-redux'

import reducer from './reducers/index'
import middlewares from './middlewares/index'
import Main from './containers/MainComponent'

// create the redux store with or without initial state
export const initStore = initState => (initState ? createStore(
  reducer,
  initState,
  applyMiddleware(...middlewares)
) : createStore(
  reducer,
  applyMiddleware(...middlewares)
))

export const MainComponent = ({ store }) => <Provider store={store}>
  <Main />
</Provider>

MainComponent.propTypes = {
  store: PropTypes.object.isRequired
}

if (global.window) {
  render(<MainComponent store={initStore(global.window.REDUXDATA)} />, global.window.document.getElementById('main'))
}

if (module.hot) {
  module.hot.accept()
}
