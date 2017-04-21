reservice
=========
An isomorphic async tasks solution for redux.

[![Build Status](https://travis-ci.org/zordius/reservice.svg?branch=master)](https://travis-ci.org/zordius/reservice)

You may already using <a href="https://github.com/gaearon/redux-thunk">redux-thunk</a> for your async tasks. Put thunk, function or Promise into action makes the action object is not pure, which means the action may not serialized or replayed well.

A better async task practice is: create your action as pure object, do async tasks in your own middlewares. Then you can see pure and sync codes in all your actions creators and reducers, all async codes are in middlewares.
