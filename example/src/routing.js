import Router from 'routr';
import { yelpSearch, yelpBusiness } from './actions/yelp';

const routing = new Router({
  search: {
    path: '/',
    handler: (store, route) => store.dispatch(yelpSearch(route.query)),
  },
  business: {
    path: '/business/:id',
    handler: (store, route) => store.dispatch(yelpBusiness(route.params.id)),
  },
});

export default routing;
