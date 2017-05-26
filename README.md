reservice
=========
An isomorphic/universal asynchronous tasks solution for redux.

[![npm version](https://img.shields.io/npm/v/reservice.svg)](https://www.npmjs.org/package/reservice) [![Build Status](https://travis-ci.org/zordius/reservice.svg?branch=master)](https://travis-ci.org/zordius/reservice)  [![Test Coverage](https://codeclimate.com/github/zordius/reservice/badges/coverage.svg)](https://codeclimate.com/github/zordius/reservice) [![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

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
  type: 'CALL_RESERVICE',
  payload: 'good',
  reservice: {
    name: 'DO_SOMETHING',
    state: 'CREATED',
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
import { handleActions } from 'redux-actions';

// create a reducer
const myReducer = handleActions({
  [doSomeThing]: (state, action) => { ... },
  [anotherServiceCreator]: anotherReducer,
  ...
}, initialState);

// If you also want to take care service start, try this
import { ACTION_TYPE_RESERVICE } from 'reservice';

const nowLoadingReducer = (state = initialState, action) => {
  if (action.type !== ACTION_TYPE_RESERVICE) {
    return state;
  }

  // service started, remeber to set nowLoading to false in yourown reducers
  // you can set different loading states by checking action.reservice.name
  return { ...state, nowLoading: true };
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

Debug
-----

* reservice already adopt [debug](https://www.npmjs.com/package/debug) , you can export DEBUG=... to show debug log:
  * `reservice:start` : show service name, payload
  * `reservice:receive` : show service name, payload when client side dispatch received
  * `reservice:success` : show service name, payload and result when service successed
  * `reservice:fail` : show service name, payload and error when service failed
  * `reservice:error` : show service name, payload and error.stack when service failed
  * `reservice:select` : show service name, payload and selected result when service successed

Optional Usage: Selector
------------------------

In most case you may try to refine API response data by selector function then put it into redux store. You can do it inthe service, or do it in the reducer.

If you run selector in the service, you dispatch only selected data to reducer. This practice save time and space when the smaller service result be transmitted from server to client, but prevent you to see full API response in network or redux debugging tools.

If you run selector in the reducer, you dispatch full data to reducer. This practice may take more time and space to transmit result from server to client, but you can see full API response in debug tools.

Reservice provide two small functions to help you adopt all these two practices in development and production environments:

```javascript
// The selector function
const mySelector = result => ({
  data: result.body.data.reduce(refineMyData, {}),
  error: result.body.error
});

// In a service
import { prodSelect } from 'reservice';
// Run your selector only when in production environment, keep original result when in development environment.
const myProdSelector = prodSelect(mySelector);
const myService = payload => callAPI(payload).then(result => myRrodSelector(result));

// In a reducer
import { devSelect } from 'reservice';
// Run your selector only when in development environment, keep original result when in production environment.
const myDevSelector = devSelect(mySelector);
const myReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'MY_SERVICE':
      return { ...state, ...myDevSelector(action.payload) }
  }
  return state;
}
```

Advanced Usage: Selector
------------------------

Or, you can define service as { service, selector } , reservice will keep full result in action.reservice.full_payload for debugging when not in production environment. And, the selected result still be placed in action.payload.

```javascript
// Original Service code with result selector
const selectResult = (result) => result.body.items;
export myService = (payload, req) => callSomeApi({ ...payload, req }).then(selectResult);

// change export from function into { service , selector } for better debugging info
export myService = {
  service: (payload, req) => callSomeApi({ ...payload, req }),
  selector: (result) => result.body.items,
};
```

Here is a <a href="https://github.com/zordius/reservice/commit/89916ad3774b25942ae5e88aa44d0a4463e7b9ec">migration example</a> to adopt reservice selector.
