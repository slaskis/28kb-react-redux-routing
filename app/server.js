/**
 * Module Dependencies
 */

import { render } from 'preact-render-to-string'
import { h } from 'preact-socrates'
import { StyleSheetServer } from 'aphrodite';
import Logger from 'redux-logger'
import Socrates from 'socrates'
import Koa from 'koa'
import serve from 'koa-static'
import convert from 'koa-convert'
import { App } from './'
import { reducer } from './reducers'


const app = new Koa()
app.use(convert(serve('.')))
app.use(async ctx => {

  if (ctx.path == '/favicon.ico') {
    return
  }

  /**
   * Initialize Socrates
   *
   * By default, it will just store what you pass in,
   * which is fine for this demo, but you'll probably
   * want to use your own reducer if you're actually
   * building an app
   */
  let store = Socrates([
    Logger(),
  ], reducer)

  /**
   * Initialize the store
   */

  const initialState = {
    url: ctx.path,
    greeting: 'Welcome to the website, friend!',
    blog: {
      articles: []
    }
  }

  await store('boot', initialState)
  await store(state => ({
    type: 'add blog.articles',
    payload: [
      {
        id: '1',
        title: 'Foo',
        summary: 'Bar',
        body: 'More bar'
      }
    ]
  }))

  /**
   * Render
   */
  const {html, css} = StyleSheetServer.renderStatic(() => render(h(App, {...store(), dispatch: store})))

  ctx.body = `
  <!DOCTYPE html>
  <html>
    <head>
      <style data-aphrodite>${css.content}</style>
    </head>
    <body>
      <div id='app'>${html}</div>
      <script>
        var INITIAL_STATE = ${JSON.stringify(store())};
        var RENDERED_CLASS_NAMES = ${JSON.stringify(css.renderedClassNames)};
      </script>
      <script src='/build/client.js'></script>
    </body>
  </html>
  `
})

app.listen(8001)
