import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { yelpSearch } from '../actions/yelp';

import YelpSearchList from '../components/YelpSearchList';
import YelpBusiness from '../components/YelpBusiness';
import YelpSearch from '../components/YelpSearch';

const routeMain = (name) => {
  switch (name) {
    case 'search':
      return YelpSearchList;
    case 'business':
      return YelpBusiness;
    default:
      return () => <div>Route not found</div>;
  }
};

const mapStateToProps = state => ({
  Main: routeMain(state.routing.route.name),
  yelp: state.yelp,
  query: state.routing.route.query,
  loading: state.pageStatus.isLoading,
});

const mapDispatchToProps = dispatch => ({
  onSubmit: term => dispatch(yelpSearch({ term })),
});

const MainComponent = ({ Main, yelp, query, loading, onSubmit }) => <div>
  <YelpSearch query={query} onSubmit={onSubmit} />
  {loading ? <div className="loading">Now loading...</div> : <Main yelp={yelp} />}
</div>;

MainComponent.propTypes = {
  Main: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  query: PropTypes.object.isRequired,
  yelp: PropTypes.object.isRequired,
  loading: PropTypes.bool.isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(MainComponent);
