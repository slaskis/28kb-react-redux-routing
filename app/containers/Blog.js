/**
 * Module Dependencies
 */

import { h } from 'preact-socrates'
import { connect } from '../support/connect'
import { blogSelector } from '../selectors'
import { ShortArticle, Link } from '../components'

/**
 * Blog
 */

export const Blog = connect(
  blogSelector,
  ({articles}) => (
    <div class='blog'>
      <h2>Welcome to the Blog!</h2>
      <Link to='/' style={{color: 'orange'}}>Go back to Home</Link>
      {articles.map(article => <ShortArticle {...article} />)}
    </div>
   )
)