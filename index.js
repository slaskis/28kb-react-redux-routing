/**
 * Module Dependencies
 */

import { render, h } from 'preact-socrates'
import Logger from 'redux-logger'
import Socrates from 'socrates'
import History from 'history'
import Route from 'enroute'

/**
 * Initialize Socrates
 *
 * By default, it will just store what you pass in,
 * which is fine for this demo, but you'll probably
 * want to use your own reducer if you're actually
 * building an app
 */

var store = Socrates([
  Logger(),
  History()
])

/**
 * App
 */

const App = (props) => (
  Route({
    '/blog': (params) => <Blog {...params} {...props} />,
    '*': (params) => <Home {...params} {...props} />
  })(props.url)
)

/**
 * Home
 */

const Home = ({ dispatch, greeting }) => (
  <div class='home'>
    <h2>{greeting}</h2>
    <button onClick={(e) => dispatch('navigate', { url: '/blog' })}>Go to the blog</button>
  </div>
)

/**
 * Blog
 */

const Blog = ({ dispatch }) => (
  <div class='blog'>
    <h2>Welcome to the Blog!</h2>
    <button onClick={(e) => dispatch('navigate', { url: '/' })}>Go back to Home</button>
  </div>
)

/**
 * Initialize the store
 */

store('boot', {
  url: document.location.pathname,
  greeting: 'Welcome to the website, friend!'
})

/**
 * Render
 */

render(App, store, document.body)
