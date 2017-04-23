Example Project
===============

This is an example project for <a href="https://github.com/zordius/reservice">reservice</a>.

How to Start
------------

Create yelp.cfg.json file:
```json
{
  "consumer_key": "Go https://www.yelp.com/developers/v2/manage_api_keys",
  "consumer_secret": "To ready your key and secrets and saved here",
  "token": "You should not expose all these secrets",
  "token_secret": "That's why you can use reservice for this"
}
```

Then:

```
npm install
npm start
```
Then browse http://localhost:3000/

How it works
------------

**Isomorphic Application**
* <a href="src/reduxapp.js">reduxapp.js</a> defines the redux store and MainComponent. It is the entry point of client side rendering.

**Routing Rules**
* <a href="src/routing.js">routing.js</a> defines the routing rules.

**Routing Action**
* <a href="src/server.js">server.js</a> creates the express application. There is an express middleware deal with routing and server side rendering.
* The request and routing information dispatched into redux store.

**Routing Middleware**
* 

**Server Side Rendering**
* <a href="src/lib/renderFullHtml.js">renderFullHtml.js</a> defined the layout of whole Html. It import the MainComponent from the <a href="src/reduxapp.js">reduxapp.js</a>, render into the main div.

