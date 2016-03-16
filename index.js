/**
 * Module Dependencies
 */

import { h } from 'preact'
import { navigate } from 'redux-routes'
import Route from 'enroute'


/**
 * App
 */

export const App = (props) => (
  Route({
    '/blog': (params) => <Blog {...params} {...props} />,
    '*': (params) => <Home {...params} {...props} />
  })(props.url)
)

/**
 * Home
 */

export const Home = ({ dispatch, greeting }) => (
  <div class='home'>
    <h2>{greeting}</h2>
    <button onClick={(e) => dispatch(navigate('/blog'))}>Go to the blog</button>
  </div>
)

/**
 * Blog
 */

export const Blog = ({ dispatch }) => (
  <div class='blog'>
    <h2>Welcome to the Blog!</h2>
    <button onClick={(e) => dispatch(navigate('/'))}>Go back to Home</button>
  </div>
)

