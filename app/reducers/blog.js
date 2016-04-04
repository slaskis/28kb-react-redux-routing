/**
 * Module Dependencies
 */

import { combineReducers } from 'redux'


/**
 * Reducer
 */

export const blog = combineReducers({
  articles
})


/**
 * Articles
 *
 * A list of articles stored as an array
 */

function articles(state = [], action) {
  switch (action.type) {
    case 'add blog.articles':
      return action.payload
    default:
      return state
  }
}