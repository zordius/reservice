import Router from 'routr';

const router = new Router({
  search: {
    path: '/',
  },
  business: {
    path: '/business/:id',
  },
});

export default router;
