/**
 * Module Dependencies
 */

import { render } from 'preact-render-to-string'
import { h } from 'preact'
import Logger from 'redux-logger'
import Socrates from 'socrates'
import Koa from 'koa'
import serve from 'koa-static'
import convert from 'koa-convert'
import {App} from './'


const app = new Koa()
app.use(convert(serve('.')))
app.use(async ctx => {

  /**
   * Initialize Socrates
   *
   * By default, it will just store what you pass in,
   * which is fine for this demo, but you'll probably
   * want to use your own reducer if you're actually
   * building an app
   */
  let store = Socrates([
    Logger()
  ])

  /**
   * Initialize the store
   */

  const initialState = {
    url: ctx.path,
    greeting: 'Welcome to the website, friend!'
  }

  store('boot', initialState)

  /**
   * Render
   */
  const html = render(h(App, store()));

  ctx.body = `<!DOCTYPE html>
    <html>
      <body>
        <div id='app'>${html}</div>
        <script>var INITIAL_STATE = ${JSON.stringify(store())}</script>
        <script src='/build/client.js'></script>
      </body>
    </html>`;
})

app.listen(8001)
