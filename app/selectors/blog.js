/**
 * Module Dependencies
 */

import { createSelector } from 'reselect'
import { articleListSelector } from './'

export const blogSelector = createSelector(
  articleListSelector,
  articles => ({
    articles
  })
)