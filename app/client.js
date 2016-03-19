/**
 * Module Dependencies
 */

import { h, render } from 'preact-socrates'
import { StyleSheet } from 'aphrodite'
import History from 'redux-routes'
import Logger from 'redux-logger'
import Socrates from 'socrates'
import {App} from './'
import {reducer} from './reducer'

/**
 * Initialize Socrates
 *
 * By default, it will just store what you pass in,
 * which is fine for this demo, but you'll probably
 * want to use your own reducer if you're actually
 * building an app
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