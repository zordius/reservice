import React from 'react'
import PropTypes from 'prop-types'

import YelpSearchItem from './YelpSearchItem'

const YelpSearchList = ({ yelp }) => (yelp.search.map
  ? <ul>{yelp.search.length
    ? yelp.search.map(item => <YelpSearchItem item={item} key={item.id} />)
    : <li key='not_found'>Not Found!</li>
    }</ul>
  : <div key='please_search'>Input keyword to Search...</div>)

YelpSearchList.propTypes = {
  yelp: PropTypes.object.isRequired
}

export default YelpSearchList
