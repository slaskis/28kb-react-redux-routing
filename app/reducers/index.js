/**
 * Module Dependencies
 */

import { combineReducers } from 'redux'
import { blog } from './blog'


/**
 * Reducer
 */

const reducers = combineReducers({
  url,
  greeting,
  blog
})

export function reducer(state, action) {
  if (action.type === 'boot') {
    return action.payload;
  } else {
    return reducers(state, action)
  }
}

function url(state = '/', action) {
  switch (action.type) {
    case '@@redux-routes/navigate':
      return action.payload.url
    default:
      return state
  }
}

function greeting(state = '', action) {
  // No actions to modify state with...
  return state
}