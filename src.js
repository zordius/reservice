import { createAction } from 'redux-actions';
import yfetch from 'yfetch';
import debug from 'debug';

export const ACTION_TYPE_RESERVICE = 'CALL_RESERVICE';
export const STATE_CREATED = 'CREATED';
export const STATE_BEGIN = 'BEGIN';
export const STATE_END = 'END';
export const ACTION_SET_REQUEST = 'SERVICE_SET_REQUEST';

const DEFAULT_TRANSPORT_PATH = '/_reservice_/';
const DEFAULT_TRANSPORT_METHOD = 'PUT';
let SERVICE_TRANSPORT_PATH = DEFAULT_TRANSPORT_PATH;
let SERVICE_TRANSPORT_METHOD = DEFAULT_TRANSPORT_METHOD;

let SERVICE_LIST = 0;
const SELECTOR_LIST = {};

const debugStart = debug('reservice:start');
const debugReceive = debug('reservice:receive');
const debugSuccess = debug('reservice:success');
const debugSelect = debug('reservice:select');
const debugFail = debug('reservice:fail');
const debugError = debug('reservice:error');

export const createService = (name, payloadCreator, metaCreator) => {
  const actionCreator = createAction(ACTION_TYPE_RESERVICE, payloadCreator, metaCreator);

  const serviceCreator = function serviceCreator(...args) {
    const action = actionCreator(...args);
    action.reservice = {
      name,
      state: STATE_CREATED,
    };
    return action;
  };

  serviceCreator.toString = () => name;

  return serviceCreator;
};

export class ReserviceError extends Error {
  constructor(message, action) {
    super(message);
    if (action) {
      this.action = action;
    }
  }
}

export const resetServiceList = () => {
  if (global.window) {
    throw new ReserviceError('resetServiceList() should not be called at client side!');
  }

  if (process.env.NODE_ENV !== 'test') {
    /* eslint no-console: 0 */
    console.warn(`resetServiceList() should only be called for testing but current NODE_ENV is "${process.env.NODE_ENV}"`);
  }

  SERVICE_LIST = 0;
  Object.keys(SELECTOR_LIST).forEach(name => delete SELECTOR_LIST[name]);
};

// A helper function to help you to create actionCreator for a service

const resultAction = (action, payload) => {
  const error = payload instanceof Error;
  const { type, reservice = {}, meta } = action;
  const name = reservice.name || type;
  const ret = {
    type: name,
    reservice: {
      ...reservice,
      previous_action: action,
      state: STATE_END,
    },
    meta,
    payload,
    error,
  };

  if (error) {
    debugFail('name: %s - payload: %o - error: %s', name, action.payload, payload);
    debugError('name: %s - payload: %o - stack: %s', name, action.payload, payload.stack);
  } else {
    debugSuccess('name: %s - payload: %o - result: %o', name, action.payload, payload);
    const selector = SELECTOR_LIST[name];
    if (selector) {
      ret.reservice.full_result = payload;
      ret.payload = selector(payload);
      debugSelect('name: %s - payload: %o - result: %o', name, action.payload, ret.payload);
    }
  }

  return ret;
};

const toErrorAction = (action, message) =>
  resultAction(action, new ReserviceError(message, action));

// validate the format of service action, return an error action when it is invalid
export const isBadService = (action) => {
  if (!action.reservice) {
    return toErrorAction(action, 'no action.reservice');
  }
  if (!action.reservice.name) {
    return toErrorAction(action, 'no action.reservice.name');
  }
  if (!action.reservice.state) {
    return toErrorAction(action, 'no action.reservice.state');
  }
  return false;
};

// check an action is service action or not, may return FSA error action if you like
export const isService = (action = {}, returnErrorAction) => {
  if ((!action.reservice) && (action.type !== ACTION_TYPE_RESERVICE)) {
    return false;
  }

  const isBad = isBadService(action);
  if (isBad) {
    return returnErrorAction ? isBad : null;
  }

  return true;
};

const isEnd = action => action.reservice.state === STATE_END;

const handleServiceResult =
(store, next, action) => result => store.dispatch(resultAction(action, result));

const executeServiceAtServer = (action, request) => {
  // service definition check
  const serviceName = action.reservice.name;
  const service = SERVICE_LIST[serviceName];

  if (!service) {
    return Promise.reject(new ReserviceError(`can not find service named as "${serviceName}" in serviceList`, action));
  }

  try {
    action.reservice.state = STATE_BEGIN;
    return Promise.resolve(service(action.payload, request));
  } catch (E) {
    return Promise.reject(E);
  }
};

const serializeError = (key, value) => (
  (value instanceof Error)
  ? Object.getOwnPropertyNames(value).reduce((O, K) => {
    if ((process.env.NODE_ENV === 'development') || (K !== 'stack')) {
      O[K] = value[K];
    }
    return O;
  }, {})
  : value
);

