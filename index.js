/**
 * Module Dependencies
 */
import { Component } from 'preact'
import { h } from 'preact-socrates'
import { navigate } from 'redux-routes'
import Route from 'enroute'


/**
 * App
 */

export class App extends Component {

  getChildContext() {
    return {dispatch: this.props.dispatch}
  }

  render() {
    return Route({
      '/blog': (params) => <Blog {...params} {...this.props} />,
      '*': (params) => <Home {...params} {...this.props} />
    })(this.props.url)
  }
}

/**
 * Home
 */

export const Home = ({ greeting }) => (
  <div class='home'>
    <h2>{greeting}</h2>
    <Link to='/blog'>Go to the blog</Link>
  </div>
)

/**
 * Blog
 */

export const Blog = () => (
  <div class='blog'>
    <h2>Welcome to the Blog!</h2>
    <Link to='/' style={{color: 'orange'}}>Go back to Home</Link>
  </div>
)

const Link = ({to, children, ...props}, {dispatch}) => (
  <a href={to} {...props} onClick={e => {
    e.preventDefault();
    dispatch(navigate(to));
  }}>{children}</a>
)