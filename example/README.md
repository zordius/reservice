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
* <a href="src/reduxapp.js">reduxapp.js#L11-L23</a> defines the redux store and MainComponent for both server side and client side rendering.

**Routing Rules**
* <a href="src/routing.js">routing.js</a> defines the routing rules.

**Routing Action**
* <a href="src/server.js">server.js</a> creates the express application. There is <a href="src/server.js#L39-L52">an express middleware</a> deal with routing, dispatch the request and routing information to redux store, execute routed handler, then rendering at server side.

**Server Side Rendering**
* <a href="src/lib/renderFullHtml.js">renderFullHtml.js</a> defined <a href="src/lib/renderFullHtml.js#L9-L18">the layout of whole Html</a>. It import the MainComponent from the <a href="src/reduxapp.js#L21-L23">reduxapp.js</a>, render it into the <a href="src/lib/renderFullHtml.js#L14">main div</a>. Here we also <a href="src/lib/renderFullHtml.js#L15">serialize the redux store state</a> into `REDUXDATA` for client side rendering.

**Client Side Rendering**
* <a href="src/reduxapp.js#L29-L31">reduxapp.js</a> is the entry point of client side script, too. It take `REDUXDATA` as initial state, create the store, then render the MainComponent into main div.
