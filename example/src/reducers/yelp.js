// In this example you can see a common reducer coding style for service actions
import { handleServiceActions } from 'reservice'

import { yelpSearch, yelpBusiness } from '../actions/yelp'

const initialState = {
  search: false,
  business: {}
}

const reducers = {
  // To get mapped action.type you can just use actionCreators
  // as string, for example: [setTitle] === 'SET_TITLE'
  // So you do not need to define another const for action.type.
  // This is the magic from the redux-actions module, document:
  // https://github.com/acdlite/redux-actions
  [yelpSearch]: (state, action) => ({ ...state, search: action.payload }),
  [yelpBusiness]: (state, action) => ({ ...state, business: action.payload })
}

// We prefer to export only 1 reducer as default per file.
// If you like to split the reducer logics, put them into sub directory,
// or export as another name.
// handleServiceActions() help you to create a reducer function for service actions
export default handleServiceActions(reducers, initialState)
