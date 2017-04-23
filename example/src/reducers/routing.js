import { handleActions } from 'redux-actions';

import { setReq } from '../actions/routing';

const defaultState = {
  route: {
    name: 'default',
    config: {},
    query: {},
  },
};

export default handleActions({
  [setReq]: (state, action) => ({ ...state, route: action.payload.route }),
}, defaultState);
