import { handleActions } from 'redux-actions'

import { setRoute } from '../actions/routing'

const defaultState = {
  route: {
    name: 'default',
    config: {},
    query: {}
  }
}

export default handleActions({
  [setRoute]: (state, action) => ({ ...state, route: action.payload })
}, defaultState)
