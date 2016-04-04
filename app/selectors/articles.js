/**
 * Module Dependencies
 */

import { createSelector } from 'reselect'

const noArticles = []
export const articleListSelector = createSelector(
  state => state.blog.articles,
  articles => articles || noArticles
)

export const articleSelector = createSelector(
  articleListSelector,
  state => state.id,
  (articles, id) => articles.filter(a => a.id === id)[0]
)