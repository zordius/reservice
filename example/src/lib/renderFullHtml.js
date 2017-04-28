import React from 'react'
import PropTypes from 'prop-types'
import { renderToString, renderToStaticMarkup } from 'react-dom/server'
import serialize from 'serialize-javascript'

import { MainComponent } from '../reduxapp'

/* eslint-disable react/no-danger */
const Html = ({ main, state }) => <html>
  <head>
    <title>{state.metaHeader.title}</title>
  </head>
  <body>
    <div id='main' dangerouslySetInnerHTML={{ __html: main }} />
    <script dangerouslySetInnerHTML={{ __html: `var REDUXDATA=${serialize(state)};` }} />
    <script src='/statics/bundle/reduxapp.js' />
  </body>
</html>

Html.propTypes = {
  main: PropTypes.string.isRequired,
  state: PropTypes.object.isRequired
}

const renderFullHtml = (store) => {
  const state = store.getState()
  const main = renderToString(<MainComponent store={store} />)

  return `<!DOCTYPE html>${renderToStaticMarkup(<Html main={main} state={state} />)}`
}

export default renderFullHtml
