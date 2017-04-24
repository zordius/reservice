import { combineReducers } from 'redux';

import routing from '../reducers/routing';
import yelp from '../reducers/yelp';
import metaHeader from '../reducers/metaHeader';
import pageStatus from '../reducers/pageStatus';

export default combineReducers({ routing, yelp, metaHeader, pageStatus });
