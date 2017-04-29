reservice
=========
An isomorphic/universal asynchronous tasks solution for redux.

[![Build Status](https://travis-ci.org/zordius/reservice.svg?branch=master)](https://travis-ci.org/zordius/reservice) [![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

You may already using <a href="https://github.com/gaearon/redux-thunk">redux-thunk</a> for your asynchronous tasks. Put thunk, function or promise into an action makes it not pure, which means the action may not be serialized or replayed well.

A better asynchronous task practice is: create your action as pure object, do asynchronous tasks in your own redux middlewares. This practice keep all your actions creators and reducers pure and clean, make your application more isomorphic or universal. The only place you put asynchronous codes are redux middlewares....Or, a better place: redux service (a.k.a. re-service).

A redux service means: an asynchronous task triggered by a start service action. After it done, the result will be dispatched as another service done action.

<img src="https://github.com/zordius/reservice/blob/master/reservice.png?raw=true" />

Re-service provides a good practice for all your asynchronous tasks, includes:
* A helper function to create service action creator. (the action is <a href="https://github.com/acdlite/flux-standard-action">FSA</a> compliant)
* A redux middleware to:
  * handle the service action
    * At client side, transport action to server then get result.
    * At server side, execute the service then get result.
  * then dispatch service result action
* A helper function to create reducer to handle service actions, you may:
  * reduce the begin service action
  * reduce the success ended service action
  * reduce the errored service action
* An <a href="https://www.npmjs.com/package/express">express</a> middleware to deal with transported service actions.

Install
-------

```
npm install reservice --save
```

You will need these polyfills for older browsers or other environments:
* [Promise](https://www.npmjs.com/search?q=promise%20polyfill&page=1&ranking=popularity) : [browser support](http://caniuse.com/#feat=promises)
* [fetch](https://www.npmjs.com/search?q=fetch%20polyfill&page=1&ranking=popularity) : [browser support](http://caniuse.com/#feat=fetch)

Usage
-----

**A Service**
```javascript
// req is optional, you can receive req to deal with session based tasks.
const myService = (payload, req) => {
  // Do any async task you like, return a promise or result.
  // You can not know any redux related things,
  // but you can access the express request object here.
  ...
  return result;
}
```

**A Service Action Creator**
```javascript
import { createService } from 'reservice';

// Check redux-actions to know more about payloadCreator
// https://github.com/acdlite/redux-actions#createactiontype-payloadcreator--identity-metacreator
const doSomeThing = createService('DO_SOMETHING', payloadCreator);

expect(doSomeThing('good')).toEqual({
  type: 'CALL_SERVICE',
  payload: 'good',
  meta: {
    serviceName: 'DO_SOMETHING',
    serviceState: 'CREATED',
  },
});
```

**Define Service List**
```javascript
const serviceList = {
  [doSomeThing]: myService,
  [anotherServiceCreator]: theCodeOfAnotherService,
  ...
}
```

**Setup Express Application**
```javascript
// your server.js
import { createMiddlewareByServiceList } from 'reservice';
import bodyParser from 'body-parser';

...

// reservice middleware need to access body as json
app.use(bodyParser.json());

// Add this line to declare serviceList and use the express middleware
app.use(createMiddlewareByServiceList(serviceList));
```

**The Reducer**
```javascript
import { handleServiceActions } from 'reservice';

// create a reducer only deal with ended service action by default
const myReducer = handleServiceActions({
  [doSomeThing]: (state, action) => { ... },
  [anotherServiceCreator]: anotherReducer,
  ...
}, defaultState);
```

If you also want to handle different service action status:
```javascript
import { handleServiceActions } from 'reservice';

const myReducer = handleServiceActions({
  [doSomeThing]: {
    begin: (state, action) => { ... },  // executes when started
    next: (state, action) => { ... },   // executes when end and success
    throw: (state, action) => { ... },  // executes when end and failed
  [anotherServiceCreator]: anotherReducer,
  ...
}, defaultState);
```
You can also mix normal reducers and service reducer:
```javascript
import { handleServiceActions } from 'reservice';

const defaultState = {
  isLoading: false,
  apiresult: {},
}

const serviceReducer = handleServiceActions({
  [callApi]: {
    begin: (state, action) => { ...state, isLoading: true },
    next: (state, action) => { ...state, isLoading: true, apiresult: action.payload },
  }
}, defaultState);

export reducer = (state = defaultState, action) => {
  switch (action.type) {
  case 'START_LOADING':
    return {...state, isLoading: true}
  case 'STOP_LOADING':
    return {...state, isLoading: false}
  default:
    return serviceReducer(state, action);
  }
}
```

**Setup Redux Store**
```javascript
import { createStore, applyMiddleware } from 'redux';
import { serviceMiddleware, settleRequest } from 'reservice';

const store = createStore(
  myReducer,
  applyMiddleware(serviceMiddleware)
);

// Optional: If you like to access request in service
// You need to do this.
store.dispatch(settleRequest(req));
```

Example
-------

Please check <a href="example">example</a> to get a deeper guide.
