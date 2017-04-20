import { ReserviceError, createService, isBadService, isService, setupServiceEndpoint, createMiddlewareByServiceList, handleServiceActions } from '../src';

describe('reservice', () => {
  let middleware;

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

    it('should return error action when required', () => {
      expect(isService({ type: 'CALL_SERVICE' }, true)).toEqual({
        type: 'CALL_SERVICE',
        payload: new ReserviceError('no action.meta'),
        error: true,
        meta: {
          serviceState: 'END',
          previous_action: {
            type: 'CALL_SERVICE',
          },
        },
      });
    });
  });

  describe('createMiddlewareByServiceList() error', () => {
    let oldWindow;

    beforeAll(() => {
      oldWindow = global.window;
    });
    afterAll(() => {
      global.window = oldWindow;
    });

    it('should error when no serviceList', () => {
      expect(createMiddlewareByServiceList).toThrow(new Error('No serviceList for service middleware! Check the serviceList in your createMiddlewareByServiceList(serviceList)'));
    });

    it('should error when at client side', () => {
      global.window = true;
      expect(() => createMiddlewareByServiceList({})).toThrow(new Error('createMiddlewareByServiceList() should not be executed at client side!'));
    });
  });

  describe('setupServiceEndpoint()', () => {
    it('should be ok', () => setupServiceEndpoint('/', 'POST'));

    it('should throw when executed after createMiddlewareByServiceList()', () => {
      middleware = createMiddlewareByServiceList({
        foo: param1 => param1,
        bar: (p1, p2) => ({ p1, p2 }),
        err: () => { throw new Error('bad'); },
      });
      expect(setupServiceEndpoint).toThrow(new Error('Wrong setupServiceEndpoint() ! You should to it before serviceMiddleware(serviceList) !'));
    });
  });

  describe('createMiddlewareByServiceList()', () => {
    it('should error when executed twice', () => {
      expect(() => createMiddlewareByServiceList({})).toThrow(new Error('createMiddlewareByServiceList() should be executed once only!'));
    });

    it('should call next when url is not matched', () => {
      const next = jasmine.createSpy('next');
      middleware({ originalUrl: 'ooxx' }, undefined, next);
      expect(next).toHaveBeenCalled();
    });

    it('should call next when method is not matched', () => {
      const next = jasmine.createSpy('next');
      middleware({ originalUrl: '/' }, undefined, next);
      expect(next).toHaveBeenCalled();
    });

    it('should call next when no req.body', () => {
      const next = jasmine.createSpy('next');
      middleware({ originalUrl: '/', method: 'POST' }, undefined, next);
      expect(next).toHaveBeenCalled();
    });

    it('should call next when action is not service action', () => {
      const next = jasmine.createSpy('next');
      middleware({ originalUrl: '/', method: 'POST', body: {} }, undefined, next);
      expect(next).toHaveBeenCalled();
    });

    it('should call next with error when action is not a valid service action', () => {
      const next = jasmine.createSpy('next');
      middleware({ originalUrl: '/', method: 'POST', body: { type: 'CALL_SERVICE' } }, undefined, next);
      expect(next).toHaveBeenCalledWith(new ReserviceError('no action.meta'));
    });

    it('should execute service', (done) => {
      const req = {
        originalUrl: '/',
        method: 'POST',
        body: {
          type: 'CALL_SERVICE',
          meta: {
            serviceName: 'foo',
            serviceState: 'CREATED',
          },
        },
      };
      middleware(req, {
        send: (act) => {
          expect(act).toEqual(req);
          done();
        },
      });
    });

    it('should report error when service not found', (done) => {
      const req = {
        originalUrl: '/',
        method: 'POST',
        body: {
          type: 'CALL_SERVICE',
          meta: {
            serviceName: 'not_found',
            serviceState: 'CREATED',
          },
        },
      };
      middleware(req, {
        send: (err) => {
          expect(err).toEqual(new ReserviceError('can not find service named as "not_found" in serviceList'));
          done();
        },
      });
    });

    it('should report error in service', (done) => {
      const req = {
        originalUrl: '/',
        method: 'POST',
        body: {
          type: 'CALL_SERVICE',
          meta: {
            serviceName: 'err',
            serviceState: 'CREATED',
          },
        },
      };
      middleware(req, {
        send: (err) => {
          expect(err).toEqual(new Error('bad'));
          done();
        },
      });
    });
  });

  describe('handleServiceActions()', () => {
    const doneService = (name) => {
      const act = createService(name)();
      act.meta.serviceState = 'END';
      return act;
    };

    it('should create default reducer when no input', () => {
      expect(handleServiceActions()()).toEqual({});
    });

    it('should create reducer to handle default state', () => {
      expect(handleServiceActions(undefined, { foo: 'bar' })()).toEqual({ foo: 'bar' });
    });

    it('should lookup service list then bypass not matched action', () => {
      expect(handleServiceActions({}, { foo: 'bar' })(undefined, doneService('TEST'))).toEqual({ foo: 'bar' });
    });

    it('should execute matched reducer', () => {
      const reducer = jasmine.createSpy('reducer');
      handleServiceActions({ foo: reducer })(3, doneService('foo'));
      expect(reducer).toHaveBeenCalledWith(3, doneService('foo'));
    });
  });
});
