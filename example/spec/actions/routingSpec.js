import { setRoute } from '../../src/actions/routing'

describe('src/actions/routing', () => {
  describe('setRoute()', () => {
    it('should create an action', () => expect(setRoute()).toEqual({
      type: 'SET_ROUTE'
    }))
  })
})
