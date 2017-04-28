import Yelp from 'yelp'
import yelpTokenSecret from '../../yelp.cfg.json'

const yelp = new Yelp(yelpTokenSecret)

// A good practice is reduce api results before you return it,
// then the response size of client side service execution will be smaller.
const services = {
  search: params => (params.term
  ? yelp.search(params).then(result =>
    (result.businesses
      ? result.businesses.map(B => ({
        rating_img_url: B.rating_img_url,
        id: B.id,
        name: B.name,
        image_url: B.image_url
      }))
      : []
    ))
  : false),
  business: params => yelp.business(params).then(B => ({
    name: B.name,
    mobile_url: B.mobile_url,
    rating_img_url_small: B.rating_img_url_small,
    url: B.url,
    phone: B.phone,
    image_url: B.image_url
  }))
}

export default services
