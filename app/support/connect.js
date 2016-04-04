/**
 * Module Dependencies
 */

import { h } from 'preact-socrates'


/**
 * connect() generates a higher order component which
 * calls `mapStateToProps(state)` and adds the results as props.
 */

export function connect(mapStateToProps, createComponent) {
  // note: `params` usually, but not always (in case of embedded components),
  //       come from the `Route()` definition in `App`
  return (params, {dispatch}) => {
    let state = dispatch()
    let props = mapStateToProps(Object.assign({}, params, state))
    return createComponent(
      Object.assign(
        params,
        props
      )
    )
  }
}