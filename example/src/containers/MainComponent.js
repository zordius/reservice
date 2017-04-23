import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

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
});

const MainComponent = ({ Main, yelp, query }) => <div>
  <YelpSearch query={query} />
  <Main yelp={yelp} />
</div>;

MainComponent.propTypes = {
  Main: PropTypes.func.isRequired,
  query: PropTypes.object.isRequired,
  yelp: PropTypes.object.isRequired,
};

export default connect(mapStateToProps)(MainComponent);
