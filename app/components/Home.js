/**
 * Module Dependencies
 */

import { h } from 'preact-socrates'
import { StyleSheet, css } from 'aphrodite'
import { Link } from './'


/**
 * Styles
 */

const styles = StyleSheet.create({
  red: {
    backgroundColor: 'green'
  }
})

/**
 * Home
 */

export const Home = ({ greeting }) => (
  <div class={['home', css(styles.red)].join(' ')}>
    <h2>{greeting}</h2>
    <Link to='/blog'>Go to the blog</Link>
  </div>
)
