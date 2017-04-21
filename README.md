reservice
=========
An isomorphic/universal asynchronous tasks solution for redux.

[![Build Status](https://travis-ci.org/zordius/reservice.svg?branch=master)](https://travis-ci.org/zordius/reservice)

You may already using <a href="https://github.com/gaearon/redux-thunk">redux-thunk</a> for your asynchronous tasks. Put thunk, function or promise into an action makes it not pure, which means the action may not be serialized or replayed well.

A better asynchronous task practice is: create your action as pure object, do asynchronous tasks in your own redux middlewares. This practice keep all your actions creators and reducers pure and clean, make your application more isomorphic or universal. The only place you put asynchronous codes are redux middlewares....Or, a better place: redux service (re-service).

A redux service means: an asynchronous task triggered by a start service action. After it done, the result will be dispatched as another service done action.

<img src="https://github.com/zordius/reservice/blob/master/reservice.png?raw=true" />

Re-service provides a good practice for all your asynchronous tasks, includes:
* A helper function to create service action creator. (the action is <a href="https://github.com/acdlite/flux-standard-action">FSA</a> compliant)
* A redux middleware to:
  * handle the service action
    * At client side, transport action to server then get result.
    * At server side, execute the service then get result.
  * then ispatch service result action
* A helper function to create reducer to handle service result actions.
* Helper functions to idenfity an action:
  * is it a valid service action?
  * is it an ended service action?
  * is it a success service action?
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
const myService = (req, payload) => {
  // Do any async task you like, return promise or result
  // You can not know any redux related things,
  // But you can access the express request object here.
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

...

// Add this line to declare serviceList and use the express middleware
app.use(createMiddlewareByServiceList(serviceList));
```

**The Reducer**
```javascript
import { handleServiceActions } from 'reservice';

const myReducer = handleServiceActions({
  [doSomeThing]: (state, action) => { ... },
  [anotherServiceCreator]: anotherReducer,
  ...
}, defaultState);
```

**Setup Redux Store**
```javascript
import { createStore, applyMiddleware } from 'redux';
import { serviceMiddleware } from 'reservice';

const store = createStore(
  myReducer,
  applyMiddleware(serviceMiddleware)
);

// IMPORTANT: attach the request object under the store
// Required at server side.
store.req = req;
```
