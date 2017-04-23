import { yelpSearch, yelpBusiness } from '../../src/actions/yelp';

describe('src/actions/yelp', () => {
  describe('yelpSearch()', () => {
    const payload = {
      term: 'test',
      location: 'Taiwan',
      category_filter: 'active',
      limit: 30,
    };

    it('should create action by default', () => expect(yelpSearch()).toEqual({
      type: 'CALL_SERVICE',
      payload: {
        term: undefined,
        location: 'Taipei',
        category_filter: undefined,
        limit: undefined,
      },
      meta: {
        serviceName: 'YELP_SEARCH',
        serviceState: 'CREATED',
      },
    }));

    it('should create action with input', () => expect(yelpSearch(payload)).toEqual({
      type: 'CALL_SERVICE',
      payload,
      meta: {
        serviceName: 'YELP_SEARCH',
        serviceState: 'CREATED',
      },
    }));
  });

  describe('yelpBusiness()', () => {
    it('should create action by default', () => expect(yelpBusiness()).toEqual({
      type: 'CALL_SERVICE',
      meta: {
        serviceName: 'YELP_BUSINESS',
        serviceState: 'CREATED',
      },
    }));

    it('should create action with input', () => expect(yelpBusiness(123)).toEqual({
      type: 'CALL_SERVICE',
      payload: 123,
      meta: {
        serviceName: 'YELP_BUSINESS',
        serviceState: 'CREATED',
      },
    }));
  });
});
