/**
 * Module Dependencies
 */

import { h } from 'preact-socrates'
import { Link } from './'


/**
 * ShortArticle
 */

export const ShortArticle = ({id, title, summary}) => (
  <article id={`short-article-${id}`}>
    <h1>{title}</h1>
    <div>{summary}</div>
    <Link to={`/blog/${id}`}>Read more</Link>
  </article>
)