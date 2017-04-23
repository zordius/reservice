import { setReq } from '../../src/actions/routing';

describe('src/actions/routing', () => {
  describe('setReq()', () => {
    it('should create an action', () => expect(setReq()).toEqual({
      type: 'SET_REQ',
    }));
  });
});
