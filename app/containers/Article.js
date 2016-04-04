/**
 * Module Dependencies
 */

import { h } from 'preact-socrates'
import { Link } from '../components'
import { connect } from '../support/connect'
import { articleSelector } from '../selectors'

/**
 * Article
 */

export const Article = connect(
  articleSelector,
  ({id, title, body}) => (
    <article id={`article-${id}`}>
      <h1>{title}</h1>
      <div>{body}</div>
      <Link to='/blog'>Back to list</Link>
    </article>
  )
)