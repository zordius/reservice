import { createAction } from 'redux-actions';
import yfetch from 'yfetch';
import debug from 'debug';

export const ACTION_CALL_SERVICE = 'CALL_SERVICE';
export const STATE_CREATED = 'CREATED';
export const STATE_BEGIN = 'BEGIN';
export const STATE_END = 'END';

const DEFAULT_TRANSPORT_PATH = '/_reservice_/';
const DEFAULT_TRANSPORT_METHOD = 'PUT';
let SERVICE_TRANSPORT_PATH = DEFAULT_TRANSPORT_PATH;
let SERVICE_TRANSPORT_METHOD = DEFAULT_TRANSPORT_METHOD;

let SERVICE_LIST = 0;

const debugStart = debug('reservice:start');
const debugReceive = debug('reservice:receive');
const debugSuccess = debug('reservice:success');
const debugFail = debug('reservice:fail');
const debugError = debug('reservice:error');

// A helper function to help you to create actionCreator for a service
export const createService = (name, payloadCreator) => {
  const actionCreator = createAction(ACTION_CALL_SERVICE, payloadCreator, () => ({
    serviceName: name,
    serviceState: STATE_CREATED,
  }));

  actionCreator.toString = () => name;

  return actionCreator;
};

export class ReserviceError extends Error {
  constructor(message, action) {
    super(message);
    if (action) {
      this.action = action;
    }
  }
}

const resultAction = (action, payload) => {
  const error = payload instanceof Error;

  if (error) {
    debugFail('name: %s - payload: %o - error: %s', action.meta ? action.meta.serviceName : undefined, action.payload, payload);
    debugError('name: %s - payload: %o - stack: %s', action.meta ? action.meta.serviceName : undefined, action.payload, payload.stack);
  } else {
    debugSuccess('name: %s - payload: %o - result: %o', action.meta.serviceName, action.payload, payload);
  }

  return {
    type: action.type,
    meta: { ...action.meta, previous_action: action, serviceState: STATE_END },
    payload,
    error,
  };
};

const toErrorAction =
(action, message) => resultAction(action, new ReserviceError(message, action));

// validate the format of service action, return an error action when it is invalid
export const isBadService = (action) => {
  if (!action.meta) {
    return toErrorAction(action, 'no action.meta');
  }
  if (!action.meta.serviceName) {
    return toErrorAction(action, 'no action.meta.serviceName');
  }
  if (!action.meta.serviceState) {
    return toErrorAction(action, 'no action.meta.serviceState');
  }
  return false;
};

// check an action is service action or not, may return FSA error action if you like
export const isService = (action = {}, returnErrorAction) => {
  if (action.type !== ACTION_CALL_SERVICE) {
    return false;
  }

  const isBad = isBadService(action);
  if (isBad) {
    return returnErrorAction ? isBad : null;
  }

  return true;
};

const isEnd = action => action.meta.serviceState === STATE_END;
const isSuccess = action => (isEnd(action) && !action.error);

const handleServiceResult =
(store, next, action) => result => store.dispatch(resultAction(action, result));

const executeServiceAtServer = (action, request) => {
  // service definition check
  const serviceName = action.meta.serviceName;
  const service = SERVICE_LIST[serviceName];

  if (!service) {
    return Promise.reject(new ReserviceError(`can not find service named as "${serviceName}" in serviceList`, action));
  }

  try {
    action.meta.serviceState = STATE_BEGIN;
    return Promise.resolve(service(action.payload, request));
  } catch (E) {
    return Promise.reject(E);
  }
};

const transportServiceToServer = action => yfetch({
  json: true,
  method: SERVICE_TRANSPORT_METHOD,
  url: SERVICE_TRANSPORT_PATH,
  body: JSON.stringify(action),
}).then(result => result.body);

export const setupServiceEndpoint = (url, method = DEFAULT_TRANSPORT_METHOD) => {
  if (SERVICE_LIST) {
    throw new ReserviceError('Wrong setupServiceEndpoint() ! You should to it before serviceMiddleware(serviceList) !');
  }
  SERVICE_TRANSPORT_PATH = url;
  SERVICE_TRANSPORT_METHOD = method;
};

// A redux middleware
export const serviceMiddleware = store => next => (action) => {
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

  debugStart('name: %s - payload: %o', action.meta.serviceName, action.payload);

  let job;

  // When no SERVICE_LIST, go client logic
  if (!SERVICE_LIST) {
    if (!global.window) {
      throw new ReserviceError('Wrong serviceMiddleware() at server side! You should create service middleware by serviceMiddleware(serviceList) !');
    }
    job = transportServiceToServer(action);
  } else {
    // store.req is a special design to let service access req
    // to deal request based logic.
    // (cookie, session, headers, other express middlewares)
    job = executeServiceAtServer(action, store.req);
  }

  const handle = handleServiceResult(store, next, action);

  return job.then(handle, handle);
};

// A helper function to help you to create a reducer for services
export const handleServiceActions =
(serviceReducers = {}, defaultState = {}) => (state = defaultState, action) => {
  const srv = isService(action, true);

  if (!srv || srv.error) {
    return state;
  }

  const reducer = serviceReducers[action.meta.serviceName];
  if (!reducer) {
    return state;
  }

  if (!isEnd(action)) {
    if (reducer.begin) {
      return reducer.begin(state, action);
    }
    return state;
  }


  if (!isSuccess(action) && reducer.throw) {
    return reducer.throw(state, action);
  }

  if (reducer.next) {
    return reducer.next(state, action);
  }

  return reducer(state, action);
};

const responseServiceResult = res => result => res.send(result);

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

  SERVICE_LIST = serviceList;

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

    debugReceive('name: %s - payload: %o', action.meta.serviceName, action.payload);

    // no matter success or failed, response result to client.
    return executeServiceAtServer(action, req)
    .then(responseServiceResult(res), responseServiceResult(res));
  };
};
