import Router from 'routr';

const routing = new Router({
  search: {
    path: '/',
  },
  business: {
    path: '/business/:id',
  },
});

export default routing;
