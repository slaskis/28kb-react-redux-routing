/**
 * Tiny history middleware
 *
 * - https://github.com/callum/redux-routing/blob/master/src/History.js
 *
 * TODO: separate module, once I'm sure it's solid
 */

var querystring = require('querystring')
var parse = require('url').parse

/**
 * Export `middleware`
 */

module.exports = middleware['default'] = middleware

/**
 * middleware middleware
 *
 * @param {Object} options
 * @return {Function}
 */

function middleware (options) {
  return function (store) {
    var history = History(store).listen()

    return function (next) {
      return function (action) {
        if (action.type !== 'navigate') return next(action)
        var url = parse(action.payload.url)

        var location = {
          hash: url.hash || undefined,
          pathname: url.pathname,
          search: url.search || undefined
        }

        var query = url.query ? qs.parse(url.query) : null

        action.payload.url = url.format(location)
        var result = next(action)
        history.update(result)

        return result
      }
    }
  }
}

/**
 * History class
 */

function History (store) {
  if (!(this instanceof History)) return new History(store)
  this.store = store
}

/**
 * listen
 */

History.prototype.listen = function (action) {
  var self = this
  window.addEventListener('popstate', function (event) {
    self.onpop(event.state)
  }, false)

  return this
}

/**
 * update
 */

History.prototype.update = function (action) {
  var url = window.history.state

  if (action.type === 'navigate') {
    url && action.payload.url === url
      ? this.replace(action.payload.url)
      : this.push(action.payload.url)
  }

  return this
}

/**
 * push
 */

History.prototype.push = function (url) {
  window.history.pushState(url, null, url)
}

/**
 * Replace
 */

History.prototype.replace = function (url) {
  window.history.replaceState(url, null, url)
}

/**
 * onpop
 */

History.prototype.onpop = function(url) {
  this.store.dispatch({ type: 'navigate', payload: { url: url } })
};

