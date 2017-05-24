Upgrade from 0.0.2 to 0.1.0
===========================

**The action creator**

Code is not changed, but the action format is changed. If you want to deal with 'service started' signal, you can focus on `action.type === 'CALL_RESERVICE'`

<table>
 <tr>
  <th>0.0.2</th><th>0.1.0</th>
 </tr>
 <tr valign="top">
  <td>

```javascript
import { createService } from 'reservice';

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

</td><td>

```javascript
import { createService } from 'reservice';

const doSomeThing = createService('DO_SOMETHING', payloadCreator);

expect(doSomeThing('good')).toEqual({
  type: 'CALL_RESERVICE',
  payload: 'good',
  meta: undefined,
  reservice: {
    name: 'DO_SOMETHING',
    state: 'CREATED',
  },
});
```

</td>
 </tr>
</table>

**The done action**

When the action is handled by middleware, another action will be dispatched.

<table>
 <tr>
  <th>0.0.2</th><th>0.1.0</th>
 </tr>
 <tr valign="top">
  <td><pre>
{
  type: 'CALL_SERVICE',
  payload: 'result',
  error: false,
  meta: {
    serviceName: 'DO_SOMETHING',
    serviceState: 'END',
    previous_action: {
      type: 'CALL_SERVICE',
      payload: 'good',
      meta: {
        serviceName: 'DO_SOMETHING',
        serviceState: 'CREATED',
      },
    },
  },
}
</pre></td><td><pre>
{
  type: 'DO_SOMETHING',
  payload: 'result',
  error: false,
  meta: undefined,
  reservice: {
    name: 'DO_SOMETHING',
    state: 'END',
    previous_action: {
      type: 'CALL_RERESERVICE',
      payload: 'good',
      meta: undefined,
      reservice: {
        name: 'DO_SOMETHING',
        state: 'BEGIN',
      },
    }
  }
}
</pre></td>
 </tr>
</table>

**The reducer**

Because we changed the action format, now you can use <a href="https://www.npmjs.com/package/redux-actions">redux-actions</a> or implement reducer directly.

<table>
 <tr>
  <th>0.0.2</th><th>0.1.0</th>
 </tr>
 <tr valign="top">
  <td>

```javascript
import { handleServiceActions } from 'reservice';

const myReducer = handleServiceActions({
  [doSomeThing]: (state, action) => { ... },
  [anotherServiceCreator]: anotherReducer,
  ...
}, initialState);
```

</td><td>

```javascript
import { handleActions } from 'redux-actions';

// create a reducer
const myReducer = handleActions({
  [doSomeThing]: (state, action) => { ... },
  [anotherServiceCreator]: anotherReducer,
  ...
}, initialState);
```

</td>
 </tr>
</table>
