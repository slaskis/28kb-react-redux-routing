/**
 * Module Dependencies
 */

import { h } from 'preact-socrates'
import { StyleSheet, css } from 'aphrodite'
import { navigate } from 'redux-routes'


/**
 * Link
 */

export const Link = ({to, children, ...props}, {dispatch}) => (
  <a href={to} {...props} onClick={e => {
    e.preventDefault();
    dispatch(navigate(to));
  }}>{children}</a>
)
