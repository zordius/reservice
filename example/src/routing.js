import Router from 'routr'
import { setTitle } from './actions/metaHeader'
import { yelpSearch, yelpBusiness } from './actions/yelp'

const routing = new Router({
  search: {
    path: '/',
    handler: (store, route) => store.dispatch(yelpSearch(route.query))
  },
  business: {
    path: '/business/:id',
    handler: (store, route) => store.dispatch(yelpBusiness(route.params.id))
      .then(action => store.dispatch(setTitle(action.payload.name)))
  }
})

export default routing
