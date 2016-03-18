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
      '/blog/:id': (params) => <Article {...params} {...this.props} />,
      '*': (params) => <Home {...params} {...this.props} />
    })(this.props.url)
  }
}

/**
 * Home
 */

const Home = ({ greeting }) => (
  <div class='home'>
    <h2>{greeting}</h2>
    <Link to='/blog'>Go to the blog</Link>
  </div>
)

/**
 * Blog
 */

const Blog = ({ articles }) => (
  <div class='blog'>
    <h2>Welcome to the Blog!</h2>
    <Link to='/' style={{color: 'orange'}}>Go back to Home</Link>
    {articles.map(article => <ShortArticle {...article} />)}
  </div>
)

const Article = ({id, title, body}) => (
  <article id={`article-${id}`}>
    <h1>{title}</h1>
    <div>{body}</div>
  </article>
)

const ShortArticle = ({id, title, summary}) => (
  <article id={`short-article-${id}`}>
    <h1>{title}</h1>
    <div>{summary}</div>
    <Link to={`/blog/${id}`}>Read more</Link>
  </article>
)

const Link = ({to, children, ...props}, {dispatch}) => (
  <a href={to} {...props} onClick={e => {
    e.preventDefault();
    dispatch(navigate(to));
  }}>{children}</a>
)