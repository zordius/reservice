reservice
=========
An isomorphic async tasks solution for redux.

[![Build Status](https://travis-ci.org/zordius/reservice.svg?branch=master)](https://travis-ci.org/zordius/reservice)

You may already using <a href="https://github.com/gaearon/redux-thunk">redux-thunk</a> for your async tasks. Put thunk, function or Promise into action makes the action object is not pure, which means the action may not serialized or replayed well.

A better async task practice is: create your action as pure object, do async tasks in your own middlewares. Then you can see pure and sync codes in all your actions creators and reducers, all async codes are in middlewares. The service actions are pure, so they can be transported from client side to server side, the bonus is: isomorphic!

Reservice provides a good practice for all your async tasks, includes:
* A helper function to create service action creator (the action is <a href="https://github.com/acdlite/flux-standard-action">FSA</a> compliant)
* A redux middleware to:
  * handle the service action
    * At client side, transport action to server then get result
    * At server side, execute the service then get result
  * dispatch service result action
* A helper function to create reducer to handle service result action
* Helper functions to idenfity a action:
  * is it valid?
  * is it ended?
  * is it success?
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

**Code for a service:**
```javascript
const myService = (req, payload) => {
  // Do any async task you like, return promise or result
  // You can not know any redux related things,
  // But you can access the express request object here.
  ...
  return result;
}
```

**Service action creator:**
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

**Service list:**
```javascript
const serviceList = {
  [doSomeThing]: myService,
  [anotherServiceCreator]: theCodeOfAnotherService,
  ...
}
```

**Handle service actions from client:**
```javascript
// your server.js
import { createMiddlewareByServiceList } from 'reservice';

...

// Add this line to declare serviceList and use the express middleware
app.use(createMiddlewareByServiceList(serviceList));
```

**The reducer:**
```javascript
import { handleServiceActions } from 'reservice';

const myReducer = handleServiceActions({
  [doSomeThing]: (state, action) => { ... },
  [anotherServiceCreator]: anotherReducer,
  ...
}, defaultState);
```

**The redux middleware:**
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
