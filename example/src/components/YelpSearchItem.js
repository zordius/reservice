import React from 'react'
import PropTypes from 'prop-types'

const YelpSearchItem = ({ item }) => <li onClick={() => (global.window.location.href = `/business/${encodeURIComponent(item.id)}`)} >
  <h2>{item.name}</h2><img src={item.rating_img_url} alt='rating' />
</li>

YelpSearchItem.propTypes = {
  item: PropTypes.object.isRequired
}

export default YelpSearchItem
