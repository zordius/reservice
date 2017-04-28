import debug from 'debug'

const debugDispatch = debug('redux:dispatch')
const debugState = debug('redux:state')

// A simple logger at server side
const debugLogger = store => next => (action) => {
  debugDispatch('%O', action)
  const result = next(action)
  debugState('%O', store.getState())
  return result
}

export default debugLogger
