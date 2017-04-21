reservice
=========
An isomorphic async tasks solution for redux.

[![Build Status](https://travis-ci.org/zordius/reservice.svg?branch=master)](https://travis-ci.org/zordius/reservice)

You may already using <a href="https://github.com/gaearon/redux-thunk">redux-thunk</a> for your async tasks. Put thunk, function or Promise into action makes the action object is not pure, which means the action may not serialized or replayed well.

A better async task practice is: create your action as pure object, do async tasks in your own middlewares. Then you can see pure and sync codes in all your actions creators and reducers, all async codes are in middlewares.

Reservice provides a good practice for all your async tasks, includes:
* A helper function to create service action creator (the action is <a href="https://github.com/acdlite/flux-standard-action">FSA</a> compliant)
* A redux middleware to:
  * handle the service action
  * dispatch service result action
* A helper function to create reducer to handle service result action
* Helper functions to idenfity a action:
  * is it valid?
  * is it ended?
  * is it success?
