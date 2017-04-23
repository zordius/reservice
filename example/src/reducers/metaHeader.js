import { handleActions } from 'redux-actions';

import { setTitle } from '../actions/metaHeader';

const initialState = {
  title: 'Redux exmaple',
};

const reducerMap = {
  // To get mapped action.type you can just use actionCreators
  // as string, for example: [setTitle] === 'SET_TITLE'
  // So you do not need to define another const for action.type.
  // This is the magic from the redux-actions module, document:
  // https://github.com/acdlite/redux-actions
  [setTitle]: (state, action) => ({ ...state, title: `Redux example - ${action.payload}` }),
};

export default handleActions(reducerMap, initialState);
