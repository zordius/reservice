import { setReq } from '../actions/routing';
import { yelpSearch, yelpBusiness } from '../actions/yelp';

const preparePagesMiddleware = store => next => (action) => {
  const result = next(action);

  if (action.type !== setReq.toString()) {
    return result;
  }

  const route = action.payload.route;

  switch (route.name) {
    case 'search':
      return store.dispatch(yelpSearch(route.query));
    case 'business':
      return store.dispatch(yelpBusiness(route.params.id));
    default:
      return Promise.reject(new Error(`Route ${route.name} not handled!`));
  }
};

export default preparePagesMiddleware;
