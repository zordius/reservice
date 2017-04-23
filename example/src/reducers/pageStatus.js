import { handleActions } from 'redux-actions';

import { startLoading, stopLoading } from '../actions/pageStatus';

const initialState = {
  isLoading: false,
};

const reducerMap = {
  // To get mapped action.type you can just use actionCreators
  // as string, for example: [startLoading] === 'START_LOADING'
  // So you do not need to define another const for action.type.
  // This is the magic from the redux-actions module, document:
  // https://github.com/acdlite/redux-actions
  [startLoading]: state => ({ ...state, isLoading: true }),
  [stopLoading]: state => ({ ...state, isLoading: false }),
};

export default handleActions(reducerMap, initialState);
