// All action creators should follow Flux Standard Action
// please read https://github.com/acdlite/flux-standard-action
// In most time createService() is enough for almost every use cases
import { createService } from 'reservice';

// Use createService(service_type, payload_creator) to create an action creator to run a service.
export const yelpSearch = createService('YELP_SEARCH', ({ term, location = 'New York', limit = 20, category_filter } = {}) => ({ term, location, limit, category_filter }));
export const yelpBusiness = createService('YELP_BUSINESS');
