/**
 * Module Dependencies
 */

import Route from 'enroute'
import { Component } from 'preact'
import { h } from 'preact-socrates'
import { Home } from './components'
import { Article, Blog } from './containers'

/**
 * App
 */

export class App extends Component {

  getChildContext() {
    return {dispatch: this.props.dispatch}
  }

  render(props) {
    return Route({
      '/': params => <Home {...params} {...props} />,
      '/blog': params => <Blog {...params} {...props} />,
      '/blog/:id': params => <Article {...params} {...props} />,
      '*': params => <Home {...params} {...props} notFound />
    })(global.location ? global.location.pathname : props.url)
  }

}