const convertError = (err) => {
  const E = err.action
    ? new ReserviceError(err.message, err.action)
    : new Error(err.message);

  if (err.stack) {
    E.stack = err.stack;
  }

  return E;
};


const transportServiceToServer = action => yfetch({
  json: true,
  method: SERVICE_TRANSPORT_METHOD,
  url: SERVICE_TRANSPORT_PATH,
  credentials: 'include',
  body: JSON.stringify(action),
}).then(response =>
  ((response.status === 555) ? convertError(response.body) : response.body));

export const setupServiceEndpoint = (url, method = DEFAULT_TRANSPORT_METHOD) => {
  if (SERVICE_LIST) {
    throw new ReserviceError('Wrong setupServiceEndpoint() ! You should to it before serviceMiddleware(serviceList) !');
  }
  SERVICE_TRANSPORT_PATH = url;
  SERVICE_TRANSPORT_METHOD = method;
};

export const settleRequest = req => ({
  type: ACTION_SET_REQUEST,
  payload: req,
});

// A redux middleware
export const serviceMiddleware = store => next => (action) => {
  if (action.type === ACTION_SET_REQUEST) {
    if (store.req) {
      throw new ReserviceError('Try to dispatch settleRequest(req) twice!');
    }
    store.req = action.payload;
  }
  const srv = isService(action, true);

  if (!srv) {
    return next(action);
  }

  // action format error handling, return promise.
  if (srv.error) {
    return Promise.resolve(next(srv));
  }

  const result = next(action);

  // just pass to next when the service is already done
  if (isEnd(action)) {
    return result;
  }

  debugStart('name: %s - payload: %o', action.reservice.name, action.payload);

  let job;

  // When no SERVICE_LIST, go client logic
  if (!SERVICE_LIST) {
    if (!global.window) {
      throw new ReserviceError('Wrong serviceMiddleware() at server side! You should create service middleware by serviceMiddleware(serviceList) !');
    }
    job = transportServiceToServer(action);
  } else {
    job = executeServiceAtServer(action, store.req || new ReserviceError('Access request without dispatching settleRequest(req) action!'));
  }

  const handle = handleServiceResult(store, next, action);

  return job.then(handle, handle);
};

const responseServiceResult = res => result => res.send(JSON.stringify(result));
const responseServiceError = res =>
  err => res.status(555).send(JSON.stringify(err, serializeError));

export const devSelect = selector => result => ((process.env.NODE_ENV === 'development') ? selector(result) : result);
export const prodSelect = selector => result => ((process.env.NODE_ENV === 'production') ? selector(result) : result);

const refineServiceList = (serviceList) => {
  const services = {};

  Object.keys(serviceList).forEach((name) => {
    const service = serviceList[name];

    if (typeof service === 'function') {
      services[name] = service;
      return;
    }

    if (!service.service || !service.selector) {
      throw new ReserviceError(`The service named as "${name}" in serviceList should be a function or { service, selector }, it is ${service} now`);
    }

    if (typeof service.service !== 'function') {
      throw new ReserviceError(`The service named as "${name}" in serviceList defined as { service, selector }, but the { service } is not a function, it is ${service.service} now`);
    }

    if (typeof service.selector !== 'function') {
      throw new ReserviceError(`The service named as "${name}" in serviceList defined as { service, selector }, but the { selector } is not a function, it is ${service.selector} now`);
    }

    if (process.env.NODE_ENV === 'production') {
      services[name] = (payload, req) =>
        Promise.resolve(service.service(payload, req)).then(service.selector);
    } else {
      services[name] = service.service;
      SELECTOR_LIST[name] = service.selector;
    }
  });

  return services;
};

// create an express middleware to handle service action from client side
export const createMiddlewareByServiceList = (serviceList) => {
  // no serviceList error
  if (!serviceList) {
    throw new ReserviceError('No serviceList for service middleware! Check the serviceList in your createMiddlewareByServiceList(serviceList)');
  }

  // double executed error
  if (SERVICE_LIST) {
    throw new ReserviceError('createMiddlewareByServiceList() should be executed once only!');
  }

  if (global.window) {
    throw new ReserviceError('createMiddlewareByServiceList() should not be executed at client side!');
  }

  SERVICE_LIST = refineServiceList(serviceList);

  return (req, res, next) => {
    // method or url different, pass
    if ((req.originalUrl !== SERVICE_TRANSPORT_PATH) || (req.method !== SERVICE_TRANSPORT_METHOD)) {
      return next();
    }

    // no body, pass
    const action = req.body;
    if (!action) {
      return next();
    }

    // not a service action, pass
    const srv = isService(action, true);
    if (!srv) {
      return next();
    }

    // not a valid service action, error
    if (srv.error) {
      return next(srv.payload);
    }

    debugReceive('name: %s - payload: %o', action.reservice.name, action.payload);

    // no matter success or failed, response result to client.
    return executeServiceAtServer(action, req)
    .then(responseServiceResult(res), responseServiceError(res));
  };
};
