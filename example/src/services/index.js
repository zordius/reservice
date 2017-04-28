import { yelpSearch, yelpBusiness } from '../actions/yelp'
import yelp from './yelp'

// * You should define all services in serviceList,
// * If a service is not listed here, then it can not be executed by redux middleware.
// * The service name should be a service action type.
const serviceList = {
  [yelpSearch]: yelp.search,
  [yelpBusiness]: yelp.business
}

// * Export the full service list as default
export default serviceList
