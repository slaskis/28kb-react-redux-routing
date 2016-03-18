/**
 * Module Dependencies
 */

import { h, render } from 'preact-socrates'
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
 * Render
 */

const root = document.getElementById('app')
root.innerHTML = ''
render(App, store, root)