import nock from 'nock';
import * as reservice from '../src';

const { ReserviceError, createService, isBadService,
        isService, setupServiceEndpoint, createMiddlewareByServiceList,
        serviceMiddleware, settleRequest } = reservice;

describe('reservice', () => {
  const mockServerHOST = 'http://test';
  const mockServerPATH = '/here';
  const mockServerURL = mockServerHOST + mockServerPATH;

  const doneService = (name) => {
    const act = createService(name)();
    act.reservice.state = 'END';
    return act;
  };

  const mockStore = () => ({
    dispatch: jasmine.createSpy('dispatch'),
  });

  const serviceList = {
    foo: param1 => param1,
    bar: (p1, p2) => ({ p1, p2 }),
    err: () => { throw new ReserviceError('bad'); },
  };

  let middleware;

  beforeAll(() => {
    nock(mockServerHOST)
    .persist()
    .post(mockServerPATH, /err1/)
    .reply(555, { message: 'err1 message' })
    .post(mockServerPATH, /err2/)
    .reply(555, { message: 'err2 message', action: 'foo' })
    .post(mockServerPATH, /err3/)
    .reply(555, { message: 'err3 message', stack: 'haha?' })
    .post(mockServerPATH)
    .reply(200, { foo: 'OK' });
  });

  afterAll(() => {
    nock.cleanAll();
  });

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

    it('should keep service name in action.reservice.name', () => {
      expect(createService('SERVICE_NAME')().reservice.name).toBe('SERVICE_NAME');
    });

    it('should provide default payload logic', () => {
      expect(createService('thisIsService')('yo', 'ya')).toEqual({
        type: 'CALL_RESERVICE',
        payload: 'yo',
        reservice: {
          name: 'thisIsService',
          state: 'CREATED',
        },
      });
    });

    it('should handle payload creator correctly', () => {
      const payloadCreator = (arg1, arg2) => ({ foo: arg1, bar: arg2 });

      expect(createService('SERVICE_NAME', payloadCreator)('yo', 'ya')).toEqual({
        type: 'CALL_RESERVICE',
        payload: {
          foo: 'yo',
          bar: 'ya',
        },
        reservice: {
          name: 'SERVICE_NAME',
          state: 'CREATED',
        },
      });
    });
  });

  describe('isBadService()', () => {
    it('should detect no reservice issue', () => {
      expect(isBadService({ type: 'CALL_SERVICE' })).toEqual({
        type: 'CALL_SERVICE',
        payload: new ReserviceError('no action.reservice', { type: 'CALL_SERVICE' }),
        error: true,
        meta: undefined,
        reservice: {
          state: 'END',
          previous_action: {
            type: 'CALL_SERVICE',
          },
        },
      });
    });

    it('should detect no reservice.name issue', () => {
      expect(isBadService({ type: 'CALL_SERVICE', reservice: {} })).toEqual({
        type: 'CALL_SERVICE',
        payload: new ReserviceError('no action.reservice.name'),
        error: true,
        meta: undefined,
        reservice: {
          state: 'END',
          previous_action: {
            type: 'CALL_SERVICE',
            reservice: {},
          },
        },
      });
    });

    it('should detect no reservice.state issue', () => {
      expect(isBadService({ type: 'CALL_SERVICE', reservice: { name: 'OKLA' } })).toEqual({
        type: 'OKLA',
        payload: new ReserviceError('no action.reservice.state'),
        error: true,
        meta: undefined,
        reservice: {
          name: 'OKLA',
          state: 'END',
          previous_action: {
            type: 'CALL_SERVICE',
            reservice: {
              name: 'OKLA',
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
      expect(isService({ reservice: 'CALL_SERVICE' })).toEqual(null);
    });

    it('should return error action when required', () => {
      expect(isService({ reservice: { foo: 1 } }, true)).toEqual({
        type: undefined,
        payload: new ReserviceError('no action.reservice.name'),
        error: true,
        meta: undefined,
        reservice: {
          foo: 1,
          state: 'END',
          previous_action: {
            reservice: { foo: 1 },
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
      expect(createMiddlewareByServiceList).toThrow(new ReserviceError('No serviceList for service middleware! Check the serviceList in your createMiddlewareByServiceList(serviceList)'));
    });

    it('should error when at client side', () => {
      global.window = true;
      expect(() => createMiddlewareByServiceList({})).toThrow(new ReserviceError('createMiddlewareByServiceList() should not be executed at client side!'));
    });
  });

  describe('serviceMiddleware() error', () => {
    it('should throw when service_list is not provided', () => {
      expect(() => serviceMiddleware(mockStore())(() => 0)(createService('test')())).toThrow(new ReserviceError('Wrong serviceMiddleware() at server side! You should create service middleware by serviceMiddleware(serviceList) !'));
    });
  });

  describe('setupServiceEndpoint()', () => {
    it('should be ok', () => setupServiceEndpoint(mockServerURL, 'POST'));
  });

  describe('serviceMiddleware() at client', () => {
    let oldWindow;

    beforeAll(() => {
      oldWindow = global.window;
      global.window = 1;
    });
    afterAll(() => {
      global.window = oldWindow;
    });

    it('should transportServiceToServer()', () => {
      const store = mockStore();
      return serviceMiddleware(store)(() => 0)(createService('foo')()).then(() => {
        expect(store.dispatch).toHaveBeenCalledWith({
          type: 'foo',
          payload: { foo: 'OK' },
          error: false,
          meta: undefined,
          reservice: {
            name: 'foo',
            state: 'END',
            previous_action: {
              type: 'CALL_RESERVICE',
              reservice: {
                name: 'foo',
                state: 'CREATED',
              },
            },
          },
        });
      });
    });

    it('should receive error from server', () => {
      const store = mockStore();
      return serviceMiddleware(store)(() => 0)(createService('err1')()).then(() => {
        expect(store.dispatch).toHaveBeenCalledWith({
          type: 'err1',
          payload: new Error('err1 message'),
          error: true,
          meta: undefined,
          reservice: {
            name: 'err1',
            state: 'END',
            previous_action: {
              type: 'CALL_RESERVICE',
              reservice: {
                name: 'err1',
                state: 'CREATED',
              },
            },
          },
        });
      });
    });

    it('should receive reservice error from server', () => {
      const store = mockStore();
      return serviceMiddleware(store)(() => 0)(createService('err2')()).then(() => {
        expect(store.dispatch).toHaveBeenCalledWith({
          type: 'err2',
          payload: new ReserviceError('err2 message', { action: 'foo' }),
          error: true,
          meta: undefined,
          reservice: {
            name: 'err2',
            state: 'END',
            previous_action: {
              type: 'CALL_RESERVICE',
              reservice: {
                name: 'err2',
                state: 'CREATED',
              },
            },
          },
        });
      });
    });

    it('should receive stack from server', () => {
      const store = mockStore();
      return serviceMiddleware(store)(() => 0)(createService('err3')()).then(() => {
        expect(store.dispatch).toHaveBeenCalledWith({
          type: 'err3',
          payload: new ReserviceError('err3 message', { action: 'foo' }),
          error: true,
          meta: undefined,
          reservice: {
            name: 'err3',
            state: 'END',
            previous_action: {
              type: 'CALL_RESERVICE',
              reservice: {
                name: 'err3',
                state: 'CREATED',
              },
            },
          },
        });
      });
    });
  });

  describe('setupServiceEndpoint() error', () => {
    it('should be ok', () => setupServiceEndpoint(mockServerURL, 'POST'));
    it('should throw when executed after createMiddlewareByServiceList()', () => {
      middleware = createMiddlewareByServiceList(serviceList);
      expect(setupServiceEndpoint).toThrow(new ReserviceError('Wrong setupServiceEndpoint() ! You should to it before serviceMiddleware(serviceList) !'));
    });
  });

  describe('createMiddlewareByServiceList()', () => {
    it('should error when executed twice', () => {
      expect(() => createMiddlewareByServiceList({})).toThrow(new ReserviceError('createMiddlewareByServiceList() should be executed once only!'));
    });

    it('should call next when url is not matched', () => {
      const next = jasmine.createSpy('next');
      middleware({ originalUrl: 'ooxx' }, undefined, next);
      expect(next).toHaveBeenCalled();
    });

    it('should call next when method is not matched', () => {
      const next = jasmine.createSpy('next');
      middleware({ originalUrl: mockServerURL }, undefined, next);
      expect(next).toHaveBeenCalled();
    });

    it('should call next when no req.body', () => {
      const next = jasmine.createSpy('next');
      middleware({ originalUrl: mockServerURL, method: 'POST' }, undefined, next);
      expect(next).toHaveBeenCalled();
    });

    it('should call next when action is not service action', () => {
      const next = jasmine.createSpy('next');
      middleware({ originalUrl: mockServerURL, method: 'POST', body: {} }, undefined, next);
      expect(next).toHaveBeenCalled();
    });

    it('should call next with error when action is not a valid service action', () => {
      const next = jasmine.createSpy('next');
      middleware({ originalUrl: mockServerURL, method: 'POST', body: { reservice: { } } }, undefined, next);
      expect(next).toHaveBeenCalledWith(new ReserviceError('no action.reservice.name'));
    });

    it('should execute service', (done) => {
      const req = {
        originalUrl: mockServerURL,
        method: 'POST',
        body: {
          type: 'CALL_RESERVICE',
          payload: { good: 'morning' },
          reservice: {
            name: 'bar',
            state: 'CREATED',
          },
        },
      };
      middleware(req, {
        send: (act) => {
          expect(act).toEqual(JSON.stringify({
            p1: { good: 'morning' },
            p2: req,
          }));
          done();
        },
      });
    });

    it('should report error when service not found', (done) => {
      const req = {
        originalUrl: mockServerURL,
        method: 'POST',
        body: {
          type: 'CALL_RESERVICE',
          reservice: {
            name: 'not_found',
            state: 'CREATED',
          },
        },
      };
      middleware(req, {
        status: code => ({ send: (err) => {
          expect(code).toEqual(555);
          expect(err).toEqual(JSON.stringify({
            message: 'can not find service named as "not_found" in serviceList',
            action: {
              type: 'CALL_RESERVICE',
              reservice: {
                name: 'not_found',
                state: 'CREATED',
              },
            },
          }));
          done();
        } }),
      });
    });

    it('should report error in service', (done) => {
      const req = {
        originalUrl: mockServerURL,
        method: 'POST',
        body: {
          type: 'CALL_RESERVICE',
          reservice: {
            name: 'err',
            state: 'CREATED',
          },
        },
      };
      middleware(req, {
        status: code => ({ send: (err) => {
          expect(code).toEqual(555);
          expect(err).toEqual(JSON.stringify({
            message: 'bad',
          }));
          done();
        } }),
      });
    });
  });

  describe('serviceMiddleware()', () => {
    it('should bypass when action is not service action', () => {
      const next = jasmine.createSpy('next');
      serviceMiddleware()(next)({ foo: 'bar' });
      expect(next).toHaveBeenCalledWith({ foo: 'bar' });
    });

    it('should return next() result when action is not service action', () => {
      expect(serviceMiddleware()(() => ({ foo: 'bar' }))({})).toEqual({ foo: 'bar' });
    });

    it('should next() error action when action is bad service action', () => {
      const next = jasmine.createSpy('next');
      serviceMiddleware()(next)({ type: 'CX', reservice: { foo: 1 } });
      expect(next).toHaveBeenCalledWith({
        type: 'CX',
        payload: new ReserviceError('no action.reservice.name'),
        error: true,
        meta: undefined,
        reservice: {
          foo: 1,
          previous_action: {
            type: 'CX',
            reservice: { foo: 1 },
          },
          state: 'END',
        },
      });
    });

    it('should return promise when input bad service action', () => {
      expect(serviceMiddleware()(() => 0)({ reservice: 'CALL_SERVICE' }).then).toEqual(jasmine.any(Function));
    });

    it('should bypass when action is done', () => {
      const next = jasmine.createSpy('next');
      const act = doneService('test');
      serviceMiddleware()(next)(act);
      expect(next).toHaveBeenCalledWith(act);
    });

    it('should return next() result when action is done', () => {
      expect(serviceMiddleware()(() => ({ foo: 'bar' }))(doneService('test'))).toEqual({ foo: 'bar' });
    });

    it('should throw when settleRequest() twice', () => {
      const act = settleRequest(123);
      const store = {};

      serviceMiddleware(store)(() => 0)(act);
      expect(() => serviceMiddleware(store)(() => 0)(act)).toThrow(new ReserviceError('Try to dispatch settleRequest(req) twice!'));
    });

    it('should executeServiceAtServer()', () => {
      const store = mockStore();
      return serviceMiddleware(store)(() => 0)(createService('foo')(456)).then(() => {
        expect(store.dispatch).toHaveBeenCalledWith({
          type: 'foo',
          payload: 456,
          error: false,
          meta: undefined,
          reservice: {
            name: 'foo',
            state: 'END',
            previous_action: {
              type: 'CALL_RESERVICE',
              payload: 456,
              reservice: {
                name: 'foo',
                state: 'BEGIN',
              },
            },
          },
        });
      });
    });

    it('should send Error as req when req is not dispatched', () => {
      const store = mockStore();
      return serviceMiddleware(store)(() => 0)(createService('bar')(456)).then(() => {
        expect(store.dispatch).toHaveBeenCalledWith({
          type: 'bar',
          payload: {
            p1: 456,
            p2: new Error('Access request without dispatching settleRequest(req) action!'),
          },
          error: false,
          meta: undefined,
          reservice: {
            name: 'bar',
            state: 'END',
            previous_action: {
              type: 'CALL_RESERVICE',
              payload: 456,
              reservice: {
                name: 'bar',
                state: 'BEGIN',
              },
            },
          },
        });
      });
    });
  });
});
