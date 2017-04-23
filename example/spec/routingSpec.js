import routing from '../src/routing';

describe('src/routing', () => {
  it('should export router object', () => {
    expect(routing.getRoute).toEqual(jasmine.any(Function));
  });
});
