import router from '../src/router';

describe('src/router', () => {
  it('should export router object', () => {
    expect(router.getRoute).toEqual(jasmine.any(Function));
  });
});
