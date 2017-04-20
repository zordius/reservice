import { ReserviceError, createService, isBadService, isService } from '../src';

describe('reservice', () => {
  describe('ReserviceError', () => {
    it('should be a standard Error', () => {
      expect(new ReserviceError('test') instanceof Error).toBe(true);
    });

    it('should be a extended Error', () => {
      expect(new ReserviceError('test') instanceof ReserviceError).toBe(true);
    });

    it('should keep action when proviced', () => {
      const action = { type: 'test', payload: 'haha' };
      const err = new ReserviceError('test', action);
      expect(err.action).toBe(action);
    });
  });

  describe('createService()', () => {
    it('should return action creator', () => {
      expect(typeof createService()).toBe('function');
    });

    it('should keep service name in .toString()', () => {
      expect(createService('SERVICE_NAME').toString()).toBe('SERVICE_NAME');
    });

    it('should keep service name in action.meta.serviceName', () => {
      expect(createService('SERVICE_NAME')().meta.serviceName).toBe('SERVICE_NAME');
    });

    it('should provide default payload logic', () => {
      expect(createService('thisIsService')('yo', 'ya')).toEqual({
        type: 'CALL_SERVICE',
        payload: 'yo',
        meta: {
          serviceName: 'thisIsService',
          serviceState: 'CREATED',
        },
      });
    });

    it('should handle payload creator correctly', () => {
      const payloadCreator = (arg1, arg2) => ({ foo: arg1, bar: arg2 });

      expect(createService('SERVICE_NAME', payloadCreator)('yo', 'ya')).toEqual({
        type: 'CALL_SERVICE',
        payload: {
          foo: 'yo',
          bar: 'ya',
        },
        meta: {
          serviceName: 'SERVICE_NAME',
          serviceState: 'CREATED',
        },
      });
    });
  });

  describe('isBadService()', () => {
    it('should detect no meta issue', () => {
      expect(isBadService({ type: 'CALL_SERVICE' })).toEqual({
        type: 'CALL_SERVICE',
        payload: new ReserviceError('no action.meta', { type: 'CALL_SERVICE' }),
        error: true,
        meta: {
          serviceState: 'END',
          previous_action: {
            type: 'CALL_SERVICE',
          },
        },
      });
    });

    it('should detect no meta.serviceName issue', () => {
      expect(isBadService({ type: 'CALL_SERVICE', meta: {} })).toEqual({
        type: 'CALL_SERVICE',
        payload: new ReserviceError('no action.meta.serviceName'),
        error: true,
        meta: {
          serviceState: 'END',
          previous_action: {
            type: 'CALL_SERVICE',
            meta: {},
          },
        },
      });
    });

    it('should detect no meta.serviceState issue', () => {
      expect(isBadService({ type: 'CALL_SERVICE', meta: { serviceName: 'OK' } })).toEqual({
        type: 'CALL_SERVICE',
        payload: new ReserviceError('no action.meta.serviceState'),
        error: true,
        meta: {
          serviceName: 'OK',
          serviceState: 'END',
          previous_action: {
            type: 'CALL_SERVICE',
            meta: {
              serviceName: 'OK',
            },
          },
        },
      });
    });
  });

  describe('isService()', () => {
    it('should return true when service is valid', () => {
      expect(isService(createService('TEST')())).toEqual(true);
    });

    it('should return false when no input', () => {
      expect(isService()).toEqual(false);
    });

    it('should return false when is not service action', () => {
      expect(isService({ type: 'any' })).toEqual(false);
    });

    it('should return false when is not a valid service action', () => {
      expect(isService({ type: 'CALL_SERVICE' })).toEqual(null);
    });
  });
});
