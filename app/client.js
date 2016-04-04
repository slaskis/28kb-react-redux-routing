/**
 * Module Dependencies
 */

import History from 'redux-routes'
import Logger from 'redux-logger'
import Socrates from 'socrates'
import { h, render } from 'preact-socrates'
import { StyleSheet } from 'aphrodite'
import { App } from './'
import { reducer } from './reducers'

/**
 * Initialize Socrates / Redux store
 */

let store = Socrates([
  Logger(),
  History()
], reducer)

/**
 * Initialize the store
 */

store('boot', window.INITIAL_STATE)

/**
 * Initialize the styles
 */

StyleSheet.rehydrate(window.RENDERED_CLASS_NAMES);

/**
 * Render
 */

const root = document.getElementById('app')
render(App, store, root)
root.removeChild(root.firstChild);