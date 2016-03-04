(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"node_modules/redux-logger/lib/index.js":[function(require,module,exports){
"use strict";

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }

var repeat = function repeat(str, times) {
  return new Array(times + 1).join(str);
};
var pad = function pad(num, maxLength) {
  return repeat("0", maxLength - num.toString().length) + num;
};
var formatTime = function formatTime(time) {
  return "@ " + pad(time.getHours(), 2) + ":" + pad(time.getMinutes(), 2) + ":" + pad(time.getSeconds(), 2) + "." + pad(time.getMilliseconds(), 3);
};

// Use the new performance api to get better precision if available
var timer = typeof performance !== "undefined" && typeof performance.now === "function" ? performance : Date;

/**
 * parse the level option of createLogger
 *
 * @property {string | function | object} level - console[level]
 * @property {object} action
 * @property {array} payload
 * @property {string} type
 */

function getLogLevel(level, action, payload, type) {
  switch (typeof level === "undefined" ? "undefined" : _typeof(level)) {
    case "object":
      return typeof level[type] === "function" ? level[type].apply(level, _toConsumableArray(payload)) : level[type];
    case "function":
      return level(action);
    default:
      return level;
  }
}

/**
 * Creates logger with followed options
 *
 * @namespace
 * @property {object} options - options for logger
 * @property {string | function | object} options.level - console[level]
 * @property {boolean} options.duration - print duration of each action?
 * @property {boolean} options.timestamp - print timestamp with each action?
 * @property {object} options.colors - custom colors
 * @property {object} options.logger - implementation of the `console` API
 * @property {boolean} options.logErrors - should errors in action execution be caught, logged, and re-thrown?
 * @property {boolean} options.collapsed - is group collapsed?
 * @property {boolean} options.predicate - condition which resolves logger behavior
 * @property {function} options.stateTransformer - transform state before print
 * @property {function} options.actionTransformer - transform action before print
 * @property {function} options.errorTransformer - transform error before print
 */

function createLogger() {
  var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
  var _options$level = options.level;
  var level = _options$level === undefined ? "log" : _options$level;
  var _options$logger = options.logger;
  var logger = _options$logger === undefined ? console : _options$logger;
  var _options$logErrors = options.logErrors;
  var logErrors = _options$logErrors === undefined ? true : _options$logErrors;
  var collapsed = options.collapsed;
  var predicate = options.predicate;
  var _options$duration = options.duration;
  var duration = _options$duration === undefined ? false : _options$duration;
  var _options$timestamp = options.timestamp;
  var timestamp = _options$timestamp === undefined ? true : _options$timestamp;
  var transformer = options.transformer;
  var _options$stateTransfo = options.stateTransformer;
  var // deprecated
  stateTransformer = _options$stateTransfo === undefined ? function (state) {
    return state;
  } : _options$stateTransfo;
  var _options$actionTransf = options.actionTransformer;
  var actionTransformer = _options$actionTransf === undefined ? function (actn) {
    return actn;
  } : _options$actionTransf;
  var _options$errorTransfo = options.errorTransformer;
  var errorTransformer = _options$errorTransfo === undefined ? function (error) {
    return error;
  } : _options$errorTransfo;
  var _options$colors = options.colors;
  var colors = _options$colors === undefined ? {
    title: function title() {
      return "#000000";
    },
    prevState: function prevState() {
      return "#9E9E9E";
    },
    action: function action() {
      return "#03A9F4";
    },
    nextState: function nextState() {
      return "#4CAF50";
    },
    error: function error() {
      return "#F20404";
    }
  } : _options$colors;

  // exit if console undefined

  if (typeof logger === "undefined") {
    return function () {
      return function (next) {
        return function (action) {
          return next(action);
        };
      };
    };
  }

  if (transformer) {
    console.error("Option 'transformer' is deprecated, use stateTransformer instead");
  }

  var logBuffer = [];
  function printBuffer() {
    logBuffer.forEach(function (logEntry, key) {
      var started = logEntry.started;
      var startedTime = logEntry.startedTime;
      var action = logEntry.action;
      var prevState = logEntry.prevState;
      var error = logEntry.error;
      var took = logEntry.took;
      var nextState = logEntry.nextState;

      var nextEntry = logBuffer[key + 1];
      if (nextEntry) {
        nextState = nextEntry.prevState;
        took = nextEntry.started - started;
      }
      // message
      var formattedAction = actionTransformer(action);
      var isCollapsed = typeof collapsed === "function" ? collapsed(function () {
        return nextState;
      }, action) : collapsed;

      var formattedTime = formatTime(startedTime);
      var titleCSS = colors.title ? "color: " + colors.title(formattedAction) + ";" : null;
      var title = "action " + (timestamp ? formattedTime : "") + " " + formattedAction.type + " " + (duration ? "(in " + took.toFixed(2) + " ms)" : "");

      // render
      try {
        if (isCollapsed) {
          if (colors.title) logger.groupCollapsed("%c " + title, titleCSS);else logger.groupCollapsed(title);
        } else {
          if (colors.title) logger.group("%c " + title, titleCSS);else logger.group(title);
        }
      } catch (e) {
        logger.log(title);
      }

      var prevStateLevel = getLogLevel(level, formattedAction, [prevState], "prevState");
      var actionLevel = getLogLevel(level, formattedAction, [formattedAction], "action");
      var errorLevel = getLogLevel(level, formattedAction, [error, prevState], "error");
      var nextStateLevel = getLogLevel(level, formattedAction, [nextState], "nextState");

      if (prevStateLevel) {
        if (colors.prevState) logger[prevStateLevel]("%c prev state", "color: " + colors.prevState(prevState) + "; font-weight: bold", prevState);else logger[prevStateLevel]("prev state", prevState);
      }

      if (actionLevel) {
        if (colors.action) logger[actionLevel]("%c action", "color: " + colors.action(formattedAction) + "; font-weight: bold", formattedAction);else logger[actionLevel]("action", formattedAction);
      }

      if (error && errorLevel) {
        if (colors.error) logger[errorLevel]("%c error", "color: " + colors.error(error, prevState) + "; font-weight: bold", error);else logger[errorLevel]("error", error);
      }

      if (nextStateLevel) {
        if (colors.nextState) logger[nextStateLevel]("%c next state", "color: " + colors.nextState(nextState) + "; font-weight: bold", nextState);else logger[nextStateLevel]("next state", nextState);
      }

      try {
        logger.groupEnd();
      } catch (e) {
        logger.log("—— log end ——");
      }
    });
    logBuffer.length = 0;
  }

  return function (_ref) {
    var getState = _ref.getState;
    return function (next) {
      return function (action) {
        // exit early if predicate function returns false
        if (typeof predicate === "function" && !predicate(getState, action)) {
          return next(action);
        }

        var logEntry = {};
        logBuffer.push(logEntry);

        logEntry.started = timer.now();
        logEntry.startedTime = new Date();
        logEntry.prevState = stateTransformer(getState());
        logEntry.action = action;

        var returnedValue = undefined;
        if (logErrors) {
          try {
            returnedValue = next(action);
          } catch (e) {
            logEntry.error = errorTransformer(e);
          }
        } else {
          returnedValue = next(action);
        }

        logEntry.took = timer.now() - logEntry.started;
        logEntry.nextState = stateTransformer(getState());

        printBuffer();

        if (logEntry.error) throw logEntry.error;
        return returnedValue;
      };
    };
  };
}

module.exports = createLogger;
},{}],"node_modules/mako-js/node_modules/punycode/punycode.js":[function(require,module,exports){
(function (global){
/*! https://mths.be/punycode v1.4.0 by @mathias */
;(function(root) {

	/** Detect free variables */
	var freeExports = typeof exports == 'object' && exports &&
		!exports.nodeType && exports;
	var freeModule = typeof module == 'object' && module &&
		!module.nodeType && module;
	var freeGlobal = typeof global == 'object' && global;
	if (
		freeGlobal.global === freeGlobal ||
		freeGlobal.window === freeGlobal ||
		freeGlobal.self === freeGlobal
	) {
		root = freeGlobal;
	}

	/**
	 * The `punycode` object.
	 * @name punycode
	 * @type Object
	 */
	var punycode,

	/** Highest positive signed 32-bit float value */
	maxInt = 2147483647, // aka. 0x7FFFFFFF or 2^31-1

	/** Bootstring parameters */
	base = 36,
	tMin = 1,
	tMax = 26,
	skew = 38,
	damp = 700,
	initialBias = 72,
	initialN = 128, // 0x80
	delimiter = '-', // '\x2D'

	/** Regular expressions */
	regexPunycode = /^xn--/,
	regexNonASCII = /[^\x20-\x7E]/, // unprintable ASCII chars + non-ASCII chars
	regexSeparators = /[\x2E\u3002\uFF0E\uFF61]/g, // RFC 3490 separators

	/** Error messages */
	errors = {
		'overflow': 'Overflow: input needs wider integers to process',
		'not-basic': 'Illegal input >= 0x80 (not a basic code point)',
		'invalid-input': 'Invalid input'
	},

	/** Convenience shortcuts */
	baseMinusTMin = base - tMin,
	floor = Math.floor,
	stringFromCharCode = String.fromCharCode,

	/** Temporary variable */
	key;

	/*--------------------------------------------------------------------------*/

	/**
	 * A generic error utility function.
	 * @private
	 * @param {String} type The error type.
	 * @returns {Error} Throws a `RangeError` with the applicable error message.
	 */
	function error(type) {
		throw new RangeError(errors[type]);
	}

	/**
	 * A generic `Array#map` utility function.
	 * @private
	 * @param {Array} array The array to iterate over.
	 * @param {Function} callback The function that gets called for every array
	 * item.
	 * @returns {Array} A new array of values returned by the callback function.
	 */
	function map(array, fn) {
		var length = array.length;
		var result = [];
		while (length--) {
			result[length] = fn(array[length]);
		}
		return result;
	}

	/**
	 * A simple `Array#map`-like wrapper to work with domain name strings or email
	 * addresses.
	 * @private
	 * @param {String} domain The domain name or email address.
	 * @param {Function} callback The function that gets called for every
	 * character.
	 * @returns {Array} A new string of characters returned by the callback
	 * function.
	 */
	function mapDomain(string, fn) {
		var parts = string.split('@');
		var result = '';
		if (parts.length > 1) {
			// In email addresses, only the domain name should be punycoded. Leave
			// the local part (i.e. everything up to `@`) intact.
			result = parts[0] + '@';
			string = parts[1];
		}
		// Avoid `split(regex)` for IE8 compatibility. See #17.
		string = string.replace(regexSeparators, '\x2E');
		var labels = string.split('.');
		var encoded = map(labels, fn).join('.');
		return result + encoded;
	}

	/**
	 * Creates an array containing the numeric code points of each Unicode
	 * character in the string. While JavaScript uses UCS-2 internally,
	 * this function will convert a pair of surrogate halves (each of which
	 * UCS-2 exposes as separate characters) into a single code point,
	 * matching UTF-16.
	 * @see `punycode.ucs2.encode`
	 * @see <https://mathiasbynens.be/notes/javascript-encoding>
	 * @memberOf punycode.ucs2
	 * @name decode
	 * @param {String} string The Unicode input string (UCS-2).
	 * @returns {Array} The new array of code points.
	 */
	function ucs2decode(string) {
		var output = [],
		    counter = 0,
		    length = string.length,
		    value,
		    extra;
		while (counter < length) {
			value = string.charCodeAt(counter++);
			if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
				// high surrogate, and there is a next character
				extra = string.charCodeAt(counter++);
				if ((extra & 0xFC00) == 0xDC00) { // low surrogate
					output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
				} else {
					// unmatched surrogate; only append this code unit, in case the next
					// code unit is the high surrogate of a surrogate pair
					output.push(value);
					counter--;
				}
			} else {
				output.push(value);
			}
		}
		return output;
	}

	/**
	 * Creates a string based on an array of numeric code points.
	 * @see `punycode.ucs2.decode`
	 * @memberOf punycode.ucs2
	 * @name encode
	 * @param {Array} codePoints The array of numeric code points.
	 * @returns {String} The new Unicode string (UCS-2).
	 */
	function ucs2encode(array) {
		return map(array, function(value) {
			var output = '';
			if (value > 0xFFFF) {
				value -= 0x10000;
				output += stringFromCharCode(value >>> 10 & 0x3FF | 0xD800);
				value = 0xDC00 | value & 0x3FF;
			}
			output += stringFromCharCode(value);
			return output;
		}).join('');
	}

	/**
	 * Converts a basic code point into a digit/integer.
	 * @see `digitToBasic()`
	 * @private
	 * @param {Number} codePoint The basic numeric code point value.
	 * @returns {Number} The numeric value of a basic code point (for use in
	 * representing integers) in the range `0` to `base - 1`, or `base` if
	 * the code point does not represent a value.
	 */
	function basicToDigit(codePoint) {
		if (codePoint - 48 < 10) {
			return codePoint - 22;
		}
		if (codePoint - 65 < 26) {
			return codePoint - 65;
		}
		if (codePoint - 97 < 26) {
			return codePoint - 97;
		}
		return base;
	}

	/**
	 * Converts a digit/integer into a basic code point.
	 * @see `basicToDigit()`
	 * @private
	 * @param {Number} digit The numeric value of a basic code point.
	 * @returns {Number} The basic code point whose value (when used for
	 * representing integers) is `digit`, which needs to be in the range
	 * `0` to `base - 1`. If `flag` is non-zero, the uppercase form is
	 * used; else, the lowercase form is used. The behavior is undefined
	 * if `flag` is non-zero and `digit` has no uppercase form.
	 */
	function digitToBasic(digit, flag) {
		//  0..25 map to ASCII a..z or A..Z
		// 26..35 map to ASCII 0..9
		return digit + 22 + 75 * (digit < 26) - ((flag != 0) << 5);
	}

	/**
	 * Bias adaptation function as per section 3.4 of RFC 3492.
	 * https://tools.ietf.org/html/rfc3492#section-3.4
	 * @private
	 */
	function adapt(delta, numPoints, firstTime) {
		var k = 0;
		delta = firstTime ? floor(delta / damp) : delta >> 1;
		delta += floor(delta / numPoints);
		for (/* no initialization */; delta > baseMinusTMin * tMax >> 1; k += base) {
			delta = floor(delta / baseMinusTMin);
		}
		return floor(k + (baseMinusTMin + 1) * delta / (delta + skew));
	}

	/**
	 * Converts a Punycode string of ASCII-only symbols to a string of Unicode
	 * symbols.
	 * @memberOf punycode
	 * @param {String} input The Punycode string of ASCII-only symbols.
	 * @returns {String} The resulting string of Unicode symbols.
	 */
	function decode(input) {
		// Don't use UCS-2
		var output = [],
		    inputLength = input.length,
		    out,
		    i = 0,
		    n = initialN,
		    bias = initialBias,
		    basic,
		    j,
		    index,
		    oldi,
		    w,
		    k,
		    digit,
		    t,
		    /** Cached calculation results */
		    baseMinusT;

		// Handle the basic code points: let `basic` be the number of input code
		// points before the last delimiter, or `0` if there is none, then copy
		// the first basic code points to the output.

		basic = input.lastIndexOf(delimiter);
		if (basic < 0) {
			basic = 0;
		}

		for (j = 0; j < basic; ++j) {
			// if it's not a basic code point
			if (input.charCodeAt(j) >= 0x80) {
				error('not-basic');
			}
			output.push(input.charCodeAt(j));
		}

		// Main decoding loop: start just after the last delimiter if any basic code
		// points were copied; start at the beginning otherwise.

		for (index = basic > 0 ? basic + 1 : 0; index < inputLength; /* no final expression */) {

			// `index` is the index of the next character to be consumed.
			// Decode a generalized variable-length integer into `delta`,
			// which gets added to `i`. The overflow checking is easier
			// if we increase `i` as we go, then subtract off its starting
			// value at the end to obtain `delta`.
			for (oldi = i, w = 1, k = base; /* no condition */; k += base) {

				if (index >= inputLength) {
					error('invalid-input');
				}

				digit = basicToDigit(input.charCodeAt(index++));

				if (digit >= base || digit > floor((maxInt - i) / w)) {
					error('overflow');
				}

				i += digit * w;
				t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);

				if (digit < t) {
					break;
				}

				baseMinusT = base - t;
				if (w > floor(maxInt / baseMinusT)) {
					error('overflow');
				}

				w *= baseMinusT;

			}

			out = output.length + 1;
			bias = adapt(i - oldi, out, oldi == 0);

			// `i` was supposed to wrap around from `out` to `0`,
			// incrementing `n` each time, so we'll fix that now:
			if (floor(i / out) > maxInt - n) {
				error('overflow');
			}

			n += floor(i / out);
			i %= out;

			// Insert `n` at position `i` of the output
			output.splice(i++, 0, n);

		}

		return ucs2encode(output);
	}

	/**
	 * Converts a string of Unicode symbols (e.g. a domain name label) to a
	 * Punycode string of ASCII-only symbols.
	 * @memberOf punycode
	 * @param {String} input The string of Unicode symbols.
	 * @returns {String} The resulting Punycode string of ASCII-only symbols.
	 */
	function encode(input) {
		var n,
		    delta,
		    handledCPCount,
		    basicLength,
		    bias,
		    j,
		    m,
		    q,
		    k,
		    t,
		    currentValue,
		    output = [],
		    /** `inputLength` will hold the number of code points in `input`. */
		    inputLength,
		    /** Cached calculation results */
		    handledCPCountPlusOne,
		    baseMinusT,
		    qMinusT;

		// Convert the input in UCS-2 to Unicode
		input = ucs2decode(input);

		// Cache the length
		inputLength = input.length;

		// Initialize the state
		n = initialN;
		delta = 0;
		bias = initialBias;

		// Handle the basic code points
		for (j = 0; j < inputLength; ++j) {
			currentValue = input[j];
			if (currentValue < 0x80) {
				output.push(stringFromCharCode(currentValue));
			}
		}

		handledCPCount = basicLength = output.length;

		// `handledCPCount` is the number of code points that have been handled;
		// `basicLength` is the number of basic code points.

		// Finish the basic string - if it is not empty - with a delimiter
		if (basicLength) {
			output.push(delimiter);
		}

		// Main encoding loop:
		while (handledCPCount < inputLength) {

			// All non-basic code points < n have been handled already. Find the next
			// larger one:
			for (m = maxInt, j = 0; j < inputLength; ++j) {
				currentValue = input[j];
				if (currentValue >= n && currentValue < m) {
					m = currentValue;
				}
			}

			// Increase `delta` enough to advance the decoder's <n,i> state to <m,0>,
			// but guard against overflow
			handledCPCountPlusOne = handledCPCount + 1;
			if (m - n > floor((maxInt - delta) / handledCPCountPlusOne)) {
				error('overflow');
			}

			delta += (m - n) * handledCPCountPlusOne;
			n = m;

			for (j = 0; j < inputLength; ++j) {
				currentValue = input[j];

				if (currentValue < n && ++delta > maxInt) {
					error('overflow');
				}

				if (currentValue == n) {
					// Represent delta as a generalized variable-length integer
					for (q = delta, k = base; /* no condition */; k += base) {
						t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);
						if (q < t) {
							break;
						}
						qMinusT = q - t;
						baseMinusT = base - t;
						output.push(
							stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT, 0))
						);
						q = floor(qMinusT / baseMinusT);
					}

					output.push(stringFromCharCode(digitToBasic(q, 0)));
					bias = adapt(delta, handledCPCountPlusOne, handledCPCount == basicLength);
					delta = 0;
					++handledCPCount;
				}
			}

			++delta;
			++n;

		}
		return output.join('');
	}

	/**
	 * Converts a Punycode string representing a domain name or an email address
	 * to Unicode. Only the Punycoded parts of the input will be converted, i.e.
	 * it doesn't matter if you call it on a string that has already been
	 * converted to Unicode.
	 * @memberOf punycode
	 * @param {String} input The Punycoded domain name or email address to
	 * convert to Unicode.
	 * @returns {String} The Unicode representation of the given Punycode
	 * string.
	 */
	function toUnicode(input) {
		return mapDomain(input, function(string) {
			return regexPunycode.test(string)
				? decode(string.slice(4).toLowerCase())
				: string;
		});
	}

	/**
	 * Converts a Unicode string representing a domain name or an email address to
	 * Punycode. Only the non-ASCII parts of the domain name will be converted,
	 * i.e. it doesn't matter if you call it with a domain that's already in
	 * ASCII.
	 * @memberOf punycode
	 * @param {String} input The domain name or email address to convert, as a
	 * Unicode string.
	 * @returns {String} The Punycode representation of the given domain name or
	 * email address.
	 */
	function toASCII(input) {
		return mapDomain(input, function(string) {
			return regexNonASCII.test(string)
				? 'xn--' + encode(string)
				: string;
		});
	}

	/*--------------------------------------------------------------------------*/

	/** Define the public API */
	punycode = {
		/**
		 * A string representing the current Punycode.js version number.
		 * @memberOf punycode
		 * @type String
		 */
		'version': '1.3.2',
		/**
		 * An object of methods to convert from JavaScript's internal character
		 * representation (UCS-2) to Unicode code points, and back.
		 * @see <https://mathiasbynens.be/notes/javascript-encoding>
		 * @memberOf punycode
		 * @type Object
		 */
		'ucs2': {
			'decode': ucs2decode,
			'encode': ucs2encode
		},
		'decode': decode,
		'encode': encode,
		'toASCII': toASCII,
		'toUnicode': toUnicode
	};

	/** Expose `punycode` */
	// Some AMD build optimizers, like r.js, check for specific condition patterns
	// like the following:
	if (
		typeof define == 'function' &&
		typeof define.amd == 'object' &&
		define.amd
	) {
		define('punycode', function() {
			return punycode;
		});
	} else if (freeExports && freeModule) {
		if (module.exports == freeExports) {
			// in Node.js, io.js, or RingoJS v0.8.0+
			freeModule.exports = punycode;
		} else {
			// in Narwhal or RingoJS v0.7.0-
			for (key in punycode) {
				punycode.hasOwnProperty(key) && (freeExports[key] = punycode[key]);
			}
		}
	} else {
		// in Rhino or a web browser
		root.punycode = punycode;
	}

}(this));

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],"node_modules/enroute/node_modules/object-assign/index.js":[function(require,module,exports){
/* eslint-disable no-unused-vars */
'use strict';
var hasOwnProperty = Object.prototype.hasOwnProperty;
var propIsEnumerable = Object.prototype.propertyIsEnumerable;

function toObject(val) {
	if (val === null || val === undefined) {
		throw new TypeError('Object.assign cannot be called with null or undefined');
	}

	return Object(val);
}

module.exports = Object.assign || function (target, source) {
	var from;
	var to = toObject(target);
	var symbols;

	for (var s = 1; s < arguments.length; s++) {
		from = Object(arguments[s]);

		for (var key in from) {
			if (hasOwnProperty.call(from, key)) {
				to[key] = from[key];
			}
		}

		if (Object.getOwnPropertySymbols) {
			symbols = Object.getOwnPropertySymbols(from);
			for (var i = 0; i < symbols.length; i++) {
				if (propIsEnumerable.call(from, symbols[i])) {
					to[symbols[i]] = from[symbols[i]];
				}
			}
		}
	}

	return to;
};

},{}],"node_modules/mako-js/node_modules/querystring-es3/decode.js":[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

// If obj.hasOwnProperty has been overridden, then calling
// obj.hasOwnProperty(prop) will break.
// See: https://github.com/joyent/node/issues/1707
function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

module.exports = function(qs, sep, eq, options) {
  sep = sep || '&';
  eq = eq || '=';
  var obj = {};

  if (typeof qs !== 'string' || qs.length === 0) {
    return obj;
  }

  var regexp = /\+/g;
  qs = qs.split(sep);

  var maxKeys = 1000;
  if (options && typeof options.maxKeys === 'number') {
    maxKeys = options.maxKeys;
  }

  var len = qs.length;
  // maxKeys <= 0 means that we should not limit keys count
  if (maxKeys > 0 && len > maxKeys) {
    len = maxKeys;
  }

  for (var i = 0; i < len; ++i) {
    var x = qs[i].replace(regexp, '%20'),
        idx = x.indexOf(eq),
        kstr, vstr, k, v;

    if (idx >= 0) {
      kstr = x.substr(0, idx);
      vstr = x.substr(idx + 1);
    } else {
      kstr = x;
      vstr = '';
    }

    k = decodeURIComponent(kstr);
    v = decodeURIComponent(vstr);

    if (!hasOwnProperty(obj, k)) {
      obj[k] = v;
    } else if (isArray(obj[k])) {
      obj[k].push(v);
    } else {
      obj[k] = [obj[k], v];
    }
  }

  return obj;
};

var isArray = Array.isArray || function (xs) {
  return Object.prototype.toString.call(xs) === '[object Array]';
};

},{}],"node_modules/mako-js/node_modules/querystring-es3/encode.js":[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

var stringifyPrimitive = function(v) {
  switch (typeof v) {
    case 'string':
      return v;

    case 'boolean':
      return v ? 'true' : 'false';

    case 'number':
      return isFinite(v) ? v : '';

    default:
      return '';
  }
};

module.exports = function(obj, sep, eq, name) {
  sep = sep || '&';
  eq = eq || '=';
  if (obj === null) {
    obj = undefined;
  }

  if (typeof obj === 'object') {
    return map(objectKeys(obj), function(k) {
      var ks = encodeURIComponent(stringifyPrimitive(k)) + eq;
      if (isArray(obj[k])) {
        return map(obj[k], function(v) {
          return ks + encodeURIComponent(stringifyPrimitive(v));
        }).join(sep);
      } else {
        return ks + encodeURIComponent(stringifyPrimitive(obj[k]));
      }
    }).join(sep);

  }

  if (!name) return '';
  return encodeURIComponent(stringifyPrimitive(name)) + eq +
         encodeURIComponent(stringifyPrimitive(obj));
};

var isArray = Array.isArray || function (xs) {
  return Object.prototype.toString.call(xs) === '[object Array]';
};

function map (xs, f) {
  if (xs.map) return xs.map(f);
  var res = [];
  for (var i = 0; i < xs.length; i++) {
    res.push(f(xs[i], i));
  }
  return res;
}

var objectKeys = Object.keys || function (obj) {
  var res = [];
  for (var key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) res.push(key);
  }
  return res;
};

},{}],"node_modules/mako-js/node_modules/url/util.js":[function(require,module,exports){
'use strict';

module.exports = {
  isString: function(arg) {
    return typeof(arg) === 'string';
  },
  isObject: function(arg) {
    return typeof(arg) === 'object' && arg !== null;
  },
  isNull: function(arg) {
    return arg === null;
  },
  isNullOrUndefined: function(arg) {
    return arg == null;
  }
};

},{}],"node_modules/preact-socrates/node_modules/preact/dist/preact.js":[function(require,module,exports){
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.preact = factory());
}(this, function () { 'use strict';

  function VNode(nodeName, attributes, children) {
  	/** @type {string|function} */
  	this.nodeName = nodeName;

  	/** @type {object<string>|undefined} */
  	this.attributes = attributes;

  	/** @type {array<VNode>|undefined} */
  	this.children = children;
  }

  var NO_RENDER = { render: false };
  var SYNC_RENDER = { renderSync: true };
  var DOM_RENDER = { build: true };

  var EMPTY = {};
  var EMPTY_BASE = '';

  // is this a DOM environment
  var HAS_DOM = typeof document !== 'undefined';
  var TEXT_CONTENT = !HAS_DOM || 'textContent' in document ? 'textContent' : 'nodeValue';

  var ATTR_KEY = typeof Symbol !== 'undefined' ? Symbol('preactattr') : '__preactattr_';

  var UNDEFINED_ELEMENT = 'undefined';

  // DOM properties that should NOT have "px" added when numeric
  var NON_DIMENSION_PROPS = {
  	boxFlex: 1, boxFlexGroup: 1, columnCount: 1, fillOpacity: 1, flex: 1, flexGrow: 1,
  	flexPositive: 1, flexShrink: 1, flexNegative: 1, fontWeight: 1, lineClamp: 1, lineHeight: 1,
  	opacity: 1, order: 1, orphans: 1, strokeOpacity: 1, widows: 1, zIndex: 1, zoom: 1
  };

  /** Copy own-properties from `props` onto `obj`.
   *	@returns obj
   *	@private
   */

  function extend(obj, props) {
  	for (var i in props) {
  		if (hasOwnProperty.call(props, i)) {
  			obj[i] = props[i];
  		}
  	}return obj;
  }

  /** Fast clone. Note: does not filter out non-own properties. */

  function clone(obj) {
  	var out = {};
  	/*eslint guard-for-in:0*/
  	for (var i in obj) {
  		out[i] = obj[i];
  	}return out;
  }

  /** Create a caching wrapper for the given function.
   *	@private
   */

  function memoize(fn, mem) {
  	mem = mem || {};
  	return function (k) {
  		return hasOwnProperty.call(mem, k) ? mem[k] : mem[k] = fn(k);
  	};
  }

  /** Get a deep property value from the given object, expressed in dot-notation.
   *	@private
   */

  function delve(obj, key) {
  	for (var p = key.split('.'), i = 0; i < p.length && obj; i++) {
  		obj = obj[p];
  	}
  	return obj;
  }

  /** Convert an Array-like object to an Array
   *	@private
   */

  function toArray(obj) {
  	var arr = [],
  	    i = obj.length;
  	while (i--) arr[i] = obj[i];
  	return arr;
  }

  /** @private is the given object a Function? */
  var isFunction = function isFunction(obj) {
  	return 'function' === typeof obj;
  };

  /** @private is the given object a String? */
  var isString = function isString(obj) {
  	return 'string' === typeof obj;
  };

  /** @private Safe reference to builtin hasOwnProperty */
  var hasOwnProperty = ({}).hasOwnProperty;

  /** Check if a value is `null` or `undefined`.
   *	@private
   */
  var empty = function empty(x) {
  	return x == null;
  };

  /** Convert a hashmap of styles to CSSText
   *	@private
   */

  function styleObjToCss(s) {
  	var str = '';
  	for (var prop in s) {
  		if (hasOwnProperty.call(s, prop)) {
  			var val = s[prop];
  			if (!empty(val)) {
  				str += jsToCss(prop);
  				str += ': ';
  				str += val;
  				if (typeof val === 'number' && !NON_DIMENSION_PROPS[prop]) {
  					str += 'px';
  				}
  				str += '; ';
  			}
  		}
  	}
  	return str;
  }

  /** Convert a hashmap of CSS classes to a space-delimited className string
   *	@private
   */

  function hashToClassName(c) {
  	var str = '';
  	for (var prop in c) {
  		if (c[prop]) {
  			if (str) str += ' ';
  			str += prop;
  		}
  	}
  	return str;
  }

  /** Convert a JavaScript camel-case CSS property name to a CSS property name
   *	@private
   *	@function
   */
  var jsToCss = memoize(function (s) {
  	return s.replace(/([A-Z])/g, '-$1').toLowerCase();
  });

  /** Just a memoized String.prototype.toLowerCase */
  var toLowerCase = memoize(function (s) {
  	return s.toLowerCase();
  });

  // For animations, rAF is vastly superior. However, it scores poorly on benchmarks :(
  // export const setImmediate = typeof requestAnimationFrame==='function' ? requestAnimationFrame : setTimeout;

  var ch = undefined;
  try {
  	ch = new MessageChannel();
  } catch (e) {}

  /** Call a function asynchronously, as soon as possible.
   *	@param {Function} callback
   */
  var setImmediate = ch ? function (f) {
  	ch.port1.onmessage = f;
  	ch.port2.postMessage('');
  } : setTimeout;

  /** Global options
   *	@public
   *	@namespace options {Object}
   */
  var options = {

  	/** If `true`, `prop` changes trigger synchronous component updates.
    *	@name syncComponentUpdates
    *	@type Boolean
    *	@default true
    */
  	//syncComponentUpdates: true,

  	/** Processes all created VNodes.
    *	@param {VNode} vnode	A newly-created VNode to normalize/process
    */
  	vnode: function vnode(n) {
  		var attrs = n.attributes;
  		if (!attrs || isFunction(n.nodeName)) return;

  		// normalize className to class.
  		var p = attrs.className;
  		if (p) {
  			attrs['class'] = p;
  			delete attrs.className;
  		}

  		if (attrs['class']) normalize(attrs, 'class', hashToClassName);
  		if (attrs.style) normalize(attrs, 'style', styleObjToCss);
  	}
  };

  function normalize(obj, prop, fn) {
  	var v = obj[prop];
  	if (v && !isString(v)) {
  		obj[prop] = fn(v);
  	}
  }

  /** Invoke a hook on the `options` export. */

  function optionsHook(name, a, b) {
  	return hook(options, name, a, b);
  }

  /** Invoke a "hook" method with arguments if it exists.
   *	@private
   */

  function hook(obj, name, a, b, c) {
  	var fn = obj[name];
  	if (fn && fn.call) return fn.call(obj, a, b, c);
  }

  /** Invoke hook() on a component and child components (recursively)
   *	@private
   */

  function deepHook(obj, type) {
  	do {
  		hook(obj, type);
  	} while (obj = obj._component);
  }

  var SHARED_TEMP_ARRAY = [];

  /** JSX/hyperscript reviver
   *	@see http://jasonformat.com/wtf-is-jsx
   *	@public
   *  @example
   *  /** @jsx h *\/
   *  import { render, h } from 'preact';
   *  render(<span>foo</span>, document.body);
   */
  function h(nodeName, attributes) {
  	var len = arguments.length,
  	    children = undefined,
  	    arr = undefined,
  	    lastSimple = undefined;

  	if (len > 2) {
  		children = [];
  		for (var i = 2; i < len; i++) {
  			var _p = arguments[i];
  			if (empty(_p)) continue;
  			if (_p.join) {
  				arr = _p;
  			} else {
  				arr = SHARED_TEMP_ARRAY;
  				arr[0] = _p;
  			}
  			for (var j = 0; j < arr.length; j++) {
  				var child = arr[j],
  				    simple = !empty(child) && !(child instanceof VNode);
  				if (simple) child = String(child);
  				if (simple && lastSimple) {
  					children[children.length - 1] += child;
  				} else if (!empty(child)) {
  					children.push(child);
  				}
  				lastSimple = simple;
  			}
  		}
  	}

  	if (attributes && attributes.children) {
  		delete attributes.children;
  	}

  	var p = new VNode(nodeName, attributes || undefined, children || undefined);
  	optionsHook('vnode', p);
  	return p;
  }

  /** Create an Event handler function that sets a given state property.
   *	@param {Component} component	The component whose state should be updated
   *	@param {string} key				A dot-notated key path to update in the component's state
   *	@param {string} eventPath		A dot-notated key path to the value that should be retrieved from the Event or component
   *	@returns {function} linkedStateHandler
   *	@private
   */

  function createLinkedState(component, key, eventPath) {
  	var path = key.split('.'),
  	    p0 = path[0],
  	    len = path.length;
  	return function (e) {
  		var _component$setState;

  		var t = this,
  		    s = component.state,
  		    obj = s,
  		    v = undefined,
  		    i = undefined;
  		if (isString(eventPath)) {
  			v = delve(e, eventPath);
  			if (empty(v) && (t = t._component)) {
  				v = delve(t, eventPath);
  			}
  		} else {
  			v = (t.nodeName + t.type).match(/^input(checkbox|radio)$/i) ? t.checked : t.value;
  		}
  		if (isFunction(v)) v = v.call(t);
  		if (len > 1) {
  			for (i = 0; i < len - 1; i++) {
  				obj = obj[path[i]] || (obj[path[i]] = {});
  			}
  			obj[path[i]] = v;
  			v = s[p0];
  		}
  		component.setState((_component$setState = {}, _component$setState[p0] = v, _component$setState));
  	};
  }

  var items = [];
  var itemsOffline = [];
  function enqueueRender(component) {
  	if (items.push(component) !== 1) return;

  	(options.debounceRendering || setImmediate)(rerender);
  }

  function rerender() {
  	if (!items.length) return;

  	var currentItems = items,
  	    p = undefined;

  	// swap online & offline
  	items = itemsOffline;
  	itemsOffline = currentItems;

  	while (p = currentItems.pop()) {
  		if (p._dirty) renderComponent(p);
  	}
  }

  /** Check if a VNode is a reference to a stateless functional component.
   *	A function component is represented as a VNode whose `nodeName` property is a reference to a function.
   *	If that function is not a Component (ie, has no `.render()` method on a prototype), it is considered a stateless functional component.
   *	@param {VNode} vnode	A VNode
   *	@private
   */

  function isFunctionalComponent(_ref) {
    var nodeName = _ref.nodeName;

    return isFunction(nodeName) && !nodeName.prototype.render;
  }

  /** Construct a resultant VNode from a VNode referencing a stateless functional component.
   *	@param {VNode} vnode	A VNode with a `nodeName` property that is a reference to a function.
   *	@private
   */

  function buildFunctionalComponent(vnode, context) {
    return vnode.nodeName(getNodeProps(vnode), context) || EMPTY_BASE;
  }

  function ensureNodeData(node) {
  	return node[ATTR_KEY] || (node[ATTR_KEY] = {});
  }

  function getNodeType(node) {
  	return node.nodeType;
  }

  /** Append multiple children to a Node.
   *	Uses a Document Fragment to batch when appending 2 or more children
   *	@private
   */

  function appendChildren(parent, children) {
  	var len = children.length,
  	    many = len > 2,
  	    into = many ? document.createDocumentFragment() : parent;
  	for (var i = 0; i < len; i++) {
  		into.appendChild(children[i]);
  	}if (many) parent.appendChild(into);
  }

  /** Retrieve the value of a rendered attribute
   *	@private
   */

  function getAccessor(node, name, value, cache) {
  	if (name !== 'type' && name !== 'style' && name in node) return node[name];
  	var attrs = node[ATTR_KEY];
  	if (cache !== false && attrs && hasOwnProperty.call(attrs, name)) return attrs[name];
  	if (name === 'class') return node.className;
  	if (name === 'style') return node.style.cssText;
  	return value;
  }

  /** Set a named attribute on the given Node, with special behavior for some names and event handlers.
   *	If `value` is `null`, the attribute/handler will be removed.
   *	@param {Element} node	An element to mutate
   *	@param {string} name	The name/key to set, such as an event or attribute name
   *	@param {any} value		An attribute value, such as a function to be used as an event handler
   *	@param {any} previousValue	The last value that was set for this name/node pair
   *	@private
   */

  function setAccessor(node, name, value) {
  	if (name === 'class') {
  		node.className = value || '';
  	} else if (name === 'style') {
  		node.style.cssText = value || '';
  	} else if (name === 'dangerouslySetInnerHTML') {
  		node.innerHTML = value.__html;
  	} else if (name === 'key' || name in node && name !== 'type') {
  		node[name] = value;
  	} else {
  		setComplexAccessor(node, name, value);
  	}

  	ensureNodeData(node)[name] = value;
  }

  /** For props without explicit behavior, apply to a Node as event handlers or attributes.
   *	@private
   */
  function setComplexAccessor(node, name, value) {
  	if (name.substring(0, 2) === 'on') {
  		var _type = normalizeEventName(name),
  		    l = node._listeners || (node._listeners = {}),
  		    fn = !l[_type] ? 'add' : !value ? 'remove' : null;
  		if (fn) node[fn + 'EventListener'](_type, eventProxy);
  		l[_type] = value;
  		return;
  	}

  	var type = typeof value;
  	if (value === null) {
  		node.removeAttribute(name);
  	} else if (type !== 'function' && type !== 'object') {
  		node.setAttribute(name, value);
  	}
  }

  /** Proxy an event to hooked event handlers
   *	@private
   */
  function eventProxy(e) {
  	var fn = this._listeners[normalizeEventName(e.type)];
  	if (fn) return fn.call(this, optionsHook('event', e) || e);
  }

  /** Convert an Event name/type to lowercase and strip any "on*" prefix.
   *	@function
   *	@private
   */
  var normalizeEventName = memoize(function (t) {
  	return t.replace(/^on/i, '').toLowerCase();
  });

  /** Get a hashmap of node properties, preferring preact's cached property values over the DOM's
   *	@private
   */

  function getNodeAttributes(node) {
  	return node[ATTR_KEY] || getRawNodeAttributes(node) || EMPTY;
  	// let list = getRawNodeAttributes(node),
  	// 	l = node[ATTR_KEY];
  	// return l && list ? extend(list, l) : (l || list || EMPTY);
  }

  /** Get a node's attributes as a hashmap, regardless of type.
   *	@private
   */
  function getRawNodeAttributes(node) {
  	var list = node.attributes;
  	if (!list || !list.getNamedItem) return list;
  	return getAttributesAsObject(list);
  }

  /** Convert a DOM `.attributes` NamedNodeMap to a hashmap.
   *	@private
   */
  function getAttributesAsObject(list) {
  	var attrs = undefined;
  	for (var i = list.length; i--;) {
  		var item = list[i];
  		if (!attrs) attrs = {};
  		attrs[item.name] = item.value;
  	}
  	return attrs;
  }

  /** Check if two nodes are equivalent.
   *	@param {Element} node
   *	@param {VNode} vnode
   *	@private
   */

  function isSameNodeType(node, vnode) {
  	if (isFunctionalComponent(vnode)) return true;
  	var nodeName = vnode.nodeName;
  	if (isFunction(nodeName)) return node._componentConstructor === nodeName;
  	if (getNodeType(node) === 3) return isString(vnode);
  	return toLowerCase(node.nodeName) === nodeName;
  }

  /**
   * Reconstruct Component-style `props` from a VNode.
   * Ensures default/fallback values from `defaultProps`:
   * Own-properties of `defaultProps` not present in `vnode.attributes` are added.
   * @param {VNode} vnode
   * @returns {Object} props
   */

  function getNodeProps(vnode) {
  	var props = clone(vnode.attributes),
  	    c = vnode.children;
  	if (c) props.children = c;

  	var defaultProps = vnode.nodeName.defaultProps;
  	if (defaultProps) {
  		for (var i in defaultProps) {
  			if (hasOwnProperty.call(defaultProps, i) && !(i in props)) {
  				props[i] = defaultProps[i];
  			}
  		}
  	}

  	return props;
  }

  /** DOM node pool, keyed on nodeName. */

  var nodes = {};

  var normalizeName = memoize(function (name) {
  	return name.toUpperCase();
  });

  function collectNode(node) {
  	cleanNode(node);
  	var name = normalizeName(node.nodeName),
  	    list = nodes[name];
  	if (list) list.push(node);else nodes[name] = [node];
  }

  function createNode(nodeName) {
  	var name = normalizeName(nodeName),
  	    list = nodes[name],
  	    node = list && list.pop() || document.createElement(nodeName);
  	ensureNodeData(node);
  	return node;
  }

  function cleanNode(node) {
  	var p = node.parentNode;
  	if (p) p.removeChild(node);

  	if (getNodeType(node) === 3) return;

  	node._component = node._componentConstructor = null;

  	// if (node.childNodes.length>0) {
  	// 	console.trace(`Warning: Recycler collecting <${node.nodeName}> with ${node.childNodes.length} children.`);
  	// 	for (let i=node.childNodes.length; i--; ) collectNode(node.childNodes[i]);
  	// }
  }

  /** Apply differences in a given vnode (and it's deep children) to a real DOM Node.
   *	@param {Element} [dom=null]		A DOM node to mutate into the shape of the `vnode`
   *	@param {VNode} vnode			A VNode (with descendants forming a tree) representing the desired DOM structure
   *	@returns {Element} dom			The created/mutated element
   *	@private
   */
  function diff(dom, vnode, context, component) {
  	while (isFunctionalComponent(vnode)) {
  		vnode = buildFunctionalComponent(vnode, context);
  	}

  	if (isFunction(vnode.nodeName)) {
  		return buildComponentFromVNode(dom, vnode, context);
  	}

  	if (isString(vnode)) {
  		if (dom) {
  			var type = getNodeType(dom);
  			if (type === 3) {
  				dom[TEXT_CONTENT] = vnode;
  				return dom;
  			} else if (type === 1) {
  				collectNode(dom);
  			}
  		}
  		return document.createTextNode(vnode);
  	}

  	// return diffNode(dom, vnode, context);
  	// }

  	/** Morph a DOM node to look like the given VNode. Creates DOM if it doesn't exist. */
  	// function diffNode(dom, vnode, context) {
  	var out = dom,
  	    nodeName = vnode.nodeName || UNDEFINED_ELEMENT;

  	if (!dom) {
  		out = createNode(nodeName);
  	} else if (toLowerCase(dom.nodeName) !== nodeName) {
  		out = createNode(nodeName);
  		// move children into the replacement node
  		appendChildren(out, toArray(dom.childNodes));
  		// reclaim element nodes
  		recollectNodeTree(dom);
  	}

  	innerDiffNode(out, vnode, context);

  	var attrs = vnode.attributes,
  	    c = out._component;
  	if (attrs) hook(attrs, 'ref', (!component || c === component) && c || out);

  	return out;
  }

  /** Apply child and attribute changes between a VNode and a DOM Node to the DOM. */
  function innerDiffNode(dom, vnode, context) {
  	var children = undefined,
  	    keyed = undefined,
  	    keyedLen = 0,
  	    len = dom.childNodes.length,
  	    childrenLen = 0;
  	if (len) {
  		children = [];
  		for (var i = 0; i < len; i++) {
  			var child = dom.childNodes[i],
  			    props = child._component && child._component.props,
  			    key = props ? props.key : getAccessor(child, 'key');
  			if (!empty(key)) {
  				if (!keyed) keyed = {};
  				keyed[key] = child;
  				keyedLen++;
  			} else {
  				children[childrenLen++] = child;
  			}
  		}
  	}

  	diffAttributes(dom, vnode);

  	var vchildren = vnode.children,
  	    vlen = vchildren && vchildren.length,
  	    min = 0;
  	if (vlen) {
  		for (var i = 0; i < vlen; i++) {
  			var vchild = vchildren[i],
  			    child = undefined;

  			// if (isFunctionalComponent(vchild)) {
  			// 	vchild = buildFunctionalComponent(vchild);
  			// }

  			// attempt to find a node based on key matching
  			if (keyedLen) {
  				var attrs = vchild.attributes,
  				    key = attrs && attrs.key;
  				if (!empty(key) && keyed.hasOwnProperty(key)) {
  					child = keyed[key];
  					keyed[key] = null;
  					keyedLen--;
  				}
  			}

  			// attempt to pluck a node of the same type from the existing children
  			if (!child && min < childrenLen) {
  				for (var j = min; j < childrenLen; j++) {
  					var c = children[j];
  					if (c && isSameNodeType(c, vchild)) {
  						child = c;
  						children[j] = null;
  						if (j === childrenLen - 1) childrenLen--;
  						if (j === min) min++;
  						break;
  					}
  				}
  			}

  			// morph the matched/found/created DOM child to match vchild (deep)
  			child = diff(child, vchild, context);

  			if (dom.childNodes[i] !== child) {
  				var c = child.parentNode !== dom && child._component,
  				    next = dom.childNodes[i + 1];
  				if (c) deepHook(c, 'componentWillMount');
  				if (next) {
  					dom.insertBefore(child, next);
  				} else {
  					dom.appendChild(child);
  				}
  				if (c) deepHook(c, 'componentDidMount');
  			}
  		}
  	}

  	if (keyedLen) {
  		/*eslint guard-for-in:0*/
  		for (var i in keyed) {
  			if (keyed.hasOwnProperty(i) && keyed[i]) {
  				children[childrenLen++] = keyed[i];
  			}
  		}
  	}

  	// remove orphaned children
  	if (min < childrenLen) {
  		removeOrphanedChildren(dom, children);
  	}
  }

  /** Reclaim children that were unreferenced in the desired VTree */

  function removeOrphanedChildren(out, children, unmountOnly) {
  	for (var i = children.length; i--;) {
  		var child = children[i];
  		if (child) {
  			recollectNodeTree(child, unmountOnly);
  		}
  	}
  }

  /** Reclaim an entire tree of nodes, starting at the root. */

  function recollectNodeTree(node, unmountOnly) {
  	// @TODO: Need to make a call on whether Preact should remove nodes not created by itself.
  	// Currently it *does* remove them. Discussion: https://github.com/developit/preact/issues/39
  	//if (!node[ATTR_KEY]) return;

  	var attrs = node[ATTR_KEY];
  	if (attrs) hook(attrs, 'ref', null);

  	var component = node._component;
  	if (component) {
  		unmountComponent(node, component);
  	} else {
  		if (!unmountOnly) {
  			if (getNodeType(node) !== 1) {
  				var p = node.parentNode;
  				if (p) p.removeChild(node);
  				return;
  			}

  			collectNode(node);
  		}

  		var c = node.childNodes;
  		if (c && c.length) {
  			removeOrphanedChildren(node, c, unmountOnly);
  		}
  	}
  }

  /** Apply differences in attributes from a VNode to the given DOM Node. */
  function diffAttributes(dom, vnode) {
  	var old = getNodeAttributes(dom) || EMPTY,
  	    attrs = vnode.attributes || EMPTY,
  	    name = undefined,
  	    value = undefined;

  	// removed
  	for (name in old) {
  		if (empty(attrs[name])) {
  			setAccessor(dom, name, null);
  		}
  	}

  	// new & updated
  	if (attrs !== EMPTY) {
  		for (name in attrs) {
  			if (hasOwnProperty.call(attrs, name)) {
  				value = attrs[name];
  				if (!empty(value) && value != getAccessor(dom, name)) {
  					setAccessor(dom, name, value);
  				}
  			}
  		}
  	}
  }

  var components = {};

  function collectComponent(component) {
  	var name = component.constructor.name,
  	    list = components[name];
  	if (list) list.push(component);else components[name] = [component];
  }

  function createComponent(ctor, props, context) {
  	var list = components[ctor.name],
  	    len = list && list.length,
  	    c = undefined;
  	for (var i = 0; i < len; i++) {
  		c = list[i];
  		if (c.constructor === ctor) {
  			list.splice(i, 1);
  			return c;
  		}
  	}
  	return new ctor(props, context);
  }

  /** Mark component as dirty and queue up a render.
   *	@param {Component} component
   *	@private
   */

  function triggerComponentRender(component) {
  	if (!component._dirty) {
  		component._dirty = true;
  		enqueueRender(component);
  	}
  }

  /** Set a component's `props` (generally derived from JSX attributes).
   *	@param {Object} props
   *	@param {Object} [opts]
   *	@param {boolean} [opts.renderSync=false]	If `true` and {@link options.syncComponentUpdates} is `true`, triggers synchronous rendering.
   *	@param {boolean} [opts.render=true]			If `false`, no render will be triggered.
   */

  function setComponentProps(component, props, opts, context) {
  	var d = component._disableRendering;
  	component._disableRendering = true;

  	opts = opts || EMPTY;

  	if (context) {
  		if (!component.prevContext) component.prevContext = clone(component.context);
  		component.context = context;
  	}

  	if (component.base) {
  		hook(component, 'componentWillReceiveProps', props, component.context);
  	}

  	if (!component.prevProps) component.prevProps = clone(component.props);
  	component.props = props;

  	component._disableRendering = d;

  	if (opts.render !== false) {
  		if (opts.renderSync || options.syncComponentUpdates !== false) {
  			renderComponent(component);
  		} else {
  			triggerComponentRender(component);
  		}
  	}

  	hook(props, 'ref', component);
  }

  /** Render a Component, triggering necessary lifecycle events and taking High-Order Components into account.
   *	@param {Component} component
   *	@param {Object} [opts]
   *	@param {boolean} [opts.build=false]		If `true`, component will build and store a DOM node if not already associated with one.
   *	@private
   */

  function renderComponent(component, opts) {
  	if (component._disableRendering) return;

  	var skip = undefined,
  	    rendered = undefined,
  	    props = component.props,
  	    state = component.state,
  	    context = component.context,
  	    previousProps = component.prevProps || props,
  	    previousState = component.prevState || state,
  	    previousContext = component.prevContext || context,
  	    isUpdate = component.base;

  	if (isUpdate) {
  		component.props = previousProps;
  		component.state = previousState;
  		component.context = previousContext;
  		if (hook(component, 'shouldComponentUpdate', props, state, context) === false) {
  			skip = true;
  		} else {
  			hook(component, 'componentWillUpdate', props, state, context);
  		}
  		component.props = props;
  		component.state = state;
  		component.context = context;
  	}

  	component.prevProps = component.prevState = component.prevContext = null;
  	component._dirty = false;

  	if (!skip) {
  		rendered = hook(component, 'render', props, state, context);

  		var childComponent = rendered && rendered.nodeName,
  		    childContext = component.getChildContext ? component.getChildContext() : context,
  		    toUnmount = undefined,
  		    base = undefined;

  		if (isFunction(childComponent) && childComponent.prototype.render) {
  			// set up high order component link

  			var inst = component._component;
  			if (inst && inst.constructor !== childComponent) {
  				toUnmount = inst;
  				inst = null;
  			}

  			var childProps = getNodeProps(rendered);

  			if (inst) {
  				setComponentProps(inst, childProps, SYNC_RENDER, childContext);
  			} else {
  				inst = createComponent(childComponent, childProps, childContext);
  				inst._parentComponent = component;
  				component._component = inst;
  				if (component.base) deepHook(inst, 'componentWillMount');
  				setComponentProps(inst, childProps, NO_RENDER, childContext);
  				renderComponent(inst, DOM_RENDER);
  				if (component.base) deepHook(inst, 'componentDidMount');
  			}

  			base = inst.base;
  		} else {
  			var cbase = component.base;

  			// destroy high order component link
  			toUnmount = component._component;
  			if (toUnmount) {
  				cbase = component._component = null;
  			}

  			if (component.base || opts && opts.build) {
  				base = diff(cbase, rendered || EMPTY_BASE, childContext, component);
  			}
  		}

  		if (component.base && base !== component.base) {
  			var p = component.base.parentNode;
  			if (p) p.replaceChild(base, component.base);
  		}

  		if (toUnmount) {
  			unmountComponent(toUnmount.base, toUnmount);
  		}

  		component.base = base;
  		if (base) {
  			var componentRef = component,
  			    t = component;
  			while (t = t._parentComponent) {
  				componentRef = t;
  			}
  			base._component = componentRef;
  			base._componentConstructor = componentRef.constructor;
  		}

  		if (isUpdate) {
  			hook(component, 'componentDidUpdate', previousProps, previousState, previousContext);
  		}
  	}

  	var cb = component._renderCallbacks,
  	    fn = undefined;
  	if (cb) while (fn = cb.pop()) fn.call(component);

  	return rendered;
  }

  /** Apply the Component referenced by a VNode to the DOM.
   *	@param {Element} dom	The DOM node to mutate
   *	@param {VNode} vnode	A Component-referencing VNode
   *	@returns {Element} dom	The created/mutated element
   *	@private
   */

  function buildComponentFromVNode(dom, vnode, context) {
  	var c = dom && dom._component;

  	var isOwner = c && dom._componentConstructor === vnode.nodeName;
  	while (c && !isOwner && (c = c._parentComponent)) {
  		isOwner = c.constructor === vnode.nodeName;
  	}

  	if (isOwner) {
  		setComponentProps(c, getNodeProps(vnode), SYNC_RENDER, context);
  		dom = c.base;
  	} else {
  		if (c) {
  			unmountComponent(dom, c);
  			dom = null;
  		}
  		dom = createComponentFromVNode(vnode, dom, context);
  	}

  	return dom;
  }

  /** Instantiate and render a Component, given a VNode whose nodeName is a constructor.
   *	@param {VNode} vnode
   *	@private
   */
  function createComponentFromVNode(vnode, dom, context) {
  	var props = getNodeProps(vnode);
  	var component = createComponent(vnode.nodeName, props, context);

  	if (dom && !component.base) component.base = dom;

  	setComponentProps(component, props, NO_RENDER, context);
  	renderComponent(component, DOM_RENDER);

  	// let node = component.base;
  	//if (!node._component) {
  	//	node._component = component;
  	//	node._componentConstructor = vnode.nodeName;
  	//}

  	return component.base;
  }

  /** Remove a component from the DOM and recycle it.
   *	@param {Element} dom			A DOM node from which to unmount the given Component
   *	@param {Component} component	The Component instance to unmount
   *	@private
   */

  function unmountComponent(dom, component, remove) {
  	// console.warn('unmounting mismatched component', component);

  	hook(component.props, 'ref', null);
  	deepHook(component, 'componentWillUnmount');
  	if (dom._component === component) {
  		delete dom._component;
  		delete dom._componentConstructor;
  	}
  	var base = component.base;
  	if (base) {
  		if (remove !== false) {
  			var p = base.parentNode;
  			if (p) p.removeChild(base);
  		}
  		removeOrphanedChildren(base, base.childNodes, true);
  	}
  	component._parentComponent = null;
  	deepHook(component, 'componentDidUnmount');
  	collectComponent(component);
  }

  /** Base Component class, for he ES6 Class method of creating Components
   *	@public
   *
   *	@example
   *	class MyFoo extends Component {
   *		render(props, state) {
   *			return <div />;
   *		}
   *	}
   */
  function Component(props, context) {
  	/** @private */
  	this._dirty = this._disableRendering = false;
  	/** @private */
  	this._linkedStates = {};
  	/** @private */
  	this._renderCallbacks = [];
  	/** @public */
  	this.prevState = this.prevProps = this.prevContext = this.base = this._parentComponent = this._component = null;
  	/** @public */
  	this.context = context || null;
  	/** @type {object} */
  	this.props = props || {};
  	/** @type {object} */
  	this.state = hook(this, 'getInitialState') || {};
  }

  extend(Component.prototype, {

  	/** Returns a `boolean` value indicating if the component should re-render when receiving the given `props` and `state`.
    *	@param {object} nextProps
    *	@param {object} nextState
    *	@param {object} nextContext
    *	@returns {Boolean} should the component re-render
    *	@name shouldComponentUpdate
    *	@function
    */
  	// shouldComponentUpdate() {
  	// 	return true;
  	// },

  	/** Returns a function that sets a state property when called.
    *	Calling linkState() repeatedly with the same arguments returns a cached link function.
    *
    *	Provides some built-in special cases:
    *		- Checkboxes and radio buttons link their boolean `checked` value
    *		- Inputs automatically link their `value` property
    *		- Event paths fall back to any associated Component if not found on an element
    *		- If linked value is a function, will invoke it and use the result
    *
    *	@param {string} key				The path to set - can be a dot-notated deep key
    *	@param {string} [eventPath]		If set, attempts to find the new state value at a given dot-notated path within the object passed to the linkedState setter.
    *	@returns {function} linkStateSetter(e)
    *
    *	@example Update a "text" state value when an input changes:
    *		<input onChange={ this.linkState('text') } />
    *
    *	@example Set a deep state value on click
    *		<button onClick={ this.linkState('touch.coords', 'touches.0') }>Tap</button
    */
  	linkState: function linkState(key, eventPath) {
  		var c = this._linkedStates,
  		    cacheKey = key + '|' + (eventPath || '');
  		return c[cacheKey] || (c[cacheKey] = createLinkedState(this, key, eventPath));
  	},

  	/** Update component state by copying properties from `state` to `this.state`.
    *	@param {object} state		A hash of state properties to update with new values
    */
  	setState: function setState(state, callback) {
  		var s = this.state;
  		if (!this.prevState) this.prevState = clone(s);
  		extend(s, isFunction(state) ? state(s, this.props) : state);
  		if (callback) this._renderCallbacks.push(callback);
  		triggerComponentRender(this);
  	},

  	/** Immediately perform a synchronous re-render of the component.
    *	@private
    */
  	forceUpdate: function forceUpdate() {
  		renderComponent(this);
  	},

  	/** Accepts `props` and `state`, and returns a new Virtual DOM tree to build.
    *	Virtual DOM is generally constructed via [JSX](http://jasonformat.com/wtf-is-jsx).
    *	@param {object} props		Props (eg: JSX attributes) received from parent element/component
    *	@param {object} state		The component's current state
    *	@returns VNode
    */
  	render: function render() {
  		return null;
  	}

  });

  /** Render JSX into a `parent` Element.
   *	@param {VNode} vnode		A (JSX) VNode to render
   *	@param {Element} parent		DOM element to render into
   *	@param {Element} [merge]	Attempt to re-use an existing DOM tree rooted at `merge`
   *	@public
   *
   *	@example
   *	// render a div into <body>:
   *	render(<div id="hello">hello!</div>, document.body);
   *
   *	@example
   *	// render a "Thing" component into #foo:
   *	const Thing = ({ name }) => <span>{ name }</span>;
   *	render(<Thing name="one" />, document.querySelector('#foo'));
   */
  function render(vnode, parent, merge) {
    var existing = merge && merge._component && merge._componentConstructor === vnode.nodeName,
        built = diff(merge, vnode),
        c = !existing && built._component;

    if (c) deepHook(c, 'componentWillMount');

    if (built.parentNode !== parent) {
      parent.appendChild(built);
    }

    if (c) deepHook(c, 'componentDidMount');

    return built;
  }

  var preact = {
  	h: h,
  	Component: Component,
  	render: render,
  	rerender: rerender,
  	options: options,
  	hooks: options
  };

  return preact;

}));

},{}],"node_modules/socrates/node_modules/sliced/index.js":[function(require,module,exports){

/**
 * An Array.prototype.slice.call(arguments) alternative
 *
 * @param {Object} args something with a length
 * @param {Number} slice
 * @param {Number} sliceEnd
 * @api public
 */

module.exports = function (args, slice, sliceEnd) {
  var ret = [];
  var len = args.length;

  if (0 === len) return ret;

  var start = slice < 0
    ? Math.max(0, slice + len)
    : slice || 0;

  if (sliceEnd !== undefined) {
    len = sliceEnd < 0
      ? sliceEnd + len
      : sliceEnd
  }

  while (len-- > start) {
    ret[len - start] = args[len];
  }

  return ret;
}


},{}],"node_modules/socrates/node_modules/object-assign/index.js":[function(require,module,exports){
/* eslint-disable no-unused-vars */
'use strict';
var hasOwnProperty = Object.prototype.hasOwnProperty;
var propIsEnumerable = Object.prototype.propertyIsEnumerable;

function toObject(val) {
	if (val === null || val === undefined) {
		throw new TypeError('Object.assign cannot be called with null or undefined');
	}

	return Object(val);
}

module.exports = Object.assign || function (target, source) {
	var from;
	var to = toObject(target);
	var symbols;

	for (var s = 1; s < arguments.length; s++) {
		from = Object(arguments[s]);

		for (var key in from) {
			if (hasOwnProperty.call(from, key)) {
				to[key] = from[key];
			}
		}

		if (Object.getOwnPropertySymbols) {
			symbols = Object.getOwnPropertySymbols(from);
			for (var i = 0; i < symbols.length; i++) {
				if (propIsEnumerable.call(from, symbols[i])) {
					to[symbols[i]] = from[symbols[i]];
				}
			}
		}
	}

	return to;
};

},{}],"node_modules/enroute/node_modules/path-to-regexp/node_modules/isarray/index.js":[function(require,module,exports){
module.exports = Array.isArray || function (arr) {
  return Object.prototype.toString.call(arr) == '[object Array]';
};

},{}],"node_modules/mako-js/node_modules/process/browser.js":[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = setTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    clearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        setTimeout(drainQueue, 0);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],"node_modules/socrates/node_modules/redux/lib/bindActionCreators.js":[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports["default"] = bindActionCreators;
function bindActionCreator(actionCreator, dispatch) {
  return function () {
    return dispatch(actionCreator.apply(undefined, arguments));
  };
}

/**
 * Turns an object whose values are action creators, into an object with the
 * same keys, but with every function wrapped into a `dispatch` call so they
 * may be invoked directly. This is just a convenience method, as you can call
 * `store.dispatch(MyActionCreators.doSomething())` yourself just fine.
 *
 * For convenience, you can also pass a single function as the first argument,
 * and get a function in return.
 *
 * @param {Function|Object} actionCreators An object whose values are action
 * creator functions. One handy way to obtain it is to use ES6 `import * as`
 * syntax. You may also pass a single function.
 *
 * @param {Function} dispatch The `dispatch` function available on your Redux
 * store.
 *
 * @returns {Function|Object} The object mimicking the original object, but with
 * every action creator wrapped into the `dispatch` call. If you passed a
 * function as `actionCreators`, the return value will also be a single
 * function.
 */
function bindActionCreators(actionCreators, dispatch) {
  if (typeof actionCreators === 'function') {
    return bindActionCreator(actionCreators, dispatch);
  }

  if (typeof actionCreators !== 'object' || actionCreators === null) {
    throw new Error('bindActionCreators expected an object or a function, instead received ' + (actionCreators === null ? 'null' : typeof actionCreators) + '. ' + 'Did you write "import ActionCreators from" instead of "import * as ActionCreators from"?');
  }

  var keys = Object.keys(actionCreators);
  var boundActionCreators = {};
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    var actionCreator = actionCreators[key];
    if (typeof actionCreator === 'function') {
      boundActionCreators[key] = bindActionCreator(actionCreator, dispatch);
    }
  }
  return boundActionCreators;
}
},{}],"node_modules/socrates/node_modules/redux/lib/compose.js":[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports["default"] = compose;
/**
 * Composes single-argument functions from right to left.
 *
 * @param {...Function} funcs The functions to compose.
 * @returns {Function} A function obtained by composing functions from right to
 * left. For example, compose(f, g, h) is identical to arg => f(g(h(arg))).
 */
function compose() {
  for (var _len = arguments.length, funcs = Array(_len), _key = 0; _key < _len; _key++) {
    funcs[_key] = arguments[_key];
  }

  return function () {
    if (funcs.length === 0) {
      return arguments.length <= 0 ? undefined : arguments[0];
    }

    var last = funcs[funcs.length - 1];
    var rest = funcs.slice(0, -1);

    return rest.reduceRight(function (composed, f) {
      return f(composed);
    }, last.apply(undefined, arguments));
  };
}
},{}],"node_modules/socrates/node_modules/redux/lib/utils/warning.js":[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports["default"] = warning;
/**
 * Prints a warning in the console if it exists.
 *
 * @param {String} message The warning message.
 * @returns {void}
 */
function warning(message) {
  /* eslint-disable no-console */
  if (typeof console !== 'undefined' && typeof console.error === 'function') {
    console.error(message);
  }
  /* eslint-enable no-console */
  try {
    // This error was thrown as a convenience so that you can use this stack
    // to find the callsite that caused this warning to fire.
    throw new Error(message);
    /* eslint-disable no-empty */
  } catch (e) {}
  /* eslint-enable no-empty */
}
},{}],"node_modules/preact-socrates/node_modules/component-raf/index.js":[function(require,module,exports){
/**
 * Expose `requestAnimationFrame()`.
 */

exports = module.exports = window.requestAnimationFrame
  || window.webkitRequestAnimationFrame
  || window.mozRequestAnimationFrame
  || fallback;

/**
 * Fallback implementation.
 */

var prev = new Date().getTime();
function fallback(fn) {
  var curr = new Date().getTime();
  var ms = Math.max(0, 16 - (curr - prev));
  var req = setTimeout(fn, ms);
  prev = curr;
  return req;
}

/**
 * Cancel.
 */

var cancel = window.cancelAnimationFrame
  || window.webkitCancelAnimationFrame
  || window.mozCancelAnimationFrame
  || window.clearTimeout;

exports.cancel = function(id){
  cancel.call(window, id);
};

},{}],"node_modules/preact-socrates/node_modules/object-assign/index.js":[function(require,module,exports){
/* eslint-disable no-unused-vars */
'use strict';
var hasOwnProperty = Object.prototype.hasOwnProperty;
var propIsEnumerable = Object.prototype.propertyIsEnumerable;

function toObject(val) {
	if (val === null || val === undefined) {
		throw new TypeError('Object.assign cannot be called with null or undefined');
	}

	return Object(val);
}

module.exports = Object.assign || function (target, source) {
	var from;
	var to = toObject(target);
	var symbols;

	for (var s = 1; s < arguments.length; s++) {
		from = Object(arguments[s]);

		for (var key in from) {
			if (hasOwnProperty.call(from, key)) {
				to[key] = from[key];
			}
		}

		if (Object.getOwnPropertySymbols) {
			symbols = Object.getOwnPropertySymbols(from);
			for (var i = 0; i < symbols.length; i++) {
				if (propIsEnumerable.call(from, symbols[i])) {
					to[symbols[i]] = from[symbols[i]];
				}
			}
		}
	}

	return to;
};

},{}],"node_modules/socrates/node_modules/isobj/index.js":[function(require,module,exports){
'use strict';

module.exports = function (obj) {
  return Object.prototype.toString.call(obj) === '[object Object]';
};

},{}],"node_modules/socrates/node_modules/component-xor/index.js":[function(require,module,exports){
/**
 * Expose `xor`
 */

module.exports = xor;

/**
 * XOR utility
 *
 * T T F
 * T F T
 * F T T
 * F F F
 *
 * @param {Boolean} a
 * @param {Boolean} b
 * @return {Boolean}
 */

function xor(a, b) {
  return a ^ b;
}

},{}],"node_modules/socrates/node_modules/redux/node_modules/lodash/_isHostObject.js":[function(require,module,exports){
/**
 * Checks if `value` is a host object in IE < 9.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a host object, else `false`.
 */
function isHostObject(value) {
  // Many host objects are `Object` objects that can coerce to strings
  // despite having improperly defined `toString` methods.
  var result = false;
  if (value != null && typeof value.toString != 'function') {
    try {
      result = !!(value + '');
    } catch (e) {}
  }
  return result;
}

module.exports = isHostObject;

},{}],"node_modules/socrates/node_modules/redux/node_modules/lodash/isObjectLike.js":[function(require,module,exports){
/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return !!value && typeof value == 'object';
}

module.exports = isObjectLike;

},{}],"node_modules/socrates/node_modules/lodash.iserror/index.js":[function(require,module,exports){
/**
 * lodash 3.1.1 (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright 2012-2016 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2016 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */

/** `Object#toString` result references. */
var errorTag = '[object Error]';

/** Used for built-in method references. */
var objectProto = Object.prototype;

/**
 * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString = objectProto.toString;

/**
 * Checks if `value` is an `Error`, `EvalError`, `RangeError`, `ReferenceError`,
 * `SyntaxError`, `TypeError`, or `URIError` object.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an error object, else `false`.
 * @example
 *
 * _.isError(new Error);
 * // => true
 *
 * _.isError(Error);
 * // => false
 */
function isError(value) {
  if (!isObjectLike(value)) {
    return false;
  }
  return (objectToString.call(value) == errorTag) ||
    (typeof value.message == 'string' && typeof value.name == 'string');
}

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return !!value && typeof value == 'object';
}

module.exports = isError;

},{}],"node_modules/socrates/node_modules/vo/lib/type.js":[function(require,module,exports){
/**
 * Module dependencies
 */

var isArray = Array.isArray

/**
 * Export `type`
 */

module.exports = type

/**
 * Get the type
 *
 * @param {Mixed} v
 * @return {String}
 */

function type(v) {
  return isArray(v)
    ? 'array'
    : v && v.vo
    ? 'vo'
    : v && v.catch
    ? 'catch'
    : v === null
    ? 'null'
    : typeof v
}

},{}],"node_modules/socrates/node_modules/vo/node_modules/lodash.compact/index.js":[function(require,module,exports){
/**
 * lodash 3.0.1 (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright 2012-2016 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2016 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */

/**
 * Creates an array with all falsey values removed. The values `false`, `null`,
 * `0`, `""`, `undefined`, and `NaN` are falsey.
 *
 * @static
 * @memberOf _
 * @category Array
 * @param {Array} array The array to compact.
 * @returns {Array} Returns the new array of filtered values.
 * @example
 *
 * _.compact([0, 1, false, 2, '', 3]);
 * // => [1, 2, 3]
 */
function compact(array) {
  var index = -1,
      length = array ? array.length : 0,
      resIndex = 0,
      result = [];

  while (++index < length) {
    var value = array[index];
    if (value) {
      result[resIndex++] = value;
    }
  }
  return result;
}

module.exports = compact;

},{}],"node_modules/socrates/node_modules/@f/compose-reducers/node_modules/@f/to-array/lib/index.js":[function(require,module,exports){
/**
 * Expose toArray
 */

module.exports = toArray['default'] = toArray

/**
 * Convert to an array from array like
 * @param  {ArrayLike} arr
 * @return {Array}
 */

function toArray (arr) {
  var len = arr.length
  var idx = -1

  var array = new Array(len)
  while (++idx < len) {
    array[idx] = arr[idx]
  }
  return array
}

},{}],"node_modules/socrates/node_modules/@f/handle-actions/node_modules/@f/is-undefined/lib/index.js":[function(require,module,exports){
/**
 * Expose isUndefined
 */

module.exports = isUndefined['default'] = isUndefined

/**
 * Check if undefined.
 * @param  {Mixed}  value
 * @return {Boolean}
 */

function isUndefined (value) {
  return typeof value === 'undefined'
}

},{}],"node_modules/socrates/node_modules/vo/node_modules/wrapped/node_modules/co/index.js":[function(require,module,exports){

/**
 * slice() reference.
 */

var slice = Array.prototype.slice;

/**
 * Expose `co`.
 */

module.exports = co;

/**
 * Wrap the given generator `fn` and
 * return a thunk.
 *
 * @param {Function} fn
 * @return {Function}
 * @api public
 */

function co(fn) {
  var isGenFun = isGeneratorFunction(fn);

  return function (done) {
    var ctx = this;

    // in toThunk() below we invoke co()
    // with a generator, so optimize for
    // this case
    var gen = fn;

    // we only need to parse the arguments
    // if gen is a generator function.
    if (isGenFun) {
      var args = slice.call(arguments), len = args.length;
      var hasCallback = len && 'function' == typeof args[len - 1];
      done = hasCallback ? args.pop() : error;
      gen = fn.apply(this, args);
    } else {
      done = done || error;
    }

    next();

    // #92
    // wrap the callback in a setImmediate
    // so that any of its errors aren't caught by `co`
    function exit(err, res) {
      setImmediate(function(){
        done.call(ctx, err, res);
      });
    }

    function next(err, res) {
      var ret;

      // multiple args
      if (arguments.length > 2) res = slice.call(arguments, 1);

      // error
      if (err) {
        try {
          ret = gen.throw(err);
        } catch (e) {
          return exit(e);
        }
      }

      // ok
      if (!err) {
        try {
          ret = gen.next(res);
        } catch (e) {
          return exit(e);
        }
      }

      // done
      if (ret.done) return exit(null, ret.value);

      // normalize
      ret.value = toThunk(ret.value, ctx);

      // run
      if ('function' == typeof ret.value) {
        var called = false;
        try {
          ret.value.call(ctx, function(){
            if (called) return;
            called = true;
            next.apply(ctx, arguments);
          });
        } catch (e) {
          setImmediate(function(){
            if (called) return;
            called = true;
            next(e);
          });
        }
        return;
      }

      // invalid
      next(new TypeError('You may only yield a function, promise, generator, array, or object, '
        + 'but the following was passed: "' + String(ret.value) + '"'));
    }
  }
}

/**
 * Convert `obj` into a normalized thunk.
 *
 * @param {Mixed} obj
 * @param {Mixed} ctx
 * @return {Function}
 * @api private
 */

function toThunk(obj, ctx) {

  if (isGeneratorFunction(obj)) {
    return co(obj.call(ctx));
  }

  if (isGenerator(obj)) {
    return co(obj);
  }

  if (isPromise(obj)) {
    return promiseToThunk(obj);
  }

  if ('function' == typeof obj) {
    return obj;
  }

  if (isObject(obj) || Array.isArray(obj)) {
    return objectToThunk.call(ctx, obj);
  }

  return obj;
}

/**
 * Convert an object of yieldables to a thunk.
 *
 * @param {Object} obj
 * @return {Function}
 * @api private
 */

function objectToThunk(obj){
  var ctx = this;
  var isArray = Array.isArray(obj);

  return function(done){
    var keys = Object.keys(obj);
    var pending = keys.length;
    var results = isArray
      ? new Array(pending) // predefine the array length
      : new obj.constructor();
    var finished;

    if (!pending) {
      setImmediate(function(){
        done(null, results)
      });
      return;
    }

    // prepopulate object keys to preserve key ordering
    if (!isArray) {
      for (var i = 0; i < pending; i++) {
        results[keys[i]] = undefined;
      }
    }

    for (var i = 0; i < keys.length; i++) {
      run(obj[keys[i]], keys[i]);
    }

    function run(fn, key) {
      if (finished) return;
      try {
        fn = toThunk(fn, ctx);

        if ('function' != typeof fn) {
          results[key] = fn;
          return --pending || done(null, results);
        }

        fn.call(ctx, function(err, res){
          if (finished) return;

          if (err) {
            finished = true;
            return done(err);
          }

          results[key] = res;
          --pending || done(null, results);
        });
      } catch (err) {
        finished = true;
        done(err);
      }
    }
  }
}

/**
 * Convert `promise` to a thunk.
 *
 * @param {Object} promise
 * @return {Function}
 * @api private
 */

function promiseToThunk(promise) {
  return function(fn){
    promise.then(function(res) {
      fn(null, res);
    }, fn);
  }
}

/**
 * Check if `obj` is a promise.
 *
 * @param {Object} obj
 * @return {Boolean}
 * @api private
 */

function isPromise(obj) {
  return obj && 'function' == typeof obj.then;
}

/**
 * Check if `obj` is a generator.
 *
 * @param {Mixed} obj
 * @return {Boolean}
 * @api private
 */

function isGenerator(obj) {
  return obj && 'function' == typeof obj.next && 'function' == typeof obj.throw;
}

/**
 * Check if `obj` is a generator function.
 *
 * @param {Mixed} obj
 * @return {Boolean}
 * @api private
 */

function isGeneratorFunction(obj) {
  return obj && obj.constructor && 'GeneratorFunction' == obj.constructor.name;
}

/**
 * Check for plain object.
 *
 * @param {Mixed} val
 * @return {Boolean}
 * @api private
 */

function isObject(val) {
  return val && Object == val.constructor;
}

/**
 * Throw `err` in a new stack.
 *
 * This is used when co() is invoked
 * without supplying a callback, which
 * should only be for demonstrational
 * purposes.
 *
 * @param {Error} err
 * @api private
 */

function error(err) {
  if (!err) return;
  setImmediate(function(){
    throw err;
  });
}

},{}],"node_modules/socrates/node_modules/@f/combine-reducers/node_modules/@f/clone-shallow/node_modules/@f/slice/lib/index.js":[function(require,module,exports){
/**
 * Expose slice
 */

module.exports = slice

/**
 * slice
 */

function slice (array, begin, end) {
  begin = begin || 0
  end = end || array.length

  var arr = new Array(array.length)
  for (var i = begin; i < end; ++i) {
    arr[i - begin] = array[i]
  }
  return arr
}

},{}],"node_modules/socrates/node_modules/@f/combine-reducers/node_modules/@f/clone-shallow/node_modules/@f/is-array/lib/index.js":[function(require,module,exports){
/**
 * Expose isArray
 */

module.exports = isArray['default'] = isArray

/**
 * isArray
 */

function isArray (val) {
  return Array.isArray(val)
}

},{}],"node_modules/socrates/node_modules/@f/combine-reducers/node_modules/@f/clone-shallow/node_modules/@f/clone-obj/node_modules/@f/foreach/node_modules/@f/foreach-obj/lib/index.js":[function(require,module,exports){
/**
 * Expose forEach
 */

module.exports = forEach['default'] = forEach

/**
 * forEach
 */

function forEach (fn, obj) {
  if (!obj) return

  var keys = Object.keys(obj)

  for (var i = 0, len = keys.length; i < len; ++i) {
    var key = keys[i]
    fn.call(this, obj[key], key)
  }
}

},{}],"node_modules/socrates/node_modules/@f/combine-reducers/node_modules/@f/clone-shallow/node_modules/@f/clone-obj/node_modules/@f/foreach/node_modules/@f/foreach-array/lib/index.js":[function(require,module,exports){
/**
 * Expose forEach
 */

module.exports = forEach['default'] = forEach

/**
 * forEach
 */

function forEach (fn, arr) {
  if (!arr) return

  for (var i = 0, len = arr.length; i < len; ++i) {
    fn.call(this, arr[i], i)
  }
}

},{}],"node_modules/socrates/node_modules/@f/combine-reducers/node_modules/@f/clone-shallow/node_modules/@f/clone-obj/node_modules/@f/foreach/node_modules/@f/is-object/node_modules/@f/is-function/lib/index.js":[function(require,module,exports){
/**
 * Modules
 */

/**
 * Expose isFunction
 */

module.exports = isFunction['default'] = isFunction

/**
 * isFunction
 */

function isFunction (value) {
  return typeof value === 'function'
}

},{}],"node_modules/mako-js/node_modules/querystring-es3/index.js":[function(require,module,exports){
'use strict';

exports.decode = exports.parse = require('./decode');
exports.encode = exports.stringify = require('./encode');

},{"./decode":"node_modules/mako-js/node_modules/querystring-es3/decode.js","./encode":"node_modules/mako-js/node_modules/querystring-es3/encode.js"}],"node_modules/enroute/node_modules/path-to-regexp/index.js":[function(require,module,exports){
var isarray = require('isarray')

/**
 * Expose `pathToRegexp`.
 */
module.exports = pathToRegexp
module.exports.parse = parse
module.exports.compile = compile
module.exports.tokensToFunction = tokensToFunction
module.exports.tokensToRegExp = tokensToRegExp

/**
 * The main path matching regexp utility.
 *
 * @type {RegExp}
 */
var PATH_REGEXP = new RegExp([
  // Match escaped characters that would otherwise appear in future matches.
  // This allows the user to escape special characters that won't transform.
  '(\\\\.)',
  // Match Express-style parameters and un-named parameters with a prefix
  // and optional suffixes. Matches appear as:
  //
  // "/:test(\\d+)?" => ["/", "test", "\d+", undefined, "?", undefined]
  // "/route(\\d+)"  => [undefined, undefined, undefined, "\d+", undefined, undefined]
  // "/*"            => ["/", undefined, undefined, undefined, undefined, "*"]
  '([\\/.])?(?:(?:\\:(\\w+)(?:\\(((?:\\\\.|[^()])+)\\))?|\\(((?:\\\\.|[^()])+)\\))([+*?])?|(\\*))'
].join('|'), 'g')

/**
 * Parse a string for the raw tokens.
 *
 * @param  {String} str
 * @return {Array}
 */
function parse (str) {
  var tokens = []
  var key = 0
  var index = 0
  var path = ''
  var res

  while ((res = PATH_REGEXP.exec(str)) != null) {
    var m = res[0]
    var escaped = res[1]
    var offset = res.index
    path += str.slice(index, offset)
    index = offset + m.length

    // Ignore already escaped sequences.
    if (escaped) {
      path += escaped[1]
      continue
    }

    // Push the current path onto the tokens.
    if (path) {
      tokens.push(path)
      path = ''
    }

    var prefix = res[2]
    var name = res[3]
    var capture = res[4]
    var group = res[5]
    var suffix = res[6]
    var asterisk = res[7]

    var repeat = suffix === '+' || suffix === '*'
    var optional = suffix === '?' || suffix === '*'
    var delimiter = prefix || '/'
    var pattern = capture || group || (asterisk ? '.*' : '[^' + delimiter + ']+?')

    tokens.push({
      name: name || key++,
      prefix: prefix || '',
      delimiter: delimiter,
      optional: optional,
      repeat: repeat,
      pattern: escapeGroup(pattern)
    })
  }

  // Match any characters still remaining.
  if (index < str.length) {
    path += str.substr(index)
  }

  // If the path exists, push it onto the end.
  if (path) {
    tokens.push(path)
  }

  return tokens
}

/**
 * Compile a string to a template function for the path.
 *
 * @param  {String}   str
 * @return {Function}
 */
function compile (str) {
  return tokensToFunction(parse(str))
}

/**
 * Expose a method for transforming tokens into the path function.
 */
function tokensToFunction (tokens) {
  // Compile all the tokens into regexps.
  var matches = new Array(tokens.length)

  // Compile all the patterns before compilation.
  for (var i = 0; i < tokens.length; i++) {
    if (typeof tokens[i] === 'object') {
      matches[i] = new RegExp('^' + tokens[i].pattern + '$')
    }
  }

  return function (obj) {
    var path = ''
    var data = obj || {}

    for (var i = 0; i < tokens.length; i++) {
      var token = tokens[i]

      if (typeof token === 'string') {
        path += token

        continue
      }

      var value = data[token.name]
      var segment

      if (value == null) {
        if (token.optional) {
          continue
        } else {
          throw new TypeError('Expected "' + token.name + '" to be defined')
        }
      }

      if (isarray(value)) {
        if (!token.repeat) {
          throw new TypeError('Expected "' + token.name + '" to not repeat, but received "' + value + '"')
        }

        if (value.length === 0) {
          if (token.optional) {
            continue
          } else {
            throw new TypeError('Expected "' + token.name + '" to not be empty')
          }
        }

        for (var j = 0; j < value.length; j++) {
          segment = encodeURIComponent(value[j])

          if (!matches[i].test(segment)) {
            throw new TypeError('Expected all "' + token.name + '" to match "' + token.pattern + '", but received "' + segment + '"')
          }

          path += (j === 0 ? token.prefix : token.delimiter) + segment
        }

        continue
      }

      segment = encodeURIComponent(value)

      if (!matches[i].test(segment)) {
        throw new TypeError('Expected "' + token.name + '" to match "' + token.pattern + '", but received "' + segment + '"')
      }

      path += token.prefix + segment
    }

    return path
  }
}

/**
 * Escape a regular expression string.
 *
 * @param  {String} str
 * @return {String}
 */
function escapeString (str) {
  return str.replace(/([.+*?=^!:${}()[\]|\/])/g, '\\$1')
}

/**
 * Escape the capturing group by escaping special characters and meaning.
 *
 * @param  {String} group
 * @return {String}
 */
function escapeGroup (group) {
  return group.replace(/([=!:$\/()])/g, '\\$1')
}

/**
 * Attach the keys as a property of the regexp.
 *
 * @param  {RegExp} re
 * @param  {Array}  keys
 * @return {RegExp}
 */
function attachKeys (re, keys) {
  re.keys = keys
  return re
}

/**
 * Get the flags for a regexp from the options.
 *
 * @param  {Object} options
 * @return {String}
 */
function flags (options) {
  return options.sensitive ? '' : 'i'
}

/**
 * Pull out keys from a regexp.
 *
 * @param  {RegExp} path
 * @param  {Array}  keys
 * @return {RegExp}
 */
function regexpToRegexp (path, keys) {
  // Use a negative lookahead to match only capturing groups.
  var groups = path.source.match(/\((?!\?)/g)

  if (groups) {
    for (var i = 0; i < groups.length; i++) {
      keys.push({
        name: i,
        prefix: null,
        delimiter: null,
        optional: false,
        repeat: false,
        pattern: null
      })
    }
  }

  return attachKeys(path, keys)
}

/**
 * Transform an array into a regexp.
 *
 * @param  {Array}  path
 * @param  {Array}  keys
 * @param  {Object} options
 * @return {RegExp}
 */
function arrayToRegexp (path, keys, options) {
  var parts = []

  for (var i = 0; i < path.length; i++) {
    parts.push(pathToRegexp(path[i], keys, options).source)
  }

  var regexp = new RegExp('(?:' + parts.join('|') + ')', flags(options))

  return attachKeys(regexp, keys)
}

/**
 * Create a path regexp from string input.
 *
 * @param  {String} path
 * @param  {Array}  keys
 * @param  {Object} options
 * @return {RegExp}
 */
function stringToRegexp (path, keys, options) {
  var tokens = parse(path)
  var re = tokensToRegExp(tokens, options)

  // Attach keys back to the regexp.
  for (var i = 0; i < tokens.length; i++) {
    if (typeof tokens[i] !== 'string') {
      keys.push(tokens[i])
    }
  }

  return attachKeys(re, keys)
}

/**
 * Expose a function for taking tokens and returning a RegExp.
 *
 * @param  {Array}  tokens
 * @param  {Array}  keys
 * @param  {Object} options
 * @return {RegExp}
 */
function tokensToRegExp (tokens, options) {
  options = options || {}

  var strict = options.strict
  var end = options.end !== false
  var route = ''
  var lastToken = tokens[tokens.length - 1]
  var endsWithSlash = typeof lastToken === 'string' && /\/$/.test(lastToken)

  // Iterate over the tokens and create our regexp string.
  for (var i = 0; i < tokens.length; i++) {
    var token = tokens[i]

    if (typeof token === 'string') {
      route += escapeString(token)
    } else {
      var prefix = escapeString(token.prefix)
      var capture = token.pattern

      if (token.repeat) {
        capture += '(?:' + prefix + capture + ')*'
      }

      if (token.optional) {
        if (prefix) {
          capture = '(?:' + prefix + '(' + capture + '))?'
        } else {
          capture = '(' + capture + ')?'
        }
      } else {
        capture = prefix + '(' + capture + ')'
      }

      route += capture
    }
  }

  // In non-strict mode we allow a slash at the end of match. If the path to
  // match already ends with a slash, we remove it for consistency. The slash
  // is valid at the end of a path match, not in the middle. This is important
  // in non-ending mode, where "/test/" shouldn't match "/test//route".
  if (!strict) {
    route = (endsWithSlash ? route.slice(0, -2) : route) + '(?:\\/(?=$))?'
  }

  if (end) {
    route += '$'
  } else {
    // In non-ending mode, we need the capturing groups to match as much as
    // possible by using a positive lookahead to the end or next path segment.
    route += strict && endsWithSlash ? '' : '(?=\\/|$)'
  }

  return new RegExp('^' + route, flags(options))
}

/**
 * Normalize the given path string, returning a regular expression.
 *
 * An empty array can be passed in for the keys, which will hold the
 * placeholder key descriptions. For example, using `/user/:id`, `keys` will
 * contain `[{ name: 'id', delimiter: '/', optional: false, repeat: false }]`.
 *
 * @param  {(String|RegExp|Array)} path
 * @param  {Array}                 [keys]
 * @param  {Object}                [options]
 * @return {RegExp}
 */
function pathToRegexp (path, keys, options) {
  keys = keys || []

  if (!isarray(keys)) {
    options = keys
    keys = []
  } else if (!options) {
    options = {}
  }

  if (path instanceof RegExp) {
    return regexpToRegexp(path, keys, options)
  }

  if (isarray(path)) {
    return arrayToRegexp(path, keys, options)
  }

  return stringToRegexp(path, keys, options)
}

},{"isarray":"node_modules/enroute/node_modules/path-to-regexp/node_modules/isarray/index.js"}],"node_modules/socrates/lib/freeze.js":[function(require,module,exports){
(function (process){
'use strict';

/**
 * Export `freeze`
 */

module.exports = freeze

/**
 * Are we running in a production build?
 */

var production = process && process.env && process.env.NODE_ENV === 'production'

/**
 * Is Freezable?
 *
 * @param {Object} object
 * @return {Boolean}
 */

function isFreezable(object) {
  if (object === null) return false

  return Array.isArray(object) ||
    typeof object === 'object'
}

/**
 * Check if we need to freeze this value
 *
 * @param {Object} object
 * @return {Boolean}
 */

function needsFreezing(object) {
  return isFreezable(object) && !Object.isFrozen(object)
}

/**
 * Recurse
 *
 * @param {Object}
 * @return {Object}
 */

function recur(object) {
  Object.freeze(object)

  Object.keys(object).forEach(function (key) {
    const value = object[key]
    if (needsFreezing(value)) {
      recur(value)
    }
  })

  return object
}

/**
 * Deeply freeze a plain javascript object.
 *
 * If `process.env.NODE_ENV === 'production'`, this returns the original object
 * witout freezing.
 *
 * @function
 * @sig a -> a
 * @param  {object} object Object to freeze.
 * @return {object} Frozen object, unless in production, then the same object.
 */

function freeze(object) {
  if (production) return object

  if (needsFreezing(object)) {
    recur(object)
  }

  return object
}

}).call(this,require("../../mako-js/node_modules/process/browser.js"))
},{"../../mako-js/node_modules/process/browser.js":"node_modules/mako-js/node_modules/process/browser.js"}],"node_modules/socrates/node_modules/vo/node_modules/es6-promise/dist/es6-promise.js":[function(require,module,exports){
(function (process,global){
/*!
 * @overview es6-promise - a tiny implementation of Promises/A+.
 * @copyright Copyright (c) 2014 Yehuda Katz, Tom Dale, Stefan Penner and contributors (Conversion to ES6 API by Jake Archibald)
 * @license   Licensed under MIT license
 *            See https://raw.githubusercontent.com/jakearchibald/es6-promise/master/LICENSE
 * @version   3.1.2
 */

(function() {
    "use strict";
    function lib$es6$promise$utils$$objectOrFunction(x) {
      return typeof x === 'function' || (typeof x === 'object' && x !== null);
    }

    function lib$es6$promise$utils$$isFunction(x) {
      return typeof x === 'function';
    }

    function lib$es6$promise$utils$$isMaybeThenable(x) {
      return typeof x === 'object' && x !== null;
    }

    var lib$es6$promise$utils$$_isArray;
    if (!Array.isArray) {
      lib$es6$promise$utils$$_isArray = function (x) {
        return Object.prototype.toString.call(x) === '[object Array]';
      };
    } else {
      lib$es6$promise$utils$$_isArray = Array.isArray;
    }

    var lib$es6$promise$utils$$isArray = lib$es6$promise$utils$$_isArray;
    var lib$es6$promise$asap$$len = 0;
    var lib$es6$promise$asap$$vertxNext;
    var lib$es6$promise$asap$$customSchedulerFn;

    var lib$es6$promise$asap$$asap = function asap(callback, arg) {
      lib$es6$promise$asap$$queue[lib$es6$promise$asap$$len] = callback;
      lib$es6$promise$asap$$queue[lib$es6$promise$asap$$len + 1] = arg;
      lib$es6$promise$asap$$len += 2;
      if (lib$es6$promise$asap$$len === 2) {
        // If len is 2, that means that we need to schedule an async flush.
        // If additional callbacks are queued before the queue is flushed, they
        // will be processed by this flush that we are scheduling.
        if (lib$es6$promise$asap$$customSchedulerFn) {
          lib$es6$promise$asap$$customSchedulerFn(lib$es6$promise$asap$$flush);
        } else {
          lib$es6$promise$asap$$scheduleFlush();
        }
      }
    }

    function lib$es6$promise$asap$$setScheduler(scheduleFn) {
      lib$es6$promise$asap$$customSchedulerFn = scheduleFn;
    }

    function lib$es6$promise$asap$$setAsap(asapFn) {
      lib$es6$promise$asap$$asap = asapFn;
    }

    var lib$es6$promise$asap$$browserWindow = (typeof window !== 'undefined') ? window : undefined;
    var lib$es6$promise$asap$$browserGlobal = lib$es6$promise$asap$$browserWindow || {};
    var lib$es6$promise$asap$$BrowserMutationObserver = lib$es6$promise$asap$$browserGlobal.MutationObserver || lib$es6$promise$asap$$browserGlobal.WebKitMutationObserver;
    var lib$es6$promise$asap$$isNode = typeof process !== 'undefined' && {}.toString.call(process) === '[object process]';

    // test for web worker but not in IE10
    var lib$es6$promise$asap$$isWorker = typeof Uint8ClampedArray !== 'undefined' &&
      typeof importScripts !== 'undefined' &&
      typeof MessageChannel !== 'undefined';

    // node
    function lib$es6$promise$asap$$useNextTick() {
      // node version 0.10.x displays a deprecation warning when nextTick is used recursively
      // see https://github.com/cujojs/when/issues/410 for details
      return function() {
        process.nextTick(lib$es6$promise$asap$$flush);
      };
    }

    // vertx
    function lib$es6$promise$asap$$useVertxTimer() {
      return function() {
        lib$es6$promise$asap$$vertxNext(lib$es6$promise$asap$$flush);
      };
    }

    function lib$es6$promise$asap$$useMutationObserver() {
      var iterations = 0;
      var observer = new lib$es6$promise$asap$$BrowserMutationObserver(lib$es6$promise$asap$$flush);
      var node = document.createTextNode('');
      observer.observe(node, { characterData: true });

      return function() {
        node.data = (iterations = ++iterations % 2);
      };
    }

    // web worker
    function lib$es6$promise$asap$$useMessageChannel() {
      var channel = new MessageChannel();
      channel.port1.onmessage = lib$es6$promise$asap$$flush;
      return function () {
        channel.port2.postMessage(0);
      };
    }

    function lib$es6$promise$asap$$useSetTimeout() {
      return function() {
        setTimeout(lib$es6$promise$asap$$flush, 1);
      };
    }

    var lib$es6$promise$asap$$queue = new Array(1000);
    function lib$es6$promise$asap$$flush() {
      for (var i = 0; i < lib$es6$promise$asap$$len; i+=2) {
        var callback = lib$es6$promise$asap$$queue[i];
        var arg = lib$es6$promise$asap$$queue[i+1];

        callback(arg);

        lib$es6$promise$asap$$queue[i] = undefined;
        lib$es6$promise$asap$$queue[i+1] = undefined;
      }

      lib$es6$promise$asap$$len = 0;
    }

    function lib$es6$promise$asap$$attemptVertx() {
      try {
        var r = require;
        var vertx = r('vertx');
        lib$es6$promise$asap$$vertxNext = vertx.runOnLoop || vertx.runOnContext;
        return lib$es6$promise$asap$$useVertxTimer();
      } catch(e) {
        return lib$es6$promise$asap$$useSetTimeout();
      }
    }

    var lib$es6$promise$asap$$scheduleFlush;
    // Decide what async method to use to triggering processing of queued callbacks:
    if (lib$es6$promise$asap$$isNode) {
      lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$useNextTick();
    } else if (lib$es6$promise$asap$$BrowserMutationObserver) {
      lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$useMutationObserver();
    } else if (lib$es6$promise$asap$$isWorker) {
      lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$useMessageChannel();
    } else if (lib$es6$promise$asap$$browserWindow === undefined && typeof require === 'function') {
      lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$attemptVertx();
    } else {
      lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$useSetTimeout();
    }
    function lib$es6$promise$then$$then(onFulfillment, onRejection) {
      var parent = this;
      var state = parent._state;

      if (state === lib$es6$promise$$internal$$FULFILLED && !onFulfillment || state === lib$es6$promise$$internal$$REJECTED && !onRejection) {
        return this;
      }

      var child = new this.constructor(lib$es6$promise$$internal$$noop);
      var result = parent._result;

      if (state) {
        var callback = arguments[state - 1];
        lib$es6$promise$asap$$asap(function(){
          lib$es6$promise$$internal$$invokeCallback(state, child, callback, result);
        });
      } else {
        lib$es6$promise$$internal$$subscribe(parent, child, onFulfillment, onRejection);
      }

      return child;
    }
    var lib$es6$promise$then$$default = lib$es6$promise$then$$then;
    function lib$es6$promise$promise$resolve$$resolve(object) {
      /*jshint validthis:true */
      var Constructor = this;

      if (object && typeof object === 'object' && object.constructor === Constructor) {
        return object;
      }

      var promise = new Constructor(lib$es6$promise$$internal$$noop);
      lib$es6$promise$$internal$$resolve(promise, object);
      return promise;
    }
    var lib$es6$promise$promise$resolve$$default = lib$es6$promise$promise$resolve$$resolve;

    function lib$es6$promise$$internal$$noop() {}

    var lib$es6$promise$$internal$$PENDING   = void 0;
    var lib$es6$promise$$internal$$FULFILLED = 1;
    var lib$es6$promise$$internal$$REJECTED  = 2;

    var lib$es6$promise$$internal$$GET_THEN_ERROR = new lib$es6$promise$$internal$$ErrorObject();

    function lib$es6$promise$$internal$$selfFulfillment() {
      return new TypeError("You cannot resolve a promise with itself");
    }

    function lib$es6$promise$$internal$$cannotReturnOwn() {
      return new TypeError('A promises callback cannot return that same promise.');
    }

    function lib$es6$promise$$internal$$getThen(promise) {
      try {
        return promise.then;
      } catch(error) {
        lib$es6$promise$$internal$$GET_THEN_ERROR.error = error;
        return lib$es6$promise$$internal$$GET_THEN_ERROR;
      }
    }

    function lib$es6$promise$$internal$$tryThen(then, value, fulfillmentHandler, rejectionHandler) {
      try {
        then.call(value, fulfillmentHandler, rejectionHandler);
      } catch(e) {
        return e;
      }
    }

    function lib$es6$promise$$internal$$handleForeignThenable(promise, thenable, then) {
       lib$es6$promise$asap$$asap(function(promise) {
        var sealed = false;
        var error = lib$es6$promise$$internal$$tryThen(then, thenable, function(value) {
          if (sealed) { return; }
          sealed = true;
          if (thenable !== value) {
            lib$es6$promise$$internal$$resolve(promise, value);
          } else {
            lib$es6$promise$$internal$$fulfill(promise, value);
          }
        }, function(reason) {
          if (sealed) { return; }
          sealed = true;

          lib$es6$promise$$internal$$reject(promise, reason);
        }, 'Settle: ' + (promise._label || ' unknown promise'));

        if (!sealed && error) {
          sealed = true;
          lib$es6$promise$$internal$$reject(promise, error);
        }
      }, promise);
    }

    function lib$es6$promise$$internal$$handleOwnThenable(promise, thenable) {
      if (thenable._state === lib$es6$promise$$internal$$FULFILLED) {
        lib$es6$promise$$internal$$fulfill(promise, thenable._result);
      } else if (thenable._state === lib$es6$promise$$internal$$REJECTED) {
        lib$es6$promise$$internal$$reject(promise, thenable._result);
      } else {
        lib$es6$promise$$internal$$subscribe(thenable, undefined, function(value) {
          lib$es6$promise$$internal$$resolve(promise, value);
        }, function(reason) {
          lib$es6$promise$$internal$$reject(promise, reason);
        });
      }
    }

    function lib$es6$promise$$internal$$handleMaybeThenable(promise, maybeThenable, then) {
      if (maybeThenable.constructor === promise.constructor &&
          then === lib$es6$promise$then$$default &&
          constructor.resolve === lib$es6$promise$promise$resolve$$default) {
        lib$es6$promise$$internal$$handleOwnThenable(promise, maybeThenable);
      } else {
        if (then === lib$es6$promise$$internal$$GET_THEN_ERROR) {
          lib$es6$promise$$internal$$reject(promise, lib$es6$promise$$internal$$GET_THEN_ERROR.error);
        } else if (then === undefined) {
          lib$es6$promise$$internal$$fulfill(promise, maybeThenable);
        } else if (lib$es6$promise$utils$$isFunction(then)) {
          lib$es6$promise$$internal$$handleForeignThenable(promise, maybeThenable, then);
        } else {
          lib$es6$promise$$internal$$fulfill(promise, maybeThenable);
        }
      }
    }

    function lib$es6$promise$$internal$$resolve(promise, value) {
      if (promise === value) {
        lib$es6$promise$$internal$$reject(promise, lib$es6$promise$$internal$$selfFulfillment());
      } else if (lib$es6$promise$utils$$objectOrFunction(value)) {
        lib$es6$promise$$internal$$handleMaybeThenable(promise, value, lib$es6$promise$$internal$$getThen(value));
      } else {
        lib$es6$promise$$internal$$fulfill(promise, value);
      }
    }

    function lib$es6$promise$$internal$$publishRejection(promise) {
      if (promise._onerror) {
        promise._onerror(promise._result);
      }

      lib$es6$promise$$internal$$publish(promise);
    }

    function lib$es6$promise$$internal$$fulfill(promise, value) {
      if (promise._state !== lib$es6$promise$$internal$$PENDING) { return; }

      promise._result = value;
      promise._state = lib$es6$promise$$internal$$FULFILLED;

      if (promise._subscribers.length !== 0) {
        lib$es6$promise$asap$$asap(lib$es6$promise$$internal$$publish, promise);
      }
    }

    function lib$es6$promise$$internal$$reject(promise, reason) {
      if (promise._state !== lib$es6$promise$$internal$$PENDING) { return; }
      promise._state = lib$es6$promise$$internal$$REJECTED;
      promise._result = reason;

      lib$es6$promise$asap$$asap(lib$es6$promise$$internal$$publishRejection, promise);
    }

    function lib$es6$promise$$internal$$subscribe(parent, child, onFulfillment, onRejection) {
      var subscribers = parent._subscribers;
      var length = subscribers.length;

      parent._onerror = null;

      subscribers[length] = child;
      subscribers[length + lib$es6$promise$$internal$$FULFILLED] = onFulfillment;
      subscribers[length + lib$es6$promise$$internal$$REJECTED]  = onRejection;

      if (length === 0 && parent._state) {
        lib$es6$promise$asap$$asap(lib$es6$promise$$internal$$publish, parent);
      }
    }

    function lib$es6$promise$$internal$$publish(promise) {
      var subscribers = promise._subscribers;
      var settled = promise._state;

      if (subscribers.length === 0) { return; }

      var child, callback, detail = promise._result;

      for (var i = 0; i < subscribers.length; i += 3) {
        child = subscribers[i];
        callback = subscribers[i + settled];

        if (child) {
          lib$es6$promise$$internal$$invokeCallback(settled, child, callback, detail);
        } else {
          callback(detail);
        }
      }

      promise._subscribers.length = 0;
    }

    function lib$es6$promise$$internal$$ErrorObject() {
      this.error = null;
    }

    var lib$es6$promise$$internal$$TRY_CATCH_ERROR = new lib$es6$promise$$internal$$ErrorObject();

    function lib$es6$promise$$internal$$tryCatch(callback, detail) {
      try {
        return callback(detail);
      } catch(e) {
        lib$es6$promise$$internal$$TRY_CATCH_ERROR.error = e;
        return lib$es6$promise$$internal$$TRY_CATCH_ERROR;
      }
    }

    function lib$es6$promise$$internal$$invokeCallback(settled, promise, callback, detail) {
      var hasCallback = lib$es6$promise$utils$$isFunction(callback),
          value, error, succeeded, failed;

      if (hasCallback) {
        value = lib$es6$promise$$internal$$tryCatch(callback, detail);

        if (value === lib$es6$promise$$internal$$TRY_CATCH_ERROR) {
          failed = true;
          error = value.error;
          value = null;
        } else {
          succeeded = true;
        }

        if (promise === value) {
          lib$es6$promise$$internal$$reject(promise, lib$es6$promise$$internal$$cannotReturnOwn());
          return;
        }

      } else {
        value = detail;
        succeeded = true;
      }

      if (promise._state !== lib$es6$promise$$internal$$PENDING) {
        // noop
      } else if (hasCallback && succeeded) {
        lib$es6$promise$$internal$$resolve(promise, value);
      } else if (failed) {
        lib$es6$promise$$internal$$reject(promise, error);
      } else if (settled === lib$es6$promise$$internal$$FULFILLED) {
        lib$es6$promise$$internal$$fulfill(promise, value);
      } else if (settled === lib$es6$promise$$internal$$REJECTED) {
        lib$es6$promise$$internal$$reject(promise, value);
      }
    }

    function lib$es6$promise$$internal$$initializePromise(promise, resolver) {
      try {
        resolver(function resolvePromise(value){
          lib$es6$promise$$internal$$resolve(promise, value);
        }, function rejectPromise(reason) {
          lib$es6$promise$$internal$$reject(promise, reason);
        });
      } catch(e) {
        lib$es6$promise$$internal$$reject(promise, e);
      }
    }

    function lib$es6$promise$promise$all$$all(entries) {
      return new lib$es6$promise$enumerator$$default(this, entries).promise;
    }
    var lib$es6$promise$promise$all$$default = lib$es6$promise$promise$all$$all;
    function lib$es6$promise$promise$race$$race(entries) {
      /*jshint validthis:true */
      var Constructor = this;

      var promise = new Constructor(lib$es6$promise$$internal$$noop);

      if (!lib$es6$promise$utils$$isArray(entries)) {
        lib$es6$promise$$internal$$reject(promise, new TypeError('You must pass an array to race.'));
        return promise;
      }

      var length = entries.length;

      function onFulfillment(value) {
        lib$es6$promise$$internal$$resolve(promise, value);
      }

      function onRejection(reason) {
        lib$es6$promise$$internal$$reject(promise, reason);
      }

      for (var i = 0; promise._state === lib$es6$promise$$internal$$PENDING && i < length; i++) {
        lib$es6$promise$$internal$$subscribe(Constructor.resolve(entries[i]), undefined, onFulfillment, onRejection);
      }

      return promise;
    }
    var lib$es6$promise$promise$race$$default = lib$es6$promise$promise$race$$race;
    function lib$es6$promise$promise$reject$$reject(reason) {
      /*jshint validthis:true */
      var Constructor = this;
      var promise = new Constructor(lib$es6$promise$$internal$$noop);
      lib$es6$promise$$internal$$reject(promise, reason);
      return promise;
    }
    var lib$es6$promise$promise$reject$$default = lib$es6$promise$promise$reject$$reject;

    var lib$es6$promise$promise$$counter = 0;

    function lib$es6$promise$promise$$needsResolver() {
      throw new TypeError('You must pass a resolver function as the first argument to the promise constructor');
    }

    function lib$es6$promise$promise$$needsNew() {
      throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");
    }

    var lib$es6$promise$promise$$default = lib$es6$promise$promise$$Promise;
    /**
      Promise objects represent the eventual result of an asynchronous operation. The
      primary way of interacting with a promise is through its `then` method, which
      registers callbacks to receive either a promise's eventual value or the reason
      why the promise cannot be fulfilled.

      Terminology
      -----------

      - `promise` is an object or function with a `then` method whose behavior conforms to this specification.
      - `thenable` is an object or function that defines a `then` method.
      - `value` is any legal JavaScript value (including undefined, a thenable, or a promise).
      - `exception` is a value that is thrown using the throw statement.
      - `reason` is a value that indicates why a promise was rejected.
      - `settled` the final resting state of a promise, fulfilled or rejected.

      A promise can be in one of three states: pending, fulfilled, or rejected.

      Promises that are fulfilled have a fulfillment value and are in the fulfilled
      state.  Promises that are rejected have a rejection reason and are in the
      rejected state.  A fulfillment value is never a thenable.

      Promises can also be said to *resolve* a value.  If this value is also a
      promise, then the original promise's settled state will match the value's
      settled state.  So a promise that *resolves* a promise that rejects will
      itself reject, and a promise that *resolves* a promise that fulfills will
      itself fulfill.


      Basic Usage:
      ------------

      ```js
      var promise = new Promise(function(resolve, reject) {
        // on success
        resolve(value);

        // on failure
        reject(reason);
      });

      promise.then(function(value) {
        // on fulfillment
      }, function(reason) {
        // on rejection
      });
      ```

      Advanced Usage:
      ---------------

      Promises shine when abstracting away asynchronous interactions such as
      `XMLHttpRequest`s.

      ```js
      function getJSON(url) {
        return new Promise(function(resolve, reject){
          var xhr = new XMLHttpRequest();

          xhr.open('GET', url);
          xhr.onreadystatechange = handler;
          xhr.responseType = 'json';
          xhr.setRequestHeader('Accept', 'application/json');
          xhr.send();

          function handler() {
            if (this.readyState === this.DONE) {
              if (this.status === 200) {
                resolve(this.response);
              } else {
                reject(new Error('getJSON: `' + url + '` failed with status: [' + this.status + ']'));
              }
            }
          };
        });
      }

      getJSON('/posts.json').then(function(json) {
        // on fulfillment
      }, function(reason) {
        // on rejection
      });
      ```

      Unlike callbacks, promises are great composable primitives.

      ```js
      Promise.all([
        getJSON('/posts'),
        getJSON('/comments')
      ]).then(function(values){
        values[0] // => postsJSON
        values[1] // => commentsJSON

        return values;
      });
      ```

      @class Promise
      @param {function} resolver
      Useful for tooling.
      @constructor
    */
    function lib$es6$promise$promise$$Promise(resolver) {
      this._id = lib$es6$promise$promise$$counter++;
      this._state = undefined;
      this._result = undefined;
      this._subscribers = [];

      if (lib$es6$promise$$internal$$noop !== resolver) {
        typeof resolver !== 'function' && lib$es6$promise$promise$$needsResolver();
        this instanceof lib$es6$promise$promise$$Promise ? lib$es6$promise$$internal$$initializePromise(this, resolver) : lib$es6$promise$promise$$needsNew();
      }
    }

    lib$es6$promise$promise$$Promise.all = lib$es6$promise$promise$all$$default;
    lib$es6$promise$promise$$Promise.race = lib$es6$promise$promise$race$$default;
    lib$es6$promise$promise$$Promise.resolve = lib$es6$promise$promise$resolve$$default;
    lib$es6$promise$promise$$Promise.reject = lib$es6$promise$promise$reject$$default;
    lib$es6$promise$promise$$Promise._setScheduler = lib$es6$promise$asap$$setScheduler;
    lib$es6$promise$promise$$Promise._setAsap = lib$es6$promise$asap$$setAsap;
    lib$es6$promise$promise$$Promise._asap = lib$es6$promise$asap$$asap;

    lib$es6$promise$promise$$Promise.prototype = {
      constructor: lib$es6$promise$promise$$Promise,

    /**
      The primary way of interacting with a promise is through its `then` method,
      which registers callbacks to receive either a promise's eventual value or the
      reason why the promise cannot be fulfilled.

      ```js
      findUser().then(function(user){
        // user is available
      }, function(reason){
        // user is unavailable, and you are given the reason why
      });
      ```

      Chaining
      --------

      The return value of `then` is itself a promise.  This second, 'downstream'
      promise is resolved with the return value of the first promise's fulfillment
      or rejection handler, or rejected if the handler throws an exception.

      ```js
      findUser().then(function (user) {
        return user.name;
      }, function (reason) {
        return 'default name';
      }).then(function (userName) {
        // If `findUser` fulfilled, `userName` will be the user's name, otherwise it
        // will be `'default name'`
      });

      findUser().then(function (user) {
        throw new Error('Found user, but still unhappy');
      }, function (reason) {
        throw new Error('`findUser` rejected and we're unhappy');
      }).then(function (value) {
        // never reached
      }, function (reason) {
        // if `findUser` fulfilled, `reason` will be 'Found user, but still unhappy'.
        // If `findUser` rejected, `reason` will be '`findUser` rejected and we're unhappy'.
      });
      ```
      If the downstream promise does not specify a rejection handler, rejection reasons will be propagated further downstream.

      ```js
      findUser().then(function (user) {
        throw new PedagogicalException('Upstream error');
      }).then(function (value) {
        // never reached
      }).then(function (value) {
        // never reached
      }, function (reason) {
        // The `PedgagocialException` is propagated all the way down to here
      });
      ```

      Assimilation
      ------------

      Sometimes the value you want to propagate to a downstream promise can only be
      retrieved asynchronously. This can be achieved by returning a promise in the
      fulfillment or rejection handler. The downstream promise will then be pending
      until the returned promise is settled. This is called *assimilation*.

      ```js
      findUser().then(function (user) {
        return findCommentsByAuthor(user);
      }).then(function (comments) {
        // The user's comments are now available
      });
      ```

      If the assimliated promise rejects, then the downstream promise will also reject.

      ```js
      findUser().then(function (user) {
        return findCommentsByAuthor(user);
      }).then(function (comments) {
        // If `findCommentsByAuthor` fulfills, we'll have the value here
      }, function (reason) {
        // If `findCommentsByAuthor` rejects, we'll have the reason here
      });
      ```

      Simple Example
      --------------

      Synchronous Example

      ```javascript
      var result;

      try {
        result = findResult();
        // success
      } catch(reason) {
        // failure
      }
      ```

      Errback Example

      ```js
      findResult(function(result, err){
        if (err) {
          // failure
        } else {
          // success
        }
      });
      ```

      Promise Example;

      ```javascript
      findResult().then(function(result){
        // success
      }, function(reason){
        // failure
      });
      ```

      Advanced Example
      --------------

      Synchronous Example

      ```javascript
      var author, books;

      try {
        author = findAuthor();
        books  = findBooksByAuthor(author);
        // success
      } catch(reason) {
        // failure
      }
      ```

      Errback Example

      ```js

      function foundBooks(books) {

      }

      function failure(reason) {

      }

      findAuthor(function(author, err){
        if (err) {
          failure(err);
          // failure
        } else {
          try {
            findBoooksByAuthor(author, function(books, err) {
              if (err) {
                failure(err);
              } else {
                try {
                  foundBooks(books);
                } catch(reason) {
                  failure(reason);
                }
              }
            });
          } catch(error) {
            failure(err);
          }
          // success
        }
      });
      ```

      Promise Example;

      ```javascript
      findAuthor().
        then(findBooksByAuthor).
        then(function(books){
          // found books
      }).catch(function(reason){
        // something went wrong
      });
      ```

      @method then
      @param {Function} onFulfilled
      @param {Function} onRejected
      Useful for tooling.
      @return {Promise}
    */
      then: lib$es6$promise$then$$default,

    /**
      `catch` is simply sugar for `then(undefined, onRejection)` which makes it the same
      as the catch block of a try/catch statement.

      ```js
      function findAuthor(){
        throw new Error('couldn't find that author');
      }

      // synchronous
      try {
        findAuthor();
      } catch(reason) {
        // something went wrong
      }

      // async with promises
      findAuthor().catch(function(reason){
        // something went wrong
      });
      ```

      @method catch
      @param {Function} onRejection
      Useful for tooling.
      @return {Promise}
    */
      'catch': function(onRejection) {
        return this.then(null, onRejection);
      }
    };
    var lib$es6$promise$enumerator$$default = lib$es6$promise$enumerator$$Enumerator;
    function lib$es6$promise$enumerator$$Enumerator(Constructor, input) {
      this._instanceConstructor = Constructor;
      this.promise = new Constructor(lib$es6$promise$$internal$$noop);

      if (Array.isArray(input)) {
        this._input     = input;
        this.length     = input.length;
        this._remaining = input.length;

        this._result = new Array(this.length);

        if (this.length === 0) {
          lib$es6$promise$$internal$$fulfill(this.promise, this._result);
        } else {
          this.length = this.length || 0;
          this._enumerate();
          if (this._remaining === 0) {
            lib$es6$promise$$internal$$fulfill(this.promise, this._result);
          }
        }
      } else {
        lib$es6$promise$$internal$$reject(this.promise, this._validationError());
      }
    }

    lib$es6$promise$enumerator$$Enumerator.prototype._validationError = function() {
      return new Error('Array Methods must be provided an Array');
    };

    lib$es6$promise$enumerator$$Enumerator.prototype._enumerate = function() {
      var length  = this.length;
      var input   = this._input;

      for (var i = 0; this._state === lib$es6$promise$$internal$$PENDING && i < length; i++) {
        this._eachEntry(input[i], i);
      }
    };

    lib$es6$promise$enumerator$$Enumerator.prototype._eachEntry = function(entry, i) {
      var c = this._instanceConstructor;
      var resolve = c.resolve;

      if (resolve === lib$es6$promise$promise$resolve$$default) {
        var then = lib$es6$promise$$internal$$getThen(entry);

        if (then === lib$es6$promise$then$$default &&
            entry._state !== lib$es6$promise$$internal$$PENDING) {
          this._settledAt(entry._state, i, entry._result);
        } else if (typeof then !== 'function') {
          this._remaining--;
          this._result[i] = entry;
        } else if (c === lib$es6$promise$promise$$default) {
          var promise = new c(lib$es6$promise$$internal$$noop);
          lib$es6$promise$$internal$$handleMaybeThenable(promise, entry, then);
          this._willSettleAt(promise, i);
        } else {
          this._willSettleAt(new c(function(resolve) { resolve(entry); }), i);
        }
      } else {
        this._willSettleAt(resolve(entry), i);
      }
    };

    lib$es6$promise$enumerator$$Enumerator.prototype._settledAt = function(state, i, value) {
      var promise = this.promise;

      if (promise._state === lib$es6$promise$$internal$$PENDING) {
        this._remaining--;

        if (state === lib$es6$promise$$internal$$REJECTED) {
          lib$es6$promise$$internal$$reject(promise, value);
        } else {
          this._result[i] = value;
        }
      }

      if (this._remaining === 0) {
        lib$es6$promise$$internal$$fulfill(promise, this._result);
      }
    };

    lib$es6$promise$enumerator$$Enumerator.prototype._willSettleAt = function(promise, i) {
      var enumerator = this;

      lib$es6$promise$$internal$$subscribe(promise, undefined, function(value) {
        enumerator._settledAt(lib$es6$promise$$internal$$FULFILLED, i, value);
      }, function(reason) {
        enumerator._settledAt(lib$es6$promise$$internal$$REJECTED, i, reason);
      });
    };
    function lib$es6$promise$polyfill$$polyfill() {
      var local;

      if (typeof global !== 'undefined') {
          local = global;
      } else if (typeof self !== 'undefined') {
          local = self;
      } else {
          try {
              local = Function('return this')();
          } catch (e) {
              throw new Error('polyfill failed because global object is unavailable in this environment');
          }
      }

      var P = local.Promise;

      if (P && Object.prototype.toString.call(P.resolve()) === '[object Promise]' && !P.cast) {
        return;
      }

      local.Promise = lib$es6$promise$promise$$default;
    }
    var lib$es6$promise$polyfill$$default = lib$es6$promise$polyfill$$polyfill;

    var lib$es6$promise$umd$$ES6Promise = {
      'Promise': lib$es6$promise$promise$$default,
      'polyfill': lib$es6$promise$polyfill$$default
    };

    /* global define:true module:true window: true */
    if (typeof define === 'function' && define['amd']) {
      define(function() { return lib$es6$promise$umd$$ES6Promise; });
    } else if (typeof module !== 'undefined' && module['exports']) {
      module['exports'] = lib$es6$promise$umd$$ES6Promise;
    } else if (typeof this !== 'undefined') {
      this['ES6Promise'] = lib$es6$promise$umd$$ES6Promise;
    }

    lib$es6$promise$polyfill$$default();
}).call(this);


}).call(this,require("../../../../../../mako-js/node_modules/process/browser.js"),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../../../../../../mako-js/node_modules/process/browser.js":"node_modules/mako-js/node_modules/process/browser.js"}],"node_modules/socrates/node_modules/vo/node_modules/err-candy/node_modules/stack-utils/index.js":[function(require,module,exports){
(function (process){
module.exports = StackUtils;

function StackUtils(opts) {
	if (!(this instanceof StackUtils)) {
		throw new Error('StackUtils constructor must be called with new');
	}
	opts = opts || {};
	this._cwd = (opts.cwd || process.cwd()).replace(/\\/g, '/');
	this._internals = opts.internals || [];
}

module.exports.nodeInternals = nodeInternals;

function nodeInternals() {
	return [
		/\(native\)$/,
		/\(domain.js:\d+:\d+\)$/,
		/\(events.js:\d+:\d+\)$/,
		/\(node.js:\d+:\d+\)$/,
		/\(timers.js:\d+:\d+\)$/,
		/\(module.js:\d+:\d+\)$/,
		/\(internal\/[\w_-]+\.js:\d+:\d+\)$/,
		/\s*at node\.js:\d+:\d+?$/,
		/\/\.node-spawn-wrap-\w+-\w+\/node:\d+:\d+\)?$/
	];
}

StackUtils.prototype.clean = function (stack) {
	if (!Array.isArray(stack)) {
		stack = stack.split('\n');
	}

	if (!(/^\s*at /.test(stack[0])) &&
		(/^\s*at /.test(stack[1]))) {
		stack = stack.slice(1);
	}

	var outdent = false;
	var lastNonAtLine = null;
	var result = [];

	stack.forEach(function (st) {
		st = st.replace(/\\/g, '/');
		var isInternal = this._internals.some(function (internal) {
			return internal.test(st);
		});

		if (isInternal) {
			return null;
		}

		var isAtLine = /^\s*at /.test(st);

		if (outdent) {
			st = st.replace(/\s+$/, '').replace(/^(\s+)at /, '$1');
		} else {
			st = st.trim();
			if (isAtLine) {
				st = st.substring(3);
			}
		}

		st = st.replace(this._cwd + '/', '');

		if (st) {
			if (isAtLine) {
				if (lastNonAtLine) {
					result.push(lastNonAtLine);
					lastNonAtLine = null;
				}
				result.push(st);
			} else {
				outdent = true;
				lastNonAtLine = st;
			}
		}
	}, this);

	stack = result.join('\n').trim();

	if (stack) {
		return stack + '\n';
	}
	return '';
};

StackUtils.prototype.captureString = function (limit, fn) {
	if (typeof limit === 'function') {
		fn = limit;
		limit = Infinity;
	}
	if (!fn) {
		fn = this.captureString;
	}

	var limitBefore = Error.stackTraceLimit;
	if (limit) {
		Error.stackTraceLimit = limit;
	}

	var obj = {};

	Error.captureStackTrace(obj, fn);
	var stack = obj.stack;
	Error.stackTraceLimit = limitBefore;

	return this.clean(stack);
};

StackUtils.prototype.capture = function (limit, fn) {
	if (typeof limit === 'function') {
		fn = limit;
		limit = Infinity;
	}
	if (!fn) {
		fn = this.capture;
	}
	var prepBefore = Error.prepareStackTrace;
	var limitBefore = Error.stackTraceLimit;

	Error.prepareStackTrace = function (obj, site) {
		return site;
	};

	if (limit) {
		Error.stackTraceLimit = limit;
	}

	var obj = {};
	Error.captureStackTrace(obj, fn);
	var stack = obj.stack;
	Error.prepareStackTrace = prepBefore;
	Error.stackTraceLimit = limitBefore;

	return stack;
};

StackUtils.prototype.at = function at(fn) {
	if (!fn) {
		fn = at;
	}

	var site = this.capture(1, fn)[0];

	if (!site) {
		return {};
	}

	var res = {
		line: site.getLineNumber(),
		column: site.getColumnNumber()
	};

	this._setFile(res, site.getFileName());

	if (site.isConstructor()) {
		res.constructor = true;
	}

	if (site.isEval()) {
		res.evalOrigin = site.getEvalOrigin();
	}

	if (site.isNative()) {
		res.native = true;
	}

	var typename = null;
	try {
		typename = site.getTypeName();
	} catch (er) {}

	if (typename &&
		typename !== 'Object' &&
		typename !== '[object Object]') {
		res.type = typename;
	}

	var fname = site.getFunctionName();
	if (fname) {
		res.function = fname;
	}

	var meth = site.getMethodName();
	if (meth && fname !== meth) {
		res.method = meth;
	}

	return res;
};

StackUtils.prototype._setFile = function (result, filename) {
	if (filename) {
		filename = filename.replace(/\\/g, '/');
		if ((filename.indexOf(this._cwd + '/') === 0)) {
			filename = filename.substr(this._cwd.length + 1);
		}
		result.file = filename;
	}
};

var re = new RegExp(
	'^' +
		// Sometimes we strip out the '    at' because it's noisy
	'(?:\\s*at )?' +
		// $1 = ctor if 'new'
	'(?:(new) )?' +
		// Object.method [as foo] (, maybe
		// $2 = function name
		// $3 = method name
	'(?:([^\\(\\[]*)(?: \\[as ([^\\]]+)\\])? \\()?' +
		// (eval at <anonymous> (file.js:1:1),
		// $4 = eval origin
		// $5:$6:$7 are eval file/line/col, but not normally reported
	'(?:eval at ([^ ]+) \\(([^\\)]+):(\\d+):(\\d+)\\), )?' +
		// file:line:col
		// $8:$9:$10
		// $11 = 'native' if native
	'(?:([^\\)]+):(\\d+):(\\d+)|(native))' +
		// maybe close the paren, then end
	'\\)?$'
);

StackUtils.prototype.parseLine = function parseLine(line) {
	var match = line && line.match(re);
	if (!match) {
		return null;
	}

	var ctor = match[1] === 'new';
	var fname = match[2];
	var meth = match[3];
	var evalOrigin = match[4];
	var evalFile = match[5];
	var evalLine = Number(match[6]);
	var evalCol = Number(match[7]);
	var file = match[8];
	var lnum = match[9];
	var col = match[10];
	var native = match[11] === 'native';

	var res = {};

	if (lnum) {
		res.line = Number(lnum);
	}

	if (col) {
		res.column = Number(col);
	}

	this._setFile(res, file);

	if (ctor) {
		res.constructor = true;
	}

	if (evalOrigin) {
		res.evalOrigin = evalOrigin;
		res.evalLine = evalLine;
		res.evalColumn = evalCol;
		res.evalFile = evalFile && evalFile.replace(/\\/g, '/');
	}

	if (native) {
		res.native = true;
	}

	if (fname) {
		res.function = fname;
	}

	if (meth && fname !== meth) {
		res.method = meth;
	}

	return res;
};

var bound = new StackUtils();

Object.keys(StackUtils.prototype).forEach(function (key) {
	StackUtils[key] = bound[key].bind(bound);
});

}).call(this,require("../../../../../../../mako-js/node_modules/process/browser.js"))
},{"../../../../../../../mako-js/node_modules/process/browser.js":"node_modules/mako-js/node_modules/process/browser.js"}],"node_modules/socrates/node_modules/redux/lib/applyMiddleware.js":[function(require,module,exports){
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.__esModule = true;
exports["default"] = applyMiddleware;

var _compose = require('./compose');

var _compose2 = _interopRequireDefault(_compose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

/**
 * Creates a store enhancer that applies middleware to the dispatch method
 * of the Redux store. This is handy for a variety of tasks, such as expressing
 * asynchronous actions in a concise manner, or logging every action payload.
 *
 * See `redux-thunk` package as an example of the Redux middleware.
 *
 * Because middleware is potentially asynchronous, this should be the first
 * store enhancer in the composition chain.
 *
 * Note that each middleware will be given the `dispatch` and `getState` functions
 * as named arguments.
 *
 * @param {...Function} middlewares The middleware chain to be applied.
 * @returns {Function} A store enhancer applying the middleware.
 */
function applyMiddleware() {
  for (var _len = arguments.length, middlewares = Array(_len), _key = 0; _key < _len; _key++) {
    middlewares[_key] = arguments[_key];
  }

  return function (createStore) {
    return function (reducer, initialState, enhancer) {
      var store = createStore(reducer, initialState, enhancer);
      var _dispatch = store.dispatch;
      var chain = [];

      var middlewareAPI = {
        getState: store.getState,
        dispatch: function dispatch(action) {
          return _dispatch(action);
        }
      };
      chain = middlewares.map(function (middleware) {
        return middleware(middlewareAPI);
      });
      _dispatch = _compose2["default"].apply(undefined, chain)(store.dispatch);

      return _extends({}, store, {
        dispatch: _dispatch
      });
    };
  };
}
},{"./compose":"node_modules/socrates/node_modules/redux/lib/compose.js"}],"node_modules/preact-socrates/lib/cycle.js":[function(require,module,exports){
/**
 * Module Dependencies
 */

var assign = require('object-assign')
var raf = require('component-raf')

/**
 * Export `cycle`
 */

module.exports = cycle

/**
 * Create the "cycle"
 *
 * @param {Function} renderer
 * @param {Object} data
 */

function cycle (renderer, store) {
  var debounce

  // render
  function render () {
    clearTimeout(debounce)
    debounce = null
    return renderer(assign({ dispatch: dispatch }, store() ))
  }

  // subscribe to changes
  store.subscribe(function () {
    if (!debounce) debounce = raf(render)
  })

  // dispatch via socrates
  function dispatch () {
    return store.apply(null, arguments)
  }

  return render()
}

},{"component-raf":"node_modules/preact-socrates/node_modules/component-raf/index.js","object-assign":"node_modules/preact-socrates/node_modules/object-assign/index.js"}],"node_modules/socrates/node_modules/redux/node_modules/lodash/isPlainObject.js":[function(require,module,exports){
var isHostObject = require('./_isHostObject'),
    isObjectLike = require('./isObjectLike');

/** `Object#toString` result references. */
var objectTag = '[object Object]';

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to resolve the decompiled source of functions. */
var funcToString = Function.prototype.toString;

/** Used to infer the `Object` constructor. */
var objectCtorString = funcToString.call(Object);

/**
 * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString = objectProto.toString;

/** Built-in value references. */
var getPrototypeOf = Object.getPrototypeOf;

/**
 * Checks if `value` is a plain object, that is, an object created by the
 * `Object` constructor or one with a `[[Prototype]]` of `null`.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 * }
 *
 * _.isPlainObject(new Foo);
 * // => false
 *
 * _.isPlainObject([1, 2, 3]);
 * // => false
 *
 * _.isPlainObject({ 'x': 0, 'y': 0 });
 * // => true
 *
 * _.isPlainObject(Object.create(null));
 * // => true
 */
function isPlainObject(value) {
  if (!isObjectLike(value) ||
      objectToString.call(value) != objectTag || isHostObject(value)) {
    return false;
  }
  var proto = getPrototypeOf(value);
  if (proto === null) {
    return true;
  }
  var Ctor = proto.constructor;
  return (typeof Ctor == 'function' &&
    Ctor instanceof Ctor && funcToString.call(Ctor) == objectCtorString);
}

module.exports = isPlainObject;

},{"./_isHostObject":"node_modules/socrates/node_modules/redux/node_modules/lodash/_isHostObject.js","./isObjectLike":"node_modules/socrates/node_modules/redux/node_modules/lodash/isObjectLike.js"}],"node_modules/socrates/lib/is-fsa.js":[function(require,module,exports){
/**
 * Module Dependencies
 */

var is_error = require('lodash.iserror')
var isobj = require('isobj')
var keys = Object.keys

/**
 * Whitelisted keys
 */

var whitelist = {
  type: 1,
  meta: 1,
  error: 1,
  payload: 1
}

/**
 * Export `is_fsa`
 */

module.exports = is_fsa

/**
 * Check if the value is an action
 *
 * Spec: https://github.com/acdlite/flux-standard-action#actions
 *
 * @param {Mixed} value
 * @return {Boolean}
 */

function is_fsa (value) {
  // value must be an object and have a type
  if (!isobj(value) || !value.type) return false

  // if any properties on the object are
  // not part of the whitelist fail then
  // return false
  var props = keys(value)
  for (var i = 0, prop; prop = props[i]; i++) {
    if (!whitelist[prop]) return false
  }

  // lastly check that if value.error is "true"
  // that our payload is an Error object
  if (value.error === true && !is_error(value.payload)) {
    return false
  }

  return true
}

},{"isobj":"node_modules/socrates/node_modules/isobj/index.js","lodash.iserror":"node_modules/socrates/node_modules/lodash.iserror/index.js"}],"node_modules/socrates/node_modules/@f/compose-reducers/lib/index.js":[function(require,module,exports){
/**
 * Modules
 */

var toArray = require('@f/to-array')

/**
 * Expose composeReducers
 */

module.exports = composeReducers['default'] = composeReducers

/**
 * composeReducers
 */

function composeReducers (/* arguments */) {
  var args = toArray(arguments)
  var len = args.length

  return function (state, action) {
    for (var i = 0; i < len; ++i) {
      state = args[i](state, action)
    }

    return state
  }
}

},{"@f/to-array":"node_modules/socrates/node_modules/@f/compose-reducers/node_modules/@f/to-array/lib/index.js"}],"node_modules/socrates/node_modules/vo/node_modules/wrapped/index.js":[function(require,module,exports){
/**
 * Module Dependencies
 */

var sliced = require('sliced');
var noop = function(){};
var co = require('co');

/**
 * Export `wrapped`
 */

module.exports = wrapped;

/**
 * Wrap a function to support
 * sync, async, and gen functions.
 *
 * @param {Function} fn
 * @return {Function}
 * @api public
 */

function wrapped(fn) {
  function wrap() {
    var args = sliced(arguments);
    var last = args[args.length - 1];
    var ctx = this;

    // done
    var done = typeof last == 'function' ? args.pop() : noop;

    // nothing
    if (!fn) {
      return done.apply(ctx, [null].concat(args));
    }

    // generator
    if (generator(fn)) {
      return co(fn).apply(ctx, args.concat(done));
    }

    // async
    if (fn.length > args.length) {
      // NOTE: this only handles uncaught synchronous errors
      try {
        return fn.apply(ctx, args.concat(done));
      } catch (e) {
        return done(e);
      }
    }

    // sync
    return sync(fn, done).apply(ctx, args);
  }

  return wrap;
}

/**
 * Wrap a synchronous function execution.
 *
 * @param {Function} fn
 * @param {Function} done
 * @return {Function}
 * @api private
 */

function sync(fn, done) {
  return function () {
    var ret;

    try {
      ret = fn.apply(this, arguments);
    } catch (err) {
      return done(err);
    }

    if (promise(ret)) {
      ret.then(function (value) { done(null, value); }, done);
    } else {
      ret instanceof Error ? done(ret) : done(null, ret);
    }
  }
}

/**
 * Is `value` a generator?
 *
 * @param {Mixed} value
 * @return {Boolean}
 * @api private
 */

function generator(value) {
  return value
    && value.constructor
    && 'GeneratorFunction' == value.constructor.name;
}


/**
 * Is `value` a promise?
 *
 * @param {Mixed} value
 * @return {Boolean}
 * @api private
 */

function promise(value) {
  return value && 'function' == typeof value.then;
}

},{"co":"node_modules/socrates/node_modules/vo/node_modules/wrapped/node_modules/co/index.js","sliced":"node_modules/socrates/node_modules/sliced/index.js"}],"node_modules/socrates/node_modules/@f/combine-reducers/node_modules/@f/clone-shallow/node_modules/@f/clone-obj/node_modules/@f/foreach/node_modules/@f/is-object/lib/index.js":[function(require,module,exports){
/**
 * Modules
 */

var isFunction = require('@f/is-function')

/**
 * Expose isObject
 */

module.exports = isObject

/**
 * Constants
 */

var objString = toString(Object)

/**
 * Check for plain object.
 *
 * @param {Mixed} val
 * @return {Boolean}
 * @api private
 */

function isObject (val) {
  return !!val && (val.constructor === Object || isObjectString(val.constructor))
}

function isObjectString (val) {
  return !!val && isFunction(val) && toString(val) === objString
}

function toString (val) {
  return Function.prototype.toString.call(val)
}

},{"@f/is-function":"node_modules/socrates/node_modules/@f/combine-reducers/node_modules/@f/clone-shallow/node_modules/@f/clone-obj/node_modules/@f/foreach/node_modules/@f/is-object/node_modules/@f/is-function/lib/index.js"}],"node_modules/mako-js/node_modules/url/url.js":[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

var punycode = require('punycode');
var util = require('./util');

exports.parse = urlParse;
exports.resolve = urlResolve;
exports.resolveObject = urlResolveObject;
exports.format = urlFormat;

exports.Url = Url;

function Url() {
  this.protocol = null;
  this.slashes = null;
  this.auth = null;
  this.host = null;
  this.port = null;
  this.hostname = null;
  this.hash = null;
  this.search = null;
  this.query = null;
  this.pathname = null;
  this.path = null;
  this.href = null;
}

// Reference: RFC 3986, RFC 1808, RFC 2396

// define these here so at least they only have to be
// compiled once on the first module load.
var protocolPattern = /^([a-z0-9.+-]+:)/i,
    portPattern = /:[0-9]*$/,

    // Special case for a simple path URL
    simplePathPattern = /^(\/\/?(?!\/)[^\?\s]*)(\?[^\s]*)?$/,

    // RFC 2396: characters reserved for delimiting URLs.
    // We actually just auto-escape these.
    delims = ['<', '>', '"', '`', ' ', '\r', '\n', '\t'],

    // RFC 2396: characters not allowed for various reasons.
    unwise = ['{', '}', '|', '\\', '^', '`'].concat(delims),

    // Allowed by RFCs, but cause of XSS attacks.  Always escape these.
    autoEscape = ['\''].concat(unwise),
    // Characters that are never ever allowed in a hostname.
    // Note that any invalid chars are also handled, but these
    // are the ones that are *expected* to be seen, so we fast-path
    // them.
    nonHostChars = ['%', '/', '?', ';', '#'].concat(autoEscape),
    hostEndingChars = ['/', '?', '#'],
    hostnameMaxLen = 255,
    hostnamePartPattern = /^[+a-z0-9A-Z_-]{0,63}$/,
    hostnamePartStart = /^([+a-z0-9A-Z_-]{0,63})(.*)$/,
    // protocols that can allow "unsafe" and "unwise" chars.
    unsafeProtocol = {
      'javascript': true,
      'javascript:': true
    },
    // protocols that never have a hostname.
    hostlessProtocol = {
      'javascript': true,
      'javascript:': true
    },
    // protocols that always contain a // bit.
    slashedProtocol = {
      'http': true,
      'https': true,
      'ftp': true,
      'gopher': true,
      'file': true,
      'http:': true,
      'https:': true,
      'ftp:': true,
      'gopher:': true,
      'file:': true
    },
    querystring = require('querystring');

function urlParse(url, parseQueryString, slashesDenoteHost) {
  if (url && util.isObject(url) && url instanceof Url) return url;

  var u = new Url;
  u.parse(url, parseQueryString, slashesDenoteHost);
  return u;
}

Url.prototype.parse = function(url, parseQueryString, slashesDenoteHost) {
  if (!util.isString(url)) {
    throw new TypeError("Parameter 'url' must be a string, not " + typeof url);
  }

  // Copy chrome, IE, opera backslash-handling behavior.
  // Back slashes before the query string get converted to forward slashes
  // See: https://code.google.com/p/chromium/issues/detail?id=25916
  var queryIndex = url.indexOf('?'),
      splitter =
          (queryIndex !== -1 && queryIndex < url.indexOf('#')) ? '?' : '#',
      uSplit = url.split(splitter),
      slashRegex = /\\/g;
  uSplit[0] = uSplit[0].replace(slashRegex, '/');
  url = uSplit.join(splitter);

  var rest = url;

  // trim before proceeding.
  // This is to support parse stuff like "  http://foo.com  \n"
  rest = rest.trim();

  if (!slashesDenoteHost && url.split('#').length === 1) {
    // Try fast path regexp
    var simplePath = simplePathPattern.exec(rest);
    if (simplePath) {
      this.path = rest;
      this.href = rest;
      this.pathname = simplePath[1];
      if (simplePath[2]) {
        this.search = simplePath[2];
        if (parseQueryString) {
          this.query = querystring.parse(this.search.substr(1));
        } else {
          this.query = this.search.substr(1);
        }
      } else if (parseQueryString) {
        this.search = '';
        this.query = {};
      }
      return this;
    }
  }

  var proto = protocolPattern.exec(rest);
  if (proto) {
    proto = proto[0];
    var lowerProto = proto.toLowerCase();
    this.protocol = lowerProto;
    rest = rest.substr(proto.length);
  }

  // figure out if it's got a host
  // user@server is *always* interpreted as a hostname, and url
  // resolution will treat //foo/bar as host=foo,path=bar because that's
  // how the browser resolves relative URLs.
  if (slashesDenoteHost || proto || rest.match(/^\/\/[^@\/]+@[^@\/]+/)) {
    var slashes = rest.substr(0, 2) === '//';
    if (slashes && !(proto && hostlessProtocol[proto])) {
      rest = rest.substr(2);
      this.slashes = true;
    }
  }

  if (!hostlessProtocol[proto] &&
      (slashes || (proto && !slashedProtocol[proto]))) {

    // there's a hostname.
    // the first instance of /, ?, ;, or # ends the host.
    //
    // If there is an @ in the hostname, then non-host chars *are* allowed
    // to the left of the last @ sign, unless some host-ending character
    // comes *before* the @-sign.
    // URLs are obnoxious.
    //
    // ex:
    // http://a@b@c/ => user:a@b host:c
    // http://a@b?@c => user:a host:c path:/?@c

    // v0.12 TODO(isaacs): This is not quite how Chrome does things.
    // Review our test case against browsers more comprehensively.

    // find the first instance of any hostEndingChars
    var hostEnd = -1;
    for (var i = 0; i < hostEndingChars.length; i++) {
      var hec = rest.indexOf(hostEndingChars[i]);
      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
        hostEnd = hec;
    }

    // at this point, either we have an explicit point where the
    // auth portion cannot go past, or the last @ char is the decider.
    var auth, atSign;
    if (hostEnd === -1) {
      // atSign can be anywhere.
      atSign = rest.lastIndexOf('@');
    } else {
      // atSign must be in auth portion.
      // http://a@b/c@d => host:b auth:a path:/c@d
      atSign = rest.lastIndexOf('@', hostEnd);
    }

    // Now we have a portion which is definitely the auth.
    // Pull that off.
    if (atSign !== -1) {
      auth = rest.slice(0, atSign);
      rest = rest.slice(atSign + 1);
      this.auth = decodeURIComponent(auth);
    }

    // the host is the remaining to the left of the first non-host char
    hostEnd = -1;
    for (var i = 0; i < nonHostChars.length; i++) {
      var hec = rest.indexOf(nonHostChars[i]);
      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
        hostEnd = hec;
    }
    // if we still have not hit it, then the entire thing is a host.
    if (hostEnd === -1)
      hostEnd = rest.length;

    this.host = rest.slice(0, hostEnd);
    rest = rest.slice(hostEnd);

    // pull out port.
    this.parseHost();

    // we've indicated that there is a hostname,
    // so even if it's empty, it has to be present.
    this.hostname = this.hostname || '';

    // if hostname begins with [ and ends with ]
    // assume that it's an IPv6 address.
    var ipv6Hostname = this.hostname[0] === '[' &&
        this.hostname[this.hostname.length - 1] === ']';

    // validate a little.
    if (!ipv6Hostname) {
      var hostparts = this.hostname.split(/\./);
      for (var i = 0, l = hostparts.length; i < l; i++) {
        var part = hostparts[i];
        if (!part) continue;
        if (!part.match(hostnamePartPattern)) {
          var newpart = '';
          for (var j = 0, k = part.length; j < k; j++) {
            if (part.charCodeAt(j) > 127) {
              // we replace non-ASCII char with a temporary placeholder
              // we need this to make sure size of hostname is not
              // broken by replacing non-ASCII by nothing
              newpart += 'x';
            } else {
              newpart += part[j];
            }
          }
          // we test again with ASCII char only
          if (!newpart.match(hostnamePartPattern)) {
            var validParts = hostparts.slice(0, i);
            var notHost = hostparts.slice(i + 1);
            var bit = part.match(hostnamePartStart);
            if (bit) {
              validParts.push(bit[1]);
              notHost.unshift(bit[2]);
            }
            if (notHost.length) {
              rest = '/' + notHost.join('.') + rest;
            }
            this.hostname = validParts.join('.');
            break;
          }
        }
      }
    }

    if (this.hostname.length > hostnameMaxLen) {
      this.hostname = '';
    } else {
      // hostnames are always lower case.
      this.hostname = this.hostname.toLowerCase();
    }

    if (!ipv6Hostname) {
      // IDNA Support: Returns a punycoded representation of "domain".
      // It only converts parts of the domain name that
      // have non-ASCII characters, i.e. it doesn't matter if
      // you call it with a domain that already is ASCII-only.
      this.hostname = punycode.toASCII(this.hostname);
    }

    var p = this.port ? ':' + this.port : '';
    var h = this.hostname || '';
    this.host = h + p;
    this.href += this.host;

    // strip [ and ] from the hostname
    // the host field still retains them, though
    if (ipv6Hostname) {
      this.hostname = this.hostname.substr(1, this.hostname.length - 2);
      if (rest[0] !== '/') {
        rest = '/' + rest;
      }
    }
  }

  // now rest is set to the post-host stuff.
  // chop off any delim chars.
  if (!unsafeProtocol[lowerProto]) {

    // First, make 100% sure that any "autoEscape" chars get
    // escaped, even if encodeURIComponent doesn't think they
    // need to be.
    for (var i = 0, l = autoEscape.length; i < l; i++) {
      var ae = autoEscape[i];
      if (rest.indexOf(ae) === -1)
        continue;
      var esc = encodeURIComponent(ae);
      if (esc === ae) {
        esc = escape(ae);
      }
      rest = rest.split(ae).join(esc);
    }
  }


  // chop off from the tail first.
  var hash = rest.indexOf('#');
  if (hash !== -1) {
    // got a fragment string.
    this.hash = rest.substr(hash);
    rest = rest.slice(0, hash);
  }
  var qm = rest.indexOf('?');
  if (qm !== -1) {
    this.search = rest.substr(qm);
    this.query = rest.substr(qm + 1);
    if (parseQueryString) {
      this.query = querystring.parse(this.query);
    }
    rest = rest.slice(0, qm);
  } else if (parseQueryString) {
    // no query string, but parseQueryString still requested
    this.search = '';
    this.query = {};
  }
  if (rest) this.pathname = rest;
  if (slashedProtocol[lowerProto] &&
      this.hostname && !this.pathname) {
    this.pathname = '/';
  }

  //to support http.request
  if (this.pathname || this.search) {
    var p = this.pathname || '';
    var s = this.search || '';
    this.path = p + s;
  }

  // finally, reconstruct the href based on what has been validated.
  this.href = this.format();
  return this;
};

// format a parsed object into a url string
function urlFormat(obj) {
  // ensure it's an object, and not a string url.
  // If it's an obj, this is a no-op.
  // this way, you can call url_format() on strings
  // to clean up potentially wonky urls.
  if (util.isString(obj)) obj = urlParse(obj);
  if (!(obj instanceof Url)) return Url.prototype.format.call(obj);
  return obj.format();
}

Url.prototype.format = function() {
  var auth = this.auth || '';
  if (auth) {
    auth = encodeURIComponent(auth);
    auth = auth.replace(/%3A/i, ':');
    auth += '@';
  }

  var protocol = this.protocol || '',
      pathname = this.pathname || '',
      hash = this.hash || '',
      host = false,
      query = '';

  if (this.host) {
    host = auth + this.host;
  } else if (this.hostname) {
    host = auth + (this.hostname.indexOf(':') === -1 ?
        this.hostname :
        '[' + this.hostname + ']');
    if (this.port) {
      host += ':' + this.port;
    }
  }

  if (this.query &&
      util.isObject(this.query) &&
      Object.keys(this.query).length) {
    query = querystring.stringify(this.query);
  }

  var search = this.search || (query && ('?' + query)) || '';

  if (protocol && protocol.substr(-1) !== ':') protocol += ':';

  // only the slashedProtocols get the //.  Not mailto:, xmpp:, etc.
  // unless they had them to begin with.
  if (this.slashes ||
      (!protocol || slashedProtocol[protocol]) && host !== false) {
    host = '//' + (host || '');
    if (pathname && pathname.charAt(0) !== '/') pathname = '/' + pathname;
  } else if (!host) {
    host = '';
  }

  if (hash && hash.charAt(0) !== '#') hash = '#' + hash;
  if (search && search.charAt(0) !== '?') search = '?' + search;

  pathname = pathname.replace(/[?#]/g, function(match) {
    return encodeURIComponent(match);
  });
  search = search.replace('#', '%23');

  return protocol + host + pathname + search + hash;
};

function urlResolve(source, relative) {
  return urlParse(source, false, true).resolve(relative);
}

Url.prototype.resolve = function(relative) {
  return this.resolveObject(urlParse(relative, false, true)).format();
};

function urlResolveObject(source, relative) {
  if (!source) return relative;
  return urlParse(source, false, true).resolveObject(relative);
}

Url.prototype.resolveObject = function(relative) {
  if (util.isString(relative)) {
    var rel = new Url();
    rel.parse(relative, false, true);
    relative = rel;
  }

  var result = new Url();
  var tkeys = Object.keys(this);
  for (var tk = 0; tk < tkeys.length; tk++) {
    var tkey = tkeys[tk];
    result[tkey] = this[tkey];
  }

  // hash is always overridden, no matter what.
  // even href="" will remove it.
  result.hash = relative.hash;

  // if the relative url is empty, then there's nothing left to do here.
  if (relative.href === '') {
    result.href = result.format();
    return result;
  }

  // hrefs like //foo/bar always cut to the protocol.
  if (relative.slashes && !relative.protocol) {
    // take everything except the protocol from relative
    var rkeys = Object.keys(relative);
    for (var rk = 0; rk < rkeys.length; rk++) {
      var rkey = rkeys[rk];
      if (rkey !== 'protocol')
        result[rkey] = relative[rkey];
    }

    //urlParse appends trailing / to urls like http://www.example.com
    if (slashedProtocol[result.protocol] &&
        result.hostname && !result.pathname) {
      result.path = result.pathname = '/';
    }

    result.href = result.format();
    return result;
  }

  if (relative.protocol && relative.protocol !== result.protocol) {
    // if it's a known url protocol, then changing
    // the protocol does weird things
    // first, if it's not file:, then we MUST have a host,
    // and if there was a path
    // to begin with, then we MUST have a path.
    // if it is file:, then the host is dropped,
    // because that's known to be hostless.
    // anything else is assumed to be absolute.
    if (!slashedProtocol[relative.protocol]) {
      var keys = Object.keys(relative);
      for (var v = 0; v < keys.length; v++) {
        var k = keys[v];
        result[k] = relative[k];
      }
      result.href = result.format();
      return result;
    }

    result.protocol = relative.protocol;
    if (!relative.host && !hostlessProtocol[relative.protocol]) {
      var relPath = (relative.pathname || '').split('/');
      while (relPath.length && !(relative.host = relPath.shift()));
      if (!relative.host) relative.host = '';
      if (!relative.hostname) relative.hostname = '';
      if (relPath[0] !== '') relPath.unshift('');
      if (relPath.length < 2) relPath.unshift('');
      result.pathname = relPath.join('/');
    } else {
      result.pathname = relative.pathname;
    }
    result.search = relative.search;
    result.query = relative.query;
    result.host = relative.host || '';
    result.auth = relative.auth;
    result.hostname = relative.hostname || relative.host;
    result.port = relative.port;
    // to support http.request
    if (result.pathname || result.search) {
      var p = result.pathname || '';
      var s = result.search || '';
      result.path = p + s;
    }
    result.slashes = result.slashes || relative.slashes;
    result.href = result.format();
    return result;
  }

  var isSourceAbs = (result.pathname && result.pathname.charAt(0) === '/'),
      isRelAbs = (
          relative.host ||
          relative.pathname && relative.pathname.charAt(0) === '/'
      ),
      mustEndAbs = (isRelAbs || isSourceAbs ||
                    (result.host && relative.pathname)),
      removeAllDots = mustEndAbs,
      srcPath = result.pathname && result.pathname.split('/') || [],
      relPath = relative.pathname && relative.pathname.split('/') || [],
      psychotic = result.protocol && !slashedProtocol[result.protocol];

  // if the url is a non-slashed url, then relative
  // links like ../.. should be able
  // to crawl up to the hostname, as well.  This is strange.
  // result.protocol has already been set by now.
  // Later on, put the first path part into the host field.
  if (psychotic) {
    result.hostname = '';
    result.port = null;
    if (result.host) {
      if (srcPath[0] === '') srcPath[0] = result.host;
      else srcPath.unshift(result.host);
    }
    result.host = '';
    if (relative.protocol) {
      relative.hostname = null;
      relative.port = null;
      if (relative.host) {
        if (relPath[0] === '') relPath[0] = relative.host;
        else relPath.unshift(relative.host);
      }
      relative.host = null;
    }
    mustEndAbs = mustEndAbs && (relPath[0] === '' || srcPath[0] === '');
  }

  if (isRelAbs) {
    // it's absolute.
    result.host = (relative.host || relative.host === '') ?
                  relative.host : result.host;
    result.hostname = (relative.hostname || relative.hostname === '') ?
                      relative.hostname : result.hostname;
    result.search = relative.search;
    result.query = relative.query;
    srcPath = relPath;
    // fall through to the dot-handling below.
  } else if (relPath.length) {
    // it's relative
    // throw away the existing file, and take the new path instead.
    if (!srcPath) srcPath = [];
    srcPath.pop();
    srcPath = srcPath.concat(relPath);
    result.search = relative.search;
    result.query = relative.query;
  } else if (!util.isNullOrUndefined(relative.search)) {
    // just pull out the search.
    // like href='?foo'.
    // Put this after the other two cases because it simplifies the booleans
    if (psychotic) {
      result.hostname = result.host = srcPath.shift();
      //occationaly the auth can get stuck only in host
      //this especially happens in cases like
      //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
      var authInHost = result.host && result.host.indexOf('@') > 0 ?
                       result.host.split('@') : false;
      if (authInHost) {
        result.auth = authInHost.shift();
        result.host = result.hostname = authInHost.shift();
      }
    }
    result.search = relative.search;
    result.query = relative.query;
    //to support http.request
    if (!util.isNull(result.pathname) || !util.isNull(result.search)) {
      result.path = (result.pathname ? result.pathname : '') +
                    (result.search ? result.search : '');
    }
    result.href = result.format();
    return result;
  }

  if (!srcPath.length) {
    // no path at all.  easy.
    // we've already handled the other stuff above.
    result.pathname = null;
    //to support http.request
    if (result.search) {
      result.path = '/' + result.search;
    } else {
      result.path = null;
    }
    result.href = result.format();
    return result;
  }

  // if a url ENDs in . or .., then it must get a trailing slash.
  // however, if it ends in anything else non-slashy,
  // then it must NOT get a trailing slash.
  var last = srcPath.slice(-1)[0];
  var hasTrailingSlash = (
      (result.host || relative.host || srcPath.length > 1) &&
      (last === '.' || last === '..') || last === '');

  // strip single dots, resolve double dots to parent dir
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = srcPath.length; i >= 0; i--) {
    last = srcPath[i];
    if (last === '.') {
      srcPath.splice(i, 1);
    } else if (last === '..') {
      srcPath.splice(i, 1);
      up++;
    } else if (up) {
      srcPath.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (!mustEndAbs && !removeAllDots) {
    for (; up--; up) {
      srcPath.unshift('..');
    }
  }

  if (mustEndAbs && srcPath[0] !== '' &&
      (!srcPath[0] || srcPath[0].charAt(0) !== '/')) {
    srcPath.unshift('');
  }

  if (hasTrailingSlash && (srcPath.join('/').substr(-1) !== '/')) {
    srcPath.push('');
  }

  var isAbsolute = srcPath[0] === '' ||
      (srcPath[0] && srcPath[0].charAt(0) === '/');

  // put the host back
  if (psychotic) {
    result.hostname = result.host = isAbsolute ? '' :
                                    srcPath.length ? srcPath.shift() : '';
    //occationaly the auth can get stuck only in host
    //this especially happens in cases like
    //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
    var authInHost = result.host && result.host.indexOf('@') > 0 ?
                     result.host.split('@') : false;
    if (authInHost) {
      result.auth = authInHost.shift();
      result.host = result.hostname = authInHost.shift();
    }
  }

  mustEndAbs = mustEndAbs || (result.host && srcPath.length);

  if (mustEndAbs && !isAbsolute) {
    srcPath.unshift('');
  }

  if (!srcPath.length) {
    result.pathname = null;
    result.path = null;
  } else {
    result.pathname = srcPath.join('/');
  }

  //to support request.http
  if (!util.isNull(result.pathname) || !util.isNull(result.search)) {
    result.path = (result.pathname ? result.pathname : '') +
                  (result.search ? result.search : '');
  }
  result.auth = relative.auth || result.auth;
  result.slashes = result.slashes || relative.slashes;
  result.href = result.format();
  return result;
};

Url.prototype.parseHost = function() {
  var host = this.host;
  var port = portPattern.exec(host);
  if (port) {
    port = port[0];
    if (port !== ':') {
      this.port = port.substr(1);
    }
    host = host.substr(0, host.length - port.length);
  }
  if (host) this.hostname = host;
};

},{"./util":"node_modules/mako-js/node_modules/url/util.js","punycode":"node_modules/mako-js/node_modules/punycode/punycode.js","querystring":"node_modules/mako-js/node_modules/querystring-es3/index.js"}],"node_modules/enroute/index.js":[function(require,module,exports){
/**
 * Module Dependencies
 */

var Regexp = require('path-to-regexp')
var assign = require('object-assign')

/**
 * Export `Enroute`
 */

module.exports = Enroute

/**
 * Create `enroute`
 *
 * @param {Object} routes
 * @return {Function}
 */

function Enroute (routes) {
  return function enroute (location, props) {
    if (!location) throw new Error('enroute requires a location')
    props = props || {}
    var params = {}

    for (var route in routes) {
      var m = match(route, params, location)
      var fn = routes[route]

      if (m) {
        if (typeof fn !== 'function') return fn
        else return fn(params, props)
      }
    }

    return null
  }
}

/**
 * Check if this route matches `path`, if so
 * populate `params`.
 *
 * @param {String} path
 * @param {Object} params
 * @return {Boolean}
 * @api private
 */

function match(path, params, pathname) {
  var keys = [];
  var regexp = Regexp(path, keys);
  var m = regexp.exec(pathname);

  if (!m) return false;
  else if (!params) return true;

  for (var i = 1, len = m.length; i < len; ++i) {
    var key = keys[i - 1];
    var val = 'string' == typeof m[i] ? decodeURIComponent(m[i]) : m[i];
    if (key) params[key.name] = val;
  }

  return true;
}

},{"object-assign":"node_modules/enroute/node_modules/object-assign/index.js","path-to-regexp":"node_modules/enroute/node_modules/path-to-regexp/index.js"}],"node_modules/socrates/lib/update.js":[function(require,module,exports){
'use strict';

/**
 * Module Dependencies
 */

var is_plain_object = require('isobj')
var assign = require('object-assign')
var freeze = require('./freeze')
var sliced = require('sliced')
var is_array = Array.isArray
var keys = Object.keys

/**
 * Export `update`
 */

module.exports = update

/**
 * Update the object or array
 *
 * @param {Mixed} original
 * @param {Mixed, ...} updates
 * @return {Mixed}
 */

function update (original, update) {
  update = sliced(arguments, 2).reduce(function (o, n) { return resolve(o, n, true) }, update)
  return freeze(resolve(original, update))
}

/**
 * Resolve the updates
 *
 * @param {Mixed} original
 * @param {Array} updates
 */

function resolve (original, updates, keep_null) {
  return is_plain_object(original) && is_plain_object(updates)
    ? object(original, updates, keep_null)
    : is_array(original) && is_array(updates)
    ? array(original, updates)
    : updates === undefined ? original : updates
}

/**
 * Update objects
 *
 * @param {Object} original
 * @param {Array} updates
 * @return {Array}
 */

function object (original, updates, keep_null) {
  return keys(updates).reduce(function (obj, key, i) {
    if (!keep_null && updates[key] === null) {
      delete obj[key]
    } else {
      obj[key] = resolve(original[key], updates[key])
    }

    return obj
  }, assign({}, original))
}

/**
 * Update arrays
 *
 * @param {Array} original
 * @param {Array} updates
 * @return {Array}
 */

function array (original, updates) {
  return [].concat(updates)
}


// var fruits = ['apples', 'oranges', 'pears']
// var obj = {
//   name: 'matt',
//   age: 26,
//   settings: {
//     theme: 'red',
//     tz: 'America/Los Angeles'
//   },
//   fruits: fruits
// }

// var a = {
//   pesky: 'change'
// }

// var out = update(obj, {
//   name: 'matt',
//   settings: {
//     tz: 'America/Chicago'
//   }
// }, {
//   settings: [a],
// })

// a.pesky = 'lol...'
// fruits.push('apricots')
// console.log(out)

// var fruits = ['a', 'b', 'c']
// console.log(update(fruits, 'd'))
// fruits.push('d')

},{"./freeze":"node_modules/socrates/lib/freeze.js","isobj":"node_modules/socrates/node_modules/isobj/index.js","object-assign":"node_modules/socrates/node_modules/object-assign/index.js","sliced":"node_modules/socrates/node_modules/sliced/index.js"}],"node_modules/socrates/node_modules/vo/node_modules/err-candy/index.js":[function(require,module,exports){
(function (process){
/**
 * Module dependencies
 */

var Stack = require('stack-utils')

/**
 * Export `error`
 */

module.exports = error

/**
 * Clean up or combine errors
 *
 * @param {Error|Array} errors
 * @return {Error}
 */

function error (errors) {
  errors = Array.isArray(errors) ? errors : [errors]
  return combine(errors)
}

/**
 * Initialize `combine`
 */

function combine (errors) {
  if (errors.length === 1) return improve(errors[0])

  errors = errors.map(function(error, i) {
    return improve(error)
  })

  var message = errors.map(function (error) {
    return error.message
  }).join('\n\n')

  var stack = errors.map(function (error) {
    return error.stack
  }).join('')

  var error = new Error()
  error.message = message
  error.stack = stack
  error.candy = true

  return error
}

/**
 * Improve the error
 *
 * @param {Error} err
 * @return {Error}
 */

function improve (err, prefix) {
  if (err.candy) return err

  prefix = prefix || '  \u2716 '

  // clean the stack
  var stack = clean(err.stack)

  // create a new error
  var error = new Error()
  error.candy = true

  // improve the message
  var message = normalize(err)
  error.message = prefix + message

  // improve the stack
  error.stack = stack
    ? prefix + message + '\n\n' + stack + '\n\n'
    : prefix + message + '\n\n'

  return error
}

/**
 * Normalize the message
 *
 * @param {Error} err
 * @return {String}
 */

function normalize (err) {
  if (err.codeFrame) { // babelify@6.x
    return [err.message, indent(err.codeFrame, 4)].join('\n\n')
  } else { // babelify@5.x and browserify
    return err.annotated || err.message
  }
}

/**
 * Clean the stack traces
 *
 * @param {String} stack
 * @return {String}
 */

function clean (stack) {
  return new Stack({
    internals: Stack.nodeInternals().concat(/\b\/node_modules\/babel-core\b/),
    cwd: process.cwd()
  })
  .clean(stack)
  .split('\n')
  .filter(function (line) { return line })
  .map(function (line) { return '    \u25B8 ' + line })
  .join('\n')
}

/**
 * Indent a bit
 *
 * @param {String} str
 * @return {String}
 */

function indent(str, n) {
  return str
    .split('\n')
    .map(function (line) { return repeat(' ', n) + line })
    .join('\n')
}

/**
 * Repeat a string a n times
 *
 * @param {String} str
 * @param {Number} n
 * @return {String}
 */

function repeat (str, n) {
  return new Array(n + 1).join(str)
}

}).call(this,require("../../../../../mako-js/node_modules/process/browser.js"))
},{"../../../../../mako-js/node_modules/process/browser.js":"node_modules/mako-js/node_modules/process/browser.js","stack-utils":"node_modules/socrates/node_modules/vo/node_modules/err-candy/node_modules/stack-utils/index.js"}],"node_modules/preact-socrates/lib/index.js":[function(require,module,exports){
/**
 * Module Dependencies
 */

var preact = require('preact')
var cycle = require('./cycle')
var Render = preact.render
var h = preact.h

/**
 * Export `render`
 */

module.exports = render
render.render = render
render.h = h

/**
 * Render
 *
 * @param {Renderable} Renderable
 * @param {Store} data
 * @param {Object} parent
 * @return {Object}
 */

function render (Renderable, data, parent) {
  var renderer = Renderer(Renderable, parent)
  return cycle(renderer, data)
}

/**
 * Renderer
 *
 * @param {Renderable} Renderable
 * @param {Object} parent
 */

function Renderer (Renderable, parent) {
  var root = null

  return function render (props) {
    root = Render(h(Renderable, props), parent, root)
  }
}

},{"./cycle":"node_modules/preact-socrates/lib/cycle.js","preact":"node_modules/preact-socrates/node_modules/preact/dist/preact.js"}],"node_modules/socrates/node_modules/redux/lib/createStore.js":[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports.ActionTypes = undefined;
exports["default"] = createStore;

var _isPlainObject = require('lodash/isPlainObject');

var _isPlainObject2 = _interopRequireDefault(_isPlainObject);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

/**
 * These are private action types reserved by Redux.
 * For any unknown actions, you must return the current state.
 * If the current state is undefined, you must return the initial state.
 * Do not reference these action types directly in your code.
 */
var ActionTypes = exports.ActionTypes = {
  INIT: '@@redux/INIT'
};

/**
 * Creates a Redux store that holds the state tree.
 * The only way to change the data in the store is to call `dispatch()` on it.
 *
 * There should only be a single store in your app. To specify how different
 * parts of the state tree respond to actions, you may combine several reducers
 * into a single reducer function by using `combineReducers`.
 *
 * @param {Function} reducer A function that returns the next state tree, given
 * the current state tree and the action to handle.
 *
 * @param {any} [initialState] The initial state. You may optionally specify it
 * to hydrate the state from the server in universal apps, or to restore a
 * previously serialized user session.
 * If you use `combineReducers` to produce the root reducer function, this must be
 * an object with the same shape as `combineReducers` keys.
 *
 * @param {Function} enhancer The store enhancer. You may optionally specify it
 * to enhance the store with third-party capabilities such as middleware,
 * time travel, persistence, etc. The only store enhancer that ships with Redux
 * is `applyMiddleware()`.
 *
 * @returns {Store} A Redux store that lets you read the state, dispatch actions
 * and subscribe to changes.
 */
function createStore(reducer, initialState, enhancer) {
  if (typeof initialState === 'function' && typeof enhancer === 'undefined') {
    enhancer = initialState;
    initialState = undefined;
  }

  if (typeof enhancer !== 'undefined') {
    if (typeof enhancer !== 'function') {
      throw new Error('Expected the enhancer to be a function.');
    }

    return enhancer(createStore)(reducer, initialState);
  }

  if (typeof reducer !== 'function') {
    throw new Error('Expected the reducer to be a function.');
  }

  var currentReducer = reducer;
  var currentState = initialState;
  var currentListeners = [];
  var nextListeners = currentListeners;
  var isDispatching = false;

  function ensureCanMutateNextListeners() {
    if (nextListeners === currentListeners) {
      nextListeners = currentListeners.slice();
    }
  }

  /**
   * Reads the state tree managed by the store.
   *
   * @returns {any} The current state tree of your application.
   */
  function getState() {
    return currentState;
  }

  /**
   * Adds a change listener. It will be called any time an action is dispatched,
   * and some part of the state tree may potentially have changed. You may then
   * call `getState()` to read the current state tree inside the callback.
   *
   * You may call `dispatch()` from a change listener, with the following
   * caveats:
   *
   * 1. The subscriptions are snapshotted just before every `dispatch()` call.
   * If you subscribe or unsubscribe while the listeners are being invoked, this
   * will not have any effect on the `dispatch()` that is currently in progress.
   * However, the next `dispatch()` call, whether nested or not, will use a more
   * recent snapshot of the subscription list.
   *
   * 2. The listener should not expect to see all states changes, as the state
   * might have been updated multiple times during a nested `dispatch()` before
   * the listener is called. It is, however, guaranteed that all subscribers
   * registered before the `dispatch()` started will be called with the latest
   * state by the time it exits.
   *
   * @param {Function} listener A callback to be invoked on every dispatch.
   * @returns {Function} A function to remove this change listener.
   */
  function subscribe(listener) {
    if (typeof listener !== 'function') {
      throw new Error('Expected listener to be a function.');
    }

    var isSubscribed = true;

    ensureCanMutateNextListeners();
    nextListeners.push(listener);

    return function unsubscribe() {
      if (!isSubscribed) {
        return;
      }

      isSubscribed = false;

      ensureCanMutateNextListeners();
      var index = nextListeners.indexOf(listener);
      nextListeners.splice(index, 1);
    };
  }

  /**
   * Dispatches an action. It is the only way to trigger a state change.
   *
   * The `reducer` function, used to create the store, will be called with the
   * current state tree and the given `action`. Its return value will
   * be considered the **next** state of the tree, and the change listeners
   * will be notified.
   *
   * The base implementation only supports plain object actions. If you want to
   * dispatch a Promise, an Observable, a thunk, or something else, you need to
   * wrap your store creating function into the corresponding middleware. For
   * example, see the documentation for the `redux-thunk` package. Even the
   * middleware will eventually dispatch plain object actions using this method.
   *
   * @param {Object} action A plain object representing “what changed”. It is
   * a good idea to keep actions serializable so you can record and replay user
   * sessions, or use the time travelling `redux-devtools`. An action must have
   * a `type` property which may not be `undefined`. It is a good idea to use
   * string constants for action types.
   *
   * @returns {Object} For convenience, the same action object you dispatched.
   *
   * Note that, if you use a custom middleware, it may wrap `dispatch()` to
   * return something else (for example, a Promise you can await).
   */
  function dispatch(action) {
    if (!(0, _isPlainObject2["default"])(action)) {
      throw new Error('Actions must be plain objects. ' + 'Use custom middleware for async actions.');
    }

    if (typeof action.type === 'undefined') {
      throw new Error('Actions may not have an undefined "type" property. ' + 'Have you misspelled a constant?');
    }

    if (isDispatching) {
      throw new Error('Reducers may not dispatch actions.');
    }

    try {
      isDispatching = true;
      currentState = currentReducer(currentState, action);
    } finally {
      isDispatching = false;
    }

    var listeners = currentListeners = nextListeners;
    for (var i = 0; i < listeners.length; i++) {
      listeners[i]();
    }

    return action;
  }

  /**
   * Replaces the reducer currently used by the store to calculate the state.
   *
   * You might need this if your app implements code splitting and you want to
   * load some of the reducers dynamically. You might also need this if you
   * implement a hot reloading mechanism for Redux.
   *
   * @param {Function} nextReducer The reducer for the store to use instead.
   * @returns {void}
   */
  function replaceReducer(nextReducer) {
    if (typeof nextReducer !== 'function') {
      throw new Error('Expected the nextReducer to be a function.');
    }

    currentReducer = nextReducer;
    dispatch({ type: ActionTypes.INIT });
  }

  // When a store is created, an "INIT" action is dispatched so that every
  // reducer returns their initial state. This effectively populates
  // the initial state tree.
  dispatch({ type: ActionTypes.INIT });

  return {
    dispatch: dispatch,
    subscribe: subscribe,
    getState: getState,
    replaceReducer: replaceReducer
  };
}
},{"lodash/isPlainObject":"node_modules/socrates/node_modules/redux/node_modules/lodash/isPlainObject.js"}],"node_modules/socrates/node_modules/@f/handle-actions/lib/index.js":[function(require,module,exports){
/**
 * Modules
 */

var composeReducers = require('@f/compose-reducers')
var isUndefined = require('@f/is-undefined')

/**
 * Expose handleActions
 */

module.exports = handleActions['default'] = handleActions

/**
 * handleActions
 */

function handleActions (map, defaultState) {
  return composeReducers.apply(null, Object
    .keys(map)
    .map(function (type) {
      return scopeReducer(type, map[type], defaultState)
    }))
}

function scopeReducer (type, reducer, defaultState) {
  return function (state, action) {
    return action.type === type
      ? reducer(state, action.payload)
      : (isUndefined(state) ? defaultState : state)
  }
}

},{"@f/compose-reducers":"node_modules/socrates/node_modules/@f/compose-reducers/lib/index.js","@f/is-undefined":"node_modules/socrates/node_modules/@f/handle-actions/node_modules/@f/is-undefined/lib/index.js"}],"node_modules/socrates/node_modules/@f/combine-reducers/node_modules/@f/clone-shallow/node_modules/@f/clone-obj/node_modules/@f/foreach/lib/index.js":[function(require,module,exports){
/**
 * Modules
 */

var isObject = require('@f/is-object')
var isArray = require('@f/is-array')
var forEachObj = require('@f/foreach-obj')
var forEachArr = require('@f/foreach-array')

/**
 * Expose foreach
 */

module.exports = forEach['default'] = forEach

/**
 * For each
 * @param  {Function} fn  iterator
 * @param  {Object}   obj object to iterate over
 */

function forEach (fn, a) {
  if (isArray(a)) return forEachArr.call(this, fn, a)
  if (isObject(a)) return forEachObj.call(this, fn, a)
}

},{"@f/foreach-array":"node_modules/socrates/node_modules/@f/combine-reducers/node_modules/@f/clone-shallow/node_modules/@f/clone-obj/node_modules/@f/foreach/node_modules/@f/foreach-array/lib/index.js","@f/foreach-obj":"node_modules/socrates/node_modules/@f/combine-reducers/node_modules/@f/clone-shallow/node_modules/@f/clone-obj/node_modules/@f/foreach/node_modules/@f/foreach-obj/lib/index.js","@f/is-array":"node_modules/socrates/node_modules/@f/combine-reducers/node_modules/@f/clone-shallow/node_modules/@f/is-array/lib/index.js","@f/is-object":"node_modules/socrates/node_modules/@f/combine-reducers/node_modules/@f/clone-shallow/node_modules/@f/clone-obj/node_modules/@f/foreach/node_modules/@f/is-object/lib/index.js"}],"lib/history/index.js":[function(require,module,exports){
'use strict';

/**
 * Tiny history middleware
 *
 * - https://github.com/callum/redux-routing/blob/master/src/History.js
 *
 * TODO: separate module, once I'm sure it's solid
 */

var querystring = require('querystring');
var parse = require('url').parse;

/**
 * Export `middleware`
 */

module.exports = middleware['default'] = middleware;

/**
 * middleware middleware
 *
 * @param {Object} options
 * @return {Function}
 */

function middleware(options) {
  return function (store) {
    var history = History(store).listen();

    return function (next) {
      return function (action) {
        if (action.type !== 'navigate') return next(action);
        var url = parse(action.payload.url);

        var location = {
          hash: url.hash || undefined,
          pathname: url.pathname,
          search: url.search || undefined
        };

        var query = url.query ? qs.parse(url.query) : null;

        action.payload.url = url.format(location);
        var result = next(action);
        history.update(result);

        return result;
      };
    };
  };
}

/**
 * History class
 */

function History(store) {
  if (!(this instanceof History)) return new History(store);
  this.store = store;
}

/**
 * listen
 */

History.prototype.listen = function (action) {
  var self = this;
  window.addEventListener('popstate', function (event) {
    self.onpop(event.state);
  }, false);

  return this;
};

/**
 * update
 */

History.prototype.update = function (action) {
  var url = window.history.state;

  if (action.type === 'navigate') {
    url && action.payload.url === url ? this.replace(action.payload.url) : this.push(action.payload.url);
  }

  return this;
};

/**
 * push
 */

History.prototype.push = function (url) {
  window.history.pushState(url, null, url);
};

/**
 * Replace
 */

History.prototype.replace = function (url) {
  window.history.replaceState(url, null, url);
};

/**
 * onpop
 */

History.prototype.onpop = function (url) {
  this.store.dispatch({ type: 'navigate', payload: { url: url } });
};
},{"querystring":"node_modules/mako-js/node_modules/querystring-es3/index.js","url":"node_modules/mako-js/node_modules/url/url.js"}],"node_modules/socrates/node_modules/vo/lib/compile.js":[function(require,module,exports){
/**
 * Module Dependencies
 */

var compact = require('lodash.compact')
var error = require('err-candy')
var wrapped = require('wrapped')
var type = require('./type')
var keys = Object.keys

/**
 * Export `compile`
 */

module.exports = compile

/**
 * Compile
 */

function compile (mixed) {
  switch (type(mixed)) {
    case 'function': return Func(mixed)
    case 'object': return object(mixed)
    case 'catch': return Catcher(mixed)
    case 'array': return array(mixed)
    case 'vo': return Vo(mixed)
    default: return Identity(mixed)
  }
}

/**
 * Wrap functions
 *
 * @param {Function} fn
 * @return {Function}
 */

function Func (fn) {
  return function func (args, done) {
    wrapped(fn).apply(this, args.concat(next))

    function next(err) {
      if (err) return done(error(err))
      return done.apply(null, arguments)
    }
  }
}

/**
 * Wrap Objects
 *
 * @param {Object|Array} iterable
 * @return {Function}
 */

function object (o) {
  // compile the object
  o = keys(o).reduce(function (o, k) {
    o[k] = compile(o[k])
    return o
  }, o)

  return function obj (args, done) {
    var pending = keys(o).length
    var context = this
    var errors = []
    var out = {}

    // if we don't have any pending
    // values, return immediately
    if (!pending) return done(null, out)

    keys(o).map(function(k, i) {
      o[k].call(context, args, function(err, args) {
        if (err) {
          errors[i] = err
          out[k] = err
        } else {
          out[k] = args
        }

        if (!--pending) {
          errors = compact(errors)
          return errors.length
            ? done(error(errors), out)
            : done(null, out)
        }
      })
    })
  }
}

/**
 * Wrap Arrays
 */

function array (a) {
  a = a.map(compile)

  return function arr (args, done) {
    var pending = a.length
    var context = this
    var errors = []
    var out = []

    // if we don't have any pending
    // values, return immediately
    if (!pending) return done(null, out)

    // run in parallel
    a.map(function (fn, i) {
      fn.call(context, args, function(err, args) {
        if (err) {
          errors[i] = err
          out[i] = err
        } else {
          out[i] = args
        }

        if (!--pending) {
          errors = compact(errors)
          return errors.length
            ? done(error(errors), out)
            : done(null, out)
        }
      })
    })
  }
}

/**
 * Wrap vo
 *
 * @param {Vo} vo
 * @return {Function}
 */

function Vo (v) {
  return function vo (args, done) {
    return v.apply(this, args.concat(function(err, v) {
      if (err) return done(error(err))
      return done.apply(null, arguments)
    }))
  }
}

/**
 * Catcher
 *
 * @param {Function} fn
 * @return {Function}
 */

function Catcher(fn) {
  return function catcher (err, args, done) {
    return wrapped(fn()).apply(this, [err].concat(args).concat(done))
  }
}

/**
 * Identity
 *
 * @param {Array} args
 * @param {Function} done
 */

function Identity (value) {
  return function identity (args, done) {
    return done(null, value)
  }
}

},{"./type":"node_modules/socrates/node_modules/vo/lib/type.js","err-candy":"node_modules/socrates/node_modules/vo/node_modules/err-candy/index.js","lodash.compact":"node_modules/socrates/node_modules/vo/node_modules/lodash.compact/index.js","wrapped":"node_modules/socrates/node_modules/vo/node_modules/wrapped/index.js"}],"node_modules/socrates/node_modules/redux/lib/combineReducers.js":[function(require,module,exports){
(function (process){
'use strict';

exports.__esModule = true;
exports["default"] = combineReducers;

var _createStore = require('./createStore');

var _isPlainObject = require('lodash/isPlainObject');

var _isPlainObject2 = _interopRequireDefault(_isPlainObject);

var _warning = require('./utils/warning');

var _warning2 = _interopRequireDefault(_warning);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function getUndefinedStateErrorMessage(key, action) {
  var actionType = action && action.type;
  var actionName = actionType && '"' + actionType.toString() + '"' || 'an action';

  return 'Reducer "' + key + '" returned undefined handling ' + actionName + '. ' + 'To ignore an action, you must explicitly return the previous state.';
}

function getUnexpectedStateShapeWarningMessage(inputState, reducers, action) {
  var reducerKeys = Object.keys(reducers);
  var argumentName = action && action.type === _createStore.ActionTypes.INIT ? 'initialState argument passed to createStore' : 'previous state received by the reducer';

  if (reducerKeys.length === 0) {
    return 'Store does not have a valid reducer. Make sure the argument passed ' + 'to combineReducers is an object whose values are reducers.';
  }

  if (!(0, _isPlainObject2["default"])(inputState)) {
    return 'The ' + argumentName + ' has unexpected type of "' + {}.toString.call(inputState).match(/\s([a-z|A-Z]+)/)[1] + '". Expected argument to be an object with the following ' + ('keys: "' + reducerKeys.join('", "') + '"');
  }

  var unexpectedKeys = Object.keys(inputState).filter(function (key) {
    return !reducers.hasOwnProperty(key);
  });

  if (unexpectedKeys.length > 0) {
    return 'Unexpected ' + (unexpectedKeys.length > 1 ? 'keys' : 'key') + ' ' + ('"' + unexpectedKeys.join('", "') + '" found in ' + argumentName + '. ') + 'Expected to find one of the known reducer keys instead: ' + ('"' + reducerKeys.join('", "') + '". Unexpected keys will be ignored.');
  }
}

function assertReducerSanity(reducers) {
  Object.keys(reducers).forEach(function (key) {
    var reducer = reducers[key];
    var initialState = reducer(undefined, { type: _createStore.ActionTypes.INIT });

    if (typeof initialState === 'undefined') {
      throw new Error('Reducer "' + key + '" returned undefined during initialization. ' + 'If the state passed to the reducer is undefined, you must ' + 'explicitly return the initial state. The initial state may ' + 'not be undefined.');
    }

    var type = '@@redux/PROBE_UNKNOWN_ACTION_' + Math.random().toString(36).substring(7).split('').join('.');
    if (typeof reducer(undefined, { type: type }) === 'undefined') {
      throw new Error('Reducer "' + key + '" returned undefined when probed with a random type. ' + ('Don\'t try to handle ' + _createStore.ActionTypes.INIT + ' or other actions in "redux/*" ') + 'namespace. They are considered private. Instead, you must return the ' + 'current state for any unknown actions, unless it is undefined, ' + 'in which case you must return the initial state, regardless of the ' + 'action type. The initial state may not be undefined.');
    }
  });
}

/**
 * Turns an object whose values are different reducer functions, into a single
 * reducer function. It will call every child reducer, and gather their results
 * into a single state object, whose keys correspond to the keys of the passed
 * reducer functions.
 *
 * @param {Object} reducers An object whose values correspond to different
 * reducer functions that need to be combined into one. One handy way to obtain
 * it is to use ES6 `import * as reducers` syntax. The reducers may never return
 * undefined for any action. Instead, they should return their initial state
 * if the state passed to them was undefined, and the current state for any
 * unrecognized action.
 *
 * @returns {Function} A reducer function that invokes every reducer inside the
 * passed object, and builds a state object with the same shape.
 */
function combineReducers(reducers) {
  var reducerKeys = Object.keys(reducers);
  var finalReducers = {};
  for (var i = 0; i < reducerKeys.length; i++) {
    var key = reducerKeys[i];
    if (typeof reducers[key] === 'function') {
      finalReducers[key] = reducers[key];
    }
  }
  var finalReducerKeys = Object.keys(finalReducers);

  var sanityError;
  try {
    assertReducerSanity(finalReducers);
  } catch (e) {
    sanityError = e;
  }

  return function combination() {
    var state = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
    var action = arguments[1];

    if (sanityError) {
      throw sanityError;
    }

    if (process.env.NODE_ENV !== 'production') {
      var warningMessage = getUnexpectedStateShapeWarningMessage(state, finalReducers, action);
      if (warningMessage) {
        (0, _warning2["default"])(warningMessage);
      }
    }

    var hasChanged = false;
    var nextState = {};
    for (var i = 0; i < finalReducerKeys.length; i++) {
      var key = finalReducerKeys[i];
      var reducer = finalReducers[key];
      var previousStateForKey = state[key];
      var nextStateForKey = reducer(previousStateForKey, action);
      if (typeof nextStateForKey === 'undefined') {
        var errorMessage = getUndefinedStateErrorMessage(key, action);
        throw new Error(errorMessage);
      }
      nextState[key] = nextStateForKey;
      hasChanged = hasChanged || nextStateForKey !== previousStateForKey;
    }
    return hasChanged ? nextState : state;
  };
}
}).call(this,require("../../../../mako-js/node_modules/process/browser.js"))
},{"../../../../mako-js/node_modules/process/browser.js":"node_modules/mako-js/node_modules/process/browser.js","./createStore":"node_modules/socrates/node_modules/redux/lib/createStore.js","./utils/warning":"node_modules/socrates/node_modules/redux/lib/utils/warning.js","lodash/isPlainObject":"node_modules/socrates/node_modules/redux/node_modules/lodash/isPlainObject.js"}],"node_modules/socrates/node_modules/@f/combine-reducers/node_modules/@f/clone-shallow/node_modules/@f/clone-obj/lib/index.js":[function(require,module,exports){
/**
 * Modules
 */

var forEach = require('@f/foreach')

/**
 * Expose cloneObj
 */

module.exports = cloneObj['default'] = cloneObj

/**
 * Clone an object.
 * @param  {Object} obj Object to Clone
 * @return {Object}
 */

function cloneObj (obj) {
  var newObj = {}

  forEach(function (val, key) {
    newObj[key] = val
  }, obj)

  return newObj
}

},{"@f/foreach":"node_modules/socrates/node_modules/@f/combine-reducers/node_modules/@f/clone-shallow/node_modules/@f/clone-obj/node_modules/@f/foreach/lib/index.js"}],"node_modules/socrates/node_modules/vo/lib/pipeline.js":[function(require,module,exports){
/**
 * Module Dependencies
 */

var compile = require('./compile')
var sliced = require('sliced')

/**
 * Export `Pipeline`
 */

module.exports = Pipeline

/**
 * Initialize `Pipeline`
 *
 * @param {Array} series array of functions
 * @param {Array} args
 * @param {Function} done
 */

function Pipeline (pipeline, context, args, done) {
  pipeline = pipeline.map(compile)

  // run in series
  function next (err) {
    if (err) return error(err, sliced(arguments, 1))
    var fn = pipeline.shift()
    while (fn && fn.length !== 2) fn = pipeline.shift()
    if (!fn) return done.call(context, null, sliced(arguments, 1))
    fn.call(context, sliced(arguments, 1), next)
  }

  // error handling
  function error (err, args) {
    var fn = pipeline.shift()
    while (fn && fn.length !== 3) fn = pipeline.shift()
    if (fn) return fn.call(context, err, args, next)
    else return done.call(context, err)
  }

  // kick us off
  next.apply(null, [null].concat(args))
}

},{"./compile":"node_modules/socrates/node_modules/vo/lib/compile.js","sliced":"node_modules/socrates/node_modules/sliced/index.js"}],"node_modules/socrates/node_modules/vo/lib/stack.js":[function(require,module,exports){
/**
 * Module Dependencies
 */

var compile = require('./compile')

/**
 * Export `Stack`
 */

module.exports = Stack

/**
 * Initialize `Stack`
 *
 * @param {Array} series array of functions
 * @param {Array} args
 * @param {Function} done
 */

function Stack (stack, context, args, done) {
  stack = stack.map(compile)

  // run in stack
  function next (err) {
    if (err) return error(err)
    var fn = stack.shift()
    while (fn && fn.length !== 2) fn = stack.shift()
    if (!fn) return done.call(context, null, args)
    fn.call(context, args, next)
  }

  // error handling
  function error (err) {
    var fn = stack.shift()
    while (fn && fn.length !== 3) fn = stack.shift()
    if (fn) return fn.call(context, err, args, next)
    else return done.call(context, err)
  }

  // kick us off
  next()
}

},{"./compile":"node_modules/socrates/node_modules/vo/lib/compile.js"}],"node_modules/socrates/node_modules/redux/lib/index.js":[function(require,module,exports){
(function (process){
'use strict';

exports.__esModule = true;
exports.compose = exports.applyMiddleware = exports.bindActionCreators = exports.combineReducers = exports.createStore = undefined;

var _createStore = require('./createStore');

var _createStore2 = _interopRequireDefault(_createStore);

var _combineReducers = require('./combineReducers');

var _combineReducers2 = _interopRequireDefault(_combineReducers);

var _bindActionCreators = require('./bindActionCreators');

var _bindActionCreators2 = _interopRequireDefault(_bindActionCreators);

var _applyMiddleware = require('./applyMiddleware');

var _applyMiddleware2 = _interopRequireDefault(_applyMiddleware);

var _compose = require('./compose');

var _compose2 = _interopRequireDefault(_compose);

var _warning = require('./utils/warning');

var _warning2 = _interopRequireDefault(_warning);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

/*
* This is a dummy function to check if the function name has been altered by minification.
* If the function has been minified and NODE_ENV !== 'production', warn the user.
*/
function isCrushed() {}

if (process.env.NODE_ENV !== 'production' && typeof isCrushed.name === 'string' && isCrushed.name !== 'isCrushed') {
  (0, _warning2["default"])('You are currently using minified code outside of NODE_ENV === \'production\'. ' + 'This means that you are running a slower development build of Redux. ' + 'You can use loose-envify (https://github.com/zertosh/loose-envify) for browserify ' + 'or DefinePlugin for webpack (http://stackoverflow.com/questions/30030031) ' + 'to ensure you have the correct code for your production build.');
}

exports.createStore = _createStore2["default"];
exports.combineReducers = _combineReducers2["default"];
exports.bindActionCreators = _bindActionCreators2["default"];
exports.applyMiddleware = _applyMiddleware2["default"];
exports.compose = _compose2["default"];
}).call(this,require("../../../../mako-js/node_modules/process/browser.js"))
},{"../../../../mako-js/node_modules/process/browser.js":"node_modules/mako-js/node_modules/process/browser.js","./applyMiddleware":"node_modules/socrates/node_modules/redux/lib/applyMiddleware.js","./bindActionCreators":"node_modules/socrates/node_modules/redux/lib/bindActionCreators.js","./combineReducers":"node_modules/socrates/node_modules/redux/lib/combineReducers.js","./compose":"node_modules/socrates/node_modules/redux/lib/compose.js","./createStore":"node_modules/socrates/node_modules/redux/lib/createStore.js","./utils/warning":"node_modules/socrates/node_modules/redux/lib/utils/warning.js"}],"node_modules/socrates/node_modules/@f/combine-reducers/node_modules/@f/clone-shallow/lib/index.js":[function(require,module,exports){
/**
 * Modules
 */

var cloneObj = require('@f/clone-obj')
var cloneArray = require('@f/slice')
var isArray = require('@f/is-array')

/**
 * Expose cloneShallow
 */

module.exports = cloneShallow

/**
 * Clone object or array shallow
 * @param  {Object|Array} a object to copy
 * @return {Object|Array}
 */

function cloneShallow (a) {
  return isArray()
    ? cloneArray(a)
    : cloneObj(a)
}

},{"@f/clone-obj":"node_modules/socrates/node_modules/@f/combine-reducers/node_modules/@f/clone-shallow/node_modules/@f/clone-obj/lib/index.js","@f/is-array":"node_modules/socrates/node_modules/@f/combine-reducers/node_modules/@f/clone-shallow/node_modules/@f/is-array/lib/index.js","@f/slice":"node_modules/socrates/node_modules/@f/combine-reducers/node_modules/@f/clone-shallow/node_modules/@f/slice/lib/index.js"}],"node_modules/socrates/node_modules/vo/index.js":[function(require,module,exports){
(function (global){
'use strict'

/**
 * Module Dependencies
 */

var Promise = global.Promise || require('es6-promise').Promise
var Pipeline = require('./lib/pipeline')
var Stack = require('./lib/stack')
var sliced = require('sliced')
var isArray = Array.isArray
var noop = function () {}
var keys = Object.keys

/**
 * Module Exports
 */

module.exports = Vo

/**
 * Initialize a `Vo` instance
 *
 * @param {Array|Object|Function, ...}
 * @return {Function}
 */

function Vo() {
  var pipeline = isArray(this) ? sliced(this) : sliced(arguments)

  // run vo
  return run(function (context, args, done) {
    Pipeline(pipeline, context, args, function(err, args) {
      if (err) return done.call(context, err)
      return done.apply(context, [null].concat(args))
    })
  })
}

/**
 * Pipeline the functions
 *
 * @param {Mixed}
 * @return {Function}
 */

Vo.stack = function stack () {
  var stack = isArray(this) ? sliced(this) : sliced(arguments)

  // run the stack
  return run(function (context, args, done) {
    Stack(stack, context, args, function(err, v) {
      if (err) return done(err)
      return done.apply(this, [null].concat(v))
    })
  })
}

/**
 * Simple wrapper that will allow us
 * to switch between fixed arguments
 * and transform pipelines
 *
 * @param {Function} fn
 * @return {Function}
 */

function run (fn) {
  function vo () {
    var args = sliced(arguments)
    var last = args[args.length - 1]
    var context = this

    if (typeof last === 'function') {
      var done = args.pop()
      fn(context, args, done)
    } else {
      // return a promise
      return new Promise(function (success, failure) {
        fn(context, args, function(err, ret) {
          if (arguments.length > 2) ret = sliced(arguments, 1)
          return err ? failure(err) : success(ret)
        })
      })
    }
  }

  // with "vo instanceof Vo"
  vo.vo = true

  return vo
}

/**
 * Catch errors
 *
 * @param {Function} fn
 * @return {Function}
 */

Vo.catch = function (fn) {
  // simple wrapper to avoid attaching to the passed-in function
  function catcher () { return fn }
  catcher.catch = true
  return catcher
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./lib/pipeline":"node_modules/socrates/node_modules/vo/lib/pipeline.js","./lib/stack":"node_modules/socrates/node_modules/vo/lib/stack.js","es6-promise":"node_modules/socrates/node_modules/vo/node_modules/es6-promise/dist/es6-promise.js","sliced":"node_modules/socrates/node_modules/sliced/index.js"}],"node_modules/socrates/node_modules/@f/combine-reducers/lib/index.js":[function(require,module,exports){
/**
 * Modules
 */

var clone = require('@f/clone-shallow')
var composeReducers = require('@f/compose-reducers')

/**
 * Expose combineReducers
 */

module.exports = combineReducers['default'] = combineReducers

/**
 * combineReducers
 */

function combineReducers (reducers, defaultState) {
  defaultState = defaultState || {}

  return composeReducers.apply(null, Object
    .keys(reducers)
    .map(function (key) {
      return scopeReducer(reducers[key], key, defaultState)
    }))
}

function scopeReducer (reducer, prop, defaultState) {
  return function (state, action) {
    if (state === undefined) state = defaultState

    var childState = reducer(state[prop], action)

    if (childState !== state[prop]) {
      state = clone(state)
      state[prop] = childState
    }

    return state
  }
}

},{"@f/clone-shallow":"node_modules/socrates/node_modules/@f/combine-reducers/node_modules/@f/clone-shallow/lib/index.js","@f/compose-reducers":"node_modules/socrates/node_modules/@f/compose-reducers/lib/index.js"}],"node_modules/socrates/lib/resolve.js":[function(require,module,exports){
'use strict'

/**
 * Module Dependencies
 */

var is_fsa = require('./is-fsa')
var freeze = require('./freeze')
var sliced = require('sliced')
var redux = require('redux')
var isArray = Array.isArray
var vo = require('vo')

/**
 * Export `middleware`
 */

module.exports = resolve

/**
 * Resolve promises, arrays, objects, etc.
 */

function resolve (store) {
  return function (next) {
    return function (action) {
      var actions = sliced(arguments).map(function(action) {
        return isArray(action)
          ? action.map(function (a) { return vo(a, next) })
          : vo(action, fsa_check, next)
      })

      return vo.stack.apply(actions)(freeze(store.getState()))
        .then(function() {
          return store.getState()
        })
    }
  }
}

/**
 * Ensure that what's returned
 * is a flux standard action
 *
 * @param {Mixed} mixed
 * @return {Object}
 */

function fsa_check (mixed) {
  if (is_fsa(mixed)) return mixed
  throw new Error('resolved action (' + stringify(mixed) + ') is not the correct format. Please refer to the spec: https://github.com/acdlite/flux-standard-action#actions')
}

/**
 * Serialize our value
 *
 * @param {Mixed} mixed
 * @return {String}
 */

function stringify (mixed) {
  try {
    return JSON.stringify(mixed)
  } catch (e) {
    return mixed
  }
}

},{"./freeze":"node_modules/socrates/lib/freeze.js","./is-fsa":"node_modules/socrates/lib/is-fsa.js","redux":"node_modules/socrates/node_modules/redux/lib/index.js","sliced":"node_modules/socrates/node_modules/sliced/index.js","vo":"node_modules/socrates/node_modules/vo/index.js"}],"node_modules/socrates/lib/tree.js":[function(require,module,exports){
/**
 * Module dependencies
 */

var combine_reducer = require('@f/combine-reducers')
var compose_reducer = require('@f/compose-reducers')
var handle_action = require('@f/handle-actions')
var xor = require('component-xor')
var keys = Object.keys

/**
 * Export `Tree`
 */

module.exports = Tree

/**
 * Initialize `Tree`
 *
 * @param {Object} map
 * @param {Function}
 */

function Tree (tree) {
  return walk(tree)
}

/**
 * Walk the object tree
 *
 * @param {Object} tree
 * @param {Array} trail
 * @return {Function}
 */

function walk (tree, trail) {
  trail = trail || []

  var funcs = {}
  var map = {}
  var path

  // segment
  for (var k in tree) {
    if (typeof tree[k] === 'function') {
      path = trail.length ? k + ' ' + trail.join('.') : k
      funcs[path] = tree[k]
    } else {
      map[k] = walk(tree[k], trail.concat(k))
    }
  }

  var fl = keys(funcs).length
  var ml = keys(map).length

  // if we have only of one type
  // or another, return reducers
  if (xor(fl, ml)) {
    return fl
      ? handle_action(funcs)
      : combine_reducer(map)
  }

  // otherwise compose the two
  // different segments into a
  // single reducer
  return compose_reducer(
    handle_action(funcs),
    combine_reducer(map)
  )
}

// var state = {
//   user: {
//     name: 'matt',
//     age: 26
//   },
//   book: {
//     name: 'alchemist',
//     pages: [
//       {
//         number: 1,
//         text: 'this is a good story'
//       },
//       {
//         number: 2,
//         text: 'about a boy'
//       }
//     ]
//   }
// }

// var tree = Tree({
//   user: {
//     update: function (state, action) {
//       console.log('update', state, action)
//     }
//   },
//   book: {
//     rename: function (state, action) {
//       console.log('rename', state, action)
//     },
//     pages: {
//       add: function (state, action) {
//         console.log('add', state, action)
//       },
//       edit: function (state, action) {
//         console.log('edit', state, action)
//       }
//     }
//   }
// })

// tree(state, {
//   type: 'rename book',
//   payload: {
//     name: 'new name'
//   }
// })

// tree(state, {
//   type: 'add book.pages',
//   payload: [
//     {
//       number: '3',
//       text: 'another great page'
//     }
//   ]
// })

// var s = tree(state, {
//   type: 'edit book.pages',
//   payload: {
//     number: 5,
//     text: 'another great page'
//   }
// })

},{"@f/combine-reducers":"node_modules/socrates/node_modules/@f/combine-reducers/lib/index.js","@f/compose-reducers":"node_modules/socrates/node_modules/@f/compose-reducers/lib/index.js","@f/handle-actions":"node_modules/socrates/node_modules/@f/handle-actions/lib/index.js","component-xor":"node_modules/socrates/node_modules/component-xor/index.js"}],"node_modules/socrates/lib/reducer.js":[function(require,module,exports){
/**
 * Module dependencies
 */

var update = require('./update')
var tree = require('./tree')
var isobj = require('isobj')

/**
 * Export `reducer`
 */

module.exports = reducer;

/**
 * Initialize `reducer`
 *
 * @param {Function|Object} fn
 * @return {Function}
 */

function reducer (fn) {
  fn = isobj(fn) ? tree(fn) : fn
  return function reduce (state, action) {
    var updates = fn(state, action)
    return update(state, updates)
  }
}

},{"./tree":"node_modules/socrates/lib/tree.js","./update":"node_modules/socrates/lib/update.js","isobj":"node_modules/socrates/node_modules/isobj/index.js"}],"node_modules/socrates/lib/index.js":[function(require,module,exports){
'use strict'

/**
 * Module Dependencies
 */

var assign = require('object-assign')
var reducer = require('./reducer')
var resolve = require('./resolve')
var freeze = require('./freeze')
var sliced = require('sliced')
var redux = require('redux')
var isArray = Array.isArray

/**
 * Redux methods
 */

var Middleware = redux.applyMiddleware
var Store = redux.createStore

/**
 * Export `Socrates`
 */

module.exports = Socrates

/**
 * Initialize `Socrates`
 *
 * @param {Array} middlewares
 * @param {Function} root reducer
 * @return {Function} socrates
 */

function Socrates (middlewares, reduce) {
  if (!isArray(middlewares)) reduce = middlewares, middlewares = []
  middlewares = [resolve].concat(middlewares)
  reduce = reduce || identity

  // create our redux client
  var redux = Store(reducer(reduce), {}, Middleware.apply(null, middlewares))

  // initialize a store
  function store (action) {
    var array_context = isArray(this)
    if (!arguments.length && !array_context) return freeze(redux.getState())
    var actions = array_context ? sliced(this) : sliced(arguments)
    actions = wrap_emitter_style(actions)
    return redux.dispatch.apply(redux, actions)
  }

  // subscribe to changes
  store.subscribe = function subscribe (fn) {
    return redux.subscribe(function listener () {
      return fn(freeze(redux.getState()))
    })
  }

  return store
}

/**
 * Maybe wrap the emitter style
 * into a flux standard action
 *
 * @param {Array} actions
 * @return {Array}
 */

function wrap_emitter_style (actions) {
  if (actions.length < 2) return actions
  if (typeof actions[0] !== 'string') return actions
  return [{
    type: actions[0],
    payload: assign.apply(null, actions.slice(1))
  }]
}

/**
 * Identity function that
 * just builds on an action's payload
 */

function identity (state, action) {
  return action.payload
}

},{"./freeze":"node_modules/socrates/lib/freeze.js","./reducer":"node_modules/socrates/lib/reducer.js","./resolve":"node_modules/socrates/lib/resolve.js","object-assign":"node_modules/socrates/node_modules/object-assign/index.js","redux":"node_modules/socrates/node_modules/redux/lib/index.js","sliced":"node_modules/socrates/node_modules/sliced/index.js"}],"index.js":[function(require,module,exports){
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; /**
                                                                                                                                                                                                                                                                   * Module Dependencies
                                                                                                                                                                                                                                                                   */

var _preactSocrates = require('preact-socrates');

var _reduxLogger = require('redux-logger');

var _reduxLogger2 = _interopRequireDefault(_reduxLogger);

var _socrates = require('socrates');

var _socrates2 = _interopRequireDefault(_socrates);

var _history = require('history');

var _history2 = _interopRequireDefault(_history);

var _enroute = require('enroute');

var _enroute2 = _interopRequireDefault(_enroute);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Initialize Socrates
 *
 * By default, it will just store what you pass in,
 * which is fine for this demo, but you'll probably
 * want to use your own reducer if you're actually
 * building an app
 */

var store = (0, _socrates2.default)([(0, _reduxLogger2.default)(), (0, _history2.default)()]);

/**
 * App
 */

var App = function App(props) {
  return (0, _enroute2.default)({
    '/blog': function blog(params) {
      return (0, _preactSocrates.h)(Blog, _extends({}, params, props));
    },
    '*': function _(params) {
      return (0, _preactSocrates.h)(Home, _extends({}, params, props));
    }
  })(props.url);
};

/**
 * Home
 */

var Home = function Home(_ref) {
  var dispatch = _ref.dispatch;
  var greeting = _ref.greeting;
  return (0, _preactSocrates.h)(
    'div',
    { 'class': 'home' },
    (0, _preactSocrates.h)(
      'h2',
      null,
      greeting
    ),
    (0, _preactSocrates.h)(
      'button',
      { onClick: function onClick(e) {
          return dispatch('navigate', { url: '/blog' });
        } },
      'Go to the blog'
    )
  );
};

/**
 * Blog
 */

var Blog = function Blog(_ref2) {
  var dispatch = _ref2.dispatch;
  return (0, _preactSocrates.h)(
    'div',
    { 'class': 'blog' },
    (0, _preactSocrates.h)(
      'h2',
      null,
      'Welcome to the Blog!'
    ),
    (0, _preactSocrates.h)(
      'button',
      { onClick: function onClick(e) {
          return dispatch('navigate', { url: '/' });
        } },
      'Go back to Home'
    )
  );
};

/**
 * Initialize the store
 */

store('boot', {
  url: document.location.pathname,
  greeting: 'Welcome to the website, friend!'
});

/**
 * Render
 */

(0, _preactSocrates.render)(App, store, document.body);
},{"enroute":"node_modules/enroute/index.js","history":"lib/history/index.js","preact-socrates":"node_modules/preact-socrates/lib/index.js","redux-logger":"node_modules/redux-logger/lib/index.js","socrates":"node_modules/socrates/lib/index.js"}]},{},["index.js"])


//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9tYWtvLWpzL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvcmVkdXgtbG9nZ2VyL2xpYi9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9tYWtvLWpzL25vZGVfbW9kdWxlcy9wdW55Y29kZS9wdW55Y29kZS5qcyIsIm5vZGVfbW9kdWxlcy9lbnJvdXRlL25vZGVfbW9kdWxlcy9vYmplY3QtYXNzaWduL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL21ha28tanMvbm9kZV9tb2R1bGVzL3F1ZXJ5c3RyaW5nLWVzMy9kZWNvZGUuanMiLCJub2RlX21vZHVsZXMvbWFrby1qcy9ub2RlX21vZHVsZXMvcXVlcnlzdHJpbmctZXMzL2VuY29kZS5qcyIsIm5vZGVfbW9kdWxlcy9tYWtvLWpzL25vZGVfbW9kdWxlcy91cmwvdXRpbC5qcyIsIm5vZGVfbW9kdWxlcy9wcmVhY3Qtc29jcmF0ZXMvbm9kZV9tb2R1bGVzL3ByZWFjdC9kaXN0L3ByZWFjdC5qcyIsIm5vZGVfbW9kdWxlcy9zb2NyYXRlcy9ub2RlX21vZHVsZXMvc2xpY2VkL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3NvY3JhdGVzL25vZGVfbW9kdWxlcy9vYmplY3QtYXNzaWduL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2Vucm91dGUvbm9kZV9tb2R1bGVzL3BhdGgtdG8tcmVnZXhwL25vZGVfbW9kdWxlcy9pc2FycmF5L2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL21ha28tanMvbm9kZV9tb2R1bGVzL3Byb2Nlc3MvYnJvd3Nlci5qcyIsIm5vZGVfbW9kdWxlcy9zb2NyYXRlcy9ub2RlX21vZHVsZXMvcmVkdXgvbGliL2JpbmRBY3Rpb25DcmVhdG9ycy5qcyIsIm5vZGVfbW9kdWxlcy9zb2NyYXRlcy9ub2RlX21vZHVsZXMvcmVkdXgvbGliL2NvbXBvc2UuanMiLCJub2RlX21vZHVsZXMvc29jcmF0ZXMvbm9kZV9tb2R1bGVzL3JlZHV4L2xpYi91dGlscy93YXJuaW5nLmpzIiwibm9kZV9tb2R1bGVzL3ByZWFjdC1zb2NyYXRlcy9ub2RlX21vZHVsZXMvY29tcG9uZW50LXJhZi9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9wcmVhY3Qtc29jcmF0ZXMvbm9kZV9tb2R1bGVzL29iamVjdC1hc3NpZ24vaW5kZXguanMiLCJub2RlX21vZHVsZXMvc29jcmF0ZXMvbm9kZV9tb2R1bGVzL2lzb2JqL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3NvY3JhdGVzL25vZGVfbW9kdWxlcy9jb21wb25lbnQteG9yL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3NvY3JhdGVzL25vZGVfbW9kdWxlcy9yZWR1eC9ub2RlX21vZHVsZXMvbG9kYXNoL19pc0hvc3RPYmplY3QuanMiLCJub2RlX21vZHVsZXMvc29jcmF0ZXMvbm9kZV9tb2R1bGVzL3JlZHV4L25vZGVfbW9kdWxlcy9sb2Rhc2gvaXNPYmplY3RMaWtlLmpzIiwibm9kZV9tb2R1bGVzL3NvY3JhdGVzL25vZGVfbW9kdWxlcy9sb2Rhc2guaXNlcnJvci9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9zb2NyYXRlcy9ub2RlX21vZHVsZXMvdm8vbGliL3R5cGUuanMiLCJub2RlX21vZHVsZXMvc29jcmF0ZXMvbm9kZV9tb2R1bGVzL3ZvL25vZGVfbW9kdWxlcy9sb2Rhc2guY29tcGFjdC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9zb2NyYXRlcy9ub2RlX21vZHVsZXMvQGYvY29tcG9zZS1yZWR1Y2Vycy9ub2RlX21vZHVsZXMvQGYvdG8tYXJyYXkvbGliL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3NvY3JhdGVzL25vZGVfbW9kdWxlcy9AZi9oYW5kbGUtYWN0aW9ucy9ub2RlX21vZHVsZXMvQGYvaXMtdW5kZWZpbmVkL2xpYi9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9zb2NyYXRlcy9ub2RlX21vZHVsZXMvdm8vbm9kZV9tb2R1bGVzL3dyYXBwZWQvbm9kZV9tb2R1bGVzL2NvL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3NvY3JhdGVzL25vZGVfbW9kdWxlcy9AZi9jb21iaW5lLXJlZHVjZXJzL25vZGVfbW9kdWxlcy9AZi9jbG9uZS1zaGFsbG93L25vZGVfbW9kdWxlcy9AZi9zbGljZS9saWIvaW5kZXguanMiLCJub2RlX21vZHVsZXMvc29jcmF0ZXMvbm9kZV9tb2R1bGVzL0BmL2NvbWJpbmUtcmVkdWNlcnMvbm9kZV9tb2R1bGVzL0BmL2Nsb25lLXNoYWxsb3cvbm9kZV9tb2R1bGVzL0BmL2lzLWFycmF5L2xpYi9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9zb2NyYXRlcy9ub2RlX21vZHVsZXMvQGYvY29tYmluZS1yZWR1Y2Vycy9ub2RlX21vZHVsZXMvQGYvY2xvbmUtc2hhbGxvdy9ub2RlX21vZHVsZXMvQGYvY2xvbmUtb2JqL25vZGVfbW9kdWxlcy9AZi9mb3JlYWNoL25vZGVfbW9kdWxlcy9AZi9mb3JlYWNoLW9iai9saWIvaW5kZXguanMiLCJub2RlX21vZHVsZXMvc29jcmF0ZXMvbm9kZV9tb2R1bGVzL0BmL2NvbWJpbmUtcmVkdWNlcnMvbm9kZV9tb2R1bGVzL0BmL2Nsb25lLXNoYWxsb3cvbm9kZV9tb2R1bGVzL0BmL2Nsb25lLW9iai9ub2RlX21vZHVsZXMvQGYvZm9yZWFjaC9ub2RlX21vZHVsZXMvQGYvZm9yZWFjaC1hcnJheS9saWIvaW5kZXguanMiLCJub2RlX21vZHVsZXMvc29jcmF0ZXMvbm9kZV9tb2R1bGVzL0BmL2NvbWJpbmUtcmVkdWNlcnMvbm9kZV9tb2R1bGVzL0BmL2Nsb25lLXNoYWxsb3cvbm9kZV9tb2R1bGVzL0BmL2Nsb25lLW9iai9ub2RlX21vZHVsZXMvQGYvZm9yZWFjaC9ub2RlX21vZHVsZXMvQGYvaXMtb2JqZWN0L25vZGVfbW9kdWxlcy9AZi9pcy1mdW5jdGlvbi9saWIvaW5kZXguanMiLCJub2RlX21vZHVsZXMvbWFrby1qcy9ub2RlX21vZHVsZXMvcXVlcnlzdHJpbmctZXMzL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2Vucm91dGUvbm9kZV9tb2R1bGVzL3BhdGgtdG8tcmVnZXhwL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3NvY3JhdGVzL2xpYi9mcmVlemUuanMiLCJub2RlX21vZHVsZXMvc29jcmF0ZXMvbm9kZV9tb2R1bGVzL3ZvL25vZGVfbW9kdWxlcy9lczYtcHJvbWlzZS9kaXN0L2VzNi1wcm9taXNlLmpzIiwibm9kZV9tb2R1bGVzL3NvY3JhdGVzL25vZGVfbW9kdWxlcy92by9ub2RlX21vZHVsZXMvZXJyLWNhbmR5L25vZGVfbW9kdWxlcy9zdGFjay11dGlscy9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9zb2NyYXRlcy9ub2RlX21vZHVsZXMvcmVkdXgvbGliL2FwcGx5TWlkZGxld2FyZS5qcyIsIm5vZGVfbW9kdWxlcy9wcmVhY3Qtc29jcmF0ZXMvbGliL2N5Y2xlLmpzIiwibm9kZV9tb2R1bGVzL3NvY3JhdGVzL25vZGVfbW9kdWxlcy9yZWR1eC9ub2RlX21vZHVsZXMvbG9kYXNoL2lzUGxhaW5PYmplY3QuanMiLCJub2RlX21vZHVsZXMvc29jcmF0ZXMvbGliL2lzLWZzYS5qcyIsIm5vZGVfbW9kdWxlcy9zb2NyYXRlcy9ub2RlX21vZHVsZXMvQGYvY29tcG9zZS1yZWR1Y2Vycy9saWIvaW5kZXguanMiLCJub2RlX21vZHVsZXMvc29jcmF0ZXMvbm9kZV9tb2R1bGVzL3ZvL25vZGVfbW9kdWxlcy93cmFwcGVkL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3NvY3JhdGVzL25vZGVfbW9kdWxlcy9AZi9jb21iaW5lLXJlZHVjZXJzL25vZGVfbW9kdWxlcy9AZi9jbG9uZS1zaGFsbG93L25vZGVfbW9kdWxlcy9AZi9jbG9uZS1vYmovbm9kZV9tb2R1bGVzL0BmL2ZvcmVhY2gvbm9kZV9tb2R1bGVzL0BmL2lzLW9iamVjdC9saWIvaW5kZXguanMiLCJub2RlX21vZHVsZXMvbWFrby1qcy9ub2RlX21vZHVsZXMvdXJsL3VybC5qcyIsIm5vZGVfbW9kdWxlcy9lbnJvdXRlL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3NvY3JhdGVzL2xpYi91cGRhdGUuanMiLCJub2RlX21vZHVsZXMvc29jcmF0ZXMvbm9kZV9tb2R1bGVzL3ZvL25vZGVfbW9kdWxlcy9lcnItY2FuZHkvaW5kZXguanMiLCJub2RlX21vZHVsZXMvcHJlYWN0LXNvY3JhdGVzL2xpYi9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9zb2NyYXRlcy9ub2RlX21vZHVsZXMvcmVkdXgvbGliL2NyZWF0ZVN0b3JlLmpzIiwibm9kZV9tb2R1bGVzL3NvY3JhdGVzL25vZGVfbW9kdWxlcy9AZi9oYW5kbGUtYWN0aW9ucy9saWIvaW5kZXguanMiLCJub2RlX21vZHVsZXMvc29jcmF0ZXMvbm9kZV9tb2R1bGVzL0BmL2NvbWJpbmUtcmVkdWNlcnMvbm9kZV9tb2R1bGVzL0BmL2Nsb25lLXNoYWxsb3cvbm9kZV9tb2R1bGVzL0BmL2Nsb25lLW9iai9ub2RlX21vZHVsZXMvQGYvZm9yZWFjaC9saWIvaW5kZXguanMiLCJsaWIvaGlzdG9yeS9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9zb2NyYXRlcy9ub2RlX21vZHVsZXMvdm8vbGliL2NvbXBpbGUuanMiLCJub2RlX21vZHVsZXMvc29jcmF0ZXMvbm9kZV9tb2R1bGVzL3JlZHV4L2xpYi9jb21iaW5lUmVkdWNlcnMuanMiLCJub2RlX21vZHVsZXMvc29jcmF0ZXMvbm9kZV9tb2R1bGVzL0BmL2NvbWJpbmUtcmVkdWNlcnMvbm9kZV9tb2R1bGVzL0BmL2Nsb25lLXNoYWxsb3cvbm9kZV9tb2R1bGVzL0BmL2Nsb25lLW9iai9saWIvaW5kZXguanMiLCJub2RlX21vZHVsZXMvc29jcmF0ZXMvbm9kZV9tb2R1bGVzL3ZvL2xpYi9waXBlbGluZS5qcyIsIm5vZGVfbW9kdWxlcy9zb2NyYXRlcy9ub2RlX21vZHVsZXMvdm8vbGliL3N0YWNrLmpzIiwibm9kZV9tb2R1bGVzL3NvY3JhdGVzL25vZGVfbW9kdWxlcy9yZWR1eC9saWIvaW5kZXguanMiLCJub2RlX21vZHVsZXMvc29jcmF0ZXMvbm9kZV9tb2R1bGVzL0BmL2NvbWJpbmUtcmVkdWNlcnMvbm9kZV9tb2R1bGVzL0BmL2Nsb25lLXNoYWxsb3cvbGliL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3NvY3JhdGVzL25vZGVfbW9kdWxlcy92by9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9zb2NyYXRlcy9ub2RlX21vZHVsZXMvQGYvY29tYmluZS1yZWR1Y2Vycy9saWIvaW5kZXguanMiLCJub2RlX21vZHVsZXMvc29jcmF0ZXMvbGliL3Jlc29sdmUuanMiLCJub2RlX21vZHVsZXMvc29jcmF0ZXMvbGliL3RyZWUuanMiLCJub2RlX21vZHVsZXMvc29jcmF0ZXMvbGliL3JlZHVjZXIuanMiLCJub2RlX21vZHVsZXMvc29jcmF0ZXMvbGliL2luZGV4LmpzIiwiaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbk9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdmhCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMXJDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkNBO0FBQ0E7QUFDQTtBQUNBOztBQ0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RTQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0WUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzU3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5UkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3REQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1dEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9JQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9HQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly9tYWtvIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJcInVzZSBzdHJpY3RcIjtcblxuZnVuY3Rpb24gX3RvQ29uc3VtYWJsZUFycmF5KGFycikgeyBpZiAoQXJyYXkuaXNBcnJheShhcnIpKSB7IGZvciAodmFyIGkgPSAwLCBhcnIyID0gQXJyYXkoYXJyLmxlbmd0aCk7IGkgPCBhcnIubGVuZ3RoOyBpKyspIHsgYXJyMltpXSA9IGFycltpXTsgfSByZXR1cm4gYXJyMjsgfSBlbHNlIHsgcmV0dXJuIEFycmF5LmZyb20oYXJyKTsgfSB9XG5cbmZ1bmN0aW9uIF90eXBlb2Yob2JqKSB7IHJldHVybiBvYmogJiYgdHlwZW9mIFN5bWJvbCAhPT0gXCJ1bmRlZmluZWRcIiAmJiBvYmouY29uc3RydWN0b3IgPT09IFN5bWJvbCA/IFwic3ltYm9sXCIgOiB0eXBlb2Ygb2JqOyB9XG5cbnZhciByZXBlYXQgPSBmdW5jdGlvbiByZXBlYXQoc3RyLCB0aW1lcykge1xuICByZXR1cm4gbmV3IEFycmF5KHRpbWVzICsgMSkuam9pbihzdHIpO1xufTtcbnZhciBwYWQgPSBmdW5jdGlvbiBwYWQobnVtLCBtYXhMZW5ndGgpIHtcbiAgcmV0dXJuIHJlcGVhdChcIjBcIiwgbWF4TGVuZ3RoIC0gbnVtLnRvU3RyaW5nKCkubGVuZ3RoKSArIG51bTtcbn07XG52YXIgZm9ybWF0VGltZSA9IGZ1bmN0aW9uIGZvcm1hdFRpbWUodGltZSkge1xuICByZXR1cm4gXCJAIFwiICsgcGFkKHRpbWUuZ2V0SG91cnMoKSwgMikgKyBcIjpcIiArIHBhZCh0aW1lLmdldE1pbnV0ZXMoKSwgMikgKyBcIjpcIiArIHBhZCh0aW1lLmdldFNlY29uZHMoKSwgMikgKyBcIi5cIiArIHBhZCh0aW1lLmdldE1pbGxpc2Vjb25kcygpLCAzKTtcbn07XG5cbi8vIFVzZSB0aGUgbmV3IHBlcmZvcm1hbmNlIGFwaSB0byBnZXQgYmV0dGVyIHByZWNpc2lvbiBpZiBhdmFpbGFibGVcbnZhciB0aW1lciA9IHR5cGVvZiBwZXJmb3JtYW5jZSAhPT0gXCJ1bmRlZmluZWRcIiAmJiB0eXBlb2YgcGVyZm9ybWFuY2Uubm93ID09PSBcImZ1bmN0aW9uXCIgPyBwZXJmb3JtYW5jZSA6IERhdGU7XG5cbi8qKlxuICogcGFyc2UgdGhlIGxldmVsIG9wdGlvbiBvZiBjcmVhdGVMb2dnZXJcbiAqXG4gKiBAcHJvcGVydHkge3N0cmluZyB8IGZ1bmN0aW9uIHwgb2JqZWN0fSBsZXZlbCAtIGNvbnNvbGVbbGV2ZWxdXG4gKiBAcHJvcGVydHkge29iamVjdH0gYWN0aW9uXG4gKiBAcHJvcGVydHkge2FycmF5fSBwYXlsb2FkXG4gKiBAcHJvcGVydHkge3N0cmluZ30gdHlwZVxuICovXG5cbmZ1bmN0aW9uIGdldExvZ0xldmVsKGxldmVsLCBhY3Rpb24sIHBheWxvYWQsIHR5cGUpIHtcbiAgc3dpdGNoICh0eXBlb2YgbGV2ZWwgPT09IFwidW5kZWZpbmVkXCIgPyBcInVuZGVmaW5lZFwiIDogX3R5cGVvZihsZXZlbCkpIHtcbiAgICBjYXNlIFwib2JqZWN0XCI6XG4gICAgICByZXR1cm4gdHlwZW9mIGxldmVsW3R5cGVdID09PSBcImZ1bmN0aW9uXCIgPyBsZXZlbFt0eXBlXS5hcHBseShsZXZlbCwgX3RvQ29uc3VtYWJsZUFycmF5KHBheWxvYWQpKSA6IGxldmVsW3R5cGVdO1xuICAgIGNhc2UgXCJmdW5jdGlvblwiOlxuICAgICAgcmV0dXJuIGxldmVsKGFjdGlvbik7XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBsZXZlbDtcbiAgfVxufVxuXG4vKipcbiAqIENyZWF0ZXMgbG9nZ2VyIHdpdGggZm9sbG93ZWQgb3B0aW9uc1xuICpcbiAqIEBuYW1lc3BhY2VcbiAqIEBwcm9wZXJ0eSB7b2JqZWN0fSBvcHRpb25zIC0gb3B0aW9ucyBmb3IgbG9nZ2VyXG4gKiBAcHJvcGVydHkge3N0cmluZyB8IGZ1bmN0aW9uIHwgb2JqZWN0fSBvcHRpb25zLmxldmVsIC0gY29uc29sZVtsZXZlbF1cbiAqIEBwcm9wZXJ0eSB7Ym9vbGVhbn0gb3B0aW9ucy5kdXJhdGlvbiAtIHByaW50IGR1cmF0aW9uIG9mIGVhY2ggYWN0aW9uP1xuICogQHByb3BlcnR5IHtib29sZWFufSBvcHRpb25zLnRpbWVzdGFtcCAtIHByaW50IHRpbWVzdGFtcCB3aXRoIGVhY2ggYWN0aW9uP1xuICogQHByb3BlcnR5IHtvYmplY3R9IG9wdGlvbnMuY29sb3JzIC0gY3VzdG9tIGNvbG9yc1xuICogQHByb3BlcnR5IHtvYmplY3R9IG9wdGlvbnMubG9nZ2VyIC0gaW1wbGVtZW50YXRpb24gb2YgdGhlIGBjb25zb2xlYCBBUElcbiAqIEBwcm9wZXJ0eSB7Ym9vbGVhbn0gb3B0aW9ucy5sb2dFcnJvcnMgLSBzaG91bGQgZXJyb3JzIGluIGFjdGlvbiBleGVjdXRpb24gYmUgY2F1Z2h0LCBsb2dnZWQsIGFuZCByZS10aHJvd24/XG4gKiBAcHJvcGVydHkge2Jvb2xlYW59IG9wdGlvbnMuY29sbGFwc2VkIC0gaXMgZ3JvdXAgY29sbGFwc2VkP1xuICogQHByb3BlcnR5IHtib29sZWFufSBvcHRpb25zLnByZWRpY2F0ZSAtIGNvbmRpdGlvbiB3aGljaCByZXNvbHZlcyBsb2dnZXIgYmVoYXZpb3JcbiAqIEBwcm9wZXJ0eSB7ZnVuY3Rpb259IG9wdGlvbnMuc3RhdGVUcmFuc2Zvcm1lciAtIHRyYW5zZm9ybSBzdGF0ZSBiZWZvcmUgcHJpbnRcbiAqIEBwcm9wZXJ0eSB7ZnVuY3Rpb259IG9wdGlvbnMuYWN0aW9uVHJhbnNmb3JtZXIgLSB0cmFuc2Zvcm0gYWN0aW9uIGJlZm9yZSBwcmludFxuICogQHByb3BlcnR5IHtmdW5jdGlvbn0gb3B0aW9ucy5lcnJvclRyYW5zZm9ybWVyIC0gdHJhbnNmb3JtIGVycm9yIGJlZm9yZSBwcmludFxuICovXG5cbmZ1bmN0aW9uIGNyZWF0ZUxvZ2dlcigpIHtcbiAgdmFyIG9wdGlvbnMgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDAgfHwgYXJndW1lbnRzWzBdID09PSB1bmRlZmluZWQgPyB7fSA6IGFyZ3VtZW50c1swXTtcbiAgdmFyIF9vcHRpb25zJGxldmVsID0gb3B0aW9ucy5sZXZlbDtcbiAgdmFyIGxldmVsID0gX29wdGlvbnMkbGV2ZWwgPT09IHVuZGVmaW5lZCA/IFwibG9nXCIgOiBfb3B0aW9ucyRsZXZlbDtcbiAgdmFyIF9vcHRpb25zJGxvZ2dlciA9IG9wdGlvbnMubG9nZ2VyO1xuICB2YXIgbG9nZ2VyID0gX29wdGlvbnMkbG9nZ2VyID09PSB1bmRlZmluZWQgPyBjb25zb2xlIDogX29wdGlvbnMkbG9nZ2VyO1xuICB2YXIgX29wdGlvbnMkbG9nRXJyb3JzID0gb3B0aW9ucy5sb2dFcnJvcnM7XG4gIHZhciBsb2dFcnJvcnMgPSBfb3B0aW9ucyRsb2dFcnJvcnMgPT09IHVuZGVmaW5lZCA/IHRydWUgOiBfb3B0aW9ucyRsb2dFcnJvcnM7XG4gIHZhciBjb2xsYXBzZWQgPSBvcHRpb25zLmNvbGxhcHNlZDtcbiAgdmFyIHByZWRpY2F0ZSA9IG9wdGlvbnMucHJlZGljYXRlO1xuICB2YXIgX29wdGlvbnMkZHVyYXRpb24gPSBvcHRpb25zLmR1cmF0aW9uO1xuICB2YXIgZHVyYXRpb24gPSBfb3B0aW9ucyRkdXJhdGlvbiA9PT0gdW5kZWZpbmVkID8gZmFsc2UgOiBfb3B0aW9ucyRkdXJhdGlvbjtcbiAgdmFyIF9vcHRpb25zJHRpbWVzdGFtcCA9IG9wdGlvbnMudGltZXN0YW1wO1xuICB2YXIgdGltZXN0YW1wID0gX29wdGlvbnMkdGltZXN0YW1wID09PSB1bmRlZmluZWQgPyB0cnVlIDogX29wdGlvbnMkdGltZXN0YW1wO1xuICB2YXIgdHJhbnNmb3JtZXIgPSBvcHRpb25zLnRyYW5zZm9ybWVyO1xuICB2YXIgX29wdGlvbnMkc3RhdGVUcmFuc2ZvID0gb3B0aW9ucy5zdGF0ZVRyYW5zZm9ybWVyO1xuICB2YXIgLy8gZGVwcmVjYXRlZFxuICBzdGF0ZVRyYW5zZm9ybWVyID0gX29wdGlvbnMkc3RhdGVUcmFuc2ZvID09PSB1bmRlZmluZWQgPyBmdW5jdGlvbiAoc3RhdGUpIHtcbiAgICByZXR1cm4gc3RhdGU7XG4gIH0gOiBfb3B0aW9ucyRzdGF0ZVRyYW5zZm87XG4gIHZhciBfb3B0aW9ucyRhY3Rpb25UcmFuc2YgPSBvcHRpb25zLmFjdGlvblRyYW5zZm9ybWVyO1xuICB2YXIgYWN0aW9uVHJhbnNmb3JtZXIgPSBfb3B0aW9ucyRhY3Rpb25UcmFuc2YgPT09IHVuZGVmaW5lZCA/IGZ1bmN0aW9uIChhY3RuKSB7XG4gICAgcmV0dXJuIGFjdG47XG4gIH0gOiBfb3B0aW9ucyRhY3Rpb25UcmFuc2Y7XG4gIHZhciBfb3B0aW9ucyRlcnJvclRyYW5zZm8gPSBvcHRpb25zLmVycm9yVHJhbnNmb3JtZXI7XG4gIHZhciBlcnJvclRyYW5zZm9ybWVyID0gX29wdGlvbnMkZXJyb3JUcmFuc2ZvID09PSB1bmRlZmluZWQgPyBmdW5jdGlvbiAoZXJyb3IpIHtcbiAgICByZXR1cm4gZXJyb3I7XG4gIH0gOiBfb3B0aW9ucyRlcnJvclRyYW5zZm87XG4gIHZhciBfb3B0aW9ucyRjb2xvcnMgPSBvcHRpb25zLmNvbG9ycztcbiAgdmFyIGNvbG9ycyA9IF9vcHRpb25zJGNvbG9ycyA9PT0gdW5kZWZpbmVkID8ge1xuICAgIHRpdGxlOiBmdW5jdGlvbiB0aXRsZSgpIHtcbiAgICAgIHJldHVybiBcIiMwMDAwMDBcIjtcbiAgICB9LFxuICAgIHByZXZTdGF0ZTogZnVuY3Rpb24gcHJldlN0YXRlKCkge1xuICAgICAgcmV0dXJuIFwiIzlFOUU5RVwiO1xuICAgIH0sXG4gICAgYWN0aW9uOiBmdW5jdGlvbiBhY3Rpb24oKSB7XG4gICAgICByZXR1cm4gXCIjMDNBOUY0XCI7XG4gICAgfSxcbiAgICBuZXh0U3RhdGU6IGZ1bmN0aW9uIG5leHRTdGF0ZSgpIHtcbiAgICAgIHJldHVybiBcIiM0Q0FGNTBcIjtcbiAgICB9LFxuICAgIGVycm9yOiBmdW5jdGlvbiBlcnJvcigpIHtcbiAgICAgIHJldHVybiBcIiNGMjA0MDRcIjtcbiAgICB9XG4gIH0gOiBfb3B0aW9ucyRjb2xvcnM7XG5cbiAgLy8gZXhpdCBpZiBjb25zb2xlIHVuZGVmaW5lZFxuXG4gIGlmICh0eXBlb2YgbG9nZ2VyID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbiAobmV4dCkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKGFjdGlvbikge1xuICAgICAgICAgIHJldHVybiBuZXh0KGFjdGlvbik7XG4gICAgICAgIH07XG4gICAgICB9O1xuICAgIH07XG4gIH1cblxuICBpZiAodHJhbnNmb3JtZXIpIHtcbiAgICBjb25zb2xlLmVycm9yKFwiT3B0aW9uICd0cmFuc2Zvcm1lcicgaXMgZGVwcmVjYXRlZCwgdXNlIHN0YXRlVHJhbnNmb3JtZXIgaW5zdGVhZFwiKTtcbiAgfVxuXG4gIHZhciBsb2dCdWZmZXIgPSBbXTtcbiAgZnVuY3Rpb24gcHJpbnRCdWZmZXIoKSB7XG4gICAgbG9nQnVmZmVyLmZvckVhY2goZnVuY3Rpb24gKGxvZ0VudHJ5LCBrZXkpIHtcbiAgICAgIHZhciBzdGFydGVkID0gbG9nRW50cnkuc3RhcnRlZDtcbiAgICAgIHZhciBzdGFydGVkVGltZSA9IGxvZ0VudHJ5LnN0YXJ0ZWRUaW1lO1xuICAgICAgdmFyIGFjdGlvbiA9IGxvZ0VudHJ5LmFjdGlvbjtcbiAgICAgIHZhciBwcmV2U3RhdGUgPSBsb2dFbnRyeS5wcmV2U3RhdGU7XG4gICAgICB2YXIgZXJyb3IgPSBsb2dFbnRyeS5lcnJvcjtcbiAgICAgIHZhciB0b29rID0gbG9nRW50cnkudG9vaztcbiAgICAgIHZhciBuZXh0U3RhdGUgPSBsb2dFbnRyeS5uZXh0U3RhdGU7XG5cbiAgICAgIHZhciBuZXh0RW50cnkgPSBsb2dCdWZmZXJba2V5ICsgMV07XG4gICAgICBpZiAobmV4dEVudHJ5KSB7XG4gICAgICAgIG5leHRTdGF0ZSA9IG5leHRFbnRyeS5wcmV2U3RhdGU7XG4gICAgICAgIHRvb2sgPSBuZXh0RW50cnkuc3RhcnRlZCAtIHN0YXJ0ZWQ7XG4gICAgICB9XG4gICAgICAvLyBtZXNzYWdlXG4gICAgICB2YXIgZm9ybWF0dGVkQWN0aW9uID0gYWN0aW9uVHJhbnNmb3JtZXIoYWN0aW9uKTtcbiAgICAgIHZhciBpc0NvbGxhcHNlZCA9IHR5cGVvZiBjb2xsYXBzZWQgPT09IFwiZnVuY3Rpb25cIiA/IGNvbGxhcHNlZChmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBuZXh0U3RhdGU7XG4gICAgICB9LCBhY3Rpb24pIDogY29sbGFwc2VkO1xuXG4gICAgICB2YXIgZm9ybWF0dGVkVGltZSA9IGZvcm1hdFRpbWUoc3RhcnRlZFRpbWUpO1xuICAgICAgdmFyIHRpdGxlQ1NTID0gY29sb3JzLnRpdGxlID8gXCJjb2xvcjogXCIgKyBjb2xvcnMudGl0bGUoZm9ybWF0dGVkQWN0aW9uKSArIFwiO1wiIDogbnVsbDtcbiAgICAgIHZhciB0aXRsZSA9IFwiYWN0aW9uIFwiICsgKHRpbWVzdGFtcCA/IGZvcm1hdHRlZFRpbWUgOiBcIlwiKSArIFwiIFwiICsgZm9ybWF0dGVkQWN0aW9uLnR5cGUgKyBcIiBcIiArIChkdXJhdGlvbiA/IFwiKGluIFwiICsgdG9vay50b0ZpeGVkKDIpICsgXCIgbXMpXCIgOiBcIlwiKTtcblxuICAgICAgLy8gcmVuZGVyXG4gICAgICB0cnkge1xuICAgICAgICBpZiAoaXNDb2xsYXBzZWQpIHtcbiAgICAgICAgICBpZiAoY29sb3JzLnRpdGxlKSBsb2dnZXIuZ3JvdXBDb2xsYXBzZWQoXCIlYyBcIiArIHRpdGxlLCB0aXRsZUNTUyk7ZWxzZSBsb2dnZXIuZ3JvdXBDb2xsYXBzZWQodGl0bGUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmIChjb2xvcnMudGl0bGUpIGxvZ2dlci5ncm91cChcIiVjIFwiICsgdGl0bGUsIHRpdGxlQ1NTKTtlbHNlIGxvZ2dlci5ncm91cCh0aXRsZSk7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgbG9nZ2VyLmxvZyh0aXRsZSk7XG4gICAgICB9XG5cbiAgICAgIHZhciBwcmV2U3RhdGVMZXZlbCA9IGdldExvZ0xldmVsKGxldmVsLCBmb3JtYXR0ZWRBY3Rpb24sIFtwcmV2U3RhdGVdLCBcInByZXZTdGF0ZVwiKTtcbiAgICAgIHZhciBhY3Rpb25MZXZlbCA9IGdldExvZ0xldmVsKGxldmVsLCBmb3JtYXR0ZWRBY3Rpb24sIFtmb3JtYXR0ZWRBY3Rpb25dLCBcImFjdGlvblwiKTtcbiAgICAgIHZhciBlcnJvckxldmVsID0gZ2V0TG9nTGV2ZWwobGV2ZWwsIGZvcm1hdHRlZEFjdGlvbiwgW2Vycm9yLCBwcmV2U3RhdGVdLCBcImVycm9yXCIpO1xuICAgICAgdmFyIG5leHRTdGF0ZUxldmVsID0gZ2V0TG9nTGV2ZWwobGV2ZWwsIGZvcm1hdHRlZEFjdGlvbiwgW25leHRTdGF0ZV0sIFwibmV4dFN0YXRlXCIpO1xuXG4gICAgICBpZiAocHJldlN0YXRlTGV2ZWwpIHtcbiAgICAgICAgaWYgKGNvbG9ycy5wcmV2U3RhdGUpIGxvZ2dlcltwcmV2U3RhdGVMZXZlbF0oXCIlYyBwcmV2IHN0YXRlXCIsIFwiY29sb3I6IFwiICsgY29sb3JzLnByZXZTdGF0ZShwcmV2U3RhdGUpICsgXCI7IGZvbnQtd2VpZ2h0OiBib2xkXCIsIHByZXZTdGF0ZSk7ZWxzZSBsb2dnZXJbcHJldlN0YXRlTGV2ZWxdKFwicHJldiBzdGF0ZVwiLCBwcmV2U3RhdGUpO1xuICAgICAgfVxuXG4gICAgICBpZiAoYWN0aW9uTGV2ZWwpIHtcbiAgICAgICAgaWYgKGNvbG9ycy5hY3Rpb24pIGxvZ2dlclthY3Rpb25MZXZlbF0oXCIlYyBhY3Rpb25cIiwgXCJjb2xvcjogXCIgKyBjb2xvcnMuYWN0aW9uKGZvcm1hdHRlZEFjdGlvbikgKyBcIjsgZm9udC13ZWlnaHQ6IGJvbGRcIiwgZm9ybWF0dGVkQWN0aW9uKTtlbHNlIGxvZ2dlclthY3Rpb25MZXZlbF0oXCJhY3Rpb25cIiwgZm9ybWF0dGVkQWN0aW9uKTtcbiAgICAgIH1cblxuICAgICAgaWYgKGVycm9yICYmIGVycm9yTGV2ZWwpIHtcbiAgICAgICAgaWYgKGNvbG9ycy5lcnJvcikgbG9nZ2VyW2Vycm9yTGV2ZWxdKFwiJWMgZXJyb3JcIiwgXCJjb2xvcjogXCIgKyBjb2xvcnMuZXJyb3IoZXJyb3IsIHByZXZTdGF0ZSkgKyBcIjsgZm9udC13ZWlnaHQ6IGJvbGRcIiwgZXJyb3IpO2Vsc2UgbG9nZ2VyW2Vycm9yTGV2ZWxdKFwiZXJyb3JcIiwgZXJyb3IpO1xuICAgICAgfVxuXG4gICAgICBpZiAobmV4dFN0YXRlTGV2ZWwpIHtcbiAgICAgICAgaWYgKGNvbG9ycy5uZXh0U3RhdGUpIGxvZ2dlcltuZXh0U3RhdGVMZXZlbF0oXCIlYyBuZXh0IHN0YXRlXCIsIFwiY29sb3I6IFwiICsgY29sb3JzLm5leHRTdGF0ZShuZXh0U3RhdGUpICsgXCI7IGZvbnQtd2VpZ2h0OiBib2xkXCIsIG5leHRTdGF0ZSk7ZWxzZSBsb2dnZXJbbmV4dFN0YXRlTGV2ZWxdKFwibmV4dCBzdGF0ZVwiLCBuZXh0U3RhdGUpO1xuICAgICAgfVxuXG4gICAgICB0cnkge1xuICAgICAgICBsb2dnZXIuZ3JvdXBFbmQoKTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgbG9nZ2VyLmxvZyhcIuKAlOKAlCBsb2cgZW5kIOKAlOKAlFwiKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBsb2dCdWZmZXIubGVuZ3RoID0gMDtcbiAgfVxuXG4gIHJldHVybiBmdW5jdGlvbiAoX3JlZikge1xuICAgIHZhciBnZXRTdGF0ZSA9IF9yZWYuZ2V0U3RhdGU7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChuZXh0KSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24gKGFjdGlvbikge1xuICAgICAgICAvLyBleGl0IGVhcmx5IGlmIHByZWRpY2F0ZSBmdW5jdGlvbiByZXR1cm5zIGZhbHNlXG4gICAgICAgIGlmICh0eXBlb2YgcHJlZGljYXRlID09PSBcImZ1bmN0aW9uXCIgJiYgIXByZWRpY2F0ZShnZXRTdGF0ZSwgYWN0aW9uKSkge1xuICAgICAgICAgIHJldHVybiBuZXh0KGFjdGlvbik7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgbG9nRW50cnkgPSB7fTtcbiAgICAgICAgbG9nQnVmZmVyLnB1c2gobG9nRW50cnkpO1xuXG4gICAgICAgIGxvZ0VudHJ5LnN0YXJ0ZWQgPSB0aW1lci5ub3coKTtcbiAgICAgICAgbG9nRW50cnkuc3RhcnRlZFRpbWUgPSBuZXcgRGF0ZSgpO1xuICAgICAgICBsb2dFbnRyeS5wcmV2U3RhdGUgPSBzdGF0ZVRyYW5zZm9ybWVyKGdldFN0YXRlKCkpO1xuICAgICAgICBsb2dFbnRyeS5hY3Rpb24gPSBhY3Rpb247XG5cbiAgICAgICAgdmFyIHJldHVybmVkVmFsdWUgPSB1bmRlZmluZWQ7XG4gICAgICAgIGlmIChsb2dFcnJvcnMpIHtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgcmV0dXJuZWRWYWx1ZSA9IG5leHQoYWN0aW9uKTtcbiAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBsb2dFbnRyeS5lcnJvciA9IGVycm9yVHJhbnNmb3JtZXIoZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybmVkVmFsdWUgPSBuZXh0KGFjdGlvbik7XG4gICAgICAgIH1cblxuICAgICAgICBsb2dFbnRyeS50b29rID0gdGltZXIubm93KCkgLSBsb2dFbnRyeS5zdGFydGVkO1xuICAgICAgICBsb2dFbnRyeS5uZXh0U3RhdGUgPSBzdGF0ZVRyYW5zZm9ybWVyKGdldFN0YXRlKCkpO1xuXG4gICAgICAgIHByaW50QnVmZmVyKCk7XG5cbiAgICAgICAgaWYgKGxvZ0VudHJ5LmVycm9yKSB0aHJvdyBsb2dFbnRyeS5lcnJvcjtcbiAgICAgICAgcmV0dXJuIHJldHVybmVkVmFsdWU7XG4gICAgICB9O1xuICAgIH07XG4gIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gY3JlYXRlTG9nZ2VyOyIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbi8qISBodHRwczovL210aHMuYmUvcHVueWNvZGUgdjEuNC4wIGJ5IEBtYXRoaWFzICovXG47KGZ1bmN0aW9uKHJvb3QpIHtcblxuXHQvKiogRGV0ZWN0IGZyZWUgdmFyaWFibGVzICovXG5cdHZhciBmcmVlRXhwb3J0cyA9IHR5cGVvZiBleHBvcnRzID09ICdvYmplY3QnICYmIGV4cG9ydHMgJiZcblx0XHQhZXhwb3J0cy5ub2RlVHlwZSAmJiBleHBvcnRzO1xuXHR2YXIgZnJlZU1vZHVsZSA9IHR5cGVvZiBtb2R1bGUgPT0gJ29iamVjdCcgJiYgbW9kdWxlICYmXG5cdFx0IW1vZHVsZS5ub2RlVHlwZSAmJiBtb2R1bGU7XG5cdHZhciBmcmVlR2xvYmFsID0gdHlwZW9mIGdsb2JhbCA9PSAnb2JqZWN0JyAmJiBnbG9iYWw7XG5cdGlmIChcblx0XHRmcmVlR2xvYmFsLmdsb2JhbCA9PT0gZnJlZUdsb2JhbCB8fFxuXHRcdGZyZWVHbG9iYWwud2luZG93ID09PSBmcmVlR2xvYmFsIHx8XG5cdFx0ZnJlZUdsb2JhbC5zZWxmID09PSBmcmVlR2xvYmFsXG5cdCkge1xuXHRcdHJvb3QgPSBmcmVlR2xvYmFsO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBgcHVueWNvZGVgIG9iamVjdC5cblx0ICogQG5hbWUgcHVueWNvZGVcblx0ICogQHR5cGUgT2JqZWN0XG5cdCAqL1xuXHR2YXIgcHVueWNvZGUsXG5cblx0LyoqIEhpZ2hlc3QgcG9zaXRpdmUgc2lnbmVkIDMyLWJpdCBmbG9hdCB2YWx1ZSAqL1xuXHRtYXhJbnQgPSAyMTQ3NDgzNjQ3LCAvLyBha2EuIDB4N0ZGRkZGRkYgb3IgMl4zMS0xXG5cblx0LyoqIEJvb3RzdHJpbmcgcGFyYW1ldGVycyAqL1xuXHRiYXNlID0gMzYsXG5cdHRNaW4gPSAxLFxuXHR0TWF4ID0gMjYsXG5cdHNrZXcgPSAzOCxcblx0ZGFtcCA9IDcwMCxcblx0aW5pdGlhbEJpYXMgPSA3Mixcblx0aW5pdGlhbE4gPSAxMjgsIC8vIDB4ODBcblx0ZGVsaW1pdGVyID0gJy0nLCAvLyAnXFx4MkQnXG5cblx0LyoqIFJlZ3VsYXIgZXhwcmVzc2lvbnMgKi9cblx0cmVnZXhQdW55Y29kZSA9IC9eeG4tLS8sXG5cdHJlZ2V4Tm9uQVNDSUkgPSAvW15cXHgyMC1cXHg3RV0vLCAvLyB1bnByaW50YWJsZSBBU0NJSSBjaGFycyArIG5vbi1BU0NJSSBjaGFyc1xuXHRyZWdleFNlcGFyYXRvcnMgPSAvW1xceDJFXFx1MzAwMlxcdUZGMEVcXHVGRjYxXS9nLCAvLyBSRkMgMzQ5MCBzZXBhcmF0b3JzXG5cblx0LyoqIEVycm9yIG1lc3NhZ2VzICovXG5cdGVycm9ycyA9IHtcblx0XHQnb3ZlcmZsb3cnOiAnT3ZlcmZsb3c6IGlucHV0IG5lZWRzIHdpZGVyIGludGVnZXJzIHRvIHByb2Nlc3MnLFxuXHRcdCdub3QtYmFzaWMnOiAnSWxsZWdhbCBpbnB1dCA+PSAweDgwIChub3QgYSBiYXNpYyBjb2RlIHBvaW50KScsXG5cdFx0J2ludmFsaWQtaW5wdXQnOiAnSW52YWxpZCBpbnB1dCdcblx0fSxcblxuXHQvKiogQ29udmVuaWVuY2Ugc2hvcnRjdXRzICovXG5cdGJhc2VNaW51c1RNaW4gPSBiYXNlIC0gdE1pbixcblx0Zmxvb3IgPSBNYXRoLmZsb29yLFxuXHRzdHJpbmdGcm9tQ2hhckNvZGUgPSBTdHJpbmcuZnJvbUNoYXJDb2RlLFxuXG5cdC8qKiBUZW1wb3JhcnkgdmFyaWFibGUgKi9cblx0a2V5O1xuXG5cdC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG5cdC8qKlxuXHQgKiBBIGdlbmVyaWMgZXJyb3IgdXRpbGl0eSBmdW5jdGlvbi5cblx0ICogQHByaXZhdGVcblx0ICogQHBhcmFtIHtTdHJpbmd9IHR5cGUgVGhlIGVycm9yIHR5cGUuXG5cdCAqIEByZXR1cm5zIHtFcnJvcn0gVGhyb3dzIGEgYFJhbmdlRXJyb3JgIHdpdGggdGhlIGFwcGxpY2FibGUgZXJyb3IgbWVzc2FnZS5cblx0ICovXG5cdGZ1bmN0aW9uIGVycm9yKHR5cGUpIHtcblx0XHR0aHJvdyBuZXcgUmFuZ2VFcnJvcihlcnJvcnNbdHlwZV0pO1xuXHR9XG5cblx0LyoqXG5cdCAqIEEgZ2VuZXJpYyBgQXJyYXkjbWFwYCB1dGlsaXR5IGZ1bmN0aW9uLlxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAcGFyYW0ge0FycmF5fSBhcnJheSBUaGUgYXJyYXkgdG8gaXRlcmF0ZSBvdmVyLlxuXHQgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayBUaGUgZnVuY3Rpb24gdGhhdCBnZXRzIGNhbGxlZCBmb3IgZXZlcnkgYXJyYXlcblx0ICogaXRlbS5cblx0ICogQHJldHVybnMge0FycmF5fSBBIG5ldyBhcnJheSBvZiB2YWx1ZXMgcmV0dXJuZWQgYnkgdGhlIGNhbGxiYWNrIGZ1bmN0aW9uLlxuXHQgKi9cblx0ZnVuY3Rpb24gbWFwKGFycmF5LCBmbikge1xuXHRcdHZhciBsZW5ndGggPSBhcnJheS5sZW5ndGg7XG5cdFx0dmFyIHJlc3VsdCA9IFtdO1xuXHRcdHdoaWxlIChsZW5ndGgtLSkge1xuXHRcdFx0cmVzdWx0W2xlbmd0aF0gPSBmbihhcnJheVtsZW5ndGhdKTtcblx0XHR9XG5cdFx0cmV0dXJuIHJlc3VsdDtcblx0fVxuXG5cdC8qKlxuXHQgKiBBIHNpbXBsZSBgQXJyYXkjbWFwYC1saWtlIHdyYXBwZXIgdG8gd29yayB3aXRoIGRvbWFpbiBuYW1lIHN0cmluZ3Mgb3IgZW1haWxcblx0ICogYWRkcmVzc2VzLlxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAcGFyYW0ge1N0cmluZ30gZG9tYWluIFRoZSBkb21haW4gbmFtZSBvciBlbWFpbCBhZGRyZXNzLlxuXHQgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayBUaGUgZnVuY3Rpb24gdGhhdCBnZXRzIGNhbGxlZCBmb3IgZXZlcnlcblx0ICogY2hhcmFjdGVyLlxuXHQgKiBAcmV0dXJucyB7QXJyYXl9IEEgbmV3IHN0cmluZyBvZiBjaGFyYWN0ZXJzIHJldHVybmVkIGJ5IHRoZSBjYWxsYmFja1xuXHQgKiBmdW5jdGlvbi5cblx0ICovXG5cdGZ1bmN0aW9uIG1hcERvbWFpbihzdHJpbmcsIGZuKSB7XG5cdFx0dmFyIHBhcnRzID0gc3RyaW5nLnNwbGl0KCdAJyk7XG5cdFx0dmFyIHJlc3VsdCA9ICcnO1xuXHRcdGlmIChwYXJ0cy5sZW5ndGggPiAxKSB7XG5cdFx0XHQvLyBJbiBlbWFpbCBhZGRyZXNzZXMsIG9ubHkgdGhlIGRvbWFpbiBuYW1lIHNob3VsZCBiZSBwdW55Y29kZWQuIExlYXZlXG5cdFx0XHQvLyB0aGUgbG9jYWwgcGFydCAoaS5lLiBldmVyeXRoaW5nIHVwIHRvIGBAYCkgaW50YWN0LlxuXHRcdFx0cmVzdWx0ID0gcGFydHNbMF0gKyAnQCc7XG5cdFx0XHRzdHJpbmcgPSBwYXJ0c1sxXTtcblx0XHR9XG5cdFx0Ly8gQXZvaWQgYHNwbGl0KHJlZ2V4KWAgZm9yIElFOCBjb21wYXRpYmlsaXR5LiBTZWUgIzE3LlxuXHRcdHN0cmluZyA9IHN0cmluZy5yZXBsYWNlKHJlZ2V4U2VwYXJhdG9ycywgJ1xceDJFJyk7XG5cdFx0dmFyIGxhYmVscyA9IHN0cmluZy5zcGxpdCgnLicpO1xuXHRcdHZhciBlbmNvZGVkID0gbWFwKGxhYmVscywgZm4pLmpvaW4oJy4nKTtcblx0XHRyZXR1cm4gcmVzdWx0ICsgZW5jb2RlZDtcblx0fVxuXG5cdC8qKlxuXHQgKiBDcmVhdGVzIGFuIGFycmF5IGNvbnRhaW5pbmcgdGhlIG51bWVyaWMgY29kZSBwb2ludHMgb2YgZWFjaCBVbmljb2RlXG5cdCAqIGNoYXJhY3RlciBpbiB0aGUgc3RyaW5nLiBXaGlsZSBKYXZhU2NyaXB0IHVzZXMgVUNTLTIgaW50ZXJuYWxseSxcblx0ICogdGhpcyBmdW5jdGlvbiB3aWxsIGNvbnZlcnQgYSBwYWlyIG9mIHN1cnJvZ2F0ZSBoYWx2ZXMgKGVhY2ggb2Ygd2hpY2hcblx0ICogVUNTLTIgZXhwb3NlcyBhcyBzZXBhcmF0ZSBjaGFyYWN0ZXJzKSBpbnRvIGEgc2luZ2xlIGNvZGUgcG9pbnQsXG5cdCAqIG1hdGNoaW5nIFVURi0xNi5cblx0ICogQHNlZSBgcHVueWNvZGUudWNzMi5lbmNvZGVgXG5cdCAqIEBzZWUgPGh0dHBzOi8vbWF0aGlhc2J5bmVucy5iZS9ub3Rlcy9qYXZhc2NyaXB0LWVuY29kaW5nPlxuXHQgKiBAbWVtYmVyT2YgcHVueWNvZGUudWNzMlxuXHQgKiBAbmFtZSBkZWNvZGVcblx0ICogQHBhcmFtIHtTdHJpbmd9IHN0cmluZyBUaGUgVW5pY29kZSBpbnB1dCBzdHJpbmcgKFVDUy0yKS5cblx0ICogQHJldHVybnMge0FycmF5fSBUaGUgbmV3IGFycmF5IG9mIGNvZGUgcG9pbnRzLlxuXHQgKi9cblx0ZnVuY3Rpb24gdWNzMmRlY29kZShzdHJpbmcpIHtcblx0XHR2YXIgb3V0cHV0ID0gW10sXG5cdFx0ICAgIGNvdW50ZXIgPSAwLFxuXHRcdCAgICBsZW5ndGggPSBzdHJpbmcubGVuZ3RoLFxuXHRcdCAgICB2YWx1ZSxcblx0XHQgICAgZXh0cmE7XG5cdFx0d2hpbGUgKGNvdW50ZXIgPCBsZW5ndGgpIHtcblx0XHRcdHZhbHVlID0gc3RyaW5nLmNoYXJDb2RlQXQoY291bnRlcisrKTtcblx0XHRcdGlmICh2YWx1ZSA+PSAweEQ4MDAgJiYgdmFsdWUgPD0gMHhEQkZGICYmIGNvdW50ZXIgPCBsZW5ndGgpIHtcblx0XHRcdFx0Ly8gaGlnaCBzdXJyb2dhdGUsIGFuZCB0aGVyZSBpcyBhIG5leHQgY2hhcmFjdGVyXG5cdFx0XHRcdGV4dHJhID0gc3RyaW5nLmNoYXJDb2RlQXQoY291bnRlcisrKTtcblx0XHRcdFx0aWYgKChleHRyYSAmIDB4RkMwMCkgPT0gMHhEQzAwKSB7IC8vIGxvdyBzdXJyb2dhdGVcblx0XHRcdFx0XHRvdXRwdXQucHVzaCgoKHZhbHVlICYgMHgzRkYpIDw8IDEwKSArIChleHRyYSAmIDB4M0ZGKSArIDB4MTAwMDApO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdC8vIHVubWF0Y2hlZCBzdXJyb2dhdGU7IG9ubHkgYXBwZW5kIHRoaXMgY29kZSB1bml0LCBpbiBjYXNlIHRoZSBuZXh0XG5cdFx0XHRcdFx0Ly8gY29kZSB1bml0IGlzIHRoZSBoaWdoIHN1cnJvZ2F0ZSBvZiBhIHN1cnJvZ2F0ZSBwYWlyXG5cdFx0XHRcdFx0b3V0cHV0LnB1c2godmFsdWUpO1xuXHRcdFx0XHRcdGNvdW50ZXItLTtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0b3V0cHV0LnB1c2godmFsdWUpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gb3V0cHV0O1xuXHR9XG5cblx0LyoqXG5cdCAqIENyZWF0ZXMgYSBzdHJpbmcgYmFzZWQgb24gYW4gYXJyYXkgb2YgbnVtZXJpYyBjb2RlIHBvaW50cy5cblx0ICogQHNlZSBgcHVueWNvZGUudWNzMi5kZWNvZGVgXG5cdCAqIEBtZW1iZXJPZiBwdW55Y29kZS51Y3MyXG5cdCAqIEBuYW1lIGVuY29kZVxuXHQgKiBAcGFyYW0ge0FycmF5fSBjb2RlUG9pbnRzIFRoZSBhcnJheSBvZiBudW1lcmljIGNvZGUgcG9pbnRzLlxuXHQgKiBAcmV0dXJucyB7U3RyaW5nfSBUaGUgbmV3IFVuaWNvZGUgc3RyaW5nIChVQ1MtMikuXG5cdCAqL1xuXHRmdW5jdGlvbiB1Y3MyZW5jb2RlKGFycmF5KSB7XG5cdFx0cmV0dXJuIG1hcChhcnJheSwgZnVuY3Rpb24odmFsdWUpIHtcblx0XHRcdHZhciBvdXRwdXQgPSAnJztcblx0XHRcdGlmICh2YWx1ZSA+IDB4RkZGRikge1xuXHRcdFx0XHR2YWx1ZSAtPSAweDEwMDAwO1xuXHRcdFx0XHRvdXRwdXQgKz0gc3RyaW5nRnJvbUNoYXJDb2RlKHZhbHVlID4+PiAxMCAmIDB4M0ZGIHwgMHhEODAwKTtcblx0XHRcdFx0dmFsdWUgPSAweERDMDAgfCB2YWx1ZSAmIDB4M0ZGO1xuXHRcdFx0fVxuXHRcdFx0b3V0cHV0ICs9IHN0cmluZ0Zyb21DaGFyQ29kZSh2YWx1ZSk7XG5cdFx0XHRyZXR1cm4gb3V0cHV0O1xuXHRcdH0pLmpvaW4oJycpO1xuXHR9XG5cblx0LyoqXG5cdCAqIENvbnZlcnRzIGEgYmFzaWMgY29kZSBwb2ludCBpbnRvIGEgZGlnaXQvaW50ZWdlci5cblx0ICogQHNlZSBgZGlnaXRUb0Jhc2ljKClgXG5cdCAqIEBwcml2YXRlXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBjb2RlUG9pbnQgVGhlIGJhc2ljIG51bWVyaWMgY29kZSBwb2ludCB2YWx1ZS5cblx0ICogQHJldHVybnMge051bWJlcn0gVGhlIG51bWVyaWMgdmFsdWUgb2YgYSBiYXNpYyBjb2RlIHBvaW50IChmb3IgdXNlIGluXG5cdCAqIHJlcHJlc2VudGluZyBpbnRlZ2VycykgaW4gdGhlIHJhbmdlIGAwYCB0byBgYmFzZSAtIDFgLCBvciBgYmFzZWAgaWZcblx0ICogdGhlIGNvZGUgcG9pbnQgZG9lcyBub3QgcmVwcmVzZW50IGEgdmFsdWUuXG5cdCAqL1xuXHRmdW5jdGlvbiBiYXNpY1RvRGlnaXQoY29kZVBvaW50KSB7XG5cdFx0aWYgKGNvZGVQb2ludCAtIDQ4IDwgMTApIHtcblx0XHRcdHJldHVybiBjb2RlUG9pbnQgLSAyMjtcblx0XHR9XG5cdFx0aWYgKGNvZGVQb2ludCAtIDY1IDwgMjYpIHtcblx0XHRcdHJldHVybiBjb2RlUG9pbnQgLSA2NTtcblx0XHR9XG5cdFx0aWYgKGNvZGVQb2ludCAtIDk3IDwgMjYpIHtcblx0XHRcdHJldHVybiBjb2RlUG9pbnQgLSA5Nztcblx0XHR9XG5cdFx0cmV0dXJuIGJhc2U7XG5cdH1cblxuXHQvKipcblx0ICogQ29udmVydHMgYSBkaWdpdC9pbnRlZ2VyIGludG8gYSBiYXNpYyBjb2RlIHBvaW50LlxuXHQgKiBAc2VlIGBiYXNpY1RvRGlnaXQoKWBcblx0ICogQHByaXZhdGVcblx0ICogQHBhcmFtIHtOdW1iZXJ9IGRpZ2l0IFRoZSBudW1lcmljIHZhbHVlIG9mIGEgYmFzaWMgY29kZSBwb2ludC5cblx0ICogQHJldHVybnMge051bWJlcn0gVGhlIGJhc2ljIGNvZGUgcG9pbnQgd2hvc2UgdmFsdWUgKHdoZW4gdXNlZCBmb3Jcblx0ICogcmVwcmVzZW50aW5nIGludGVnZXJzKSBpcyBgZGlnaXRgLCB3aGljaCBuZWVkcyB0byBiZSBpbiB0aGUgcmFuZ2Vcblx0ICogYDBgIHRvIGBiYXNlIC0gMWAuIElmIGBmbGFnYCBpcyBub24temVybywgdGhlIHVwcGVyY2FzZSBmb3JtIGlzXG5cdCAqIHVzZWQ7IGVsc2UsIHRoZSBsb3dlcmNhc2UgZm9ybSBpcyB1c2VkLiBUaGUgYmVoYXZpb3IgaXMgdW5kZWZpbmVkXG5cdCAqIGlmIGBmbGFnYCBpcyBub24temVybyBhbmQgYGRpZ2l0YCBoYXMgbm8gdXBwZXJjYXNlIGZvcm0uXG5cdCAqL1xuXHRmdW5jdGlvbiBkaWdpdFRvQmFzaWMoZGlnaXQsIGZsYWcpIHtcblx0XHQvLyAgMC4uMjUgbWFwIHRvIEFTQ0lJIGEuLnogb3IgQS4uWlxuXHRcdC8vIDI2Li4zNSBtYXAgdG8gQVNDSUkgMC4uOVxuXHRcdHJldHVybiBkaWdpdCArIDIyICsgNzUgKiAoZGlnaXQgPCAyNikgLSAoKGZsYWcgIT0gMCkgPDwgNSk7XG5cdH1cblxuXHQvKipcblx0ICogQmlhcyBhZGFwdGF0aW9uIGZ1bmN0aW9uIGFzIHBlciBzZWN0aW9uIDMuNCBvZiBSRkMgMzQ5Mi5cblx0ICogaHR0cHM6Ly90b29scy5pZXRmLm9yZy9odG1sL3JmYzM0OTIjc2VjdGlvbi0zLjRcblx0ICogQHByaXZhdGVcblx0ICovXG5cdGZ1bmN0aW9uIGFkYXB0KGRlbHRhLCBudW1Qb2ludHMsIGZpcnN0VGltZSkge1xuXHRcdHZhciBrID0gMDtcblx0XHRkZWx0YSA9IGZpcnN0VGltZSA/IGZsb29yKGRlbHRhIC8gZGFtcCkgOiBkZWx0YSA+PiAxO1xuXHRcdGRlbHRhICs9IGZsb29yKGRlbHRhIC8gbnVtUG9pbnRzKTtcblx0XHRmb3IgKC8qIG5vIGluaXRpYWxpemF0aW9uICovOyBkZWx0YSA+IGJhc2VNaW51c1RNaW4gKiB0TWF4ID4+IDE7IGsgKz0gYmFzZSkge1xuXHRcdFx0ZGVsdGEgPSBmbG9vcihkZWx0YSAvIGJhc2VNaW51c1RNaW4pO1xuXHRcdH1cblx0XHRyZXR1cm4gZmxvb3IoayArIChiYXNlTWludXNUTWluICsgMSkgKiBkZWx0YSAvIChkZWx0YSArIHNrZXcpKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDb252ZXJ0cyBhIFB1bnljb2RlIHN0cmluZyBvZiBBU0NJSS1vbmx5IHN5bWJvbHMgdG8gYSBzdHJpbmcgb2YgVW5pY29kZVxuXHQgKiBzeW1ib2xzLlxuXHQgKiBAbWVtYmVyT2YgcHVueWNvZGVcblx0ICogQHBhcmFtIHtTdHJpbmd9IGlucHV0IFRoZSBQdW55Y29kZSBzdHJpbmcgb2YgQVNDSUktb25seSBzeW1ib2xzLlxuXHQgKiBAcmV0dXJucyB7U3RyaW5nfSBUaGUgcmVzdWx0aW5nIHN0cmluZyBvZiBVbmljb2RlIHN5bWJvbHMuXG5cdCAqL1xuXHRmdW5jdGlvbiBkZWNvZGUoaW5wdXQpIHtcblx0XHQvLyBEb24ndCB1c2UgVUNTLTJcblx0XHR2YXIgb3V0cHV0ID0gW10sXG5cdFx0ICAgIGlucHV0TGVuZ3RoID0gaW5wdXQubGVuZ3RoLFxuXHRcdCAgICBvdXQsXG5cdFx0ICAgIGkgPSAwLFxuXHRcdCAgICBuID0gaW5pdGlhbE4sXG5cdFx0ICAgIGJpYXMgPSBpbml0aWFsQmlhcyxcblx0XHQgICAgYmFzaWMsXG5cdFx0ICAgIGosXG5cdFx0ICAgIGluZGV4LFxuXHRcdCAgICBvbGRpLFxuXHRcdCAgICB3LFxuXHRcdCAgICBrLFxuXHRcdCAgICBkaWdpdCxcblx0XHQgICAgdCxcblx0XHQgICAgLyoqIENhY2hlZCBjYWxjdWxhdGlvbiByZXN1bHRzICovXG5cdFx0ICAgIGJhc2VNaW51c1Q7XG5cblx0XHQvLyBIYW5kbGUgdGhlIGJhc2ljIGNvZGUgcG9pbnRzOiBsZXQgYGJhc2ljYCBiZSB0aGUgbnVtYmVyIG9mIGlucHV0IGNvZGVcblx0XHQvLyBwb2ludHMgYmVmb3JlIHRoZSBsYXN0IGRlbGltaXRlciwgb3IgYDBgIGlmIHRoZXJlIGlzIG5vbmUsIHRoZW4gY29weVxuXHRcdC8vIHRoZSBmaXJzdCBiYXNpYyBjb2RlIHBvaW50cyB0byB0aGUgb3V0cHV0LlxuXG5cdFx0YmFzaWMgPSBpbnB1dC5sYXN0SW5kZXhPZihkZWxpbWl0ZXIpO1xuXHRcdGlmIChiYXNpYyA8IDApIHtcblx0XHRcdGJhc2ljID0gMDtcblx0XHR9XG5cblx0XHRmb3IgKGogPSAwOyBqIDwgYmFzaWM7ICsraikge1xuXHRcdFx0Ly8gaWYgaXQncyBub3QgYSBiYXNpYyBjb2RlIHBvaW50XG5cdFx0XHRpZiAoaW5wdXQuY2hhckNvZGVBdChqKSA+PSAweDgwKSB7XG5cdFx0XHRcdGVycm9yKCdub3QtYmFzaWMnKTtcblx0XHRcdH1cblx0XHRcdG91dHB1dC5wdXNoKGlucHV0LmNoYXJDb2RlQXQoaikpO1xuXHRcdH1cblxuXHRcdC8vIE1haW4gZGVjb2RpbmcgbG9vcDogc3RhcnQganVzdCBhZnRlciB0aGUgbGFzdCBkZWxpbWl0ZXIgaWYgYW55IGJhc2ljIGNvZGVcblx0XHQvLyBwb2ludHMgd2VyZSBjb3BpZWQ7IHN0YXJ0IGF0IHRoZSBiZWdpbm5pbmcgb3RoZXJ3aXNlLlxuXG5cdFx0Zm9yIChpbmRleCA9IGJhc2ljID4gMCA/IGJhc2ljICsgMSA6IDA7IGluZGV4IDwgaW5wdXRMZW5ndGg7IC8qIG5vIGZpbmFsIGV4cHJlc3Npb24gKi8pIHtcblxuXHRcdFx0Ly8gYGluZGV4YCBpcyB0aGUgaW5kZXggb2YgdGhlIG5leHQgY2hhcmFjdGVyIHRvIGJlIGNvbnN1bWVkLlxuXHRcdFx0Ly8gRGVjb2RlIGEgZ2VuZXJhbGl6ZWQgdmFyaWFibGUtbGVuZ3RoIGludGVnZXIgaW50byBgZGVsdGFgLFxuXHRcdFx0Ly8gd2hpY2ggZ2V0cyBhZGRlZCB0byBgaWAuIFRoZSBvdmVyZmxvdyBjaGVja2luZyBpcyBlYXNpZXJcblx0XHRcdC8vIGlmIHdlIGluY3JlYXNlIGBpYCBhcyB3ZSBnbywgdGhlbiBzdWJ0cmFjdCBvZmYgaXRzIHN0YXJ0aW5nXG5cdFx0XHQvLyB2YWx1ZSBhdCB0aGUgZW5kIHRvIG9idGFpbiBgZGVsdGFgLlxuXHRcdFx0Zm9yIChvbGRpID0gaSwgdyA9IDEsIGsgPSBiYXNlOyAvKiBubyBjb25kaXRpb24gKi87IGsgKz0gYmFzZSkge1xuXG5cdFx0XHRcdGlmIChpbmRleCA+PSBpbnB1dExlbmd0aCkge1xuXHRcdFx0XHRcdGVycm9yKCdpbnZhbGlkLWlucHV0Jyk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRkaWdpdCA9IGJhc2ljVG9EaWdpdChpbnB1dC5jaGFyQ29kZUF0KGluZGV4KyspKTtcblxuXHRcdFx0XHRpZiAoZGlnaXQgPj0gYmFzZSB8fCBkaWdpdCA+IGZsb29yKChtYXhJbnQgLSBpKSAvIHcpKSB7XG5cdFx0XHRcdFx0ZXJyb3IoJ292ZXJmbG93Jyk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpICs9IGRpZ2l0ICogdztcblx0XHRcdFx0dCA9IGsgPD0gYmlhcyA/IHRNaW4gOiAoayA+PSBiaWFzICsgdE1heCA/IHRNYXggOiBrIC0gYmlhcyk7XG5cblx0XHRcdFx0aWYgKGRpZ2l0IDwgdCkge1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0YmFzZU1pbnVzVCA9IGJhc2UgLSB0O1xuXHRcdFx0XHRpZiAodyA+IGZsb29yKG1heEludCAvIGJhc2VNaW51c1QpKSB7XG5cdFx0XHRcdFx0ZXJyb3IoJ292ZXJmbG93Jyk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHR3ICo9IGJhc2VNaW51c1Q7XG5cblx0XHRcdH1cblxuXHRcdFx0b3V0ID0gb3V0cHV0Lmxlbmd0aCArIDE7XG5cdFx0XHRiaWFzID0gYWRhcHQoaSAtIG9sZGksIG91dCwgb2xkaSA9PSAwKTtcblxuXHRcdFx0Ly8gYGlgIHdhcyBzdXBwb3NlZCB0byB3cmFwIGFyb3VuZCBmcm9tIGBvdXRgIHRvIGAwYCxcblx0XHRcdC8vIGluY3JlbWVudGluZyBgbmAgZWFjaCB0aW1lLCBzbyB3ZSdsbCBmaXggdGhhdCBub3c6XG5cdFx0XHRpZiAoZmxvb3IoaSAvIG91dCkgPiBtYXhJbnQgLSBuKSB7XG5cdFx0XHRcdGVycm9yKCdvdmVyZmxvdycpO1xuXHRcdFx0fVxuXG5cdFx0XHRuICs9IGZsb29yKGkgLyBvdXQpO1xuXHRcdFx0aSAlPSBvdXQ7XG5cblx0XHRcdC8vIEluc2VydCBgbmAgYXQgcG9zaXRpb24gYGlgIG9mIHRoZSBvdXRwdXRcblx0XHRcdG91dHB1dC5zcGxpY2UoaSsrLCAwLCBuKTtcblxuXHRcdH1cblxuXHRcdHJldHVybiB1Y3MyZW5jb2RlKG91dHB1dCk7XG5cdH1cblxuXHQvKipcblx0ICogQ29udmVydHMgYSBzdHJpbmcgb2YgVW5pY29kZSBzeW1ib2xzIChlLmcuIGEgZG9tYWluIG5hbWUgbGFiZWwpIHRvIGFcblx0ICogUHVueWNvZGUgc3RyaW5nIG9mIEFTQ0lJLW9ubHkgc3ltYm9scy5cblx0ICogQG1lbWJlck9mIHB1bnljb2RlXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBpbnB1dCBUaGUgc3RyaW5nIG9mIFVuaWNvZGUgc3ltYm9scy5cblx0ICogQHJldHVybnMge1N0cmluZ30gVGhlIHJlc3VsdGluZyBQdW55Y29kZSBzdHJpbmcgb2YgQVNDSUktb25seSBzeW1ib2xzLlxuXHQgKi9cblx0ZnVuY3Rpb24gZW5jb2RlKGlucHV0KSB7XG5cdFx0dmFyIG4sXG5cdFx0ICAgIGRlbHRhLFxuXHRcdCAgICBoYW5kbGVkQ1BDb3VudCxcblx0XHQgICAgYmFzaWNMZW5ndGgsXG5cdFx0ICAgIGJpYXMsXG5cdFx0ICAgIGosXG5cdFx0ICAgIG0sXG5cdFx0ICAgIHEsXG5cdFx0ICAgIGssXG5cdFx0ICAgIHQsXG5cdFx0ICAgIGN1cnJlbnRWYWx1ZSxcblx0XHQgICAgb3V0cHV0ID0gW10sXG5cdFx0ICAgIC8qKiBgaW5wdXRMZW5ndGhgIHdpbGwgaG9sZCB0aGUgbnVtYmVyIG9mIGNvZGUgcG9pbnRzIGluIGBpbnB1dGAuICovXG5cdFx0ICAgIGlucHV0TGVuZ3RoLFxuXHRcdCAgICAvKiogQ2FjaGVkIGNhbGN1bGF0aW9uIHJlc3VsdHMgKi9cblx0XHQgICAgaGFuZGxlZENQQ291bnRQbHVzT25lLFxuXHRcdCAgICBiYXNlTWludXNULFxuXHRcdCAgICBxTWludXNUO1xuXG5cdFx0Ly8gQ29udmVydCB0aGUgaW5wdXQgaW4gVUNTLTIgdG8gVW5pY29kZVxuXHRcdGlucHV0ID0gdWNzMmRlY29kZShpbnB1dCk7XG5cblx0XHQvLyBDYWNoZSB0aGUgbGVuZ3RoXG5cdFx0aW5wdXRMZW5ndGggPSBpbnB1dC5sZW5ndGg7XG5cblx0XHQvLyBJbml0aWFsaXplIHRoZSBzdGF0ZVxuXHRcdG4gPSBpbml0aWFsTjtcblx0XHRkZWx0YSA9IDA7XG5cdFx0YmlhcyA9IGluaXRpYWxCaWFzO1xuXG5cdFx0Ly8gSGFuZGxlIHRoZSBiYXNpYyBjb2RlIHBvaW50c1xuXHRcdGZvciAoaiA9IDA7IGogPCBpbnB1dExlbmd0aDsgKytqKSB7XG5cdFx0XHRjdXJyZW50VmFsdWUgPSBpbnB1dFtqXTtcblx0XHRcdGlmIChjdXJyZW50VmFsdWUgPCAweDgwKSB7XG5cdFx0XHRcdG91dHB1dC5wdXNoKHN0cmluZ0Zyb21DaGFyQ29kZShjdXJyZW50VmFsdWUpKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRoYW5kbGVkQ1BDb3VudCA9IGJhc2ljTGVuZ3RoID0gb3V0cHV0Lmxlbmd0aDtcblxuXHRcdC8vIGBoYW5kbGVkQ1BDb3VudGAgaXMgdGhlIG51bWJlciBvZiBjb2RlIHBvaW50cyB0aGF0IGhhdmUgYmVlbiBoYW5kbGVkO1xuXHRcdC8vIGBiYXNpY0xlbmd0aGAgaXMgdGhlIG51bWJlciBvZiBiYXNpYyBjb2RlIHBvaW50cy5cblxuXHRcdC8vIEZpbmlzaCB0aGUgYmFzaWMgc3RyaW5nIC0gaWYgaXQgaXMgbm90IGVtcHR5IC0gd2l0aCBhIGRlbGltaXRlclxuXHRcdGlmIChiYXNpY0xlbmd0aCkge1xuXHRcdFx0b3V0cHV0LnB1c2goZGVsaW1pdGVyKTtcblx0XHR9XG5cblx0XHQvLyBNYWluIGVuY29kaW5nIGxvb3A6XG5cdFx0d2hpbGUgKGhhbmRsZWRDUENvdW50IDwgaW5wdXRMZW5ndGgpIHtcblxuXHRcdFx0Ly8gQWxsIG5vbi1iYXNpYyBjb2RlIHBvaW50cyA8IG4gaGF2ZSBiZWVuIGhhbmRsZWQgYWxyZWFkeS4gRmluZCB0aGUgbmV4dFxuXHRcdFx0Ly8gbGFyZ2VyIG9uZTpcblx0XHRcdGZvciAobSA9IG1heEludCwgaiA9IDA7IGogPCBpbnB1dExlbmd0aDsgKytqKSB7XG5cdFx0XHRcdGN1cnJlbnRWYWx1ZSA9IGlucHV0W2pdO1xuXHRcdFx0XHRpZiAoY3VycmVudFZhbHVlID49IG4gJiYgY3VycmVudFZhbHVlIDwgbSkge1xuXHRcdFx0XHRcdG0gPSBjdXJyZW50VmFsdWU7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0Ly8gSW5jcmVhc2UgYGRlbHRhYCBlbm91Z2ggdG8gYWR2YW5jZSB0aGUgZGVjb2RlcidzIDxuLGk+IHN0YXRlIHRvIDxtLDA+LFxuXHRcdFx0Ly8gYnV0IGd1YXJkIGFnYWluc3Qgb3ZlcmZsb3dcblx0XHRcdGhhbmRsZWRDUENvdW50UGx1c09uZSA9IGhhbmRsZWRDUENvdW50ICsgMTtcblx0XHRcdGlmIChtIC0gbiA+IGZsb29yKChtYXhJbnQgLSBkZWx0YSkgLyBoYW5kbGVkQ1BDb3VudFBsdXNPbmUpKSB7XG5cdFx0XHRcdGVycm9yKCdvdmVyZmxvdycpO1xuXHRcdFx0fVxuXG5cdFx0XHRkZWx0YSArPSAobSAtIG4pICogaGFuZGxlZENQQ291bnRQbHVzT25lO1xuXHRcdFx0biA9IG07XG5cblx0XHRcdGZvciAoaiA9IDA7IGogPCBpbnB1dExlbmd0aDsgKytqKSB7XG5cdFx0XHRcdGN1cnJlbnRWYWx1ZSA9IGlucHV0W2pdO1xuXG5cdFx0XHRcdGlmIChjdXJyZW50VmFsdWUgPCBuICYmICsrZGVsdGEgPiBtYXhJbnQpIHtcblx0XHRcdFx0XHRlcnJvcignb3ZlcmZsb3cnKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmIChjdXJyZW50VmFsdWUgPT0gbikge1xuXHRcdFx0XHRcdC8vIFJlcHJlc2VudCBkZWx0YSBhcyBhIGdlbmVyYWxpemVkIHZhcmlhYmxlLWxlbmd0aCBpbnRlZ2VyXG5cdFx0XHRcdFx0Zm9yIChxID0gZGVsdGEsIGsgPSBiYXNlOyAvKiBubyBjb25kaXRpb24gKi87IGsgKz0gYmFzZSkge1xuXHRcdFx0XHRcdFx0dCA9IGsgPD0gYmlhcyA/IHRNaW4gOiAoayA+PSBiaWFzICsgdE1heCA/IHRNYXggOiBrIC0gYmlhcyk7XG5cdFx0XHRcdFx0XHRpZiAocSA8IHQpIHtcblx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRxTWludXNUID0gcSAtIHQ7XG5cdFx0XHRcdFx0XHRiYXNlTWludXNUID0gYmFzZSAtIHQ7XG5cdFx0XHRcdFx0XHRvdXRwdXQucHVzaChcblx0XHRcdFx0XHRcdFx0c3RyaW5nRnJvbUNoYXJDb2RlKGRpZ2l0VG9CYXNpYyh0ICsgcU1pbnVzVCAlIGJhc2VNaW51c1QsIDApKVxuXHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRcdHEgPSBmbG9vcihxTWludXNUIC8gYmFzZU1pbnVzVCk7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0b3V0cHV0LnB1c2goc3RyaW5nRnJvbUNoYXJDb2RlKGRpZ2l0VG9CYXNpYyhxLCAwKSkpO1xuXHRcdFx0XHRcdGJpYXMgPSBhZGFwdChkZWx0YSwgaGFuZGxlZENQQ291bnRQbHVzT25lLCBoYW5kbGVkQ1BDb3VudCA9PSBiYXNpY0xlbmd0aCk7XG5cdFx0XHRcdFx0ZGVsdGEgPSAwO1xuXHRcdFx0XHRcdCsraGFuZGxlZENQQ291bnQ7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0KytkZWx0YTtcblx0XHRcdCsrbjtcblxuXHRcdH1cblx0XHRyZXR1cm4gb3V0cHV0LmpvaW4oJycpO1xuXHR9XG5cblx0LyoqXG5cdCAqIENvbnZlcnRzIGEgUHVueWNvZGUgc3RyaW5nIHJlcHJlc2VudGluZyBhIGRvbWFpbiBuYW1lIG9yIGFuIGVtYWlsIGFkZHJlc3Ncblx0ICogdG8gVW5pY29kZS4gT25seSB0aGUgUHVueWNvZGVkIHBhcnRzIG9mIHRoZSBpbnB1dCB3aWxsIGJlIGNvbnZlcnRlZCwgaS5lLlxuXHQgKiBpdCBkb2Vzbid0IG1hdHRlciBpZiB5b3UgY2FsbCBpdCBvbiBhIHN0cmluZyB0aGF0IGhhcyBhbHJlYWR5IGJlZW5cblx0ICogY29udmVydGVkIHRvIFVuaWNvZGUuXG5cdCAqIEBtZW1iZXJPZiBwdW55Y29kZVxuXHQgKiBAcGFyYW0ge1N0cmluZ30gaW5wdXQgVGhlIFB1bnljb2RlZCBkb21haW4gbmFtZSBvciBlbWFpbCBhZGRyZXNzIHRvXG5cdCAqIGNvbnZlcnQgdG8gVW5pY29kZS5cblx0ICogQHJldHVybnMge1N0cmluZ30gVGhlIFVuaWNvZGUgcmVwcmVzZW50YXRpb24gb2YgdGhlIGdpdmVuIFB1bnljb2RlXG5cdCAqIHN0cmluZy5cblx0ICovXG5cdGZ1bmN0aW9uIHRvVW5pY29kZShpbnB1dCkge1xuXHRcdHJldHVybiBtYXBEb21haW4oaW5wdXQsIGZ1bmN0aW9uKHN0cmluZykge1xuXHRcdFx0cmV0dXJuIHJlZ2V4UHVueWNvZGUudGVzdChzdHJpbmcpXG5cdFx0XHRcdD8gZGVjb2RlKHN0cmluZy5zbGljZSg0KS50b0xvd2VyQ2FzZSgpKVxuXHRcdFx0XHQ6IHN0cmluZztcblx0XHR9KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDb252ZXJ0cyBhIFVuaWNvZGUgc3RyaW5nIHJlcHJlc2VudGluZyBhIGRvbWFpbiBuYW1lIG9yIGFuIGVtYWlsIGFkZHJlc3MgdG9cblx0ICogUHVueWNvZGUuIE9ubHkgdGhlIG5vbi1BU0NJSSBwYXJ0cyBvZiB0aGUgZG9tYWluIG5hbWUgd2lsbCBiZSBjb252ZXJ0ZWQsXG5cdCAqIGkuZS4gaXQgZG9lc24ndCBtYXR0ZXIgaWYgeW91IGNhbGwgaXQgd2l0aCBhIGRvbWFpbiB0aGF0J3MgYWxyZWFkeSBpblxuXHQgKiBBU0NJSS5cblx0ICogQG1lbWJlck9mIHB1bnljb2RlXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBpbnB1dCBUaGUgZG9tYWluIG5hbWUgb3IgZW1haWwgYWRkcmVzcyB0byBjb252ZXJ0LCBhcyBhXG5cdCAqIFVuaWNvZGUgc3RyaW5nLlxuXHQgKiBAcmV0dXJucyB7U3RyaW5nfSBUaGUgUHVueWNvZGUgcmVwcmVzZW50YXRpb24gb2YgdGhlIGdpdmVuIGRvbWFpbiBuYW1lIG9yXG5cdCAqIGVtYWlsIGFkZHJlc3MuXG5cdCAqL1xuXHRmdW5jdGlvbiB0b0FTQ0lJKGlucHV0KSB7XG5cdFx0cmV0dXJuIG1hcERvbWFpbihpbnB1dCwgZnVuY3Rpb24oc3RyaW5nKSB7XG5cdFx0XHRyZXR1cm4gcmVnZXhOb25BU0NJSS50ZXN0KHN0cmluZylcblx0XHRcdFx0PyAneG4tLScgKyBlbmNvZGUoc3RyaW5nKVxuXHRcdFx0XHQ6IHN0cmluZztcblx0XHR9KTtcblx0fVxuXG5cdC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG5cdC8qKiBEZWZpbmUgdGhlIHB1YmxpYyBBUEkgKi9cblx0cHVueWNvZGUgPSB7XG5cdFx0LyoqXG5cdFx0ICogQSBzdHJpbmcgcmVwcmVzZW50aW5nIHRoZSBjdXJyZW50IFB1bnljb2RlLmpzIHZlcnNpb24gbnVtYmVyLlxuXHRcdCAqIEBtZW1iZXJPZiBwdW55Y29kZVxuXHRcdCAqIEB0eXBlIFN0cmluZ1xuXHRcdCAqL1xuXHRcdCd2ZXJzaW9uJzogJzEuMy4yJyxcblx0XHQvKipcblx0XHQgKiBBbiBvYmplY3Qgb2YgbWV0aG9kcyB0byBjb252ZXJ0IGZyb20gSmF2YVNjcmlwdCdzIGludGVybmFsIGNoYXJhY3RlclxuXHRcdCAqIHJlcHJlc2VudGF0aW9uIChVQ1MtMikgdG8gVW5pY29kZSBjb2RlIHBvaW50cywgYW5kIGJhY2suXG5cdFx0ICogQHNlZSA8aHR0cHM6Ly9tYXRoaWFzYnluZW5zLmJlL25vdGVzL2phdmFzY3JpcHQtZW5jb2Rpbmc+XG5cdFx0ICogQG1lbWJlck9mIHB1bnljb2RlXG5cdFx0ICogQHR5cGUgT2JqZWN0XG5cdFx0ICovXG5cdFx0J3VjczInOiB7XG5cdFx0XHQnZGVjb2RlJzogdWNzMmRlY29kZSxcblx0XHRcdCdlbmNvZGUnOiB1Y3MyZW5jb2RlXG5cdFx0fSxcblx0XHQnZGVjb2RlJzogZGVjb2RlLFxuXHRcdCdlbmNvZGUnOiBlbmNvZGUsXG5cdFx0J3RvQVNDSUknOiB0b0FTQ0lJLFxuXHRcdCd0b1VuaWNvZGUnOiB0b1VuaWNvZGVcblx0fTtcblxuXHQvKiogRXhwb3NlIGBwdW55Y29kZWAgKi9cblx0Ly8gU29tZSBBTUQgYnVpbGQgb3B0aW1pemVycywgbGlrZSByLmpzLCBjaGVjayBmb3Igc3BlY2lmaWMgY29uZGl0aW9uIHBhdHRlcm5zXG5cdC8vIGxpa2UgdGhlIGZvbGxvd2luZzpcblx0aWYgKFxuXHRcdHR5cGVvZiBkZWZpbmUgPT0gJ2Z1bmN0aW9uJyAmJlxuXHRcdHR5cGVvZiBkZWZpbmUuYW1kID09ICdvYmplY3QnICYmXG5cdFx0ZGVmaW5lLmFtZFxuXHQpIHtcblx0XHRkZWZpbmUoJ3B1bnljb2RlJywgZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gcHVueWNvZGU7XG5cdFx0fSk7XG5cdH0gZWxzZSBpZiAoZnJlZUV4cG9ydHMgJiYgZnJlZU1vZHVsZSkge1xuXHRcdGlmIChtb2R1bGUuZXhwb3J0cyA9PSBmcmVlRXhwb3J0cykge1xuXHRcdFx0Ly8gaW4gTm9kZS5qcywgaW8uanMsIG9yIFJpbmdvSlMgdjAuOC4wK1xuXHRcdFx0ZnJlZU1vZHVsZS5leHBvcnRzID0gcHVueWNvZGU7XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIGluIE5hcndoYWwgb3IgUmluZ29KUyB2MC43LjAtXG5cdFx0XHRmb3IgKGtleSBpbiBwdW55Y29kZSkge1xuXHRcdFx0XHRwdW55Y29kZS5oYXNPd25Qcm9wZXJ0eShrZXkpICYmIChmcmVlRXhwb3J0c1trZXldID0gcHVueWNvZGVba2V5XSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9IGVsc2Uge1xuXHRcdC8vIGluIFJoaW5vIG9yIGEgd2ViIGJyb3dzZXJcblx0XHRyb290LnB1bnljb2RlID0gcHVueWNvZGU7XG5cdH1cblxufSh0aGlzKSk7XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIi8qIGVzbGludC1kaXNhYmxlIG5vLXVudXNlZC12YXJzICovXG4ndXNlIHN0cmljdCc7XG52YXIgaGFzT3duUHJvcGVydHkgPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5O1xudmFyIHByb3BJc0VudW1lcmFibGUgPSBPYmplY3QucHJvdG90eXBlLnByb3BlcnR5SXNFbnVtZXJhYmxlO1xuXG5mdW5jdGlvbiB0b09iamVjdCh2YWwpIHtcblx0aWYgKHZhbCA9PT0gbnVsbCB8fCB2YWwgPT09IHVuZGVmaW5lZCkge1xuXHRcdHRocm93IG5ldyBUeXBlRXJyb3IoJ09iamVjdC5hc3NpZ24gY2Fubm90IGJlIGNhbGxlZCB3aXRoIG51bGwgb3IgdW5kZWZpbmVkJyk7XG5cdH1cblxuXHRyZXR1cm4gT2JqZWN0KHZhbCk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbiAodGFyZ2V0LCBzb3VyY2UpIHtcblx0dmFyIGZyb207XG5cdHZhciB0byA9IHRvT2JqZWN0KHRhcmdldCk7XG5cdHZhciBzeW1ib2xzO1xuXG5cdGZvciAodmFyIHMgPSAxOyBzIDwgYXJndW1lbnRzLmxlbmd0aDsgcysrKSB7XG5cdFx0ZnJvbSA9IE9iamVjdChhcmd1bWVudHNbc10pO1xuXG5cdFx0Zm9yICh2YXIga2V5IGluIGZyb20pIHtcblx0XHRcdGlmIChoYXNPd25Qcm9wZXJ0eS5jYWxsKGZyb20sIGtleSkpIHtcblx0XHRcdFx0dG9ba2V5XSA9IGZyb21ba2V5XTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRpZiAoT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scykge1xuXHRcdFx0c3ltYm9scyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMoZnJvbSk7XG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHN5bWJvbHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0aWYgKHByb3BJc0VudW1lcmFibGUuY2FsbChmcm9tLCBzeW1ib2xzW2ldKSkge1xuXHRcdFx0XHRcdHRvW3N5bWJvbHNbaV1dID0gZnJvbVtzeW1ib2xzW2ldXTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdHJldHVybiB0bztcbn07XG4iLCIvLyBDb3B5cmlnaHQgSm95ZW50LCBJbmMuIGFuZCBvdGhlciBOb2RlIGNvbnRyaWJ1dG9ycy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYVxuLy8gY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuLy8gXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXG4vLyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXG4vLyBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0XG4vLyBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGVcbi8vIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkXG4vLyBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTXG4vLyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXG4vLyBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOXG4vLyBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSxcbi8vIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUlxuLy8gT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRVxuLy8gVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cblxuJ3VzZSBzdHJpY3QnO1xuXG4vLyBJZiBvYmouaGFzT3duUHJvcGVydHkgaGFzIGJlZW4gb3ZlcnJpZGRlbiwgdGhlbiBjYWxsaW5nXG4vLyBvYmouaGFzT3duUHJvcGVydHkocHJvcCkgd2lsbCBicmVhay5cbi8vIFNlZTogaHR0cHM6Ly9naXRodWIuY29tL2pveWVudC9ub2RlL2lzc3Vlcy8xNzA3XG5mdW5jdGlvbiBoYXNPd25Qcm9wZXJ0eShvYmosIHByb3ApIHtcbiAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHFzLCBzZXAsIGVxLCBvcHRpb25zKSB7XG4gIHNlcCA9IHNlcCB8fCAnJic7XG4gIGVxID0gZXEgfHwgJz0nO1xuICB2YXIgb2JqID0ge307XG5cbiAgaWYgKHR5cGVvZiBxcyAhPT0gJ3N0cmluZycgfHwgcXMubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIG9iajtcbiAgfVxuXG4gIHZhciByZWdleHAgPSAvXFwrL2c7XG4gIHFzID0gcXMuc3BsaXQoc2VwKTtcblxuICB2YXIgbWF4S2V5cyA9IDEwMDA7XG4gIGlmIChvcHRpb25zICYmIHR5cGVvZiBvcHRpb25zLm1heEtleXMgPT09ICdudW1iZXInKSB7XG4gICAgbWF4S2V5cyA9IG9wdGlvbnMubWF4S2V5cztcbiAgfVxuXG4gIHZhciBsZW4gPSBxcy5sZW5ndGg7XG4gIC8vIG1heEtleXMgPD0gMCBtZWFucyB0aGF0IHdlIHNob3VsZCBub3QgbGltaXQga2V5cyBjb3VudFxuICBpZiAobWF4S2V5cyA+IDAgJiYgbGVuID4gbWF4S2V5cykge1xuICAgIGxlbiA9IG1heEtleXM7XG4gIH1cblxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgKytpKSB7XG4gICAgdmFyIHggPSBxc1tpXS5yZXBsYWNlKHJlZ2V4cCwgJyUyMCcpLFxuICAgICAgICBpZHggPSB4LmluZGV4T2YoZXEpLFxuICAgICAgICBrc3RyLCB2c3RyLCBrLCB2O1xuXG4gICAgaWYgKGlkeCA+PSAwKSB7XG4gICAgICBrc3RyID0geC5zdWJzdHIoMCwgaWR4KTtcbiAgICAgIHZzdHIgPSB4LnN1YnN0cihpZHggKyAxKTtcbiAgICB9IGVsc2Uge1xuICAgICAga3N0ciA9IHg7XG4gICAgICB2c3RyID0gJyc7XG4gICAgfVxuXG4gICAgayA9IGRlY29kZVVSSUNvbXBvbmVudChrc3RyKTtcbiAgICB2ID0gZGVjb2RlVVJJQ29tcG9uZW50KHZzdHIpO1xuXG4gICAgaWYgKCFoYXNPd25Qcm9wZXJ0eShvYmosIGspKSB7XG4gICAgICBvYmpba10gPSB2O1xuICAgIH0gZWxzZSBpZiAoaXNBcnJheShvYmpba10pKSB7XG4gICAgICBvYmpba10ucHVzaCh2KTtcbiAgICB9IGVsc2Uge1xuICAgICAgb2JqW2tdID0gW29ialtrXSwgdl07XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG9iajtcbn07XG5cbnZhciBpc0FycmF5ID0gQXJyYXkuaXNBcnJheSB8fCBmdW5jdGlvbiAoeHMpIHtcbiAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh4cykgPT09ICdbb2JqZWN0IEFycmF5XSc7XG59O1xuIiwiLy8gQ29weXJpZ2h0IEpveWVudCwgSW5jLiBhbmQgb3RoZXIgTm9kZSBjb250cmlidXRvcnMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGFcbi8vIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcbi8vIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xuLy8gd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxuLy8gZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdFxuLy8gcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlXG4vLyBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZFxuLy8gaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTU1xuLy8gT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxuLy8gTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTlxuLy8gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sXG4vLyBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1Jcbi8vIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEVcbi8vIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIHN0cmluZ2lmeVByaW1pdGl2ZSA9IGZ1bmN0aW9uKHYpIHtcbiAgc3dpdGNoICh0eXBlb2Ygdikge1xuICAgIGNhc2UgJ3N0cmluZyc6XG4gICAgICByZXR1cm4gdjtcblxuICAgIGNhc2UgJ2Jvb2xlYW4nOlxuICAgICAgcmV0dXJuIHYgPyAndHJ1ZScgOiAnZmFsc2UnO1xuXG4gICAgY2FzZSAnbnVtYmVyJzpcbiAgICAgIHJldHVybiBpc0Zpbml0ZSh2KSA/IHYgOiAnJztcblxuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gJyc7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24ob2JqLCBzZXAsIGVxLCBuYW1lKSB7XG4gIHNlcCA9IHNlcCB8fCAnJic7XG4gIGVxID0gZXEgfHwgJz0nO1xuICBpZiAob2JqID09PSBudWxsKSB7XG4gICAgb2JqID0gdW5kZWZpbmVkO1xuICB9XG5cbiAgaWYgKHR5cGVvZiBvYmogPT09ICdvYmplY3QnKSB7XG4gICAgcmV0dXJuIG1hcChvYmplY3RLZXlzKG9iaiksIGZ1bmN0aW9uKGspIHtcbiAgICAgIHZhciBrcyA9IGVuY29kZVVSSUNvbXBvbmVudChzdHJpbmdpZnlQcmltaXRpdmUoaykpICsgZXE7XG4gICAgICBpZiAoaXNBcnJheShvYmpba10pKSB7XG4gICAgICAgIHJldHVybiBtYXAob2JqW2tdLCBmdW5jdGlvbih2KSB7XG4gICAgICAgICAgcmV0dXJuIGtzICsgZW5jb2RlVVJJQ29tcG9uZW50KHN0cmluZ2lmeVByaW1pdGl2ZSh2KSk7XG4gICAgICAgIH0pLmpvaW4oc2VwKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBrcyArIGVuY29kZVVSSUNvbXBvbmVudChzdHJpbmdpZnlQcmltaXRpdmUob2JqW2tdKSk7XG4gICAgICB9XG4gICAgfSkuam9pbihzZXApO1xuXG4gIH1cblxuICBpZiAoIW5hbWUpIHJldHVybiAnJztcbiAgcmV0dXJuIGVuY29kZVVSSUNvbXBvbmVudChzdHJpbmdpZnlQcmltaXRpdmUobmFtZSkpICsgZXEgK1xuICAgICAgICAgZW5jb2RlVVJJQ29tcG9uZW50KHN0cmluZ2lmeVByaW1pdGl2ZShvYmopKTtcbn07XG5cbnZhciBpc0FycmF5ID0gQXJyYXkuaXNBcnJheSB8fCBmdW5jdGlvbiAoeHMpIHtcbiAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh4cykgPT09ICdbb2JqZWN0IEFycmF5XSc7XG59O1xuXG5mdW5jdGlvbiBtYXAgKHhzLCBmKSB7XG4gIGlmICh4cy5tYXApIHJldHVybiB4cy5tYXAoZik7XG4gIHZhciByZXMgPSBbXTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB4cy5sZW5ndGg7IGkrKykge1xuICAgIHJlcy5wdXNoKGYoeHNbaV0sIGkpKTtcbiAgfVxuICByZXR1cm4gcmVzO1xufVxuXG52YXIgb2JqZWN0S2V5cyA9IE9iamVjdC5rZXlzIHx8IGZ1bmN0aW9uIChvYmopIHtcbiAgdmFyIHJlcyA9IFtdO1xuICBmb3IgKHZhciBrZXkgaW4gb2JqKSB7XG4gICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIGtleSkpIHJlcy5wdXNoKGtleSk7XG4gIH1cbiAgcmV0dXJuIHJlcztcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBpc1N0cmluZzogZnVuY3Rpb24oYXJnKSB7XG4gICAgcmV0dXJuIHR5cGVvZihhcmcpID09PSAnc3RyaW5nJztcbiAgfSxcbiAgaXNPYmplY3Q6IGZ1bmN0aW9uKGFyZykge1xuICAgIHJldHVybiB0eXBlb2YoYXJnKSA9PT0gJ29iamVjdCcgJiYgYXJnICE9PSBudWxsO1xuICB9LFxuICBpc051bGw6IGZ1bmN0aW9uKGFyZykge1xuICAgIHJldHVybiBhcmcgPT09IG51bGw7XG4gIH0sXG4gIGlzTnVsbE9yVW5kZWZpbmVkOiBmdW5jdGlvbihhcmcpIHtcbiAgICByZXR1cm4gYXJnID09IG51bGw7XG4gIH1cbn07XG4iLCIoZnVuY3Rpb24gKGdsb2JhbCwgZmFjdG9yeSkge1xuICB0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgPyBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKSA6XG4gIHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCA/IGRlZmluZShmYWN0b3J5KSA6XG4gIChnbG9iYWwucHJlYWN0ID0gZmFjdG9yeSgpKTtcbn0odGhpcywgZnVuY3Rpb24gKCkgeyAndXNlIHN0cmljdCc7XG5cbiAgZnVuY3Rpb24gVk5vZGUobm9kZU5hbWUsIGF0dHJpYnV0ZXMsIGNoaWxkcmVuKSB7XG4gIFx0LyoqIEB0eXBlIHtzdHJpbmd8ZnVuY3Rpb259ICovXG4gIFx0dGhpcy5ub2RlTmFtZSA9IG5vZGVOYW1lO1xuXG4gIFx0LyoqIEB0eXBlIHtvYmplY3Q8c3RyaW5nPnx1bmRlZmluZWR9ICovXG4gIFx0dGhpcy5hdHRyaWJ1dGVzID0gYXR0cmlidXRlcztcblxuICBcdC8qKiBAdHlwZSB7YXJyYXk8Vk5vZGU+fHVuZGVmaW5lZH0gKi9cbiAgXHR0aGlzLmNoaWxkcmVuID0gY2hpbGRyZW47XG4gIH1cblxuICB2YXIgTk9fUkVOREVSID0geyByZW5kZXI6IGZhbHNlIH07XG4gIHZhciBTWU5DX1JFTkRFUiA9IHsgcmVuZGVyU3luYzogdHJ1ZSB9O1xuICB2YXIgRE9NX1JFTkRFUiA9IHsgYnVpbGQ6IHRydWUgfTtcblxuICB2YXIgRU1QVFkgPSB7fTtcbiAgdmFyIEVNUFRZX0JBU0UgPSAnJztcblxuICAvLyBpcyB0aGlzIGEgRE9NIGVudmlyb25tZW50XG4gIHZhciBIQVNfRE9NID0gdHlwZW9mIGRvY3VtZW50ICE9PSAndW5kZWZpbmVkJztcbiAgdmFyIFRFWFRfQ09OVEVOVCA9ICFIQVNfRE9NIHx8ICd0ZXh0Q29udGVudCcgaW4gZG9jdW1lbnQgPyAndGV4dENvbnRlbnQnIDogJ25vZGVWYWx1ZSc7XG5cbiAgdmFyIEFUVFJfS0VZID0gdHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgPyBTeW1ib2woJ3ByZWFjdGF0dHInKSA6ICdfX3ByZWFjdGF0dHJfJztcblxuICB2YXIgVU5ERUZJTkVEX0VMRU1FTlQgPSAndW5kZWZpbmVkJztcblxuICAvLyBET00gcHJvcGVydGllcyB0aGF0IHNob3VsZCBOT1QgaGF2ZSBcInB4XCIgYWRkZWQgd2hlbiBudW1lcmljXG4gIHZhciBOT05fRElNRU5TSU9OX1BST1BTID0ge1xuICBcdGJveEZsZXg6IDEsIGJveEZsZXhHcm91cDogMSwgY29sdW1uQ291bnQ6IDEsIGZpbGxPcGFjaXR5OiAxLCBmbGV4OiAxLCBmbGV4R3JvdzogMSxcbiAgXHRmbGV4UG9zaXRpdmU6IDEsIGZsZXhTaHJpbms6IDEsIGZsZXhOZWdhdGl2ZTogMSwgZm9udFdlaWdodDogMSwgbGluZUNsYW1wOiAxLCBsaW5lSGVpZ2h0OiAxLFxuICBcdG9wYWNpdHk6IDEsIG9yZGVyOiAxLCBvcnBoYW5zOiAxLCBzdHJva2VPcGFjaXR5OiAxLCB3aWRvd3M6IDEsIHpJbmRleDogMSwgem9vbTogMVxuICB9O1xuXG4gIC8qKiBDb3B5IG93bi1wcm9wZXJ0aWVzIGZyb20gYHByb3BzYCBvbnRvIGBvYmpgLlxuICAgKlx0QHJldHVybnMgb2JqXG4gICAqXHRAcHJpdmF0ZVxuICAgKi9cblxuICBmdW5jdGlvbiBleHRlbmQob2JqLCBwcm9wcykge1xuICBcdGZvciAodmFyIGkgaW4gcHJvcHMpIHtcbiAgXHRcdGlmIChoYXNPd25Qcm9wZXJ0eS5jYWxsKHByb3BzLCBpKSkge1xuICBcdFx0XHRvYmpbaV0gPSBwcm9wc1tpXTtcbiAgXHRcdH1cbiAgXHR9cmV0dXJuIG9iajtcbiAgfVxuXG4gIC8qKiBGYXN0IGNsb25lLiBOb3RlOiBkb2VzIG5vdCBmaWx0ZXIgb3V0IG5vbi1vd24gcHJvcGVydGllcy4gKi9cblxuICBmdW5jdGlvbiBjbG9uZShvYmopIHtcbiAgXHR2YXIgb3V0ID0ge307XG4gIFx0Lyplc2xpbnQgZ3VhcmQtZm9yLWluOjAqL1xuICBcdGZvciAodmFyIGkgaW4gb2JqKSB7XG4gIFx0XHRvdXRbaV0gPSBvYmpbaV07XG4gIFx0fXJldHVybiBvdXQ7XG4gIH1cblxuICAvKiogQ3JlYXRlIGEgY2FjaGluZyB3cmFwcGVyIGZvciB0aGUgZ2l2ZW4gZnVuY3Rpb24uXG4gICAqXHRAcHJpdmF0ZVxuICAgKi9cblxuICBmdW5jdGlvbiBtZW1vaXplKGZuLCBtZW0pIHtcbiAgXHRtZW0gPSBtZW0gfHwge307XG4gIFx0cmV0dXJuIGZ1bmN0aW9uIChrKSB7XG4gIFx0XHRyZXR1cm4gaGFzT3duUHJvcGVydHkuY2FsbChtZW0sIGspID8gbWVtW2tdIDogbWVtW2tdID0gZm4oayk7XG4gIFx0fTtcbiAgfVxuXG4gIC8qKiBHZXQgYSBkZWVwIHByb3BlcnR5IHZhbHVlIGZyb20gdGhlIGdpdmVuIG9iamVjdCwgZXhwcmVzc2VkIGluIGRvdC1ub3RhdGlvbi5cbiAgICpcdEBwcml2YXRlXG4gICAqL1xuXG4gIGZ1bmN0aW9uIGRlbHZlKG9iaiwga2V5KSB7XG4gIFx0Zm9yICh2YXIgcCA9IGtleS5zcGxpdCgnLicpLCBpID0gMDsgaSA8IHAubGVuZ3RoICYmIG9iajsgaSsrKSB7XG4gIFx0XHRvYmogPSBvYmpbcF07XG4gIFx0fVxuICBcdHJldHVybiBvYmo7XG4gIH1cblxuICAvKiogQ29udmVydCBhbiBBcnJheS1saWtlIG9iamVjdCB0byBhbiBBcnJheVxuICAgKlx0QHByaXZhdGVcbiAgICovXG5cbiAgZnVuY3Rpb24gdG9BcnJheShvYmopIHtcbiAgXHR2YXIgYXJyID0gW10sXG4gIFx0ICAgIGkgPSBvYmoubGVuZ3RoO1xuICBcdHdoaWxlIChpLS0pIGFycltpXSA9IG9ialtpXTtcbiAgXHRyZXR1cm4gYXJyO1xuICB9XG5cbiAgLyoqIEBwcml2YXRlIGlzIHRoZSBnaXZlbiBvYmplY3QgYSBGdW5jdGlvbj8gKi9cbiAgdmFyIGlzRnVuY3Rpb24gPSBmdW5jdGlvbiBpc0Z1bmN0aW9uKG9iaikge1xuICBcdHJldHVybiAnZnVuY3Rpb24nID09PSB0eXBlb2Ygb2JqO1xuICB9O1xuXG4gIC8qKiBAcHJpdmF0ZSBpcyB0aGUgZ2l2ZW4gb2JqZWN0IGEgU3RyaW5nPyAqL1xuICB2YXIgaXNTdHJpbmcgPSBmdW5jdGlvbiBpc1N0cmluZyhvYmopIHtcbiAgXHRyZXR1cm4gJ3N0cmluZycgPT09IHR5cGVvZiBvYmo7XG4gIH07XG5cbiAgLyoqIEBwcml2YXRlIFNhZmUgcmVmZXJlbmNlIHRvIGJ1aWx0aW4gaGFzT3duUHJvcGVydHkgKi9cbiAgdmFyIGhhc093blByb3BlcnR5ID0gKHt9KS5oYXNPd25Qcm9wZXJ0eTtcblxuICAvKiogQ2hlY2sgaWYgYSB2YWx1ZSBpcyBgbnVsbGAgb3IgYHVuZGVmaW5lZGAuXG4gICAqXHRAcHJpdmF0ZVxuICAgKi9cbiAgdmFyIGVtcHR5ID0gZnVuY3Rpb24gZW1wdHkoeCkge1xuICBcdHJldHVybiB4ID09IG51bGw7XG4gIH07XG5cbiAgLyoqIENvbnZlcnQgYSBoYXNobWFwIG9mIHN0eWxlcyB0byBDU1NUZXh0XG4gICAqXHRAcHJpdmF0ZVxuICAgKi9cblxuICBmdW5jdGlvbiBzdHlsZU9ialRvQ3NzKHMpIHtcbiAgXHR2YXIgc3RyID0gJyc7XG4gIFx0Zm9yICh2YXIgcHJvcCBpbiBzKSB7XG4gIFx0XHRpZiAoaGFzT3duUHJvcGVydHkuY2FsbChzLCBwcm9wKSkge1xuICBcdFx0XHR2YXIgdmFsID0gc1twcm9wXTtcbiAgXHRcdFx0aWYgKCFlbXB0eSh2YWwpKSB7XG4gIFx0XHRcdFx0c3RyICs9IGpzVG9Dc3MocHJvcCk7XG4gIFx0XHRcdFx0c3RyICs9ICc6ICc7XG4gIFx0XHRcdFx0c3RyICs9IHZhbDtcbiAgXHRcdFx0XHRpZiAodHlwZW9mIHZhbCA9PT0gJ251bWJlcicgJiYgIU5PTl9ESU1FTlNJT05fUFJPUFNbcHJvcF0pIHtcbiAgXHRcdFx0XHRcdHN0ciArPSAncHgnO1xuICBcdFx0XHRcdH1cbiAgXHRcdFx0XHRzdHIgKz0gJzsgJztcbiAgXHRcdFx0fVxuICBcdFx0fVxuICBcdH1cbiAgXHRyZXR1cm4gc3RyO1xuICB9XG5cbiAgLyoqIENvbnZlcnQgYSBoYXNobWFwIG9mIENTUyBjbGFzc2VzIHRvIGEgc3BhY2UtZGVsaW1pdGVkIGNsYXNzTmFtZSBzdHJpbmdcbiAgICpcdEBwcml2YXRlXG4gICAqL1xuXG4gIGZ1bmN0aW9uIGhhc2hUb0NsYXNzTmFtZShjKSB7XG4gIFx0dmFyIHN0ciA9ICcnO1xuICBcdGZvciAodmFyIHByb3AgaW4gYykge1xuICBcdFx0aWYgKGNbcHJvcF0pIHtcbiAgXHRcdFx0aWYgKHN0cikgc3RyICs9ICcgJztcbiAgXHRcdFx0c3RyICs9IHByb3A7XG4gIFx0XHR9XG4gIFx0fVxuICBcdHJldHVybiBzdHI7XG4gIH1cblxuICAvKiogQ29udmVydCBhIEphdmFTY3JpcHQgY2FtZWwtY2FzZSBDU1MgcHJvcGVydHkgbmFtZSB0byBhIENTUyBwcm9wZXJ0eSBuYW1lXG4gICAqXHRAcHJpdmF0ZVxuICAgKlx0QGZ1bmN0aW9uXG4gICAqL1xuICB2YXIganNUb0NzcyA9IG1lbW9pemUoZnVuY3Rpb24gKHMpIHtcbiAgXHRyZXR1cm4gcy5yZXBsYWNlKC8oW0EtWl0pL2csICctJDEnKS50b0xvd2VyQ2FzZSgpO1xuICB9KTtcblxuICAvKiogSnVzdCBhIG1lbW9pemVkIFN0cmluZy5wcm90b3R5cGUudG9Mb3dlckNhc2UgKi9cbiAgdmFyIHRvTG93ZXJDYXNlID0gbWVtb2l6ZShmdW5jdGlvbiAocykge1xuICBcdHJldHVybiBzLnRvTG93ZXJDYXNlKCk7XG4gIH0pO1xuXG4gIC8vIEZvciBhbmltYXRpb25zLCByQUYgaXMgdmFzdGx5IHN1cGVyaW9yLiBIb3dldmVyLCBpdCBzY29yZXMgcG9vcmx5IG9uIGJlbmNobWFya3MgOihcbiAgLy8gZXhwb3J0IGNvbnN0IHNldEltbWVkaWF0ZSA9IHR5cGVvZiByZXF1ZXN0QW5pbWF0aW9uRnJhbWU9PT0nZnVuY3Rpb24nID8gcmVxdWVzdEFuaW1hdGlvbkZyYW1lIDogc2V0VGltZW91dDtcblxuICB2YXIgY2ggPSB1bmRlZmluZWQ7XG4gIHRyeSB7XG4gIFx0Y2ggPSBuZXcgTWVzc2FnZUNoYW5uZWwoKTtcbiAgfSBjYXRjaCAoZSkge31cblxuICAvKiogQ2FsbCBhIGZ1bmN0aW9uIGFzeW5jaHJvbm91c2x5LCBhcyBzb29uIGFzIHBvc3NpYmxlLlxuICAgKlx0QHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2tcbiAgICovXG4gIHZhciBzZXRJbW1lZGlhdGUgPSBjaCA/IGZ1bmN0aW9uIChmKSB7XG4gIFx0Y2gucG9ydDEub25tZXNzYWdlID0gZjtcbiAgXHRjaC5wb3J0Mi5wb3N0TWVzc2FnZSgnJyk7XG4gIH0gOiBzZXRUaW1lb3V0O1xuXG4gIC8qKiBHbG9iYWwgb3B0aW9uc1xuICAgKlx0QHB1YmxpY1xuICAgKlx0QG5hbWVzcGFjZSBvcHRpb25zIHtPYmplY3R9XG4gICAqL1xuICB2YXIgb3B0aW9ucyA9IHtcblxuICBcdC8qKiBJZiBgdHJ1ZWAsIGBwcm9wYCBjaGFuZ2VzIHRyaWdnZXIgc3luY2hyb25vdXMgY29tcG9uZW50IHVwZGF0ZXMuXG4gICAgKlx0QG5hbWUgc3luY0NvbXBvbmVudFVwZGF0ZXNcbiAgICAqXHRAdHlwZSBCb29sZWFuXG4gICAgKlx0QGRlZmF1bHQgdHJ1ZVxuICAgICovXG4gIFx0Ly9zeW5jQ29tcG9uZW50VXBkYXRlczogdHJ1ZSxcblxuICBcdC8qKiBQcm9jZXNzZXMgYWxsIGNyZWF0ZWQgVk5vZGVzLlxuICAgICpcdEBwYXJhbSB7Vk5vZGV9IHZub2RlXHRBIG5ld2x5LWNyZWF0ZWQgVk5vZGUgdG8gbm9ybWFsaXplL3Byb2Nlc3NcbiAgICAqL1xuICBcdHZub2RlOiBmdW5jdGlvbiB2bm9kZShuKSB7XG4gIFx0XHR2YXIgYXR0cnMgPSBuLmF0dHJpYnV0ZXM7XG4gIFx0XHRpZiAoIWF0dHJzIHx8IGlzRnVuY3Rpb24obi5ub2RlTmFtZSkpIHJldHVybjtcblxuICBcdFx0Ly8gbm9ybWFsaXplIGNsYXNzTmFtZSB0byBjbGFzcy5cbiAgXHRcdHZhciBwID0gYXR0cnMuY2xhc3NOYW1lO1xuICBcdFx0aWYgKHApIHtcbiAgXHRcdFx0YXR0cnNbJ2NsYXNzJ10gPSBwO1xuICBcdFx0XHRkZWxldGUgYXR0cnMuY2xhc3NOYW1lO1xuICBcdFx0fVxuXG4gIFx0XHRpZiAoYXR0cnNbJ2NsYXNzJ10pIG5vcm1hbGl6ZShhdHRycywgJ2NsYXNzJywgaGFzaFRvQ2xhc3NOYW1lKTtcbiAgXHRcdGlmIChhdHRycy5zdHlsZSkgbm9ybWFsaXplKGF0dHJzLCAnc3R5bGUnLCBzdHlsZU9ialRvQ3NzKTtcbiAgXHR9XG4gIH07XG5cbiAgZnVuY3Rpb24gbm9ybWFsaXplKG9iaiwgcHJvcCwgZm4pIHtcbiAgXHR2YXIgdiA9IG9ialtwcm9wXTtcbiAgXHRpZiAodiAmJiAhaXNTdHJpbmcodikpIHtcbiAgXHRcdG9ialtwcm9wXSA9IGZuKHYpO1xuICBcdH1cbiAgfVxuXG4gIC8qKiBJbnZva2UgYSBob29rIG9uIHRoZSBgb3B0aW9uc2AgZXhwb3J0LiAqL1xuXG4gIGZ1bmN0aW9uIG9wdGlvbnNIb29rKG5hbWUsIGEsIGIpIHtcbiAgXHRyZXR1cm4gaG9vayhvcHRpb25zLCBuYW1lLCBhLCBiKTtcbiAgfVxuXG4gIC8qKiBJbnZva2UgYSBcImhvb2tcIiBtZXRob2Qgd2l0aCBhcmd1bWVudHMgaWYgaXQgZXhpc3RzLlxuICAgKlx0QHByaXZhdGVcbiAgICovXG5cbiAgZnVuY3Rpb24gaG9vayhvYmosIG5hbWUsIGEsIGIsIGMpIHtcbiAgXHR2YXIgZm4gPSBvYmpbbmFtZV07XG4gIFx0aWYgKGZuICYmIGZuLmNhbGwpIHJldHVybiBmbi5jYWxsKG9iaiwgYSwgYiwgYyk7XG4gIH1cblxuICAvKiogSW52b2tlIGhvb2soKSBvbiBhIGNvbXBvbmVudCBhbmQgY2hpbGQgY29tcG9uZW50cyAocmVjdXJzaXZlbHkpXG4gICAqXHRAcHJpdmF0ZVxuICAgKi9cblxuICBmdW5jdGlvbiBkZWVwSG9vayhvYmosIHR5cGUpIHtcbiAgXHRkbyB7XG4gIFx0XHRob29rKG9iaiwgdHlwZSk7XG4gIFx0fSB3aGlsZSAob2JqID0gb2JqLl9jb21wb25lbnQpO1xuICB9XG5cbiAgdmFyIFNIQVJFRF9URU1QX0FSUkFZID0gW107XG5cbiAgLyoqIEpTWC9oeXBlcnNjcmlwdCByZXZpdmVyXG4gICAqXHRAc2VlIGh0dHA6Ly9qYXNvbmZvcm1hdC5jb20vd3RmLWlzLWpzeFxuICAgKlx0QHB1YmxpY1xuICAgKiAgQGV4YW1wbGVcbiAgICogIC8qKiBAanN4IGggKlxcL1xuICAgKiAgaW1wb3J0IHsgcmVuZGVyLCBoIH0gZnJvbSAncHJlYWN0JztcbiAgICogIHJlbmRlcig8c3Bhbj5mb288L3NwYW4+LCBkb2N1bWVudC5ib2R5KTtcbiAgICovXG4gIGZ1bmN0aW9uIGgobm9kZU5hbWUsIGF0dHJpYnV0ZXMpIHtcbiAgXHR2YXIgbGVuID0gYXJndW1lbnRzLmxlbmd0aCxcbiAgXHQgICAgY2hpbGRyZW4gPSB1bmRlZmluZWQsXG4gIFx0ICAgIGFyciA9IHVuZGVmaW5lZCxcbiAgXHQgICAgbGFzdFNpbXBsZSA9IHVuZGVmaW5lZDtcblxuICBcdGlmIChsZW4gPiAyKSB7XG4gIFx0XHRjaGlsZHJlbiA9IFtdO1xuICBcdFx0Zm9yICh2YXIgaSA9IDI7IGkgPCBsZW47IGkrKykge1xuICBcdFx0XHR2YXIgX3AgPSBhcmd1bWVudHNbaV07XG4gIFx0XHRcdGlmIChlbXB0eShfcCkpIGNvbnRpbnVlO1xuICBcdFx0XHRpZiAoX3Auam9pbikge1xuICBcdFx0XHRcdGFyciA9IF9wO1xuICBcdFx0XHR9IGVsc2Uge1xuICBcdFx0XHRcdGFyciA9IFNIQVJFRF9URU1QX0FSUkFZO1xuICBcdFx0XHRcdGFyclswXSA9IF9wO1xuICBcdFx0XHR9XG4gIFx0XHRcdGZvciAodmFyIGogPSAwOyBqIDwgYXJyLmxlbmd0aDsgaisrKSB7XG4gIFx0XHRcdFx0dmFyIGNoaWxkID0gYXJyW2pdLFxuICBcdFx0XHRcdCAgICBzaW1wbGUgPSAhZW1wdHkoY2hpbGQpICYmICEoY2hpbGQgaW5zdGFuY2VvZiBWTm9kZSk7XG4gIFx0XHRcdFx0aWYgKHNpbXBsZSkgY2hpbGQgPSBTdHJpbmcoY2hpbGQpO1xuICBcdFx0XHRcdGlmIChzaW1wbGUgJiYgbGFzdFNpbXBsZSkge1xuICBcdFx0XHRcdFx0Y2hpbGRyZW5bY2hpbGRyZW4ubGVuZ3RoIC0gMV0gKz0gY2hpbGQ7XG4gIFx0XHRcdFx0fSBlbHNlIGlmICghZW1wdHkoY2hpbGQpKSB7XG4gIFx0XHRcdFx0XHRjaGlsZHJlbi5wdXNoKGNoaWxkKTtcbiAgXHRcdFx0XHR9XG4gIFx0XHRcdFx0bGFzdFNpbXBsZSA9IHNpbXBsZTtcbiAgXHRcdFx0fVxuICBcdFx0fVxuICBcdH1cblxuICBcdGlmIChhdHRyaWJ1dGVzICYmIGF0dHJpYnV0ZXMuY2hpbGRyZW4pIHtcbiAgXHRcdGRlbGV0ZSBhdHRyaWJ1dGVzLmNoaWxkcmVuO1xuICBcdH1cblxuICBcdHZhciBwID0gbmV3IFZOb2RlKG5vZGVOYW1lLCBhdHRyaWJ1dGVzIHx8IHVuZGVmaW5lZCwgY2hpbGRyZW4gfHwgdW5kZWZpbmVkKTtcbiAgXHRvcHRpb25zSG9vaygndm5vZGUnLCBwKTtcbiAgXHRyZXR1cm4gcDtcbiAgfVxuXG4gIC8qKiBDcmVhdGUgYW4gRXZlbnQgaGFuZGxlciBmdW5jdGlvbiB0aGF0IHNldHMgYSBnaXZlbiBzdGF0ZSBwcm9wZXJ0eS5cbiAgICpcdEBwYXJhbSB7Q29tcG9uZW50fSBjb21wb25lbnRcdFRoZSBjb21wb25lbnQgd2hvc2Ugc3RhdGUgc2hvdWxkIGJlIHVwZGF0ZWRcbiAgICpcdEBwYXJhbSB7c3RyaW5nfSBrZXlcdFx0XHRcdEEgZG90LW5vdGF0ZWQga2V5IHBhdGggdG8gdXBkYXRlIGluIHRoZSBjb21wb25lbnQncyBzdGF0ZVxuICAgKlx0QHBhcmFtIHtzdHJpbmd9IGV2ZW50UGF0aFx0XHRBIGRvdC1ub3RhdGVkIGtleSBwYXRoIHRvIHRoZSB2YWx1ZSB0aGF0IHNob3VsZCBiZSByZXRyaWV2ZWQgZnJvbSB0aGUgRXZlbnQgb3IgY29tcG9uZW50XG4gICAqXHRAcmV0dXJucyB7ZnVuY3Rpb259IGxpbmtlZFN0YXRlSGFuZGxlclxuICAgKlx0QHByaXZhdGVcbiAgICovXG5cbiAgZnVuY3Rpb24gY3JlYXRlTGlua2VkU3RhdGUoY29tcG9uZW50LCBrZXksIGV2ZW50UGF0aCkge1xuICBcdHZhciBwYXRoID0ga2V5LnNwbGl0KCcuJyksXG4gIFx0ICAgIHAwID0gcGF0aFswXSxcbiAgXHQgICAgbGVuID0gcGF0aC5sZW5ndGg7XG4gIFx0cmV0dXJuIGZ1bmN0aW9uIChlKSB7XG4gIFx0XHR2YXIgX2NvbXBvbmVudCRzZXRTdGF0ZTtcblxuICBcdFx0dmFyIHQgPSB0aGlzLFxuICBcdFx0ICAgIHMgPSBjb21wb25lbnQuc3RhdGUsXG4gIFx0XHQgICAgb2JqID0gcyxcbiAgXHRcdCAgICB2ID0gdW5kZWZpbmVkLFxuICBcdFx0ICAgIGkgPSB1bmRlZmluZWQ7XG4gIFx0XHRpZiAoaXNTdHJpbmcoZXZlbnRQYXRoKSkge1xuICBcdFx0XHR2ID0gZGVsdmUoZSwgZXZlbnRQYXRoKTtcbiAgXHRcdFx0aWYgKGVtcHR5KHYpICYmICh0ID0gdC5fY29tcG9uZW50KSkge1xuICBcdFx0XHRcdHYgPSBkZWx2ZSh0LCBldmVudFBhdGgpO1xuICBcdFx0XHR9XG4gIFx0XHR9IGVsc2Uge1xuICBcdFx0XHR2ID0gKHQubm9kZU5hbWUgKyB0LnR5cGUpLm1hdGNoKC9eaW5wdXQoY2hlY2tib3h8cmFkaW8pJC9pKSA/IHQuY2hlY2tlZCA6IHQudmFsdWU7XG4gIFx0XHR9XG4gIFx0XHRpZiAoaXNGdW5jdGlvbih2KSkgdiA9IHYuY2FsbCh0KTtcbiAgXHRcdGlmIChsZW4gPiAxKSB7XG4gIFx0XHRcdGZvciAoaSA9IDA7IGkgPCBsZW4gLSAxOyBpKyspIHtcbiAgXHRcdFx0XHRvYmogPSBvYmpbcGF0aFtpXV0gfHwgKG9ialtwYXRoW2ldXSA9IHt9KTtcbiAgXHRcdFx0fVxuICBcdFx0XHRvYmpbcGF0aFtpXV0gPSB2O1xuICBcdFx0XHR2ID0gc1twMF07XG4gIFx0XHR9XG4gIFx0XHRjb21wb25lbnQuc2V0U3RhdGUoKF9jb21wb25lbnQkc2V0U3RhdGUgPSB7fSwgX2NvbXBvbmVudCRzZXRTdGF0ZVtwMF0gPSB2LCBfY29tcG9uZW50JHNldFN0YXRlKSk7XG4gIFx0fTtcbiAgfVxuXG4gIHZhciBpdGVtcyA9IFtdO1xuICB2YXIgaXRlbXNPZmZsaW5lID0gW107XG4gIGZ1bmN0aW9uIGVucXVldWVSZW5kZXIoY29tcG9uZW50KSB7XG4gIFx0aWYgKGl0ZW1zLnB1c2goY29tcG9uZW50KSAhPT0gMSkgcmV0dXJuO1xuXG4gIFx0KG9wdGlvbnMuZGVib3VuY2VSZW5kZXJpbmcgfHwgc2V0SW1tZWRpYXRlKShyZXJlbmRlcik7XG4gIH1cblxuICBmdW5jdGlvbiByZXJlbmRlcigpIHtcbiAgXHRpZiAoIWl0ZW1zLmxlbmd0aCkgcmV0dXJuO1xuXG4gIFx0dmFyIGN1cnJlbnRJdGVtcyA9IGl0ZW1zLFxuICBcdCAgICBwID0gdW5kZWZpbmVkO1xuXG4gIFx0Ly8gc3dhcCBvbmxpbmUgJiBvZmZsaW5lXG4gIFx0aXRlbXMgPSBpdGVtc09mZmxpbmU7XG4gIFx0aXRlbXNPZmZsaW5lID0gY3VycmVudEl0ZW1zO1xuXG4gIFx0d2hpbGUgKHAgPSBjdXJyZW50SXRlbXMucG9wKCkpIHtcbiAgXHRcdGlmIChwLl9kaXJ0eSkgcmVuZGVyQ29tcG9uZW50KHApO1xuICBcdH1cbiAgfVxuXG4gIC8qKiBDaGVjayBpZiBhIFZOb2RlIGlzIGEgcmVmZXJlbmNlIHRvIGEgc3RhdGVsZXNzIGZ1bmN0aW9uYWwgY29tcG9uZW50LlxuICAgKlx0QSBmdW5jdGlvbiBjb21wb25lbnQgaXMgcmVwcmVzZW50ZWQgYXMgYSBWTm9kZSB3aG9zZSBgbm9kZU5hbWVgIHByb3BlcnR5IGlzIGEgcmVmZXJlbmNlIHRvIGEgZnVuY3Rpb24uXG4gICAqXHRJZiB0aGF0IGZ1bmN0aW9uIGlzIG5vdCBhIENvbXBvbmVudCAoaWUsIGhhcyBubyBgLnJlbmRlcigpYCBtZXRob2Qgb24gYSBwcm90b3R5cGUpLCBpdCBpcyBjb25zaWRlcmVkIGEgc3RhdGVsZXNzIGZ1bmN0aW9uYWwgY29tcG9uZW50LlxuICAgKlx0QHBhcmFtIHtWTm9kZX0gdm5vZGVcdEEgVk5vZGVcbiAgICpcdEBwcml2YXRlXG4gICAqL1xuXG4gIGZ1bmN0aW9uIGlzRnVuY3Rpb25hbENvbXBvbmVudChfcmVmKSB7XG4gICAgdmFyIG5vZGVOYW1lID0gX3JlZi5ub2RlTmFtZTtcblxuICAgIHJldHVybiBpc0Z1bmN0aW9uKG5vZGVOYW1lKSAmJiAhbm9kZU5hbWUucHJvdG90eXBlLnJlbmRlcjtcbiAgfVxuXG4gIC8qKiBDb25zdHJ1Y3QgYSByZXN1bHRhbnQgVk5vZGUgZnJvbSBhIFZOb2RlIHJlZmVyZW5jaW5nIGEgc3RhdGVsZXNzIGZ1bmN0aW9uYWwgY29tcG9uZW50LlxuICAgKlx0QHBhcmFtIHtWTm9kZX0gdm5vZGVcdEEgVk5vZGUgd2l0aCBhIGBub2RlTmFtZWAgcHJvcGVydHkgdGhhdCBpcyBhIHJlZmVyZW5jZSB0byBhIGZ1bmN0aW9uLlxuICAgKlx0QHByaXZhdGVcbiAgICovXG5cbiAgZnVuY3Rpb24gYnVpbGRGdW5jdGlvbmFsQ29tcG9uZW50KHZub2RlLCBjb250ZXh0KSB7XG4gICAgcmV0dXJuIHZub2RlLm5vZGVOYW1lKGdldE5vZGVQcm9wcyh2bm9kZSksIGNvbnRleHQpIHx8IEVNUFRZX0JBU0U7XG4gIH1cblxuICBmdW5jdGlvbiBlbnN1cmVOb2RlRGF0YShub2RlKSB7XG4gIFx0cmV0dXJuIG5vZGVbQVRUUl9LRVldIHx8IChub2RlW0FUVFJfS0VZXSA9IHt9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGdldE5vZGVUeXBlKG5vZGUpIHtcbiAgXHRyZXR1cm4gbm9kZS5ub2RlVHlwZTtcbiAgfVxuXG4gIC8qKiBBcHBlbmQgbXVsdGlwbGUgY2hpbGRyZW4gdG8gYSBOb2RlLlxuICAgKlx0VXNlcyBhIERvY3VtZW50IEZyYWdtZW50IHRvIGJhdGNoIHdoZW4gYXBwZW5kaW5nIDIgb3IgbW9yZSBjaGlsZHJlblxuICAgKlx0QHByaXZhdGVcbiAgICovXG5cbiAgZnVuY3Rpb24gYXBwZW5kQ2hpbGRyZW4ocGFyZW50LCBjaGlsZHJlbikge1xuICBcdHZhciBsZW4gPSBjaGlsZHJlbi5sZW5ndGgsXG4gIFx0ICAgIG1hbnkgPSBsZW4gPiAyLFxuICBcdCAgICBpbnRvID0gbWFueSA/IGRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKSA6IHBhcmVudDtcbiAgXHRmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gIFx0XHRpbnRvLmFwcGVuZENoaWxkKGNoaWxkcmVuW2ldKTtcbiAgXHR9aWYgKG1hbnkpIHBhcmVudC5hcHBlbmRDaGlsZChpbnRvKTtcbiAgfVxuXG4gIC8qKiBSZXRyaWV2ZSB0aGUgdmFsdWUgb2YgYSByZW5kZXJlZCBhdHRyaWJ1dGVcbiAgICpcdEBwcml2YXRlXG4gICAqL1xuXG4gIGZ1bmN0aW9uIGdldEFjY2Vzc29yKG5vZGUsIG5hbWUsIHZhbHVlLCBjYWNoZSkge1xuICBcdGlmIChuYW1lICE9PSAndHlwZScgJiYgbmFtZSAhPT0gJ3N0eWxlJyAmJiBuYW1lIGluIG5vZGUpIHJldHVybiBub2RlW25hbWVdO1xuICBcdHZhciBhdHRycyA9IG5vZGVbQVRUUl9LRVldO1xuICBcdGlmIChjYWNoZSAhPT0gZmFsc2UgJiYgYXR0cnMgJiYgaGFzT3duUHJvcGVydHkuY2FsbChhdHRycywgbmFtZSkpIHJldHVybiBhdHRyc1tuYW1lXTtcbiAgXHRpZiAobmFtZSA9PT0gJ2NsYXNzJykgcmV0dXJuIG5vZGUuY2xhc3NOYW1lO1xuICBcdGlmIChuYW1lID09PSAnc3R5bGUnKSByZXR1cm4gbm9kZS5zdHlsZS5jc3NUZXh0O1xuICBcdHJldHVybiB2YWx1ZTtcbiAgfVxuXG4gIC8qKiBTZXQgYSBuYW1lZCBhdHRyaWJ1dGUgb24gdGhlIGdpdmVuIE5vZGUsIHdpdGggc3BlY2lhbCBiZWhhdmlvciBmb3Igc29tZSBuYW1lcyBhbmQgZXZlbnQgaGFuZGxlcnMuXG4gICAqXHRJZiBgdmFsdWVgIGlzIGBudWxsYCwgdGhlIGF0dHJpYnV0ZS9oYW5kbGVyIHdpbGwgYmUgcmVtb3ZlZC5cbiAgICpcdEBwYXJhbSB7RWxlbWVudH0gbm9kZVx0QW4gZWxlbWVudCB0byBtdXRhdGVcbiAgICpcdEBwYXJhbSB7c3RyaW5nfSBuYW1lXHRUaGUgbmFtZS9rZXkgdG8gc2V0LCBzdWNoIGFzIGFuIGV2ZW50IG9yIGF0dHJpYnV0ZSBuYW1lXG4gICAqXHRAcGFyYW0ge2FueX0gdmFsdWVcdFx0QW4gYXR0cmlidXRlIHZhbHVlLCBzdWNoIGFzIGEgZnVuY3Rpb24gdG8gYmUgdXNlZCBhcyBhbiBldmVudCBoYW5kbGVyXG4gICAqXHRAcGFyYW0ge2FueX0gcHJldmlvdXNWYWx1ZVx0VGhlIGxhc3QgdmFsdWUgdGhhdCB3YXMgc2V0IGZvciB0aGlzIG5hbWUvbm9kZSBwYWlyXG4gICAqXHRAcHJpdmF0ZVxuICAgKi9cblxuICBmdW5jdGlvbiBzZXRBY2Nlc3Nvcihub2RlLCBuYW1lLCB2YWx1ZSkge1xuICBcdGlmIChuYW1lID09PSAnY2xhc3MnKSB7XG4gIFx0XHRub2RlLmNsYXNzTmFtZSA9IHZhbHVlIHx8ICcnO1xuICBcdH0gZWxzZSBpZiAobmFtZSA9PT0gJ3N0eWxlJykge1xuICBcdFx0bm9kZS5zdHlsZS5jc3NUZXh0ID0gdmFsdWUgfHwgJyc7XG4gIFx0fSBlbHNlIGlmIChuYW1lID09PSAnZGFuZ2Vyb3VzbHlTZXRJbm5lckhUTUwnKSB7XG4gIFx0XHRub2RlLmlubmVySFRNTCA9IHZhbHVlLl9faHRtbDtcbiAgXHR9IGVsc2UgaWYgKG5hbWUgPT09ICdrZXknIHx8IG5hbWUgaW4gbm9kZSAmJiBuYW1lICE9PSAndHlwZScpIHtcbiAgXHRcdG5vZGVbbmFtZV0gPSB2YWx1ZTtcbiAgXHR9IGVsc2Uge1xuICBcdFx0c2V0Q29tcGxleEFjY2Vzc29yKG5vZGUsIG5hbWUsIHZhbHVlKTtcbiAgXHR9XG5cbiAgXHRlbnN1cmVOb2RlRGF0YShub2RlKVtuYW1lXSA9IHZhbHVlO1xuICB9XG5cbiAgLyoqIEZvciBwcm9wcyB3aXRob3V0IGV4cGxpY2l0IGJlaGF2aW9yLCBhcHBseSB0byBhIE5vZGUgYXMgZXZlbnQgaGFuZGxlcnMgb3IgYXR0cmlidXRlcy5cbiAgICpcdEBwcml2YXRlXG4gICAqL1xuICBmdW5jdGlvbiBzZXRDb21wbGV4QWNjZXNzb3Iobm9kZSwgbmFtZSwgdmFsdWUpIHtcbiAgXHRpZiAobmFtZS5zdWJzdHJpbmcoMCwgMikgPT09ICdvbicpIHtcbiAgXHRcdHZhciBfdHlwZSA9IG5vcm1hbGl6ZUV2ZW50TmFtZShuYW1lKSxcbiAgXHRcdCAgICBsID0gbm9kZS5fbGlzdGVuZXJzIHx8IChub2RlLl9saXN0ZW5lcnMgPSB7fSksXG4gIFx0XHQgICAgZm4gPSAhbFtfdHlwZV0gPyAnYWRkJyA6ICF2YWx1ZSA/ICdyZW1vdmUnIDogbnVsbDtcbiAgXHRcdGlmIChmbikgbm9kZVtmbiArICdFdmVudExpc3RlbmVyJ10oX3R5cGUsIGV2ZW50UHJveHkpO1xuICBcdFx0bFtfdHlwZV0gPSB2YWx1ZTtcbiAgXHRcdHJldHVybjtcbiAgXHR9XG5cbiAgXHR2YXIgdHlwZSA9IHR5cGVvZiB2YWx1ZTtcbiAgXHRpZiAodmFsdWUgPT09IG51bGwpIHtcbiAgXHRcdG5vZGUucmVtb3ZlQXR0cmlidXRlKG5hbWUpO1xuICBcdH0gZWxzZSBpZiAodHlwZSAhPT0gJ2Z1bmN0aW9uJyAmJiB0eXBlICE9PSAnb2JqZWN0Jykge1xuICBcdFx0bm9kZS5zZXRBdHRyaWJ1dGUobmFtZSwgdmFsdWUpO1xuICBcdH1cbiAgfVxuXG4gIC8qKiBQcm94eSBhbiBldmVudCB0byBob29rZWQgZXZlbnQgaGFuZGxlcnNcbiAgICpcdEBwcml2YXRlXG4gICAqL1xuICBmdW5jdGlvbiBldmVudFByb3h5KGUpIHtcbiAgXHR2YXIgZm4gPSB0aGlzLl9saXN0ZW5lcnNbbm9ybWFsaXplRXZlbnROYW1lKGUudHlwZSldO1xuICBcdGlmIChmbikgcmV0dXJuIGZuLmNhbGwodGhpcywgb3B0aW9uc0hvb2soJ2V2ZW50JywgZSkgfHwgZSk7XG4gIH1cblxuICAvKiogQ29udmVydCBhbiBFdmVudCBuYW1lL3R5cGUgdG8gbG93ZXJjYXNlIGFuZCBzdHJpcCBhbnkgXCJvbipcIiBwcmVmaXguXG4gICAqXHRAZnVuY3Rpb25cbiAgICpcdEBwcml2YXRlXG4gICAqL1xuICB2YXIgbm9ybWFsaXplRXZlbnROYW1lID0gbWVtb2l6ZShmdW5jdGlvbiAodCkge1xuICBcdHJldHVybiB0LnJlcGxhY2UoL15vbi9pLCAnJykudG9Mb3dlckNhc2UoKTtcbiAgfSk7XG5cbiAgLyoqIEdldCBhIGhhc2htYXAgb2Ygbm9kZSBwcm9wZXJ0aWVzLCBwcmVmZXJyaW5nIHByZWFjdCdzIGNhY2hlZCBwcm9wZXJ0eSB2YWx1ZXMgb3ZlciB0aGUgRE9NJ3NcbiAgICpcdEBwcml2YXRlXG4gICAqL1xuXG4gIGZ1bmN0aW9uIGdldE5vZGVBdHRyaWJ1dGVzKG5vZGUpIHtcbiAgXHRyZXR1cm4gbm9kZVtBVFRSX0tFWV0gfHwgZ2V0UmF3Tm9kZUF0dHJpYnV0ZXMobm9kZSkgfHwgRU1QVFk7XG4gIFx0Ly8gbGV0IGxpc3QgPSBnZXRSYXdOb2RlQXR0cmlidXRlcyhub2RlKSxcbiAgXHQvLyBcdGwgPSBub2RlW0FUVFJfS0VZXTtcbiAgXHQvLyByZXR1cm4gbCAmJiBsaXN0ID8gZXh0ZW5kKGxpc3QsIGwpIDogKGwgfHwgbGlzdCB8fCBFTVBUWSk7XG4gIH1cblxuICAvKiogR2V0IGEgbm9kZSdzIGF0dHJpYnV0ZXMgYXMgYSBoYXNobWFwLCByZWdhcmRsZXNzIG9mIHR5cGUuXG4gICAqXHRAcHJpdmF0ZVxuICAgKi9cbiAgZnVuY3Rpb24gZ2V0UmF3Tm9kZUF0dHJpYnV0ZXMobm9kZSkge1xuICBcdHZhciBsaXN0ID0gbm9kZS5hdHRyaWJ1dGVzO1xuICBcdGlmICghbGlzdCB8fCAhbGlzdC5nZXROYW1lZEl0ZW0pIHJldHVybiBsaXN0O1xuICBcdHJldHVybiBnZXRBdHRyaWJ1dGVzQXNPYmplY3QobGlzdCk7XG4gIH1cblxuICAvKiogQ29udmVydCBhIERPTSBgLmF0dHJpYnV0ZXNgIE5hbWVkTm9kZU1hcCB0byBhIGhhc2htYXAuXG4gICAqXHRAcHJpdmF0ZVxuICAgKi9cbiAgZnVuY3Rpb24gZ2V0QXR0cmlidXRlc0FzT2JqZWN0KGxpc3QpIHtcbiAgXHR2YXIgYXR0cnMgPSB1bmRlZmluZWQ7XG4gIFx0Zm9yICh2YXIgaSA9IGxpc3QubGVuZ3RoOyBpLS07KSB7XG4gIFx0XHR2YXIgaXRlbSA9IGxpc3RbaV07XG4gIFx0XHRpZiAoIWF0dHJzKSBhdHRycyA9IHt9O1xuICBcdFx0YXR0cnNbaXRlbS5uYW1lXSA9IGl0ZW0udmFsdWU7XG4gIFx0fVxuICBcdHJldHVybiBhdHRycztcbiAgfVxuXG4gIC8qKiBDaGVjayBpZiB0d28gbm9kZXMgYXJlIGVxdWl2YWxlbnQuXG4gICAqXHRAcGFyYW0ge0VsZW1lbnR9IG5vZGVcbiAgICpcdEBwYXJhbSB7Vk5vZGV9IHZub2RlXG4gICAqXHRAcHJpdmF0ZVxuICAgKi9cblxuICBmdW5jdGlvbiBpc1NhbWVOb2RlVHlwZShub2RlLCB2bm9kZSkge1xuICBcdGlmIChpc0Z1bmN0aW9uYWxDb21wb25lbnQodm5vZGUpKSByZXR1cm4gdHJ1ZTtcbiAgXHR2YXIgbm9kZU5hbWUgPSB2bm9kZS5ub2RlTmFtZTtcbiAgXHRpZiAoaXNGdW5jdGlvbihub2RlTmFtZSkpIHJldHVybiBub2RlLl9jb21wb25lbnRDb25zdHJ1Y3RvciA9PT0gbm9kZU5hbWU7XG4gIFx0aWYgKGdldE5vZGVUeXBlKG5vZGUpID09PSAzKSByZXR1cm4gaXNTdHJpbmcodm5vZGUpO1xuICBcdHJldHVybiB0b0xvd2VyQ2FzZShub2RlLm5vZGVOYW1lKSA9PT0gbm9kZU5hbWU7XG4gIH1cblxuICAvKipcbiAgICogUmVjb25zdHJ1Y3QgQ29tcG9uZW50LXN0eWxlIGBwcm9wc2AgZnJvbSBhIFZOb2RlLlxuICAgKiBFbnN1cmVzIGRlZmF1bHQvZmFsbGJhY2sgdmFsdWVzIGZyb20gYGRlZmF1bHRQcm9wc2A6XG4gICAqIE93bi1wcm9wZXJ0aWVzIG9mIGBkZWZhdWx0UHJvcHNgIG5vdCBwcmVzZW50IGluIGB2bm9kZS5hdHRyaWJ1dGVzYCBhcmUgYWRkZWQuXG4gICAqIEBwYXJhbSB7Vk5vZGV9IHZub2RlXG4gICAqIEByZXR1cm5zIHtPYmplY3R9IHByb3BzXG4gICAqL1xuXG4gIGZ1bmN0aW9uIGdldE5vZGVQcm9wcyh2bm9kZSkge1xuICBcdHZhciBwcm9wcyA9IGNsb25lKHZub2RlLmF0dHJpYnV0ZXMpLFxuICBcdCAgICBjID0gdm5vZGUuY2hpbGRyZW47XG4gIFx0aWYgKGMpIHByb3BzLmNoaWxkcmVuID0gYztcblxuICBcdHZhciBkZWZhdWx0UHJvcHMgPSB2bm9kZS5ub2RlTmFtZS5kZWZhdWx0UHJvcHM7XG4gIFx0aWYgKGRlZmF1bHRQcm9wcykge1xuICBcdFx0Zm9yICh2YXIgaSBpbiBkZWZhdWx0UHJvcHMpIHtcbiAgXHRcdFx0aWYgKGhhc093blByb3BlcnR5LmNhbGwoZGVmYXVsdFByb3BzLCBpKSAmJiAhKGkgaW4gcHJvcHMpKSB7XG4gIFx0XHRcdFx0cHJvcHNbaV0gPSBkZWZhdWx0UHJvcHNbaV07XG4gIFx0XHRcdH1cbiAgXHRcdH1cbiAgXHR9XG5cbiAgXHRyZXR1cm4gcHJvcHM7XG4gIH1cblxuICAvKiogRE9NIG5vZGUgcG9vbCwga2V5ZWQgb24gbm9kZU5hbWUuICovXG5cbiAgdmFyIG5vZGVzID0ge307XG5cbiAgdmFyIG5vcm1hbGl6ZU5hbWUgPSBtZW1vaXplKGZ1bmN0aW9uIChuYW1lKSB7XG4gIFx0cmV0dXJuIG5hbWUudG9VcHBlckNhc2UoKTtcbiAgfSk7XG5cbiAgZnVuY3Rpb24gY29sbGVjdE5vZGUobm9kZSkge1xuICBcdGNsZWFuTm9kZShub2RlKTtcbiAgXHR2YXIgbmFtZSA9IG5vcm1hbGl6ZU5hbWUobm9kZS5ub2RlTmFtZSksXG4gIFx0ICAgIGxpc3QgPSBub2Rlc1tuYW1lXTtcbiAgXHRpZiAobGlzdCkgbGlzdC5wdXNoKG5vZGUpO2Vsc2Ugbm9kZXNbbmFtZV0gPSBbbm9kZV07XG4gIH1cblxuICBmdW5jdGlvbiBjcmVhdGVOb2RlKG5vZGVOYW1lKSB7XG4gIFx0dmFyIG5hbWUgPSBub3JtYWxpemVOYW1lKG5vZGVOYW1lKSxcbiAgXHQgICAgbGlzdCA9IG5vZGVzW25hbWVdLFxuICBcdCAgICBub2RlID0gbGlzdCAmJiBsaXN0LnBvcCgpIHx8IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQobm9kZU5hbWUpO1xuICBcdGVuc3VyZU5vZGVEYXRhKG5vZGUpO1xuICBcdHJldHVybiBub2RlO1xuICB9XG5cbiAgZnVuY3Rpb24gY2xlYW5Ob2RlKG5vZGUpIHtcbiAgXHR2YXIgcCA9IG5vZGUucGFyZW50Tm9kZTtcbiAgXHRpZiAocCkgcC5yZW1vdmVDaGlsZChub2RlKTtcblxuICBcdGlmIChnZXROb2RlVHlwZShub2RlKSA9PT0gMykgcmV0dXJuO1xuXG4gIFx0bm9kZS5fY29tcG9uZW50ID0gbm9kZS5fY29tcG9uZW50Q29uc3RydWN0b3IgPSBudWxsO1xuXG4gIFx0Ly8gaWYgKG5vZGUuY2hpbGROb2Rlcy5sZW5ndGg+MCkge1xuICBcdC8vIFx0Y29uc29sZS50cmFjZShgV2FybmluZzogUmVjeWNsZXIgY29sbGVjdGluZyA8JHtub2RlLm5vZGVOYW1lfT4gd2l0aCAke25vZGUuY2hpbGROb2Rlcy5sZW5ndGh9IGNoaWxkcmVuLmApO1xuICBcdC8vIFx0Zm9yIChsZXQgaT1ub2RlLmNoaWxkTm9kZXMubGVuZ3RoOyBpLS07ICkgY29sbGVjdE5vZGUobm9kZS5jaGlsZE5vZGVzW2ldKTtcbiAgXHQvLyB9XG4gIH1cblxuICAvKiogQXBwbHkgZGlmZmVyZW5jZXMgaW4gYSBnaXZlbiB2bm9kZSAoYW5kIGl0J3MgZGVlcCBjaGlsZHJlbikgdG8gYSByZWFsIERPTSBOb2RlLlxuICAgKlx0QHBhcmFtIHtFbGVtZW50fSBbZG9tPW51bGxdXHRcdEEgRE9NIG5vZGUgdG8gbXV0YXRlIGludG8gdGhlIHNoYXBlIG9mIHRoZSBgdm5vZGVgXG4gICAqXHRAcGFyYW0ge1ZOb2RlfSB2bm9kZVx0XHRcdEEgVk5vZGUgKHdpdGggZGVzY2VuZGFudHMgZm9ybWluZyBhIHRyZWUpIHJlcHJlc2VudGluZyB0aGUgZGVzaXJlZCBET00gc3RydWN0dXJlXG4gICAqXHRAcmV0dXJucyB7RWxlbWVudH0gZG9tXHRcdFx0VGhlIGNyZWF0ZWQvbXV0YXRlZCBlbGVtZW50XG4gICAqXHRAcHJpdmF0ZVxuICAgKi9cbiAgZnVuY3Rpb24gZGlmZihkb20sIHZub2RlLCBjb250ZXh0LCBjb21wb25lbnQpIHtcbiAgXHR3aGlsZSAoaXNGdW5jdGlvbmFsQ29tcG9uZW50KHZub2RlKSkge1xuICBcdFx0dm5vZGUgPSBidWlsZEZ1bmN0aW9uYWxDb21wb25lbnQodm5vZGUsIGNvbnRleHQpO1xuICBcdH1cblxuICBcdGlmIChpc0Z1bmN0aW9uKHZub2RlLm5vZGVOYW1lKSkge1xuICBcdFx0cmV0dXJuIGJ1aWxkQ29tcG9uZW50RnJvbVZOb2RlKGRvbSwgdm5vZGUsIGNvbnRleHQpO1xuICBcdH1cblxuICBcdGlmIChpc1N0cmluZyh2bm9kZSkpIHtcbiAgXHRcdGlmIChkb20pIHtcbiAgXHRcdFx0dmFyIHR5cGUgPSBnZXROb2RlVHlwZShkb20pO1xuICBcdFx0XHRpZiAodHlwZSA9PT0gMykge1xuICBcdFx0XHRcdGRvbVtURVhUX0NPTlRFTlRdID0gdm5vZGU7XG4gIFx0XHRcdFx0cmV0dXJuIGRvbTtcbiAgXHRcdFx0fSBlbHNlIGlmICh0eXBlID09PSAxKSB7XG4gIFx0XHRcdFx0Y29sbGVjdE5vZGUoZG9tKTtcbiAgXHRcdFx0fVxuICBcdFx0fVxuICBcdFx0cmV0dXJuIGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHZub2RlKTtcbiAgXHR9XG5cbiAgXHQvLyByZXR1cm4gZGlmZk5vZGUoZG9tLCB2bm9kZSwgY29udGV4dCk7XG4gIFx0Ly8gfVxuXG4gIFx0LyoqIE1vcnBoIGEgRE9NIG5vZGUgdG8gbG9vayBsaWtlIHRoZSBnaXZlbiBWTm9kZS4gQ3JlYXRlcyBET00gaWYgaXQgZG9lc24ndCBleGlzdC4gKi9cbiAgXHQvLyBmdW5jdGlvbiBkaWZmTm9kZShkb20sIHZub2RlLCBjb250ZXh0KSB7XG4gIFx0dmFyIG91dCA9IGRvbSxcbiAgXHQgICAgbm9kZU5hbWUgPSB2bm9kZS5ub2RlTmFtZSB8fCBVTkRFRklORURfRUxFTUVOVDtcblxuICBcdGlmICghZG9tKSB7XG4gIFx0XHRvdXQgPSBjcmVhdGVOb2RlKG5vZGVOYW1lKTtcbiAgXHR9IGVsc2UgaWYgKHRvTG93ZXJDYXNlKGRvbS5ub2RlTmFtZSkgIT09IG5vZGVOYW1lKSB7XG4gIFx0XHRvdXQgPSBjcmVhdGVOb2RlKG5vZGVOYW1lKTtcbiAgXHRcdC8vIG1vdmUgY2hpbGRyZW4gaW50byB0aGUgcmVwbGFjZW1lbnQgbm9kZVxuICBcdFx0YXBwZW5kQ2hpbGRyZW4ob3V0LCB0b0FycmF5KGRvbS5jaGlsZE5vZGVzKSk7XG4gIFx0XHQvLyByZWNsYWltIGVsZW1lbnQgbm9kZXNcbiAgXHRcdHJlY29sbGVjdE5vZGVUcmVlKGRvbSk7XG4gIFx0fVxuXG4gIFx0aW5uZXJEaWZmTm9kZShvdXQsIHZub2RlLCBjb250ZXh0KTtcblxuICBcdHZhciBhdHRycyA9IHZub2RlLmF0dHJpYnV0ZXMsXG4gIFx0ICAgIGMgPSBvdXQuX2NvbXBvbmVudDtcbiAgXHRpZiAoYXR0cnMpIGhvb2soYXR0cnMsICdyZWYnLCAoIWNvbXBvbmVudCB8fCBjID09PSBjb21wb25lbnQpICYmIGMgfHwgb3V0KTtcblxuICBcdHJldHVybiBvdXQ7XG4gIH1cblxuICAvKiogQXBwbHkgY2hpbGQgYW5kIGF0dHJpYnV0ZSBjaGFuZ2VzIGJldHdlZW4gYSBWTm9kZSBhbmQgYSBET00gTm9kZSB0byB0aGUgRE9NLiAqL1xuICBmdW5jdGlvbiBpbm5lckRpZmZOb2RlKGRvbSwgdm5vZGUsIGNvbnRleHQpIHtcbiAgXHR2YXIgY2hpbGRyZW4gPSB1bmRlZmluZWQsXG4gIFx0ICAgIGtleWVkID0gdW5kZWZpbmVkLFxuICBcdCAgICBrZXllZExlbiA9IDAsXG4gIFx0ICAgIGxlbiA9IGRvbS5jaGlsZE5vZGVzLmxlbmd0aCxcbiAgXHQgICAgY2hpbGRyZW5MZW4gPSAwO1xuICBcdGlmIChsZW4pIHtcbiAgXHRcdGNoaWxkcmVuID0gW107XG4gIFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gIFx0XHRcdHZhciBjaGlsZCA9IGRvbS5jaGlsZE5vZGVzW2ldLFxuICBcdFx0XHQgICAgcHJvcHMgPSBjaGlsZC5fY29tcG9uZW50ICYmIGNoaWxkLl9jb21wb25lbnQucHJvcHMsXG4gIFx0XHRcdCAgICBrZXkgPSBwcm9wcyA/IHByb3BzLmtleSA6IGdldEFjY2Vzc29yKGNoaWxkLCAna2V5Jyk7XG4gIFx0XHRcdGlmICghZW1wdHkoa2V5KSkge1xuICBcdFx0XHRcdGlmICgha2V5ZWQpIGtleWVkID0ge307XG4gIFx0XHRcdFx0a2V5ZWRba2V5XSA9IGNoaWxkO1xuICBcdFx0XHRcdGtleWVkTGVuKys7XG4gIFx0XHRcdH0gZWxzZSB7XG4gIFx0XHRcdFx0Y2hpbGRyZW5bY2hpbGRyZW5MZW4rK10gPSBjaGlsZDtcbiAgXHRcdFx0fVxuICBcdFx0fVxuICBcdH1cblxuICBcdGRpZmZBdHRyaWJ1dGVzKGRvbSwgdm5vZGUpO1xuXG4gIFx0dmFyIHZjaGlsZHJlbiA9IHZub2RlLmNoaWxkcmVuLFxuICBcdCAgICB2bGVuID0gdmNoaWxkcmVuICYmIHZjaGlsZHJlbi5sZW5ndGgsXG4gIFx0ICAgIG1pbiA9IDA7XG4gIFx0aWYgKHZsZW4pIHtcbiAgXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdmxlbjsgaSsrKSB7XG4gIFx0XHRcdHZhciB2Y2hpbGQgPSB2Y2hpbGRyZW5baV0sXG4gIFx0XHRcdCAgICBjaGlsZCA9IHVuZGVmaW5lZDtcblxuICBcdFx0XHQvLyBpZiAoaXNGdW5jdGlvbmFsQ29tcG9uZW50KHZjaGlsZCkpIHtcbiAgXHRcdFx0Ly8gXHR2Y2hpbGQgPSBidWlsZEZ1bmN0aW9uYWxDb21wb25lbnQodmNoaWxkKTtcbiAgXHRcdFx0Ly8gfVxuXG4gIFx0XHRcdC8vIGF0dGVtcHQgdG8gZmluZCBhIG5vZGUgYmFzZWQgb24ga2V5IG1hdGNoaW5nXG4gIFx0XHRcdGlmIChrZXllZExlbikge1xuICBcdFx0XHRcdHZhciBhdHRycyA9IHZjaGlsZC5hdHRyaWJ1dGVzLFxuICBcdFx0XHRcdCAgICBrZXkgPSBhdHRycyAmJiBhdHRycy5rZXk7XG4gIFx0XHRcdFx0aWYgKCFlbXB0eShrZXkpICYmIGtleWVkLmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgXHRcdFx0XHRcdGNoaWxkID0ga2V5ZWRba2V5XTtcbiAgXHRcdFx0XHRcdGtleWVkW2tleV0gPSBudWxsO1xuICBcdFx0XHRcdFx0a2V5ZWRMZW4tLTtcbiAgXHRcdFx0XHR9XG4gIFx0XHRcdH1cblxuICBcdFx0XHQvLyBhdHRlbXB0IHRvIHBsdWNrIGEgbm9kZSBvZiB0aGUgc2FtZSB0eXBlIGZyb20gdGhlIGV4aXN0aW5nIGNoaWxkcmVuXG4gIFx0XHRcdGlmICghY2hpbGQgJiYgbWluIDwgY2hpbGRyZW5MZW4pIHtcbiAgXHRcdFx0XHRmb3IgKHZhciBqID0gbWluOyBqIDwgY2hpbGRyZW5MZW47IGorKykge1xuICBcdFx0XHRcdFx0dmFyIGMgPSBjaGlsZHJlbltqXTtcbiAgXHRcdFx0XHRcdGlmIChjICYmIGlzU2FtZU5vZGVUeXBlKGMsIHZjaGlsZCkpIHtcbiAgXHRcdFx0XHRcdFx0Y2hpbGQgPSBjO1xuICBcdFx0XHRcdFx0XHRjaGlsZHJlbltqXSA9IG51bGw7XG4gIFx0XHRcdFx0XHRcdGlmIChqID09PSBjaGlsZHJlbkxlbiAtIDEpIGNoaWxkcmVuTGVuLS07XG4gIFx0XHRcdFx0XHRcdGlmIChqID09PSBtaW4pIG1pbisrO1xuICBcdFx0XHRcdFx0XHRicmVhaztcbiAgXHRcdFx0XHRcdH1cbiAgXHRcdFx0XHR9XG4gIFx0XHRcdH1cblxuICBcdFx0XHQvLyBtb3JwaCB0aGUgbWF0Y2hlZC9mb3VuZC9jcmVhdGVkIERPTSBjaGlsZCB0byBtYXRjaCB2Y2hpbGQgKGRlZXApXG4gIFx0XHRcdGNoaWxkID0gZGlmZihjaGlsZCwgdmNoaWxkLCBjb250ZXh0KTtcblxuICBcdFx0XHRpZiAoZG9tLmNoaWxkTm9kZXNbaV0gIT09IGNoaWxkKSB7XG4gIFx0XHRcdFx0dmFyIGMgPSBjaGlsZC5wYXJlbnROb2RlICE9PSBkb20gJiYgY2hpbGQuX2NvbXBvbmVudCxcbiAgXHRcdFx0XHQgICAgbmV4dCA9IGRvbS5jaGlsZE5vZGVzW2kgKyAxXTtcbiAgXHRcdFx0XHRpZiAoYykgZGVlcEhvb2soYywgJ2NvbXBvbmVudFdpbGxNb3VudCcpO1xuICBcdFx0XHRcdGlmIChuZXh0KSB7XG4gIFx0XHRcdFx0XHRkb20uaW5zZXJ0QmVmb3JlKGNoaWxkLCBuZXh0KTtcbiAgXHRcdFx0XHR9IGVsc2Uge1xuICBcdFx0XHRcdFx0ZG9tLmFwcGVuZENoaWxkKGNoaWxkKTtcbiAgXHRcdFx0XHR9XG4gIFx0XHRcdFx0aWYgKGMpIGRlZXBIb29rKGMsICdjb21wb25lbnREaWRNb3VudCcpO1xuICBcdFx0XHR9XG4gIFx0XHR9XG4gIFx0fVxuXG4gIFx0aWYgKGtleWVkTGVuKSB7XG4gIFx0XHQvKmVzbGludCBndWFyZC1mb3ItaW46MCovXG4gIFx0XHRmb3IgKHZhciBpIGluIGtleWVkKSB7XG4gIFx0XHRcdGlmIChrZXllZC5oYXNPd25Qcm9wZXJ0eShpKSAmJiBrZXllZFtpXSkge1xuICBcdFx0XHRcdGNoaWxkcmVuW2NoaWxkcmVuTGVuKytdID0ga2V5ZWRbaV07XG4gIFx0XHRcdH1cbiAgXHRcdH1cbiAgXHR9XG5cbiAgXHQvLyByZW1vdmUgb3JwaGFuZWQgY2hpbGRyZW5cbiAgXHRpZiAobWluIDwgY2hpbGRyZW5MZW4pIHtcbiAgXHRcdHJlbW92ZU9ycGhhbmVkQ2hpbGRyZW4oZG9tLCBjaGlsZHJlbik7XG4gIFx0fVxuICB9XG5cbiAgLyoqIFJlY2xhaW0gY2hpbGRyZW4gdGhhdCB3ZXJlIHVucmVmZXJlbmNlZCBpbiB0aGUgZGVzaXJlZCBWVHJlZSAqL1xuXG4gIGZ1bmN0aW9uIHJlbW92ZU9ycGhhbmVkQ2hpbGRyZW4ob3V0LCBjaGlsZHJlbiwgdW5tb3VudE9ubHkpIHtcbiAgXHRmb3IgKHZhciBpID0gY2hpbGRyZW4ubGVuZ3RoOyBpLS07KSB7XG4gIFx0XHR2YXIgY2hpbGQgPSBjaGlsZHJlbltpXTtcbiAgXHRcdGlmIChjaGlsZCkge1xuICBcdFx0XHRyZWNvbGxlY3ROb2RlVHJlZShjaGlsZCwgdW5tb3VudE9ubHkpO1xuICBcdFx0fVxuICBcdH1cbiAgfVxuXG4gIC8qKiBSZWNsYWltIGFuIGVudGlyZSB0cmVlIG9mIG5vZGVzLCBzdGFydGluZyBhdCB0aGUgcm9vdC4gKi9cblxuICBmdW5jdGlvbiByZWNvbGxlY3ROb2RlVHJlZShub2RlLCB1bm1vdW50T25seSkge1xuICBcdC8vIEBUT0RPOiBOZWVkIHRvIG1ha2UgYSBjYWxsIG9uIHdoZXRoZXIgUHJlYWN0IHNob3VsZCByZW1vdmUgbm9kZXMgbm90IGNyZWF0ZWQgYnkgaXRzZWxmLlxuICBcdC8vIEN1cnJlbnRseSBpdCAqZG9lcyogcmVtb3ZlIHRoZW0uIERpc2N1c3Npb246IGh0dHBzOi8vZ2l0aHViLmNvbS9kZXZlbG9waXQvcHJlYWN0L2lzc3Vlcy8zOVxuICBcdC8vaWYgKCFub2RlW0FUVFJfS0VZXSkgcmV0dXJuO1xuXG4gIFx0dmFyIGF0dHJzID0gbm9kZVtBVFRSX0tFWV07XG4gIFx0aWYgKGF0dHJzKSBob29rKGF0dHJzLCAncmVmJywgbnVsbCk7XG5cbiAgXHR2YXIgY29tcG9uZW50ID0gbm9kZS5fY29tcG9uZW50O1xuICBcdGlmIChjb21wb25lbnQpIHtcbiAgXHRcdHVubW91bnRDb21wb25lbnQobm9kZSwgY29tcG9uZW50KTtcbiAgXHR9IGVsc2Uge1xuICBcdFx0aWYgKCF1bm1vdW50T25seSkge1xuICBcdFx0XHRpZiAoZ2V0Tm9kZVR5cGUobm9kZSkgIT09IDEpIHtcbiAgXHRcdFx0XHR2YXIgcCA9IG5vZGUucGFyZW50Tm9kZTtcbiAgXHRcdFx0XHRpZiAocCkgcC5yZW1vdmVDaGlsZChub2RlKTtcbiAgXHRcdFx0XHRyZXR1cm47XG4gIFx0XHRcdH1cblxuICBcdFx0XHRjb2xsZWN0Tm9kZShub2RlKTtcbiAgXHRcdH1cblxuICBcdFx0dmFyIGMgPSBub2RlLmNoaWxkTm9kZXM7XG4gIFx0XHRpZiAoYyAmJiBjLmxlbmd0aCkge1xuICBcdFx0XHRyZW1vdmVPcnBoYW5lZENoaWxkcmVuKG5vZGUsIGMsIHVubW91bnRPbmx5KTtcbiAgXHRcdH1cbiAgXHR9XG4gIH1cblxuICAvKiogQXBwbHkgZGlmZmVyZW5jZXMgaW4gYXR0cmlidXRlcyBmcm9tIGEgVk5vZGUgdG8gdGhlIGdpdmVuIERPTSBOb2RlLiAqL1xuICBmdW5jdGlvbiBkaWZmQXR0cmlidXRlcyhkb20sIHZub2RlKSB7XG4gIFx0dmFyIG9sZCA9IGdldE5vZGVBdHRyaWJ1dGVzKGRvbSkgfHwgRU1QVFksXG4gIFx0ICAgIGF0dHJzID0gdm5vZGUuYXR0cmlidXRlcyB8fCBFTVBUWSxcbiAgXHQgICAgbmFtZSA9IHVuZGVmaW5lZCxcbiAgXHQgICAgdmFsdWUgPSB1bmRlZmluZWQ7XG5cbiAgXHQvLyByZW1vdmVkXG4gIFx0Zm9yIChuYW1lIGluIG9sZCkge1xuICBcdFx0aWYgKGVtcHR5KGF0dHJzW25hbWVdKSkge1xuICBcdFx0XHRzZXRBY2Nlc3Nvcihkb20sIG5hbWUsIG51bGwpO1xuICBcdFx0fVxuICBcdH1cblxuICBcdC8vIG5ldyAmIHVwZGF0ZWRcbiAgXHRpZiAoYXR0cnMgIT09IEVNUFRZKSB7XG4gIFx0XHRmb3IgKG5hbWUgaW4gYXR0cnMpIHtcbiAgXHRcdFx0aWYgKGhhc093blByb3BlcnR5LmNhbGwoYXR0cnMsIG5hbWUpKSB7XG4gIFx0XHRcdFx0dmFsdWUgPSBhdHRyc1tuYW1lXTtcbiAgXHRcdFx0XHRpZiAoIWVtcHR5KHZhbHVlKSAmJiB2YWx1ZSAhPSBnZXRBY2Nlc3Nvcihkb20sIG5hbWUpKSB7XG4gIFx0XHRcdFx0XHRzZXRBY2Nlc3Nvcihkb20sIG5hbWUsIHZhbHVlKTtcbiAgXHRcdFx0XHR9XG4gIFx0XHRcdH1cbiAgXHRcdH1cbiAgXHR9XG4gIH1cblxuICB2YXIgY29tcG9uZW50cyA9IHt9O1xuXG4gIGZ1bmN0aW9uIGNvbGxlY3RDb21wb25lbnQoY29tcG9uZW50KSB7XG4gIFx0dmFyIG5hbWUgPSBjb21wb25lbnQuY29uc3RydWN0b3IubmFtZSxcbiAgXHQgICAgbGlzdCA9IGNvbXBvbmVudHNbbmFtZV07XG4gIFx0aWYgKGxpc3QpIGxpc3QucHVzaChjb21wb25lbnQpO2Vsc2UgY29tcG9uZW50c1tuYW1lXSA9IFtjb21wb25lbnRdO1xuICB9XG5cbiAgZnVuY3Rpb24gY3JlYXRlQ29tcG9uZW50KGN0b3IsIHByb3BzLCBjb250ZXh0KSB7XG4gIFx0dmFyIGxpc3QgPSBjb21wb25lbnRzW2N0b3IubmFtZV0sXG4gIFx0ICAgIGxlbiA9IGxpc3QgJiYgbGlzdC5sZW5ndGgsXG4gIFx0ICAgIGMgPSB1bmRlZmluZWQ7XG4gIFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICBcdFx0YyA9IGxpc3RbaV07XG4gIFx0XHRpZiAoYy5jb25zdHJ1Y3RvciA9PT0gY3Rvcikge1xuICBcdFx0XHRsaXN0LnNwbGljZShpLCAxKTtcbiAgXHRcdFx0cmV0dXJuIGM7XG4gIFx0XHR9XG4gIFx0fVxuICBcdHJldHVybiBuZXcgY3Rvcihwcm9wcywgY29udGV4dCk7XG4gIH1cblxuICAvKiogTWFyayBjb21wb25lbnQgYXMgZGlydHkgYW5kIHF1ZXVlIHVwIGEgcmVuZGVyLlxuICAgKlx0QHBhcmFtIHtDb21wb25lbnR9IGNvbXBvbmVudFxuICAgKlx0QHByaXZhdGVcbiAgICovXG5cbiAgZnVuY3Rpb24gdHJpZ2dlckNvbXBvbmVudFJlbmRlcihjb21wb25lbnQpIHtcbiAgXHRpZiAoIWNvbXBvbmVudC5fZGlydHkpIHtcbiAgXHRcdGNvbXBvbmVudC5fZGlydHkgPSB0cnVlO1xuICBcdFx0ZW5xdWV1ZVJlbmRlcihjb21wb25lbnQpO1xuICBcdH1cbiAgfVxuXG4gIC8qKiBTZXQgYSBjb21wb25lbnQncyBgcHJvcHNgIChnZW5lcmFsbHkgZGVyaXZlZCBmcm9tIEpTWCBhdHRyaWJ1dGVzKS5cbiAgICpcdEBwYXJhbSB7T2JqZWN0fSBwcm9wc1xuICAgKlx0QHBhcmFtIHtPYmplY3R9IFtvcHRzXVxuICAgKlx0QHBhcmFtIHtib29sZWFufSBbb3B0cy5yZW5kZXJTeW5jPWZhbHNlXVx0SWYgYHRydWVgIGFuZCB7QGxpbmsgb3B0aW9ucy5zeW5jQ29tcG9uZW50VXBkYXRlc30gaXMgYHRydWVgLCB0cmlnZ2VycyBzeW5jaHJvbm91cyByZW5kZXJpbmcuXG4gICAqXHRAcGFyYW0ge2Jvb2xlYW59IFtvcHRzLnJlbmRlcj10cnVlXVx0XHRcdElmIGBmYWxzZWAsIG5vIHJlbmRlciB3aWxsIGJlIHRyaWdnZXJlZC5cbiAgICovXG5cbiAgZnVuY3Rpb24gc2V0Q29tcG9uZW50UHJvcHMoY29tcG9uZW50LCBwcm9wcywgb3B0cywgY29udGV4dCkge1xuICBcdHZhciBkID0gY29tcG9uZW50Ll9kaXNhYmxlUmVuZGVyaW5nO1xuICBcdGNvbXBvbmVudC5fZGlzYWJsZVJlbmRlcmluZyA9IHRydWU7XG5cbiAgXHRvcHRzID0gb3B0cyB8fCBFTVBUWTtcblxuICBcdGlmIChjb250ZXh0KSB7XG4gIFx0XHRpZiAoIWNvbXBvbmVudC5wcmV2Q29udGV4dCkgY29tcG9uZW50LnByZXZDb250ZXh0ID0gY2xvbmUoY29tcG9uZW50LmNvbnRleHQpO1xuICBcdFx0Y29tcG9uZW50LmNvbnRleHQgPSBjb250ZXh0O1xuICBcdH1cblxuICBcdGlmIChjb21wb25lbnQuYmFzZSkge1xuICBcdFx0aG9vayhjb21wb25lbnQsICdjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzJywgcHJvcHMsIGNvbXBvbmVudC5jb250ZXh0KTtcbiAgXHR9XG5cbiAgXHRpZiAoIWNvbXBvbmVudC5wcmV2UHJvcHMpIGNvbXBvbmVudC5wcmV2UHJvcHMgPSBjbG9uZShjb21wb25lbnQucHJvcHMpO1xuICBcdGNvbXBvbmVudC5wcm9wcyA9IHByb3BzO1xuXG4gIFx0Y29tcG9uZW50Ll9kaXNhYmxlUmVuZGVyaW5nID0gZDtcblxuICBcdGlmIChvcHRzLnJlbmRlciAhPT0gZmFsc2UpIHtcbiAgXHRcdGlmIChvcHRzLnJlbmRlclN5bmMgfHwgb3B0aW9ucy5zeW5jQ29tcG9uZW50VXBkYXRlcyAhPT0gZmFsc2UpIHtcbiAgXHRcdFx0cmVuZGVyQ29tcG9uZW50KGNvbXBvbmVudCk7XG4gIFx0XHR9IGVsc2Uge1xuICBcdFx0XHR0cmlnZ2VyQ29tcG9uZW50UmVuZGVyKGNvbXBvbmVudCk7XG4gIFx0XHR9XG4gIFx0fVxuXG4gIFx0aG9vayhwcm9wcywgJ3JlZicsIGNvbXBvbmVudCk7XG4gIH1cblxuICAvKiogUmVuZGVyIGEgQ29tcG9uZW50LCB0cmlnZ2VyaW5nIG5lY2Vzc2FyeSBsaWZlY3ljbGUgZXZlbnRzIGFuZCB0YWtpbmcgSGlnaC1PcmRlciBDb21wb25lbnRzIGludG8gYWNjb3VudC5cbiAgICpcdEBwYXJhbSB7Q29tcG9uZW50fSBjb21wb25lbnRcbiAgICpcdEBwYXJhbSB7T2JqZWN0fSBbb3B0c11cbiAgICpcdEBwYXJhbSB7Ym9vbGVhbn0gW29wdHMuYnVpbGQ9ZmFsc2VdXHRcdElmIGB0cnVlYCwgY29tcG9uZW50IHdpbGwgYnVpbGQgYW5kIHN0b3JlIGEgRE9NIG5vZGUgaWYgbm90IGFscmVhZHkgYXNzb2NpYXRlZCB3aXRoIG9uZS5cbiAgICpcdEBwcml2YXRlXG4gICAqL1xuXG4gIGZ1bmN0aW9uIHJlbmRlckNvbXBvbmVudChjb21wb25lbnQsIG9wdHMpIHtcbiAgXHRpZiAoY29tcG9uZW50Ll9kaXNhYmxlUmVuZGVyaW5nKSByZXR1cm47XG5cbiAgXHR2YXIgc2tpcCA9IHVuZGVmaW5lZCxcbiAgXHQgICAgcmVuZGVyZWQgPSB1bmRlZmluZWQsXG4gIFx0ICAgIHByb3BzID0gY29tcG9uZW50LnByb3BzLFxuICBcdCAgICBzdGF0ZSA9IGNvbXBvbmVudC5zdGF0ZSxcbiAgXHQgICAgY29udGV4dCA9IGNvbXBvbmVudC5jb250ZXh0LFxuICBcdCAgICBwcmV2aW91c1Byb3BzID0gY29tcG9uZW50LnByZXZQcm9wcyB8fCBwcm9wcyxcbiAgXHQgICAgcHJldmlvdXNTdGF0ZSA9IGNvbXBvbmVudC5wcmV2U3RhdGUgfHwgc3RhdGUsXG4gIFx0ICAgIHByZXZpb3VzQ29udGV4dCA9IGNvbXBvbmVudC5wcmV2Q29udGV4dCB8fCBjb250ZXh0LFxuICBcdCAgICBpc1VwZGF0ZSA9IGNvbXBvbmVudC5iYXNlO1xuXG4gIFx0aWYgKGlzVXBkYXRlKSB7XG4gIFx0XHRjb21wb25lbnQucHJvcHMgPSBwcmV2aW91c1Byb3BzO1xuICBcdFx0Y29tcG9uZW50LnN0YXRlID0gcHJldmlvdXNTdGF0ZTtcbiAgXHRcdGNvbXBvbmVudC5jb250ZXh0ID0gcHJldmlvdXNDb250ZXh0O1xuICBcdFx0aWYgKGhvb2soY29tcG9uZW50LCAnc2hvdWxkQ29tcG9uZW50VXBkYXRlJywgcHJvcHMsIHN0YXRlLCBjb250ZXh0KSA9PT0gZmFsc2UpIHtcbiAgXHRcdFx0c2tpcCA9IHRydWU7XG4gIFx0XHR9IGVsc2Uge1xuICBcdFx0XHRob29rKGNvbXBvbmVudCwgJ2NvbXBvbmVudFdpbGxVcGRhdGUnLCBwcm9wcywgc3RhdGUsIGNvbnRleHQpO1xuICBcdFx0fVxuICBcdFx0Y29tcG9uZW50LnByb3BzID0gcHJvcHM7XG4gIFx0XHRjb21wb25lbnQuc3RhdGUgPSBzdGF0ZTtcbiAgXHRcdGNvbXBvbmVudC5jb250ZXh0ID0gY29udGV4dDtcbiAgXHR9XG5cbiAgXHRjb21wb25lbnQucHJldlByb3BzID0gY29tcG9uZW50LnByZXZTdGF0ZSA9IGNvbXBvbmVudC5wcmV2Q29udGV4dCA9IG51bGw7XG4gIFx0Y29tcG9uZW50Ll9kaXJ0eSA9IGZhbHNlO1xuXG4gIFx0aWYgKCFza2lwKSB7XG4gIFx0XHRyZW5kZXJlZCA9IGhvb2soY29tcG9uZW50LCAncmVuZGVyJywgcHJvcHMsIHN0YXRlLCBjb250ZXh0KTtcblxuICBcdFx0dmFyIGNoaWxkQ29tcG9uZW50ID0gcmVuZGVyZWQgJiYgcmVuZGVyZWQubm9kZU5hbWUsXG4gIFx0XHQgICAgY2hpbGRDb250ZXh0ID0gY29tcG9uZW50LmdldENoaWxkQ29udGV4dCA/IGNvbXBvbmVudC5nZXRDaGlsZENvbnRleHQoKSA6IGNvbnRleHQsXG4gIFx0XHQgICAgdG9Vbm1vdW50ID0gdW5kZWZpbmVkLFxuICBcdFx0ICAgIGJhc2UgPSB1bmRlZmluZWQ7XG5cbiAgXHRcdGlmIChpc0Z1bmN0aW9uKGNoaWxkQ29tcG9uZW50KSAmJiBjaGlsZENvbXBvbmVudC5wcm90b3R5cGUucmVuZGVyKSB7XG4gIFx0XHRcdC8vIHNldCB1cCBoaWdoIG9yZGVyIGNvbXBvbmVudCBsaW5rXG5cbiAgXHRcdFx0dmFyIGluc3QgPSBjb21wb25lbnQuX2NvbXBvbmVudDtcbiAgXHRcdFx0aWYgKGluc3QgJiYgaW5zdC5jb25zdHJ1Y3RvciAhPT0gY2hpbGRDb21wb25lbnQpIHtcbiAgXHRcdFx0XHR0b1VubW91bnQgPSBpbnN0O1xuICBcdFx0XHRcdGluc3QgPSBudWxsO1xuICBcdFx0XHR9XG5cbiAgXHRcdFx0dmFyIGNoaWxkUHJvcHMgPSBnZXROb2RlUHJvcHMocmVuZGVyZWQpO1xuXG4gIFx0XHRcdGlmIChpbnN0KSB7XG4gIFx0XHRcdFx0c2V0Q29tcG9uZW50UHJvcHMoaW5zdCwgY2hpbGRQcm9wcywgU1lOQ19SRU5ERVIsIGNoaWxkQ29udGV4dCk7XG4gIFx0XHRcdH0gZWxzZSB7XG4gIFx0XHRcdFx0aW5zdCA9IGNyZWF0ZUNvbXBvbmVudChjaGlsZENvbXBvbmVudCwgY2hpbGRQcm9wcywgY2hpbGRDb250ZXh0KTtcbiAgXHRcdFx0XHRpbnN0Ll9wYXJlbnRDb21wb25lbnQgPSBjb21wb25lbnQ7XG4gIFx0XHRcdFx0Y29tcG9uZW50Ll9jb21wb25lbnQgPSBpbnN0O1xuICBcdFx0XHRcdGlmIChjb21wb25lbnQuYmFzZSkgZGVlcEhvb2soaW5zdCwgJ2NvbXBvbmVudFdpbGxNb3VudCcpO1xuICBcdFx0XHRcdHNldENvbXBvbmVudFByb3BzKGluc3QsIGNoaWxkUHJvcHMsIE5PX1JFTkRFUiwgY2hpbGRDb250ZXh0KTtcbiAgXHRcdFx0XHRyZW5kZXJDb21wb25lbnQoaW5zdCwgRE9NX1JFTkRFUik7XG4gIFx0XHRcdFx0aWYgKGNvbXBvbmVudC5iYXNlKSBkZWVwSG9vayhpbnN0LCAnY29tcG9uZW50RGlkTW91bnQnKTtcbiAgXHRcdFx0fVxuXG4gIFx0XHRcdGJhc2UgPSBpbnN0LmJhc2U7XG4gIFx0XHR9IGVsc2Uge1xuICBcdFx0XHR2YXIgY2Jhc2UgPSBjb21wb25lbnQuYmFzZTtcblxuICBcdFx0XHQvLyBkZXN0cm95IGhpZ2ggb3JkZXIgY29tcG9uZW50IGxpbmtcbiAgXHRcdFx0dG9Vbm1vdW50ID0gY29tcG9uZW50Ll9jb21wb25lbnQ7XG4gIFx0XHRcdGlmICh0b1VubW91bnQpIHtcbiAgXHRcdFx0XHRjYmFzZSA9IGNvbXBvbmVudC5fY29tcG9uZW50ID0gbnVsbDtcbiAgXHRcdFx0fVxuXG4gIFx0XHRcdGlmIChjb21wb25lbnQuYmFzZSB8fCBvcHRzICYmIG9wdHMuYnVpbGQpIHtcbiAgXHRcdFx0XHRiYXNlID0gZGlmZihjYmFzZSwgcmVuZGVyZWQgfHwgRU1QVFlfQkFTRSwgY2hpbGRDb250ZXh0LCBjb21wb25lbnQpO1xuICBcdFx0XHR9XG4gIFx0XHR9XG5cbiAgXHRcdGlmIChjb21wb25lbnQuYmFzZSAmJiBiYXNlICE9PSBjb21wb25lbnQuYmFzZSkge1xuICBcdFx0XHR2YXIgcCA9IGNvbXBvbmVudC5iYXNlLnBhcmVudE5vZGU7XG4gIFx0XHRcdGlmIChwKSBwLnJlcGxhY2VDaGlsZChiYXNlLCBjb21wb25lbnQuYmFzZSk7XG4gIFx0XHR9XG5cbiAgXHRcdGlmICh0b1VubW91bnQpIHtcbiAgXHRcdFx0dW5tb3VudENvbXBvbmVudCh0b1VubW91bnQuYmFzZSwgdG9Vbm1vdW50KTtcbiAgXHRcdH1cblxuICBcdFx0Y29tcG9uZW50LmJhc2UgPSBiYXNlO1xuICBcdFx0aWYgKGJhc2UpIHtcbiAgXHRcdFx0dmFyIGNvbXBvbmVudFJlZiA9IGNvbXBvbmVudCxcbiAgXHRcdFx0ICAgIHQgPSBjb21wb25lbnQ7XG4gIFx0XHRcdHdoaWxlICh0ID0gdC5fcGFyZW50Q29tcG9uZW50KSB7XG4gIFx0XHRcdFx0Y29tcG9uZW50UmVmID0gdDtcbiAgXHRcdFx0fVxuICBcdFx0XHRiYXNlLl9jb21wb25lbnQgPSBjb21wb25lbnRSZWY7XG4gIFx0XHRcdGJhc2UuX2NvbXBvbmVudENvbnN0cnVjdG9yID0gY29tcG9uZW50UmVmLmNvbnN0cnVjdG9yO1xuICBcdFx0fVxuXG4gIFx0XHRpZiAoaXNVcGRhdGUpIHtcbiAgXHRcdFx0aG9vayhjb21wb25lbnQsICdjb21wb25lbnREaWRVcGRhdGUnLCBwcmV2aW91c1Byb3BzLCBwcmV2aW91c1N0YXRlLCBwcmV2aW91c0NvbnRleHQpO1xuICBcdFx0fVxuICBcdH1cblxuICBcdHZhciBjYiA9IGNvbXBvbmVudC5fcmVuZGVyQ2FsbGJhY2tzLFxuICBcdCAgICBmbiA9IHVuZGVmaW5lZDtcbiAgXHRpZiAoY2IpIHdoaWxlIChmbiA9IGNiLnBvcCgpKSBmbi5jYWxsKGNvbXBvbmVudCk7XG5cbiAgXHRyZXR1cm4gcmVuZGVyZWQ7XG4gIH1cblxuICAvKiogQXBwbHkgdGhlIENvbXBvbmVudCByZWZlcmVuY2VkIGJ5IGEgVk5vZGUgdG8gdGhlIERPTS5cbiAgICpcdEBwYXJhbSB7RWxlbWVudH0gZG9tXHRUaGUgRE9NIG5vZGUgdG8gbXV0YXRlXG4gICAqXHRAcGFyYW0ge1ZOb2RlfSB2bm9kZVx0QSBDb21wb25lbnQtcmVmZXJlbmNpbmcgVk5vZGVcbiAgICpcdEByZXR1cm5zIHtFbGVtZW50fSBkb21cdFRoZSBjcmVhdGVkL211dGF0ZWQgZWxlbWVudFxuICAgKlx0QHByaXZhdGVcbiAgICovXG5cbiAgZnVuY3Rpb24gYnVpbGRDb21wb25lbnRGcm9tVk5vZGUoZG9tLCB2bm9kZSwgY29udGV4dCkge1xuICBcdHZhciBjID0gZG9tICYmIGRvbS5fY29tcG9uZW50O1xuXG4gIFx0dmFyIGlzT3duZXIgPSBjICYmIGRvbS5fY29tcG9uZW50Q29uc3RydWN0b3IgPT09IHZub2RlLm5vZGVOYW1lO1xuICBcdHdoaWxlIChjICYmICFpc093bmVyICYmIChjID0gYy5fcGFyZW50Q29tcG9uZW50KSkge1xuICBcdFx0aXNPd25lciA9IGMuY29uc3RydWN0b3IgPT09IHZub2RlLm5vZGVOYW1lO1xuICBcdH1cblxuICBcdGlmIChpc093bmVyKSB7XG4gIFx0XHRzZXRDb21wb25lbnRQcm9wcyhjLCBnZXROb2RlUHJvcHModm5vZGUpLCBTWU5DX1JFTkRFUiwgY29udGV4dCk7XG4gIFx0XHRkb20gPSBjLmJhc2U7XG4gIFx0fSBlbHNlIHtcbiAgXHRcdGlmIChjKSB7XG4gIFx0XHRcdHVubW91bnRDb21wb25lbnQoZG9tLCBjKTtcbiAgXHRcdFx0ZG9tID0gbnVsbDtcbiAgXHRcdH1cbiAgXHRcdGRvbSA9IGNyZWF0ZUNvbXBvbmVudEZyb21WTm9kZSh2bm9kZSwgZG9tLCBjb250ZXh0KTtcbiAgXHR9XG5cbiAgXHRyZXR1cm4gZG9tO1xuICB9XG5cbiAgLyoqIEluc3RhbnRpYXRlIGFuZCByZW5kZXIgYSBDb21wb25lbnQsIGdpdmVuIGEgVk5vZGUgd2hvc2Ugbm9kZU5hbWUgaXMgYSBjb25zdHJ1Y3Rvci5cbiAgICpcdEBwYXJhbSB7Vk5vZGV9IHZub2RlXG4gICAqXHRAcHJpdmF0ZVxuICAgKi9cbiAgZnVuY3Rpb24gY3JlYXRlQ29tcG9uZW50RnJvbVZOb2RlKHZub2RlLCBkb20sIGNvbnRleHQpIHtcbiAgXHR2YXIgcHJvcHMgPSBnZXROb2RlUHJvcHModm5vZGUpO1xuICBcdHZhciBjb21wb25lbnQgPSBjcmVhdGVDb21wb25lbnQodm5vZGUubm9kZU5hbWUsIHByb3BzLCBjb250ZXh0KTtcblxuICBcdGlmIChkb20gJiYgIWNvbXBvbmVudC5iYXNlKSBjb21wb25lbnQuYmFzZSA9IGRvbTtcblxuICBcdHNldENvbXBvbmVudFByb3BzKGNvbXBvbmVudCwgcHJvcHMsIE5PX1JFTkRFUiwgY29udGV4dCk7XG4gIFx0cmVuZGVyQ29tcG9uZW50KGNvbXBvbmVudCwgRE9NX1JFTkRFUik7XG5cbiAgXHQvLyBsZXQgbm9kZSA9IGNvbXBvbmVudC5iYXNlO1xuICBcdC8vaWYgKCFub2RlLl9jb21wb25lbnQpIHtcbiAgXHQvL1x0bm9kZS5fY29tcG9uZW50ID0gY29tcG9uZW50O1xuICBcdC8vXHRub2RlLl9jb21wb25lbnRDb25zdHJ1Y3RvciA9IHZub2RlLm5vZGVOYW1lO1xuICBcdC8vfVxuXG4gIFx0cmV0dXJuIGNvbXBvbmVudC5iYXNlO1xuICB9XG5cbiAgLyoqIFJlbW92ZSBhIGNvbXBvbmVudCBmcm9tIHRoZSBET00gYW5kIHJlY3ljbGUgaXQuXG4gICAqXHRAcGFyYW0ge0VsZW1lbnR9IGRvbVx0XHRcdEEgRE9NIG5vZGUgZnJvbSB3aGljaCB0byB1bm1vdW50IHRoZSBnaXZlbiBDb21wb25lbnRcbiAgICpcdEBwYXJhbSB7Q29tcG9uZW50fSBjb21wb25lbnRcdFRoZSBDb21wb25lbnQgaW5zdGFuY2UgdG8gdW5tb3VudFxuICAgKlx0QHByaXZhdGVcbiAgICovXG5cbiAgZnVuY3Rpb24gdW5tb3VudENvbXBvbmVudChkb20sIGNvbXBvbmVudCwgcmVtb3ZlKSB7XG4gIFx0Ly8gY29uc29sZS53YXJuKCd1bm1vdW50aW5nIG1pc21hdGNoZWQgY29tcG9uZW50JywgY29tcG9uZW50KTtcblxuICBcdGhvb2soY29tcG9uZW50LnByb3BzLCAncmVmJywgbnVsbCk7XG4gIFx0ZGVlcEhvb2soY29tcG9uZW50LCAnY29tcG9uZW50V2lsbFVubW91bnQnKTtcbiAgXHRpZiAoZG9tLl9jb21wb25lbnQgPT09IGNvbXBvbmVudCkge1xuICBcdFx0ZGVsZXRlIGRvbS5fY29tcG9uZW50O1xuICBcdFx0ZGVsZXRlIGRvbS5fY29tcG9uZW50Q29uc3RydWN0b3I7XG4gIFx0fVxuICBcdHZhciBiYXNlID0gY29tcG9uZW50LmJhc2U7XG4gIFx0aWYgKGJhc2UpIHtcbiAgXHRcdGlmIChyZW1vdmUgIT09IGZhbHNlKSB7XG4gIFx0XHRcdHZhciBwID0gYmFzZS5wYXJlbnROb2RlO1xuICBcdFx0XHRpZiAocCkgcC5yZW1vdmVDaGlsZChiYXNlKTtcbiAgXHRcdH1cbiAgXHRcdHJlbW92ZU9ycGhhbmVkQ2hpbGRyZW4oYmFzZSwgYmFzZS5jaGlsZE5vZGVzLCB0cnVlKTtcbiAgXHR9XG4gIFx0Y29tcG9uZW50Ll9wYXJlbnRDb21wb25lbnQgPSBudWxsO1xuICBcdGRlZXBIb29rKGNvbXBvbmVudCwgJ2NvbXBvbmVudERpZFVubW91bnQnKTtcbiAgXHRjb2xsZWN0Q29tcG9uZW50KGNvbXBvbmVudCk7XG4gIH1cblxuICAvKiogQmFzZSBDb21wb25lbnQgY2xhc3MsIGZvciBoZSBFUzYgQ2xhc3MgbWV0aG9kIG9mIGNyZWF0aW5nIENvbXBvbmVudHNcbiAgICpcdEBwdWJsaWNcbiAgICpcbiAgICpcdEBleGFtcGxlXG4gICAqXHRjbGFzcyBNeUZvbyBleHRlbmRzIENvbXBvbmVudCB7XG4gICAqXHRcdHJlbmRlcihwcm9wcywgc3RhdGUpIHtcbiAgICpcdFx0XHRyZXR1cm4gPGRpdiAvPjtcbiAgICpcdFx0fVxuICAgKlx0fVxuICAgKi9cbiAgZnVuY3Rpb24gQ29tcG9uZW50KHByb3BzLCBjb250ZXh0KSB7XG4gIFx0LyoqIEBwcml2YXRlICovXG4gIFx0dGhpcy5fZGlydHkgPSB0aGlzLl9kaXNhYmxlUmVuZGVyaW5nID0gZmFsc2U7XG4gIFx0LyoqIEBwcml2YXRlICovXG4gIFx0dGhpcy5fbGlua2VkU3RhdGVzID0ge307XG4gIFx0LyoqIEBwcml2YXRlICovXG4gIFx0dGhpcy5fcmVuZGVyQ2FsbGJhY2tzID0gW107XG4gIFx0LyoqIEBwdWJsaWMgKi9cbiAgXHR0aGlzLnByZXZTdGF0ZSA9IHRoaXMucHJldlByb3BzID0gdGhpcy5wcmV2Q29udGV4dCA9IHRoaXMuYmFzZSA9IHRoaXMuX3BhcmVudENvbXBvbmVudCA9IHRoaXMuX2NvbXBvbmVudCA9IG51bGw7XG4gIFx0LyoqIEBwdWJsaWMgKi9cbiAgXHR0aGlzLmNvbnRleHQgPSBjb250ZXh0IHx8IG51bGw7XG4gIFx0LyoqIEB0eXBlIHtvYmplY3R9ICovXG4gIFx0dGhpcy5wcm9wcyA9IHByb3BzIHx8IHt9O1xuICBcdC8qKiBAdHlwZSB7b2JqZWN0fSAqL1xuICBcdHRoaXMuc3RhdGUgPSBob29rKHRoaXMsICdnZXRJbml0aWFsU3RhdGUnKSB8fCB7fTtcbiAgfVxuXG4gIGV4dGVuZChDb21wb25lbnQucHJvdG90eXBlLCB7XG5cbiAgXHQvKiogUmV0dXJucyBhIGBib29sZWFuYCB2YWx1ZSBpbmRpY2F0aW5nIGlmIHRoZSBjb21wb25lbnQgc2hvdWxkIHJlLXJlbmRlciB3aGVuIHJlY2VpdmluZyB0aGUgZ2l2ZW4gYHByb3BzYCBhbmQgYHN0YXRlYC5cbiAgICAqXHRAcGFyYW0ge29iamVjdH0gbmV4dFByb3BzXG4gICAgKlx0QHBhcmFtIHtvYmplY3R9IG5leHRTdGF0ZVxuICAgICpcdEBwYXJhbSB7b2JqZWN0fSBuZXh0Q29udGV4dFxuICAgICpcdEByZXR1cm5zIHtCb29sZWFufSBzaG91bGQgdGhlIGNvbXBvbmVudCByZS1yZW5kZXJcbiAgICAqXHRAbmFtZSBzaG91bGRDb21wb25lbnRVcGRhdGVcbiAgICAqXHRAZnVuY3Rpb25cbiAgICAqL1xuICBcdC8vIHNob3VsZENvbXBvbmVudFVwZGF0ZSgpIHtcbiAgXHQvLyBcdHJldHVybiB0cnVlO1xuICBcdC8vIH0sXG5cbiAgXHQvKiogUmV0dXJucyBhIGZ1bmN0aW9uIHRoYXQgc2V0cyBhIHN0YXRlIHByb3BlcnR5IHdoZW4gY2FsbGVkLlxuICAgICpcdENhbGxpbmcgbGlua1N0YXRlKCkgcmVwZWF0ZWRseSB3aXRoIHRoZSBzYW1lIGFyZ3VtZW50cyByZXR1cm5zIGEgY2FjaGVkIGxpbmsgZnVuY3Rpb24uXG4gICAgKlxuICAgICpcdFByb3ZpZGVzIHNvbWUgYnVpbHQtaW4gc3BlY2lhbCBjYXNlczpcbiAgICAqXHRcdC0gQ2hlY2tib3hlcyBhbmQgcmFkaW8gYnV0dG9ucyBsaW5rIHRoZWlyIGJvb2xlYW4gYGNoZWNrZWRgIHZhbHVlXG4gICAgKlx0XHQtIElucHV0cyBhdXRvbWF0aWNhbGx5IGxpbmsgdGhlaXIgYHZhbHVlYCBwcm9wZXJ0eVxuICAgICpcdFx0LSBFdmVudCBwYXRocyBmYWxsIGJhY2sgdG8gYW55IGFzc29jaWF0ZWQgQ29tcG9uZW50IGlmIG5vdCBmb3VuZCBvbiBhbiBlbGVtZW50XG4gICAgKlx0XHQtIElmIGxpbmtlZCB2YWx1ZSBpcyBhIGZ1bmN0aW9uLCB3aWxsIGludm9rZSBpdCBhbmQgdXNlIHRoZSByZXN1bHRcbiAgICAqXG4gICAgKlx0QHBhcmFtIHtzdHJpbmd9IGtleVx0XHRcdFx0VGhlIHBhdGggdG8gc2V0IC0gY2FuIGJlIGEgZG90LW5vdGF0ZWQgZGVlcCBrZXlcbiAgICAqXHRAcGFyYW0ge3N0cmluZ30gW2V2ZW50UGF0aF1cdFx0SWYgc2V0LCBhdHRlbXB0cyB0byBmaW5kIHRoZSBuZXcgc3RhdGUgdmFsdWUgYXQgYSBnaXZlbiBkb3Qtbm90YXRlZCBwYXRoIHdpdGhpbiB0aGUgb2JqZWN0IHBhc3NlZCB0byB0aGUgbGlua2VkU3RhdGUgc2V0dGVyLlxuICAgICpcdEByZXR1cm5zIHtmdW5jdGlvbn0gbGlua1N0YXRlU2V0dGVyKGUpXG4gICAgKlxuICAgICpcdEBleGFtcGxlIFVwZGF0ZSBhIFwidGV4dFwiIHN0YXRlIHZhbHVlIHdoZW4gYW4gaW5wdXQgY2hhbmdlczpcbiAgICAqXHRcdDxpbnB1dCBvbkNoYW5nZT17IHRoaXMubGlua1N0YXRlKCd0ZXh0JykgfSAvPlxuICAgICpcbiAgICAqXHRAZXhhbXBsZSBTZXQgYSBkZWVwIHN0YXRlIHZhbHVlIG9uIGNsaWNrXG4gICAgKlx0XHQ8YnV0dG9uIG9uQ2xpY2s9eyB0aGlzLmxpbmtTdGF0ZSgndG91Y2guY29vcmRzJywgJ3RvdWNoZXMuMCcpIH0+VGFwPC9idXR0b25cbiAgICAqL1xuICBcdGxpbmtTdGF0ZTogZnVuY3Rpb24gbGlua1N0YXRlKGtleSwgZXZlbnRQYXRoKSB7XG4gIFx0XHR2YXIgYyA9IHRoaXMuX2xpbmtlZFN0YXRlcyxcbiAgXHRcdCAgICBjYWNoZUtleSA9IGtleSArICd8JyArIChldmVudFBhdGggfHwgJycpO1xuICBcdFx0cmV0dXJuIGNbY2FjaGVLZXldIHx8IChjW2NhY2hlS2V5XSA9IGNyZWF0ZUxpbmtlZFN0YXRlKHRoaXMsIGtleSwgZXZlbnRQYXRoKSk7XG4gIFx0fSxcblxuICBcdC8qKiBVcGRhdGUgY29tcG9uZW50IHN0YXRlIGJ5IGNvcHlpbmcgcHJvcGVydGllcyBmcm9tIGBzdGF0ZWAgdG8gYHRoaXMuc3RhdGVgLlxuICAgICpcdEBwYXJhbSB7b2JqZWN0fSBzdGF0ZVx0XHRBIGhhc2ggb2Ygc3RhdGUgcHJvcGVydGllcyB0byB1cGRhdGUgd2l0aCBuZXcgdmFsdWVzXG4gICAgKi9cbiAgXHRzZXRTdGF0ZTogZnVuY3Rpb24gc2V0U3RhdGUoc3RhdGUsIGNhbGxiYWNrKSB7XG4gIFx0XHR2YXIgcyA9IHRoaXMuc3RhdGU7XG4gIFx0XHRpZiAoIXRoaXMucHJldlN0YXRlKSB0aGlzLnByZXZTdGF0ZSA9IGNsb25lKHMpO1xuICBcdFx0ZXh0ZW5kKHMsIGlzRnVuY3Rpb24oc3RhdGUpID8gc3RhdGUocywgdGhpcy5wcm9wcykgOiBzdGF0ZSk7XG4gIFx0XHRpZiAoY2FsbGJhY2spIHRoaXMuX3JlbmRlckNhbGxiYWNrcy5wdXNoKGNhbGxiYWNrKTtcbiAgXHRcdHRyaWdnZXJDb21wb25lbnRSZW5kZXIodGhpcyk7XG4gIFx0fSxcblxuICBcdC8qKiBJbW1lZGlhdGVseSBwZXJmb3JtIGEgc3luY2hyb25vdXMgcmUtcmVuZGVyIG9mIHRoZSBjb21wb25lbnQuXG4gICAgKlx0QHByaXZhdGVcbiAgICAqL1xuICBcdGZvcmNlVXBkYXRlOiBmdW5jdGlvbiBmb3JjZVVwZGF0ZSgpIHtcbiAgXHRcdHJlbmRlckNvbXBvbmVudCh0aGlzKTtcbiAgXHR9LFxuXG4gIFx0LyoqIEFjY2VwdHMgYHByb3BzYCBhbmQgYHN0YXRlYCwgYW5kIHJldHVybnMgYSBuZXcgVmlydHVhbCBET00gdHJlZSB0byBidWlsZC5cbiAgICAqXHRWaXJ0dWFsIERPTSBpcyBnZW5lcmFsbHkgY29uc3RydWN0ZWQgdmlhIFtKU1hdKGh0dHA6Ly9qYXNvbmZvcm1hdC5jb20vd3RmLWlzLWpzeCkuXG4gICAgKlx0QHBhcmFtIHtvYmplY3R9IHByb3BzXHRcdFByb3BzIChlZzogSlNYIGF0dHJpYnV0ZXMpIHJlY2VpdmVkIGZyb20gcGFyZW50IGVsZW1lbnQvY29tcG9uZW50XG4gICAgKlx0QHBhcmFtIHtvYmplY3R9IHN0YXRlXHRcdFRoZSBjb21wb25lbnQncyBjdXJyZW50IHN0YXRlXG4gICAgKlx0QHJldHVybnMgVk5vZGVcbiAgICAqL1xuICBcdHJlbmRlcjogZnVuY3Rpb24gcmVuZGVyKCkge1xuICBcdFx0cmV0dXJuIG51bGw7XG4gIFx0fVxuXG4gIH0pO1xuXG4gIC8qKiBSZW5kZXIgSlNYIGludG8gYSBgcGFyZW50YCBFbGVtZW50LlxuICAgKlx0QHBhcmFtIHtWTm9kZX0gdm5vZGVcdFx0QSAoSlNYKSBWTm9kZSB0byByZW5kZXJcbiAgICpcdEBwYXJhbSB7RWxlbWVudH0gcGFyZW50XHRcdERPTSBlbGVtZW50IHRvIHJlbmRlciBpbnRvXG4gICAqXHRAcGFyYW0ge0VsZW1lbnR9IFttZXJnZV1cdEF0dGVtcHQgdG8gcmUtdXNlIGFuIGV4aXN0aW5nIERPTSB0cmVlIHJvb3RlZCBhdCBgbWVyZ2VgXG4gICAqXHRAcHVibGljXG4gICAqXG4gICAqXHRAZXhhbXBsZVxuICAgKlx0Ly8gcmVuZGVyIGEgZGl2IGludG8gPGJvZHk+OlxuICAgKlx0cmVuZGVyKDxkaXYgaWQ9XCJoZWxsb1wiPmhlbGxvITwvZGl2PiwgZG9jdW1lbnQuYm9keSk7XG4gICAqXG4gICAqXHRAZXhhbXBsZVxuICAgKlx0Ly8gcmVuZGVyIGEgXCJUaGluZ1wiIGNvbXBvbmVudCBpbnRvICNmb286XG4gICAqXHRjb25zdCBUaGluZyA9ICh7IG5hbWUgfSkgPT4gPHNwYW4+eyBuYW1lIH08L3NwYW4+O1xuICAgKlx0cmVuZGVyKDxUaGluZyBuYW1lPVwib25lXCIgLz4sIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNmb28nKSk7XG4gICAqL1xuICBmdW5jdGlvbiByZW5kZXIodm5vZGUsIHBhcmVudCwgbWVyZ2UpIHtcbiAgICB2YXIgZXhpc3RpbmcgPSBtZXJnZSAmJiBtZXJnZS5fY29tcG9uZW50ICYmIG1lcmdlLl9jb21wb25lbnRDb25zdHJ1Y3RvciA9PT0gdm5vZGUubm9kZU5hbWUsXG4gICAgICAgIGJ1aWx0ID0gZGlmZihtZXJnZSwgdm5vZGUpLFxuICAgICAgICBjID0gIWV4aXN0aW5nICYmIGJ1aWx0Ll9jb21wb25lbnQ7XG5cbiAgICBpZiAoYykgZGVlcEhvb2soYywgJ2NvbXBvbmVudFdpbGxNb3VudCcpO1xuXG4gICAgaWYgKGJ1aWx0LnBhcmVudE5vZGUgIT09IHBhcmVudCkge1xuICAgICAgcGFyZW50LmFwcGVuZENoaWxkKGJ1aWx0KTtcbiAgICB9XG5cbiAgICBpZiAoYykgZGVlcEhvb2soYywgJ2NvbXBvbmVudERpZE1vdW50Jyk7XG5cbiAgICByZXR1cm4gYnVpbHQ7XG4gIH1cblxuICB2YXIgcHJlYWN0ID0ge1xuICBcdGg6IGgsXG4gIFx0Q29tcG9uZW50OiBDb21wb25lbnQsXG4gIFx0cmVuZGVyOiByZW5kZXIsXG4gIFx0cmVyZW5kZXI6IHJlcmVuZGVyLFxuICBcdG9wdGlvbnM6IG9wdGlvbnMsXG4gIFx0aG9va3M6IG9wdGlvbnNcbiAgfTtcblxuICByZXR1cm4gcHJlYWN0O1xuXG59KSk7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1wcmVhY3QuanMubWFwIiwiXG4vKipcbiAqIEFuIEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cykgYWx0ZXJuYXRpdmVcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gYXJncyBzb21ldGhpbmcgd2l0aCBhIGxlbmd0aFxuICogQHBhcmFtIHtOdW1iZXJ9IHNsaWNlXG4gKiBAcGFyYW0ge051bWJlcn0gc2xpY2VFbmRcbiAqIEBhcGkgcHVibGljXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoYXJncywgc2xpY2UsIHNsaWNlRW5kKSB7XG4gIHZhciByZXQgPSBbXTtcbiAgdmFyIGxlbiA9IGFyZ3MubGVuZ3RoO1xuXG4gIGlmICgwID09PSBsZW4pIHJldHVybiByZXQ7XG5cbiAgdmFyIHN0YXJ0ID0gc2xpY2UgPCAwXG4gICAgPyBNYXRoLm1heCgwLCBzbGljZSArIGxlbilcbiAgICA6IHNsaWNlIHx8IDA7XG5cbiAgaWYgKHNsaWNlRW5kICE9PSB1bmRlZmluZWQpIHtcbiAgICBsZW4gPSBzbGljZUVuZCA8IDBcbiAgICAgID8gc2xpY2VFbmQgKyBsZW5cbiAgICAgIDogc2xpY2VFbmRcbiAgfVxuXG4gIHdoaWxlIChsZW4tLSA+IHN0YXJ0KSB7XG4gICAgcmV0W2xlbiAtIHN0YXJ0XSA9IGFyZ3NbbGVuXTtcbiAgfVxuXG4gIHJldHVybiByZXQ7XG59XG5cbiIsIi8qIGVzbGludC1kaXNhYmxlIG5vLXVudXNlZC12YXJzICovXG4ndXNlIHN0cmljdCc7XG52YXIgaGFzT3duUHJvcGVydHkgPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5O1xudmFyIHByb3BJc0VudW1lcmFibGUgPSBPYmplY3QucHJvdG90eXBlLnByb3BlcnR5SXNFbnVtZXJhYmxlO1xuXG5mdW5jdGlvbiB0b09iamVjdCh2YWwpIHtcblx0aWYgKHZhbCA9PT0gbnVsbCB8fCB2YWwgPT09IHVuZGVmaW5lZCkge1xuXHRcdHRocm93IG5ldyBUeXBlRXJyb3IoJ09iamVjdC5hc3NpZ24gY2Fubm90IGJlIGNhbGxlZCB3aXRoIG51bGwgb3IgdW5kZWZpbmVkJyk7XG5cdH1cblxuXHRyZXR1cm4gT2JqZWN0KHZhbCk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbiAodGFyZ2V0LCBzb3VyY2UpIHtcblx0dmFyIGZyb207XG5cdHZhciB0byA9IHRvT2JqZWN0KHRhcmdldCk7XG5cdHZhciBzeW1ib2xzO1xuXG5cdGZvciAodmFyIHMgPSAxOyBzIDwgYXJndW1lbnRzLmxlbmd0aDsgcysrKSB7XG5cdFx0ZnJvbSA9IE9iamVjdChhcmd1bWVudHNbc10pO1xuXG5cdFx0Zm9yICh2YXIga2V5IGluIGZyb20pIHtcblx0XHRcdGlmIChoYXNPd25Qcm9wZXJ0eS5jYWxsKGZyb20sIGtleSkpIHtcblx0XHRcdFx0dG9ba2V5XSA9IGZyb21ba2V5XTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRpZiAoT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scykge1xuXHRcdFx0c3ltYm9scyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMoZnJvbSk7XG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHN5bWJvbHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0aWYgKHByb3BJc0VudW1lcmFibGUuY2FsbChmcm9tLCBzeW1ib2xzW2ldKSkge1xuXHRcdFx0XHRcdHRvW3N5bWJvbHNbaV1dID0gZnJvbVtzeW1ib2xzW2ldXTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdHJldHVybiB0bztcbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IEFycmF5LmlzQXJyYXkgfHwgZnVuY3Rpb24gKGFycikge1xuICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGFycikgPT0gJ1tvYmplY3QgQXJyYXldJztcbn07XG4iLCIvLyBzaGltIGZvciB1c2luZyBwcm9jZXNzIGluIGJyb3dzZXJcblxudmFyIHByb2Nlc3MgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xudmFyIHF1ZXVlID0gW107XG52YXIgZHJhaW5pbmcgPSBmYWxzZTtcbnZhciBjdXJyZW50UXVldWU7XG52YXIgcXVldWVJbmRleCA9IC0xO1xuXG5mdW5jdGlvbiBjbGVhblVwTmV4dFRpY2soKSB7XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBpZiAoY3VycmVudFF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBxdWV1ZSA9IGN1cnJlbnRRdWV1ZS5jb25jYXQocXVldWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHF1ZXVlSW5kZXggPSAtMTtcbiAgICB9XG4gICAgaWYgKHF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBkcmFpblF1ZXVlKCk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBkcmFpblF1ZXVlKCkge1xuICAgIGlmIChkcmFpbmluZykge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciB0aW1lb3V0ID0gc2V0VGltZW91dChjbGVhblVwTmV4dFRpY2spO1xuICAgIGRyYWluaW5nID0gdHJ1ZTtcblxuICAgIHZhciBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgd2hpbGUobGVuKSB7XG4gICAgICAgIGN1cnJlbnRRdWV1ZSA9IHF1ZXVlO1xuICAgICAgICBxdWV1ZSA9IFtdO1xuICAgICAgICB3aGlsZSAoKytxdWV1ZUluZGV4IDwgbGVuKSB7XG4gICAgICAgICAgICBpZiAoY3VycmVudFF1ZXVlKSB7XG4gICAgICAgICAgICAgICAgY3VycmVudFF1ZXVlW3F1ZXVlSW5kZXhdLnJ1bigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHF1ZXVlSW5kZXggPSAtMTtcbiAgICAgICAgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIH1cbiAgICBjdXJyZW50UXVldWUgPSBudWxsO1xuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgY2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xufVxuXG5wcm9jZXNzLm5leHRUaWNrID0gZnVuY3Rpb24gKGZ1bikge1xuICAgIHZhciBhcmdzID0gbmV3IEFycmF5KGFyZ3VtZW50cy5sZW5ndGggLSAxKTtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuICAgICAgICB9XG4gICAgfVxuICAgIHF1ZXVlLnB1c2gobmV3IEl0ZW0oZnVuLCBhcmdzKSk7XG4gICAgaWYgKHF1ZXVlLmxlbmd0aCA9PT0gMSAmJiAhZHJhaW5pbmcpIHtcbiAgICAgICAgc2V0VGltZW91dChkcmFpblF1ZXVlLCAwKTtcbiAgICB9XG59O1xuXG4vLyB2OCBsaWtlcyBwcmVkaWN0aWJsZSBvYmplY3RzXG5mdW5jdGlvbiBJdGVtKGZ1biwgYXJyYXkpIHtcbiAgICB0aGlzLmZ1biA9IGZ1bjtcbiAgICB0aGlzLmFycmF5ID0gYXJyYXk7XG59XG5JdGVtLnByb3RvdHlwZS5ydW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5mdW4uYXBwbHkobnVsbCwgdGhpcy5hcnJheSk7XG59O1xucHJvY2Vzcy50aXRsZSA9ICdicm93c2VyJztcbnByb2Nlc3MuYnJvd3NlciA9IHRydWU7XG5wcm9jZXNzLmVudiA9IHt9O1xucHJvY2Vzcy5hcmd2ID0gW107XG5wcm9jZXNzLnZlcnNpb24gPSAnJzsgLy8gZW1wdHkgc3RyaW5nIHRvIGF2b2lkIHJlZ2V4cCBpc3N1ZXNcbnByb2Nlc3MudmVyc2lvbnMgPSB7fTtcblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbnByb2Nlc3Mub24gPSBub29wO1xucHJvY2Vzcy5hZGRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLm9uY2UgPSBub29wO1xucHJvY2Vzcy5vZmYgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUFsbExpc3RlbmVycyA9IG5vb3A7XG5wcm9jZXNzLmVtaXQgPSBub29wO1xuXG5wcm9jZXNzLmJpbmRpbmcgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5iaW5kaW5nIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5cbnByb2Nlc3MuY3dkID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJy8nIH07XG5wcm9jZXNzLmNoZGlyID0gZnVuY3Rpb24gKGRpcikge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5jaGRpciBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xucHJvY2Vzcy51bWFzayA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gMDsgfTtcbiIsIid1c2Ugc3RyaWN0JztcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gYmluZEFjdGlvbkNyZWF0b3JzO1xuZnVuY3Rpb24gYmluZEFjdGlvbkNyZWF0b3IoYWN0aW9uQ3JlYXRvciwgZGlzcGF0Y2gpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gZGlzcGF0Y2goYWN0aW9uQ3JlYXRvci5hcHBseSh1bmRlZmluZWQsIGFyZ3VtZW50cykpO1xuICB9O1xufVxuXG4vKipcbiAqIFR1cm5zIGFuIG9iamVjdCB3aG9zZSB2YWx1ZXMgYXJlIGFjdGlvbiBjcmVhdG9ycywgaW50byBhbiBvYmplY3Qgd2l0aCB0aGVcbiAqIHNhbWUga2V5cywgYnV0IHdpdGggZXZlcnkgZnVuY3Rpb24gd3JhcHBlZCBpbnRvIGEgYGRpc3BhdGNoYCBjYWxsIHNvIHRoZXlcbiAqIG1heSBiZSBpbnZva2VkIGRpcmVjdGx5LiBUaGlzIGlzIGp1c3QgYSBjb252ZW5pZW5jZSBtZXRob2QsIGFzIHlvdSBjYW4gY2FsbFxuICogYHN0b3JlLmRpc3BhdGNoKE15QWN0aW9uQ3JlYXRvcnMuZG9Tb21ldGhpbmcoKSlgIHlvdXJzZWxmIGp1c3QgZmluZS5cbiAqXG4gKiBGb3IgY29udmVuaWVuY2UsIHlvdSBjYW4gYWxzbyBwYXNzIGEgc2luZ2xlIGZ1bmN0aW9uIGFzIHRoZSBmaXJzdCBhcmd1bWVudCxcbiAqIGFuZCBnZXQgYSBmdW5jdGlvbiBpbiByZXR1cm4uXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbnxPYmplY3R9IGFjdGlvbkNyZWF0b3JzIEFuIG9iamVjdCB3aG9zZSB2YWx1ZXMgYXJlIGFjdGlvblxuICogY3JlYXRvciBmdW5jdGlvbnMuIE9uZSBoYW5keSB3YXkgdG8gb2J0YWluIGl0IGlzIHRvIHVzZSBFUzYgYGltcG9ydCAqIGFzYFxuICogc3ludGF4LiBZb3UgbWF5IGFsc28gcGFzcyBhIHNpbmdsZSBmdW5jdGlvbi5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBkaXNwYXRjaCBUaGUgYGRpc3BhdGNoYCBmdW5jdGlvbiBhdmFpbGFibGUgb24geW91ciBSZWR1eFxuICogc3RvcmUuXG4gKlxuICogQHJldHVybnMge0Z1bmN0aW9ufE9iamVjdH0gVGhlIG9iamVjdCBtaW1pY2tpbmcgdGhlIG9yaWdpbmFsIG9iamVjdCwgYnV0IHdpdGhcbiAqIGV2ZXJ5IGFjdGlvbiBjcmVhdG9yIHdyYXBwZWQgaW50byB0aGUgYGRpc3BhdGNoYCBjYWxsLiBJZiB5b3UgcGFzc2VkIGFcbiAqIGZ1bmN0aW9uIGFzIGBhY3Rpb25DcmVhdG9yc2AsIHRoZSByZXR1cm4gdmFsdWUgd2lsbCBhbHNvIGJlIGEgc2luZ2xlXG4gKiBmdW5jdGlvbi5cbiAqL1xuZnVuY3Rpb24gYmluZEFjdGlvbkNyZWF0b3JzKGFjdGlvbkNyZWF0b3JzLCBkaXNwYXRjaCkge1xuICBpZiAodHlwZW9mIGFjdGlvbkNyZWF0b3JzID09PSAnZnVuY3Rpb24nKSB7XG4gICAgcmV0dXJuIGJpbmRBY3Rpb25DcmVhdG9yKGFjdGlvbkNyZWF0b3JzLCBkaXNwYXRjaCk7XG4gIH1cblxuICBpZiAodHlwZW9mIGFjdGlvbkNyZWF0b3JzICE9PSAnb2JqZWN0JyB8fCBhY3Rpb25DcmVhdG9ycyA9PT0gbnVsbCkge1xuICAgIHRocm93IG5ldyBFcnJvcignYmluZEFjdGlvbkNyZWF0b3JzIGV4cGVjdGVkIGFuIG9iamVjdCBvciBhIGZ1bmN0aW9uLCBpbnN0ZWFkIHJlY2VpdmVkICcgKyAoYWN0aW9uQ3JlYXRvcnMgPT09IG51bGwgPyAnbnVsbCcgOiB0eXBlb2YgYWN0aW9uQ3JlYXRvcnMpICsgJy4gJyArICdEaWQgeW91IHdyaXRlIFwiaW1wb3J0IEFjdGlvbkNyZWF0b3JzIGZyb21cIiBpbnN0ZWFkIG9mIFwiaW1wb3J0ICogYXMgQWN0aW9uQ3JlYXRvcnMgZnJvbVwiPycpO1xuICB9XG5cbiAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhhY3Rpb25DcmVhdG9ycyk7XG4gIHZhciBib3VuZEFjdGlvbkNyZWF0b3JzID0ge307XG4gIGZvciAodmFyIGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7IGkrKykge1xuICAgIHZhciBrZXkgPSBrZXlzW2ldO1xuICAgIHZhciBhY3Rpb25DcmVhdG9yID0gYWN0aW9uQ3JlYXRvcnNba2V5XTtcbiAgICBpZiAodHlwZW9mIGFjdGlvbkNyZWF0b3IgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGJvdW5kQWN0aW9uQ3JlYXRvcnNba2V5XSA9IGJpbmRBY3Rpb25DcmVhdG9yKGFjdGlvbkNyZWF0b3IsIGRpc3BhdGNoKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGJvdW5kQWN0aW9uQ3JlYXRvcnM7XG59IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IGNvbXBvc2U7XG4vKipcbiAqIENvbXBvc2VzIHNpbmdsZS1hcmd1bWVudCBmdW5jdGlvbnMgZnJvbSByaWdodCB0byBsZWZ0LlxuICpcbiAqIEBwYXJhbSB7Li4uRnVuY3Rpb259IGZ1bmNzIFRoZSBmdW5jdGlvbnMgdG8gY29tcG9zZS5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gQSBmdW5jdGlvbiBvYnRhaW5lZCBieSBjb21wb3NpbmcgZnVuY3Rpb25zIGZyb20gcmlnaHQgdG9cbiAqIGxlZnQuIEZvciBleGFtcGxlLCBjb21wb3NlKGYsIGcsIGgpIGlzIGlkZW50aWNhbCB0byBhcmcgPT4gZihnKGgoYXJnKSkpLlxuICovXG5mdW5jdGlvbiBjb21wb3NlKCkge1xuICBmb3IgKHZhciBfbGVuID0gYXJndW1lbnRzLmxlbmd0aCwgZnVuY3MgPSBBcnJheShfbGVuKSwgX2tleSA9IDA7IF9rZXkgPCBfbGVuOyBfa2V5KyspIHtcbiAgICBmdW5jc1tfa2V5XSA9IGFyZ3VtZW50c1tfa2V5XTtcbiAgfVxuXG4gIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKGZ1bmNzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPD0gMCA/IHVuZGVmaW5lZCA6IGFyZ3VtZW50c1swXTtcbiAgICB9XG5cbiAgICB2YXIgbGFzdCA9IGZ1bmNzW2Z1bmNzLmxlbmd0aCAtIDFdO1xuICAgIHZhciByZXN0ID0gZnVuY3Muc2xpY2UoMCwgLTEpO1xuXG4gICAgcmV0dXJuIHJlc3QucmVkdWNlUmlnaHQoZnVuY3Rpb24gKGNvbXBvc2VkLCBmKSB7XG4gICAgICByZXR1cm4gZihjb21wb3NlZCk7XG4gICAgfSwgbGFzdC5hcHBseSh1bmRlZmluZWQsIGFyZ3VtZW50cykpO1xuICB9O1xufSIsIid1c2Ugc3RyaWN0JztcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gd2FybmluZztcbi8qKlxuICogUHJpbnRzIGEgd2FybmluZyBpbiB0aGUgY29uc29sZSBpZiBpdCBleGlzdHMuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IG1lc3NhZ2UgVGhlIHdhcm5pbmcgbWVzc2FnZS5cbiAqIEByZXR1cm5zIHt2b2lkfVxuICovXG5mdW5jdGlvbiB3YXJuaW5nKG1lc3NhZ2UpIHtcbiAgLyogZXNsaW50LWRpc2FibGUgbm8tY29uc29sZSAqL1xuICBpZiAodHlwZW9mIGNvbnNvbGUgIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBjb25zb2xlLmVycm9yID09PSAnZnVuY3Rpb24nKSB7XG4gICAgY29uc29sZS5lcnJvcihtZXNzYWdlKTtcbiAgfVxuICAvKiBlc2xpbnQtZW5hYmxlIG5vLWNvbnNvbGUgKi9cbiAgdHJ5IHtcbiAgICAvLyBUaGlzIGVycm9yIHdhcyB0aHJvd24gYXMgYSBjb252ZW5pZW5jZSBzbyB0aGF0IHlvdSBjYW4gdXNlIHRoaXMgc3RhY2tcbiAgICAvLyB0byBmaW5kIHRoZSBjYWxsc2l0ZSB0aGF0IGNhdXNlZCB0aGlzIHdhcm5pbmcgdG8gZmlyZS5cbiAgICB0aHJvdyBuZXcgRXJyb3IobWVzc2FnZSk7XG4gICAgLyogZXNsaW50LWRpc2FibGUgbm8tZW1wdHkgKi9cbiAgfSBjYXRjaCAoZSkge31cbiAgLyogZXNsaW50LWVuYWJsZSBuby1lbXB0eSAqL1xufSIsIi8qKlxuICogRXhwb3NlIGByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKWAuXG4gKi9cblxuZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZVxuICB8fCB3aW5kb3cud2Via2l0UmVxdWVzdEFuaW1hdGlvbkZyYW1lXG4gIHx8IHdpbmRvdy5tb3pSZXF1ZXN0QW5pbWF0aW9uRnJhbWVcbiAgfHwgZmFsbGJhY2s7XG5cbi8qKlxuICogRmFsbGJhY2sgaW1wbGVtZW50YXRpb24uXG4gKi9cblxudmFyIHByZXYgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbmZ1bmN0aW9uIGZhbGxiYWNrKGZuKSB7XG4gIHZhciBjdXJyID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gIHZhciBtcyA9IE1hdGgubWF4KDAsIDE2IC0gKGN1cnIgLSBwcmV2KSk7XG4gIHZhciByZXEgPSBzZXRUaW1lb3V0KGZuLCBtcyk7XG4gIHByZXYgPSBjdXJyO1xuICByZXR1cm4gcmVxO1xufVxuXG4vKipcbiAqIENhbmNlbC5cbiAqL1xuXG52YXIgY2FuY2VsID0gd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lXG4gIHx8IHdpbmRvdy53ZWJraXRDYW5jZWxBbmltYXRpb25GcmFtZVxuICB8fCB3aW5kb3cubW96Q2FuY2VsQW5pbWF0aW9uRnJhbWVcbiAgfHwgd2luZG93LmNsZWFyVGltZW91dDtcblxuZXhwb3J0cy5jYW5jZWwgPSBmdW5jdGlvbihpZCl7XG4gIGNhbmNlbC5jYWxsKHdpbmRvdywgaWQpO1xufTtcbiIsIi8qIGVzbGludC1kaXNhYmxlIG5vLXVudXNlZC12YXJzICovXG4ndXNlIHN0cmljdCc7XG52YXIgaGFzT3duUHJvcGVydHkgPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5O1xudmFyIHByb3BJc0VudW1lcmFibGUgPSBPYmplY3QucHJvdG90eXBlLnByb3BlcnR5SXNFbnVtZXJhYmxlO1xuXG5mdW5jdGlvbiB0b09iamVjdCh2YWwpIHtcblx0aWYgKHZhbCA9PT0gbnVsbCB8fCB2YWwgPT09IHVuZGVmaW5lZCkge1xuXHRcdHRocm93IG5ldyBUeXBlRXJyb3IoJ09iamVjdC5hc3NpZ24gY2Fubm90IGJlIGNhbGxlZCB3aXRoIG51bGwgb3IgdW5kZWZpbmVkJyk7XG5cdH1cblxuXHRyZXR1cm4gT2JqZWN0KHZhbCk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbiAodGFyZ2V0LCBzb3VyY2UpIHtcblx0dmFyIGZyb207XG5cdHZhciB0byA9IHRvT2JqZWN0KHRhcmdldCk7XG5cdHZhciBzeW1ib2xzO1xuXG5cdGZvciAodmFyIHMgPSAxOyBzIDwgYXJndW1lbnRzLmxlbmd0aDsgcysrKSB7XG5cdFx0ZnJvbSA9IE9iamVjdChhcmd1bWVudHNbc10pO1xuXG5cdFx0Zm9yICh2YXIga2V5IGluIGZyb20pIHtcblx0XHRcdGlmIChoYXNPd25Qcm9wZXJ0eS5jYWxsKGZyb20sIGtleSkpIHtcblx0XHRcdFx0dG9ba2V5XSA9IGZyb21ba2V5XTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRpZiAoT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scykge1xuXHRcdFx0c3ltYm9scyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMoZnJvbSk7XG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHN5bWJvbHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0aWYgKHByb3BJc0VudW1lcmFibGUuY2FsbChmcm9tLCBzeW1ib2xzW2ldKSkge1xuXHRcdFx0XHRcdHRvW3N5bWJvbHNbaV1dID0gZnJvbVtzeW1ib2xzW2ldXTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdHJldHVybiB0bztcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKG9iaikge1xuICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9iaikgPT09ICdbb2JqZWN0IE9iamVjdF0nO1xufTtcbiIsIi8qKlxuICogRXhwb3NlIGB4b3JgXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSB4b3I7XG5cbi8qKlxuICogWE9SIHV0aWxpdHlcbiAqXG4gKiBUIFQgRlxuICogVCBGIFRcbiAqIEYgVCBUXG4gKiBGIEYgRlxuICpcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gYVxuICogQHBhcmFtIHtCb29sZWFufSBiXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICovXG5cbmZ1bmN0aW9uIHhvcihhLCBiKSB7XG4gIHJldHVybiBhIF4gYjtcbn1cbiIsIi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgYSBob3N0IG9iamVjdCBpbiBJRSA8IDkuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYSBob3N0IG9iamVjdCwgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBpc0hvc3RPYmplY3QodmFsdWUpIHtcbiAgLy8gTWFueSBob3N0IG9iamVjdHMgYXJlIGBPYmplY3RgIG9iamVjdHMgdGhhdCBjYW4gY29lcmNlIHRvIHN0cmluZ3NcbiAgLy8gZGVzcGl0ZSBoYXZpbmcgaW1wcm9wZXJseSBkZWZpbmVkIGB0b1N0cmluZ2AgbWV0aG9kcy5cbiAgdmFyIHJlc3VsdCA9IGZhbHNlO1xuICBpZiAodmFsdWUgIT0gbnVsbCAmJiB0eXBlb2YgdmFsdWUudG9TdHJpbmcgIT0gJ2Z1bmN0aW9uJykge1xuICAgIHRyeSB7XG4gICAgICByZXN1bHQgPSAhISh2YWx1ZSArICcnKTtcbiAgICB9IGNhdGNoIChlKSB7fVxuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaXNIb3N0T2JqZWN0O1xuIiwiLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBvYmplY3QtbGlrZS4gQSB2YWx1ZSBpcyBvYmplY3QtbGlrZSBpZiBpdCdzIG5vdCBgbnVsbGBcbiAqIGFuZCBoYXMgYSBgdHlwZW9mYCByZXN1bHQgb2YgXCJvYmplY3RcIi5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgb2JqZWN0LWxpa2UsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc09iamVjdExpa2Uoe30pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNPYmplY3RMaWtlKFsxLCAyLCAzXSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc09iamVjdExpa2UoXy5ub29wKTtcbiAqIC8vID0+IGZhbHNlXG4gKlxuICogXy5pc09iamVjdExpa2UobnVsbCk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG5mdW5jdGlvbiBpc09iamVjdExpa2UodmFsdWUpIHtcbiAgcmV0dXJuICEhdmFsdWUgJiYgdHlwZW9mIHZhbHVlID09ICdvYmplY3QnO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlzT2JqZWN0TGlrZTtcbiIsIi8qKlxuICogbG9kYXNoIDMuMS4xIChDdXN0b20gQnVpbGQpIDxodHRwczovL2xvZGFzaC5jb20vPlxuICogQnVpbGQ6IGBsb2Rhc2ggbW9kdWxhcml6ZSBleHBvcnRzPVwibnBtXCIgLW8gLi9gXG4gKiBDb3B5cmlnaHQgMjAxMi0yMDE2IFRoZSBEb2pvIEZvdW5kYXRpb24gPGh0dHA6Ly9kb2pvZm91bmRhdGlvbi5vcmcvPlxuICogQmFzZWQgb24gVW5kZXJzY29yZS5qcyAxLjguMyA8aHR0cDovL3VuZGVyc2NvcmVqcy5vcmcvTElDRU5TRT5cbiAqIENvcHlyaWdodCAyMDA5LTIwMTYgSmVyZW15IEFzaGtlbmFzLCBEb2N1bWVudENsb3VkIGFuZCBJbnZlc3RpZ2F0aXZlIFJlcG9ydGVycyAmIEVkaXRvcnNcbiAqIEF2YWlsYWJsZSB1bmRlciBNSVQgbGljZW5zZSA8aHR0cHM6Ly9sb2Rhc2guY29tL2xpY2Vuc2U+XG4gKi9cblxuLyoqIGBPYmplY3QjdG9TdHJpbmdgIHJlc3VsdCByZWZlcmVuY2VzLiAqL1xudmFyIGVycm9yVGFnID0gJ1tvYmplY3QgRXJyb3JdJztcblxuLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqXG4gKiBVc2VkIHRvIHJlc29sdmUgdGhlIFtgdG9TdHJpbmdUYWdgXShodHRwOi8vZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi82LjAvI3NlYy1vYmplY3QucHJvdG90eXBlLnRvc3RyaW5nKVxuICogb2YgdmFsdWVzLlxuICovXG52YXIgb2JqZWN0VG9TdHJpbmcgPSBvYmplY3RQcm90by50b1N0cmluZztcblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBhbiBgRXJyb3JgLCBgRXZhbEVycm9yYCwgYFJhbmdlRXJyb3JgLCBgUmVmZXJlbmNlRXJyb3JgLFxuICogYFN5bnRheEVycm9yYCwgYFR5cGVFcnJvcmAsIG9yIGBVUklFcnJvcmAgb2JqZWN0LlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhbiBlcnJvciBvYmplY3QsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc0Vycm9yKG5ldyBFcnJvcik7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc0Vycm9yKEVycm9yKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzRXJyb3IodmFsdWUpIHtcbiAgaWYgKCFpc09iamVjdExpa2UodmFsdWUpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHJldHVybiAob2JqZWN0VG9TdHJpbmcuY2FsbCh2YWx1ZSkgPT0gZXJyb3JUYWcpIHx8XG4gICAgKHR5cGVvZiB2YWx1ZS5tZXNzYWdlID09ICdzdHJpbmcnICYmIHR5cGVvZiB2YWx1ZS5uYW1lID09ICdzdHJpbmcnKTtcbn1cblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBvYmplY3QtbGlrZS4gQSB2YWx1ZSBpcyBvYmplY3QtbGlrZSBpZiBpdCdzIG5vdCBgbnVsbGBcbiAqIGFuZCBoYXMgYSBgdHlwZW9mYCByZXN1bHQgb2YgXCJvYmplY3RcIi5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgb2JqZWN0LWxpa2UsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc09iamVjdExpa2Uoe30pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNPYmplY3RMaWtlKFsxLCAyLCAzXSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc09iamVjdExpa2UoXy5ub29wKTtcbiAqIC8vID0+IGZhbHNlXG4gKlxuICogXy5pc09iamVjdExpa2UobnVsbCk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG5mdW5jdGlvbiBpc09iamVjdExpa2UodmFsdWUpIHtcbiAgcmV0dXJuICEhdmFsdWUgJiYgdHlwZW9mIHZhbHVlID09ICdvYmplY3QnO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlzRXJyb3I7XG4iLCIvKipcbiAqIE1vZHVsZSBkZXBlbmRlbmNpZXNcbiAqL1xuXG52YXIgaXNBcnJheSA9IEFycmF5LmlzQXJyYXlcblxuLyoqXG4gKiBFeHBvcnQgYHR5cGVgXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSB0eXBlXG5cbi8qKlxuICogR2V0IHRoZSB0eXBlXG4gKlxuICogQHBhcmFtIHtNaXhlZH0gdlxuICogQHJldHVybiB7U3RyaW5nfVxuICovXG5cbmZ1bmN0aW9uIHR5cGUodikge1xuICByZXR1cm4gaXNBcnJheSh2KVxuICAgID8gJ2FycmF5J1xuICAgIDogdiAmJiB2LnZvXG4gICAgPyAndm8nXG4gICAgOiB2ICYmIHYuY2F0Y2hcbiAgICA/ICdjYXRjaCdcbiAgICA6IHYgPT09IG51bGxcbiAgICA/ICdudWxsJ1xuICAgIDogdHlwZW9mIHZcbn1cbiIsIi8qKlxuICogbG9kYXNoIDMuMC4xIChDdXN0b20gQnVpbGQpIDxodHRwczovL2xvZGFzaC5jb20vPlxuICogQnVpbGQ6IGBsb2Rhc2ggbW9kdWxhcml6ZSBleHBvcnRzPVwibnBtXCIgLW8gLi9gXG4gKiBDb3B5cmlnaHQgMjAxMi0yMDE2IFRoZSBEb2pvIEZvdW5kYXRpb24gPGh0dHA6Ly9kb2pvZm91bmRhdGlvbi5vcmcvPlxuICogQmFzZWQgb24gVW5kZXJzY29yZS5qcyAxLjguMyA8aHR0cDovL3VuZGVyc2NvcmVqcy5vcmcvTElDRU5TRT5cbiAqIENvcHlyaWdodCAyMDA5LTIwMTYgSmVyZW15IEFzaGtlbmFzLCBEb2N1bWVudENsb3VkIGFuZCBJbnZlc3RpZ2F0aXZlIFJlcG9ydGVycyAmIEVkaXRvcnNcbiAqIEF2YWlsYWJsZSB1bmRlciBNSVQgbGljZW5zZSA8aHR0cHM6Ly9sb2Rhc2guY29tL2xpY2Vuc2U+XG4gKi9cblxuLyoqXG4gKiBDcmVhdGVzIGFuIGFycmF5IHdpdGggYWxsIGZhbHNleSB2YWx1ZXMgcmVtb3ZlZC4gVGhlIHZhbHVlcyBgZmFsc2VgLCBgbnVsbGAsXG4gKiBgMGAsIGBcIlwiYCwgYHVuZGVmaW5lZGAsIGFuZCBgTmFOYCBhcmUgZmFsc2V5LlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAY2F0ZWdvcnkgQXJyYXlcbiAqIEBwYXJhbSB7QXJyYXl9IGFycmF5IFRoZSBhcnJheSB0byBjb21wYWN0LlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBuZXcgYXJyYXkgb2YgZmlsdGVyZWQgdmFsdWVzLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmNvbXBhY3QoWzAsIDEsIGZhbHNlLCAyLCAnJywgM10pO1xuICogLy8gPT4gWzEsIDIsIDNdXG4gKi9cbmZ1bmN0aW9uIGNvbXBhY3QoYXJyYXkpIHtcbiAgdmFyIGluZGV4ID0gLTEsXG4gICAgICBsZW5ndGggPSBhcnJheSA/IGFycmF5Lmxlbmd0aCA6IDAsXG4gICAgICByZXNJbmRleCA9IDAsXG4gICAgICByZXN1bHQgPSBbXTtcblxuICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgIHZhciB2YWx1ZSA9IGFycmF5W2luZGV4XTtcbiAgICBpZiAodmFsdWUpIHtcbiAgICAgIHJlc3VsdFtyZXNJbmRleCsrXSA9IHZhbHVlO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNvbXBhY3Q7XG4iLCIvKipcbiAqIEV4cG9zZSB0b0FycmF5XG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSB0b0FycmF5WydkZWZhdWx0J10gPSB0b0FycmF5XG5cbi8qKlxuICogQ29udmVydCB0byBhbiBhcnJheSBmcm9tIGFycmF5IGxpa2VcbiAqIEBwYXJhbSAge0FycmF5TGlrZX0gYXJyXG4gKiBAcmV0dXJuIHtBcnJheX1cbiAqL1xuXG5mdW5jdGlvbiB0b0FycmF5IChhcnIpIHtcbiAgdmFyIGxlbiA9IGFyci5sZW5ndGhcbiAgdmFyIGlkeCA9IC0xXG5cbiAgdmFyIGFycmF5ID0gbmV3IEFycmF5KGxlbilcbiAgd2hpbGUgKCsraWR4IDwgbGVuKSB7XG4gICAgYXJyYXlbaWR4XSA9IGFycltpZHhdXG4gIH1cbiAgcmV0dXJuIGFycmF5XG59XG4iLCIvKipcbiAqIEV4cG9zZSBpc1VuZGVmaW5lZFxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gaXNVbmRlZmluZWRbJ2RlZmF1bHQnXSA9IGlzVW5kZWZpbmVkXG5cbi8qKlxuICogQ2hlY2sgaWYgdW5kZWZpbmVkLlxuICogQHBhcmFtICB7TWl4ZWR9ICB2YWx1ZVxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqL1xuXG5mdW5jdGlvbiBpc1VuZGVmaW5lZCAodmFsdWUpIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gJ3VuZGVmaW5lZCdcbn1cbiIsIlxuLyoqXG4gKiBzbGljZSgpIHJlZmVyZW5jZS5cbiAqL1xuXG52YXIgc2xpY2UgPSBBcnJheS5wcm90b3R5cGUuc2xpY2U7XG5cbi8qKlxuICogRXhwb3NlIGBjb2AuXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBjbztcblxuLyoqXG4gKiBXcmFwIHRoZSBnaXZlbiBnZW5lcmF0b3IgYGZuYCBhbmRcbiAqIHJldHVybiBhIHRodW5rLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gY28oZm4pIHtcbiAgdmFyIGlzR2VuRnVuID0gaXNHZW5lcmF0b3JGdW5jdGlvbihmbik7XG5cbiAgcmV0dXJuIGZ1bmN0aW9uIChkb25lKSB7XG4gICAgdmFyIGN0eCA9IHRoaXM7XG5cbiAgICAvLyBpbiB0b1RodW5rKCkgYmVsb3cgd2UgaW52b2tlIGNvKClcbiAgICAvLyB3aXRoIGEgZ2VuZXJhdG9yLCBzbyBvcHRpbWl6ZSBmb3JcbiAgICAvLyB0aGlzIGNhc2VcbiAgICB2YXIgZ2VuID0gZm47XG5cbiAgICAvLyB3ZSBvbmx5IG5lZWQgdG8gcGFyc2UgdGhlIGFyZ3VtZW50c1xuICAgIC8vIGlmIGdlbiBpcyBhIGdlbmVyYXRvciBmdW5jdGlvbi5cbiAgICBpZiAoaXNHZW5GdW4pIHtcbiAgICAgIHZhciBhcmdzID0gc2xpY2UuY2FsbChhcmd1bWVudHMpLCBsZW4gPSBhcmdzLmxlbmd0aDtcbiAgICAgIHZhciBoYXNDYWxsYmFjayA9IGxlbiAmJiAnZnVuY3Rpb24nID09IHR5cGVvZiBhcmdzW2xlbiAtIDFdO1xuICAgICAgZG9uZSA9IGhhc0NhbGxiYWNrID8gYXJncy5wb3AoKSA6IGVycm9yO1xuICAgICAgZ2VuID0gZm4uYXBwbHkodGhpcywgYXJncyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGRvbmUgPSBkb25lIHx8IGVycm9yO1xuICAgIH1cblxuICAgIG5leHQoKTtcblxuICAgIC8vICM5MlxuICAgIC8vIHdyYXAgdGhlIGNhbGxiYWNrIGluIGEgc2V0SW1tZWRpYXRlXG4gICAgLy8gc28gdGhhdCBhbnkgb2YgaXRzIGVycm9ycyBhcmVuJ3QgY2F1Z2h0IGJ5IGBjb2BcbiAgICBmdW5jdGlvbiBleGl0KGVyciwgcmVzKSB7XG4gICAgICBzZXRJbW1lZGlhdGUoZnVuY3Rpb24oKXtcbiAgICAgICAgZG9uZS5jYWxsKGN0eCwgZXJyLCByZXMpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbmV4dChlcnIsIHJlcykge1xuICAgICAgdmFyIHJldDtcblxuICAgICAgLy8gbXVsdGlwbGUgYXJnc1xuICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAyKSByZXMgPSBzbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG5cbiAgICAgIC8vIGVycm9yXG4gICAgICBpZiAoZXJyKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgcmV0ID0gZ2VuLnRocm93KGVycik7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICByZXR1cm4gZXhpdChlKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBva1xuICAgICAgaWYgKCFlcnIpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICByZXQgPSBnZW4ubmV4dChyZXMpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgcmV0dXJuIGV4aXQoZSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gZG9uZVxuICAgICAgaWYgKHJldC5kb25lKSByZXR1cm4gZXhpdChudWxsLCByZXQudmFsdWUpO1xuXG4gICAgICAvLyBub3JtYWxpemVcbiAgICAgIHJldC52YWx1ZSA9IHRvVGh1bmsocmV0LnZhbHVlLCBjdHgpO1xuXG4gICAgICAvLyBydW5cbiAgICAgIGlmICgnZnVuY3Rpb24nID09IHR5cGVvZiByZXQudmFsdWUpIHtcbiAgICAgICAgdmFyIGNhbGxlZCA9IGZhbHNlO1xuICAgICAgICB0cnkge1xuICAgICAgICAgIHJldC52YWx1ZS5jYWxsKGN0eCwgZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIGlmIChjYWxsZWQpIHJldHVybjtcbiAgICAgICAgICAgIGNhbGxlZCA9IHRydWU7XG4gICAgICAgICAgICBuZXh0LmFwcGx5KGN0eCwgYXJndW1lbnRzKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgIHNldEltbWVkaWF0ZShmdW5jdGlvbigpe1xuICAgICAgICAgICAgaWYgKGNhbGxlZCkgcmV0dXJuO1xuICAgICAgICAgICAgY2FsbGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIG5leHQoZSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBpbnZhbGlkXG4gICAgICBuZXh0KG5ldyBUeXBlRXJyb3IoJ1lvdSBtYXkgb25seSB5aWVsZCBhIGZ1bmN0aW9uLCBwcm9taXNlLCBnZW5lcmF0b3IsIGFycmF5LCBvciBvYmplY3QsICdcbiAgICAgICAgKyAnYnV0IHRoZSBmb2xsb3dpbmcgd2FzIHBhc3NlZDogXCInICsgU3RyaW5nKHJldC52YWx1ZSkgKyAnXCInKSk7XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogQ29udmVydCBgb2JqYCBpbnRvIGEgbm9ybWFsaXplZCB0aHVuay5cbiAqXG4gKiBAcGFyYW0ge01peGVkfSBvYmpcbiAqIEBwYXJhbSB7TWl4ZWR9IGN0eFxuICogQHJldHVybiB7RnVuY3Rpb259XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiB0b1RodW5rKG9iaiwgY3R4KSB7XG5cbiAgaWYgKGlzR2VuZXJhdG9yRnVuY3Rpb24ob2JqKSkge1xuICAgIHJldHVybiBjbyhvYmouY2FsbChjdHgpKTtcbiAgfVxuXG4gIGlmIChpc0dlbmVyYXRvcihvYmopKSB7XG4gICAgcmV0dXJuIGNvKG9iaik7XG4gIH1cblxuICBpZiAoaXNQcm9taXNlKG9iaikpIHtcbiAgICByZXR1cm4gcHJvbWlzZVRvVGh1bmsob2JqKTtcbiAgfVxuXG4gIGlmICgnZnVuY3Rpb24nID09IHR5cGVvZiBvYmopIHtcbiAgICByZXR1cm4gb2JqO1xuICB9XG5cbiAgaWYgKGlzT2JqZWN0KG9iaikgfHwgQXJyYXkuaXNBcnJheShvYmopKSB7XG4gICAgcmV0dXJuIG9iamVjdFRvVGh1bmsuY2FsbChjdHgsIG9iaik7XG4gIH1cblxuICByZXR1cm4gb2JqO1xufVxuXG4vKipcbiAqIENvbnZlcnQgYW4gb2JqZWN0IG9mIHlpZWxkYWJsZXMgdG8gYSB0aHVuay5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIG9iamVjdFRvVGh1bmsob2JqKXtcbiAgdmFyIGN0eCA9IHRoaXM7XG4gIHZhciBpc0FycmF5ID0gQXJyYXkuaXNBcnJheShvYmopO1xuXG4gIHJldHVybiBmdW5jdGlvbihkb25lKXtcbiAgICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKG9iaik7XG4gICAgdmFyIHBlbmRpbmcgPSBrZXlzLmxlbmd0aDtcbiAgICB2YXIgcmVzdWx0cyA9IGlzQXJyYXlcbiAgICAgID8gbmV3IEFycmF5KHBlbmRpbmcpIC8vIHByZWRlZmluZSB0aGUgYXJyYXkgbGVuZ3RoXG4gICAgICA6IG5ldyBvYmouY29uc3RydWN0b3IoKTtcbiAgICB2YXIgZmluaXNoZWQ7XG5cbiAgICBpZiAoIXBlbmRpbmcpIHtcbiAgICAgIHNldEltbWVkaWF0ZShmdW5jdGlvbigpe1xuICAgICAgICBkb25lKG51bGwsIHJlc3VsdHMpXG4gICAgICB9KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBwcmVwb3B1bGF0ZSBvYmplY3Qga2V5cyB0byBwcmVzZXJ2ZSBrZXkgb3JkZXJpbmdcbiAgICBpZiAoIWlzQXJyYXkpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcGVuZGluZzsgaSsrKSB7XG4gICAgICAgIHJlc3VsdHNba2V5c1tpXV0gPSB1bmRlZmluZWQ7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBydW4ob2JqW2tleXNbaV1dLCBrZXlzW2ldKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBydW4oZm4sIGtleSkge1xuICAgICAgaWYgKGZpbmlzaGVkKSByZXR1cm47XG4gICAgICB0cnkge1xuICAgICAgICBmbiA9IHRvVGh1bmsoZm4sIGN0eCk7XG5cbiAgICAgICAgaWYgKCdmdW5jdGlvbicgIT0gdHlwZW9mIGZuKSB7XG4gICAgICAgICAgcmVzdWx0c1trZXldID0gZm47XG4gICAgICAgICAgcmV0dXJuIC0tcGVuZGluZyB8fCBkb25lKG51bGwsIHJlc3VsdHMpO1xuICAgICAgICB9XG5cbiAgICAgICAgZm4uY2FsbChjdHgsIGZ1bmN0aW9uKGVyciwgcmVzKXtcbiAgICAgICAgICBpZiAoZmluaXNoZWQpIHJldHVybjtcblxuICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgIGZpbmlzaGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIHJldHVybiBkb25lKGVycik7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmVzdWx0c1trZXldID0gcmVzO1xuICAgICAgICAgIC0tcGVuZGluZyB8fCBkb25lKG51bGwsIHJlc3VsdHMpO1xuICAgICAgICB9KTtcbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBmaW5pc2hlZCA9IHRydWU7XG4gICAgICAgIGRvbmUoZXJyKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBDb252ZXJ0IGBwcm9taXNlYCB0byBhIHRodW5rLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBwcm9taXNlXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHByb21pc2VUb1RodW5rKHByb21pc2UpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKGZuKXtcbiAgICBwcm9taXNlLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICBmbihudWxsLCByZXMpO1xuICAgIH0sIGZuKTtcbiAgfVxufVxuXG4vKipcbiAqIENoZWNrIGlmIGBvYmpgIGlzIGEgcHJvbWlzZS5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gaXNQcm9taXNlKG9iaikge1xuICByZXR1cm4gb2JqICYmICdmdW5jdGlvbicgPT0gdHlwZW9mIG9iai50aGVuO1xufVxuXG4vKipcbiAqIENoZWNrIGlmIGBvYmpgIGlzIGEgZ2VuZXJhdG9yLlxuICpcbiAqIEBwYXJhbSB7TWl4ZWR9IG9ialxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIGlzR2VuZXJhdG9yKG9iaikge1xuICByZXR1cm4gb2JqICYmICdmdW5jdGlvbicgPT0gdHlwZW9mIG9iai5uZXh0ICYmICdmdW5jdGlvbicgPT0gdHlwZW9mIG9iai50aHJvdztcbn1cblxuLyoqXG4gKiBDaGVjayBpZiBgb2JqYCBpcyBhIGdlbmVyYXRvciBmdW5jdGlvbi5cbiAqXG4gKiBAcGFyYW0ge01peGVkfSBvYmpcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBpc0dlbmVyYXRvckZ1bmN0aW9uKG9iaikge1xuICByZXR1cm4gb2JqICYmIG9iai5jb25zdHJ1Y3RvciAmJiAnR2VuZXJhdG9yRnVuY3Rpb24nID09IG9iai5jb25zdHJ1Y3Rvci5uYW1lO1xufVxuXG4vKipcbiAqIENoZWNrIGZvciBwbGFpbiBvYmplY3QuXG4gKlxuICogQHBhcmFtIHtNaXhlZH0gdmFsXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gaXNPYmplY3QodmFsKSB7XG4gIHJldHVybiB2YWwgJiYgT2JqZWN0ID09IHZhbC5jb25zdHJ1Y3Rvcjtcbn1cblxuLyoqXG4gKiBUaHJvdyBgZXJyYCBpbiBhIG5ldyBzdGFjay5cbiAqXG4gKiBUaGlzIGlzIHVzZWQgd2hlbiBjbygpIGlzIGludm9rZWRcbiAqIHdpdGhvdXQgc3VwcGx5aW5nIGEgY2FsbGJhY2ssIHdoaWNoXG4gKiBzaG91bGQgb25seSBiZSBmb3IgZGVtb25zdHJhdGlvbmFsXG4gKiBwdXJwb3Nlcy5cbiAqXG4gKiBAcGFyYW0ge0Vycm9yfSBlcnJcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIGVycm9yKGVycikge1xuICBpZiAoIWVycikgcmV0dXJuO1xuICBzZXRJbW1lZGlhdGUoZnVuY3Rpb24oKXtcbiAgICB0aHJvdyBlcnI7XG4gIH0pO1xufVxuIiwiLyoqXG4gKiBFeHBvc2Ugc2xpY2VcbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IHNsaWNlXG5cbi8qKlxuICogc2xpY2VcbiAqL1xuXG5mdW5jdGlvbiBzbGljZSAoYXJyYXksIGJlZ2luLCBlbmQpIHtcbiAgYmVnaW4gPSBiZWdpbiB8fCAwXG4gIGVuZCA9IGVuZCB8fCBhcnJheS5sZW5ndGhcblxuICB2YXIgYXJyID0gbmV3IEFycmF5KGFycmF5Lmxlbmd0aClcbiAgZm9yICh2YXIgaSA9IGJlZ2luOyBpIDwgZW5kOyArK2kpIHtcbiAgICBhcnJbaSAtIGJlZ2luXSA9IGFycmF5W2ldXG4gIH1cbiAgcmV0dXJuIGFyclxufVxuIiwiLyoqXG4gKiBFeHBvc2UgaXNBcnJheVxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gaXNBcnJheVsnZGVmYXVsdCddID0gaXNBcnJheVxuXG4vKipcbiAqIGlzQXJyYXlcbiAqL1xuXG5mdW5jdGlvbiBpc0FycmF5ICh2YWwpIHtcbiAgcmV0dXJuIEFycmF5LmlzQXJyYXkodmFsKVxufVxuIiwiLyoqXG4gKiBFeHBvc2UgZm9yRWFjaFxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZm9yRWFjaFsnZGVmYXVsdCddID0gZm9yRWFjaFxuXG4vKipcbiAqIGZvckVhY2hcbiAqL1xuXG5mdW5jdGlvbiBmb3JFYWNoIChmbiwgb2JqKSB7XG4gIGlmICghb2JqKSByZXR1cm5cblxuICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKG9iailcblxuICBmb3IgKHZhciBpID0gMCwgbGVuID0ga2V5cy5sZW5ndGg7IGkgPCBsZW47ICsraSkge1xuICAgIHZhciBrZXkgPSBrZXlzW2ldXG4gICAgZm4uY2FsbCh0aGlzLCBvYmpba2V5XSwga2V5KVxuICB9XG59XG4iLCIvKipcbiAqIEV4cG9zZSBmb3JFYWNoXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBmb3JFYWNoWydkZWZhdWx0J10gPSBmb3JFYWNoXG5cbi8qKlxuICogZm9yRWFjaFxuICovXG5cbmZ1bmN0aW9uIGZvckVhY2ggKGZuLCBhcnIpIHtcbiAgaWYgKCFhcnIpIHJldHVyblxuXG4gIGZvciAodmFyIGkgPSAwLCBsZW4gPSBhcnIubGVuZ3RoOyBpIDwgbGVuOyArK2kpIHtcbiAgICBmbi5jYWxsKHRoaXMsIGFycltpXSwgaSlcbiAgfVxufVxuIiwiLyoqXG4gKiBNb2R1bGVzXG4gKi9cblxuLyoqXG4gKiBFeHBvc2UgaXNGdW5jdGlvblxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gaXNGdW5jdGlvblsnZGVmYXVsdCddID0gaXNGdW5jdGlvblxuXG4vKipcbiAqIGlzRnVuY3Rpb25cbiAqL1xuXG5mdW5jdGlvbiBpc0Z1bmN0aW9uICh2YWx1ZSkge1xuICByZXR1cm4gdHlwZW9mIHZhbHVlID09PSAnZnVuY3Rpb24nXG59XG4iLCIndXNlIHN0cmljdCc7XG5cbmV4cG9ydHMuZGVjb2RlID0gZXhwb3J0cy5wYXJzZSA9IHJlcXVpcmUoJy4vZGVjb2RlJyk7XG5leHBvcnRzLmVuY29kZSA9IGV4cG9ydHMuc3RyaW5naWZ5ID0gcmVxdWlyZSgnLi9lbmNvZGUnKTtcbiIsInZhciBpc2FycmF5ID0gcmVxdWlyZSgnaXNhcnJheScpXG5cbi8qKlxuICogRXhwb3NlIGBwYXRoVG9SZWdleHBgLlxuICovXG5tb2R1bGUuZXhwb3J0cyA9IHBhdGhUb1JlZ2V4cFxubW9kdWxlLmV4cG9ydHMucGFyc2UgPSBwYXJzZVxubW9kdWxlLmV4cG9ydHMuY29tcGlsZSA9IGNvbXBpbGVcbm1vZHVsZS5leHBvcnRzLnRva2Vuc1RvRnVuY3Rpb24gPSB0b2tlbnNUb0Z1bmN0aW9uXG5tb2R1bGUuZXhwb3J0cy50b2tlbnNUb1JlZ0V4cCA9IHRva2Vuc1RvUmVnRXhwXG5cbi8qKlxuICogVGhlIG1haW4gcGF0aCBtYXRjaGluZyByZWdleHAgdXRpbGl0eS5cbiAqXG4gKiBAdHlwZSB7UmVnRXhwfVxuICovXG52YXIgUEFUSF9SRUdFWFAgPSBuZXcgUmVnRXhwKFtcbiAgLy8gTWF0Y2ggZXNjYXBlZCBjaGFyYWN0ZXJzIHRoYXQgd291bGQgb3RoZXJ3aXNlIGFwcGVhciBpbiBmdXR1cmUgbWF0Y2hlcy5cbiAgLy8gVGhpcyBhbGxvd3MgdGhlIHVzZXIgdG8gZXNjYXBlIHNwZWNpYWwgY2hhcmFjdGVycyB0aGF0IHdvbid0IHRyYW5zZm9ybS5cbiAgJyhcXFxcXFxcXC4pJyxcbiAgLy8gTWF0Y2ggRXhwcmVzcy1zdHlsZSBwYXJhbWV0ZXJzIGFuZCB1bi1uYW1lZCBwYXJhbWV0ZXJzIHdpdGggYSBwcmVmaXhcbiAgLy8gYW5kIG9wdGlvbmFsIHN1ZmZpeGVzLiBNYXRjaGVzIGFwcGVhciBhczpcbiAgLy9cbiAgLy8gXCIvOnRlc3QoXFxcXGQrKT9cIiA9PiBbXCIvXCIsIFwidGVzdFwiLCBcIlxcZCtcIiwgdW5kZWZpbmVkLCBcIj9cIiwgdW5kZWZpbmVkXVxuICAvLyBcIi9yb3V0ZShcXFxcZCspXCIgID0+IFt1bmRlZmluZWQsIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCBcIlxcZCtcIiwgdW5kZWZpbmVkLCB1bmRlZmluZWRdXG4gIC8vIFwiLypcIiAgICAgICAgICAgID0+IFtcIi9cIiwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCBcIipcIl1cbiAgJyhbXFxcXC8uXSk/KD86KD86XFxcXDooXFxcXHcrKSg/OlxcXFwoKCg/OlxcXFxcXFxcLnxbXigpXSkrKVxcXFwpKT98XFxcXCgoKD86XFxcXFxcXFwufFteKCldKSspXFxcXCkpKFsrKj9dKT98KFxcXFwqKSknXG5dLmpvaW4oJ3wnKSwgJ2cnKVxuXG4vKipcbiAqIFBhcnNlIGEgc3RyaW5nIGZvciB0aGUgcmF3IHRva2Vucy5cbiAqXG4gKiBAcGFyYW0gIHtTdHJpbmd9IHN0clxuICogQHJldHVybiB7QXJyYXl9XG4gKi9cbmZ1bmN0aW9uIHBhcnNlIChzdHIpIHtcbiAgdmFyIHRva2VucyA9IFtdXG4gIHZhciBrZXkgPSAwXG4gIHZhciBpbmRleCA9IDBcbiAgdmFyIHBhdGggPSAnJ1xuICB2YXIgcmVzXG5cbiAgd2hpbGUgKChyZXMgPSBQQVRIX1JFR0VYUC5leGVjKHN0cikpICE9IG51bGwpIHtcbiAgICB2YXIgbSA9IHJlc1swXVxuICAgIHZhciBlc2NhcGVkID0gcmVzWzFdXG4gICAgdmFyIG9mZnNldCA9IHJlcy5pbmRleFxuICAgIHBhdGggKz0gc3RyLnNsaWNlKGluZGV4LCBvZmZzZXQpXG4gICAgaW5kZXggPSBvZmZzZXQgKyBtLmxlbmd0aFxuXG4gICAgLy8gSWdub3JlIGFscmVhZHkgZXNjYXBlZCBzZXF1ZW5jZXMuXG4gICAgaWYgKGVzY2FwZWQpIHtcbiAgICAgIHBhdGggKz0gZXNjYXBlZFsxXVxuICAgICAgY29udGludWVcbiAgICB9XG5cbiAgICAvLyBQdXNoIHRoZSBjdXJyZW50IHBhdGggb250byB0aGUgdG9rZW5zLlxuICAgIGlmIChwYXRoKSB7XG4gICAgICB0b2tlbnMucHVzaChwYXRoKVxuICAgICAgcGF0aCA9ICcnXG4gICAgfVxuXG4gICAgdmFyIHByZWZpeCA9IHJlc1syXVxuICAgIHZhciBuYW1lID0gcmVzWzNdXG4gICAgdmFyIGNhcHR1cmUgPSByZXNbNF1cbiAgICB2YXIgZ3JvdXAgPSByZXNbNV1cbiAgICB2YXIgc3VmZml4ID0gcmVzWzZdXG4gICAgdmFyIGFzdGVyaXNrID0gcmVzWzddXG5cbiAgICB2YXIgcmVwZWF0ID0gc3VmZml4ID09PSAnKycgfHwgc3VmZml4ID09PSAnKidcbiAgICB2YXIgb3B0aW9uYWwgPSBzdWZmaXggPT09ICc/JyB8fCBzdWZmaXggPT09ICcqJ1xuICAgIHZhciBkZWxpbWl0ZXIgPSBwcmVmaXggfHwgJy8nXG4gICAgdmFyIHBhdHRlcm4gPSBjYXB0dXJlIHx8IGdyb3VwIHx8IChhc3RlcmlzayA/ICcuKicgOiAnW14nICsgZGVsaW1pdGVyICsgJ10rPycpXG5cbiAgICB0b2tlbnMucHVzaCh7XG4gICAgICBuYW1lOiBuYW1lIHx8IGtleSsrLFxuICAgICAgcHJlZml4OiBwcmVmaXggfHwgJycsXG4gICAgICBkZWxpbWl0ZXI6IGRlbGltaXRlcixcbiAgICAgIG9wdGlvbmFsOiBvcHRpb25hbCxcbiAgICAgIHJlcGVhdDogcmVwZWF0LFxuICAgICAgcGF0dGVybjogZXNjYXBlR3JvdXAocGF0dGVybilcbiAgICB9KVxuICB9XG5cbiAgLy8gTWF0Y2ggYW55IGNoYXJhY3RlcnMgc3RpbGwgcmVtYWluaW5nLlxuICBpZiAoaW5kZXggPCBzdHIubGVuZ3RoKSB7XG4gICAgcGF0aCArPSBzdHIuc3Vic3RyKGluZGV4KVxuICB9XG5cbiAgLy8gSWYgdGhlIHBhdGggZXhpc3RzLCBwdXNoIGl0IG9udG8gdGhlIGVuZC5cbiAgaWYgKHBhdGgpIHtcbiAgICB0b2tlbnMucHVzaChwYXRoKVxuICB9XG5cbiAgcmV0dXJuIHRva2Vuc1xufVxuXG4vKipcbiAqIENvbXBpbGUgYSBzdHJpbmcgdG8gYSB0ZW1wbGF0ZSBmdW5jdGlvbiBmb3IgdGhlIHBhdGguXG4gKlxuICogQHBhcmFtICB7U3RyaW5nfSAgIHN0clxuICogQHJldHVybiB7RnVuY3Rpb259XG4gKi9cbmZ1bmN0aW9uIGNvbXBpbGUgKHN0cikge1xuICByZXR1cm4gdG9rZW5zVG9GdW5jdGlvbihwYXJzZShzdHIpKVxufVxuXG4vKipcbiAqIEV4cG9zZSBhIG1ldGhvZCBmb3IgdHJhbnNmb3JtaW5nIHRva2VucyBpbnRvIHRoZSBwYXRoIGZ1bmN0aW9uLlxuICovXG5mdW5jdGlvbiB0b2tlbnNUb0Z1bmN0aW9uICh0b2tlbnMpIHtcbiAgLy8gQ29tcGlsZSBhbGwgdGhlIHRva2VucyBpbnRvIHJlZ2V4cHMuXG4gIHZhciBtYXRjaGVzID0gbmV3IEFycmF5KHRva2Vucy5sZW5ndGgpXG5cbiAgLy8gQ29tcGlsZSBhbGwgdGhlIHBhdHRlcm5zIGJlZm9yZSBjb21waWxhdGlvbi5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0b2tlbnMubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAodHlwZW9mIHRva2Vuc1tpXSA9PT0gJ29iamVjdCcpIHtcbiAgICAgIG1hdGNoZXNbaV0gPSBuZXcgUmVnRXhwKCdeJyArIHRva2Vuc1tpXS5wYXR0ZXJuICsgJyQnKVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBmdW5jdGlvbiAob2JqKSB7XG4gICAgdmFyIHBhdGggPSAnJ1xuICAgIHZhciBkYXRhID0gb2JqIHx8IHt9XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRva2Vucy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIHRva2VuID0gdG9rZW5zW2ldXG5cbiAgICAgIGlmICh0eXBlb2YgdG9rZW4gPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHBhdGggKz0gdG9rZW5cblxuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuXG4gICAgICB2YXIgdmFsdWUgPSBkYXRhW3Rva2VuLm5hbWVdXG4gICAgICB2YXIgc2VnbWVudFxuXG4gICAgICBpZiAodmFsdWUgPT0gbnVsbCkge1xuICAgICAgICBpZiAodG9rZW4ub3B0aW9uYWwpIHtcbiAgICAgICAgICBjb250aW51ZVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0V4cGVjdGVkIFwiJyArIHRva2VuLm5hbWUgKyAnXCIgdG8gYmUgZGVmaW5lZCcpXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKGlzYXJyYXkodmFsdWUpKSB7XG4gICAgICAgIGlmICghdG9rZW4ucmVwZWF0KSB7XG4gICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignRXhwZWN0ZWQgXCInICsgdG9rZW4ubmFtZSArICdcIiB0byBub3QgcmVwZWF0LCBidXQgcmVjZWl2ZWQgXCInICsgdmFsdWUgKyAnXCInKVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHZhbHVlLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgIGlmICh0b2tlbi5vcHRpb25hbCkge1xuICAgICAgICAgICAgY29udGludWVcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignRXhwZWN0ZWQgXCInICsgdG9rZW4ubmFtZSArICdcIiB0byBub3QgYmUgZW1wdHknKVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgdmFsdWUubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICBzZWdtZW50ID0gZW5jb2RlVVJJQ29tcG9uZW50KHZhbHVlW2pdKVxuXG4gICAgICAgICAgaWYgKCFtYXRjaGVzW2ldLnRlc3Qoc2VnbWVudCkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0V4cGVjdGVkIGFsbCBcIicgKyB0b2tlbi5uYW1lICsgJ1wiIHRvIG1hdGNoIFwiJyArIHRva2VuLnBhdHRlcm4gKyAnXCIsIGJ1dCByZWNlaXZlZCBcIicgKyBzZWdtZW50ICsgJ1wiJylcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBwYXRoICs9IChqID09PSAwID8gdG9rZW4ucHJlZml4IDogdG9rZW4uZGVsaW1pdGVyKSArIHNlZ21lbnRcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnRpbnVlXG4gICAgICB9XG5cbiAgICAgIHNlZ21lbnQgPSBlbmNvZGVVUklDb21wb25lbnQodmFsdWUpXG5cbiAgICAgIGlmICghbWF0Y2hlc1tpXS50ZXN0KHNlZ21lbnQpKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0V4cGVjdGVkIFwiJyArIHRva2VuLm5hbWUgKyAnXCIgdG8gbWF0Y2ggXCInICsgdG9rZW4ucGF0dGVybiArICdcIiwgYnV0IHJlY2VpdmVkIFwiJyArIHNlZ21lbnQgKyAnXCInKVxuICAgICAgfVxuXG4gICAgICBwYXRoICs9IHRva2VuLnByZWZpeCArIHNlZ21lbnRcbiAgICB9XG5cbiAgICByZXR1cm4gcGF0aFxuICB9XG59XG5cbi8qKlxuICogRXNjYXBlIGEgcmVndWxhciBleHByZXNzaW9uIHN0cmluZy5cbiAqXG4gKiBAcGFyYW0gIHtTdHJpbmd9IHN0clxuICogQHJldHVybiB7U3RyaW5nfVxuICovXG5mdW5jdGlvbiBlc2NhcGVTdHJpbmcgKHN0cikge1xuICByZXR1cm4gc3RyLnJlcGxhY2UoLyhbLisqPz1eIToke30oKVtcXF18XFwvXSkvZywgJ1xcXFwkMScpXG59XG5cbi8qKlxuICogRXNjYXBlIHRoZSBjYXB0dXJpbmcgZ3JvdXAgYnkgZXNjYXBpbmcgc3BlY2lhbCBjaGFyYWN0ZXJzIGFuZCBtZWFuaW5nLlxuICpcbiAqIEBwYXJhbSAge1N0cmluZ30gZ3JvdXBcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqL1xuZnVuY3Rpb24gZXNjYXBlR3JvdXAgKGdyb3VwKSB7XG4gIHJldHVybiBncm91cC5yZXBsYWNlKC8oWz0hOiRcXC8oKV0pL2csICdcXFxcJDEnKVxufVxuXG4vKipcbiAqIEF0dGFjaCB0aGUga2V5cyBhcyBhIHByb3BlcnR5IG9mIHRoZSByZWdleHAuXG4gKlxuICogQHBhcmFtICB7UmVnRXhwfSByZVxuICogQHBhcmFtICB7QXJyYXl9ICBrZXlzXG4gKiBAcmV0dXJuIHtSZWdFeHB9XG4gKi9cbmZ1bmN0aW9uIGF0dGFjaEtleXMgKHJlLCBrZXlzKSB7XG4gIHJlLmtleXMgPSBrZXlzXG4gIHJldHVybiByZVxufVxuXG4vKipcbiAqIEdldCB0aGUgZmxhZ3MgZm9yIGEgcmVnZXhwIGZyb20gdGhlIG9wdGlvbnMuXG4gKlxuICogQHBhcmFtICB7T2JqZWN0fSBvcHRpb25zXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKi9cbmZ1bmN0aW9uIGZsYWdzIChvcHRpb25zKSB7XG4gIHJldHVybiBvcHRpb25zLnNlbnNpdGl2ZSA/ICcnIDogJ2knXG59XG5cbi8qKlxuICogUHVsbCBvdXQga2V5cyBmcm9tIGEgcmVnZXhwLlxuICpcbiAqIEBwYXJhbSAge1JlZ0V4cH0gcGF0aFxuICogQHBhcmFtICB7QXJyYXl9ICBrZXlzXG4gKiBAcmV0dXJuIHtSZWdFeHB9XG4gKi9cbmZ1bmN0aW9uIHJlZ2V4cFRvUmVnZXhwIChwYXRoLCBrZXlzKSB7XG4gIC8vIFVzZSBhIG5lZ2F0aXZlIGxvb2thaGVhZCB0byBtYXRjaCBvbmx5IGNhcHR1cmluZyBncm91cHMuXG4gIHZhciBncm91cHMgPSBwYXRoLnNvdXJjZS5tYXRjaCgvXFwoKD8hXFw/KS9nKVxuXG4gIGlmIChncm91cHMpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGdyb3Vwcy5sZW5ndGg7IGkrKykge1xuICAgICAga2V5cy5wdXNoKHtcbiAgICAgICAgbmFtZTogaSxcbiAgICAgICAgcHJlZml4OiBudWxsLFxuICAgICAgICBkZWxpbWl0ZXI6IG51bGwsXG4gICAgICAgIG9wdGlvbmFsOiBmYWxzZSxcbiAgICAgICAgcmVwZWF0OiBmYWxzZSxcbiAgICAgICAgcGF0dGVybjogbnVsbFxuICAgICAgfSlcbiAgICB9XG4gIH1cblxuICByZXR1cm4gYXR0YWNoS2V5cyhwYXRoLCBrZXlzKVxufVxuXG4vKipcbiAqIFRyYW5zZm9ybSBhbiBhcnJheSBpbnRvIGEgcmVnZXhwLlxuICpcbiAqIEBwYXJhbSAge0FycmF5fSAgcGF0aFxuICogQHBhcmFtICB7QXJyYXl9ICBrZXlzXG4gKiBAcGFyYW0gIHtPYmplY3R9IG9wdGlvbnNcbiAqIEByZXR1cm4ge1JlZ0V4cH1cbiAqL1xuZnVuY3Rpb24gYXJyYXlUb1JlZ2V4cCAocGF0aCwga2V5cywgb3B0aW9ucykge1xuICB2YXIgcGFydHMgPSBbXVxuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgcGF0aC5sZW5ndGg7IGkrKykge1xuICAgIHBhcnRzLnB1c2gocGF0aFRvUmVnZXhwKHBhdGhbaV0sIGtleXMsIG9wdGlvbnMpLnNvdXJjZSlcbiAgfVxuXG4gIHZhciByZWdleHAgPSBuZXcgUmVnRXhwKCcoPzonICsgcGFydHMuam9pbignfCcpICsgJyknLCBmbGFncyhvcHRpb25zKSlcblxuICByZXR1cm4gYXR0YWNoS2V5cyhyZWdleHAsIGtleXMpXG59XG5cbi8qKlxuICogQ3JlYXRlIGEgcGF0aCByZWdleHAgZnJvbSBzdHJpbmcgaW5wdXQuXG4gKlxuICogQHBhcmFtICB7U3RyaW5nfSBwYXRoXG4gKiBAcGFyYW0gIHtBcnJheX0gIGtleXNcbiAqIEBwYXJhbSAge09iamVjdH0gb3B0aW9uc1xuICogQHJldHVybiB7UmVnRXhwfVxuICovXG5mdW5jdGlvbiBzdHJpbmdUb1JlZ2V4cCAocGF0aCwga2V5cywgb3B0aW9ucykge1xuICB2YXIgdG9rZW5zID0gcGFyc2UocGF0aClcbiAgdmFyIHJlID0gdG9rZW5zVG9SZWdFeHAodG9rZW5zLCBvcHRpb25zKVxuXG4gIC8vIEF0dGFjaCBrZXlzIGJhY2sgdG8gdGhlIHJlZ2V4cC5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0b2tlbnMubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAodHlwZW9mIHRva2Vuc1tpXSAhPT0gJ3N0cmluZycpIHtcbiAgICAgIGtleXMucHVzaCh0b2tlbnNbaV0pXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGF0dGFjaEtleXMocmUsIGtleXMpXG59XG5cbi8qKlxuICogRXhwb3NlIGEgZnVuY3Rpb24gZm9yIHRha2luZyB0b2tlbnMgYW5kIHJldHVybmluZyBhIFJlZ0V4cC5cbiAqXG4gKiBAcGFyYW0gIHtBcnJheX0gIHRva2Vuc1xuICogQHBhcmFtICB7QXJyYXl9ICBrZXlzXG4gKiBAcGFyYW0gIHtPYmplY3R9IG9wdGlvbnNcbiAqIEByZXR1cm4ge1JlZ0V4cH1cbiAqL1xuZnVuY3Rpb24gdG9rZW5zVG9SZWdFeHAgKHRva2Vucywgb3B0aW9ucykge1xuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fVxuXG4gIHZhciBzdHJpY3QgPSBvcHRpb25zLnN0cmljdFxuICB2YXIgZW5kID0gb3B0aW9ucy5lbmQgIT09IGZhbHNlXG4gIHZhciByb3V0ZSA9ICcnXG4gIHZhciBsYXN0VG9rZW4gPSB0b2tlbnNbdG9rZW5zLmxlbmd0aCAtIDFdXG4gIHZhciBlbmRzV2l0aFNsYXNoID0gdHlwZW9mIGxhc3RUb2tlbiA9PT0gJ3N0cmluZycgJiYgL1xcLyQvLnRlc3QobGFzdFRva2VuKVxuXG4gIC8vIEl0ZXJhdGUgb3ZlciB0aGUgdG9rZW5zIGFuZCBjcmVhdGUgb3VyIHJlZ2V4cCBzdHJpbmcuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdG9rZW5zLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIHRva2VuID0gdG9rZW5zW2ldXG5cbiAgICBpZiAodHlwZW9mIHRva2VuID09PSAnc3RyaW5nJykge1xuICAgICAgcm91dGUgKz0gZXNjYXBlU3RyaW5nKHRva2VuKVxuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgcHJlZml4ID0gZXNjYXBlU3RyaW5nKHRva2VuLnByZWZpeClcbiAgICAgIHZhciBjYXB0dXJlID0gdG9rZW4ucGF0dGVyblxuXG4gICAgICBpZiAodG9rZW4ucmVwZWF0KSB7XG4gICAgICAgIGNhcHR1cmUgKz0gJyg/OicgKyBwcmVmaXggKyBjYXB0dXJlICsgJykqJ1xuICAgICAgfVxuXG4gICAgICBpZiAodG9rZW4ub3B0aW9uYWwpIHtcbiAgICAgICAgaWYgKHByZWZpeCkge1xuICAgICAgICAgIGNhcHR1cmUgPSAnKD86JyArIHByZWZpeCArICcoJyArIGNhcHR1cmUgKyAnKSk/J1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNhcHR1cmUgPSAnKCcgKyBjYXB0dXJlICsgJyk/J1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjYXB0dXJlID0gcHJlZml4ICsgJygnICsgY2FwdHVyZSArICcpJ1xuICAgICAgfVxuXG4gICAgICByb3V0ZSArPSBjYXB0dXJlXG4gICAgfVxuICB9XG5cbiAgLy8gSW4gbm9uLXN0cmljdCBtb2RlIHdlIGFsbG93IGEgc2xhc2ggYXQgdGhlIGVuZCBvZiBtYXRjaC4gSWYgdGhlIHBhdGggdG9cbiAgLy8gbWF0Y2ggYWxyZWFkeSBlbmRzIHdpdGggYSBzbGFzaCwgd2UgcmVtb3ZlIGl0IGZvciBjb25zaXN0ZW5jeS4gVGhlIHNsYXNoXG4gIC8vIGlzIHZhbGlkIGF0IHRoZSBlbmQgb2YgYSBwYXRoIG1hdGNoLCBub3QgaW4gdGhlIG1pZGRsZS4gVGhpcyBpcyBpbXBvcnRhbnRcbiAgLy8gaW4gbm9uLWVuZGluZyBtb2RlLCB3aGVyZSBcIi90ZXN0L1wiIHNob3VsZG4ndCBtYXRjaCBcIi90ZXN0Ly9yb3V0ZVwiLlxuICBpZiAoIXN0cmljdCkge1xuICAgIHJvdXRlID0gKGVuZHNXaXRoU2xhc2ggPyByb3V0ZS5zbGljZSgwLCAtMikgOiByb3V0ZSkgKyAnKD86XFxcXC8oPz0kKSk/J1xuICB9XG5cbiAgaWYgKGVuZCkge1xuICAgIHJvdXRlICs9ICckJ1xuICB9IGVsc2Uge1xuICAgIC8vIEluIG5vbi1lbmRpbmcgbW9kZSwgd2UgbmVlZCB0aGUgY2FwdHVyaW5nIGdyb3VwcyB0byBtYXRjaCBhcyBtdWNoIGFzXG4gICAgLy8gcG9zc2libGUgYnkgdXNpbmcgYSBwb3NpdGl2ZSBsb29rYWhlYWQgdG8gdGhlIGVuZCBvciBuZXh0IHBhdGggc2VnbWVudC5cbiAgICByb3V0ZSArPSBzdHJpY3QgJiYgZW5kc1dpdGhTbGFzaCA/ICcnIDogJyg/PVxcXFwvfCQpJ1xuICB9XG5cbiAgcmV0dXJuIG5ldyBSZWdFeHAoJ14nICsgcm91dGUsIGZsYWdzKG9wdGlvbnMpKVxufVxuXG4vKipcbiAqIE5vcm1hbGl6ZSB0aGUgZ2l2ZW4gcGF0aCBzdHJpbmcsIHJldHVybmluZyBhIHJlZ3VsYXIgZXhwcmVzc2lvbi5cbiAqXG4gKiBBbiBlbXB0eSBhcnJheSBjYW4gYmUgcGFzc2VkIGluIGZvciB0aGUga2V5cywgd2hpY2ggd2lsbCBob2xkIHRoZVxuICogcGxhY2Vob2xkZXIga2V5IGRlc2NyaXB0aW9ucy4gRm9yIGV4YW1wbGUsIHVzaW5nIGAvdXNlci86aWRgLCBga2V5c2Agd2lsbFxuICogY29udGFpbiBgW3sgbmFtZTogJ2lkJywgZGVsaW1pdGVyOiAnLycsIG9wdGlvbmFsOiBmYWxzZSwgcmVwZWF0OiBmYWxzZSB9XWAuXG4gKlxuICogQHBhcmFtICB7KFN0cmluZ3xSZWdFeHB8QXJyYXkpfSBwYXRoXG4gKiBAcGFyYW0gIHtBcnJheX0gICAgICAgICAgICAgICAgIFtrZXlzXVxuICogQHBhcmFtICB7T2JqZWN0fSAgICAgICAgICAgICAgICBbb3B0aW9uc11cbiAqIEByZXR1cm4ge1JlZ0V4cH1cbiAqL1xuZnVuY3Rpb24gcGF0aFRvUmVnZXhwIChwYXRoLCBrZXlzLCBvcHRpb25zKSB7XG4gIGtleXMgPSBrZXlzIHx8IFtdXG5cbiAgaWYgKCFpc2FycmF5KGtleXMpKSB7XG4gICAgb3B0aW9ucyA9IGtleXNcbiAgICBrZXlzID0gW11cbiAgfSBlbHNlIGlmICghb3B0aW9ucykge1xuICAgIG9wdGlvbnMgPSB7fVxuICB9XG5cbiAgaWYgKHBhdGggaW5zdGFuY2VvZiBSZWdFeHApIHtcbiAgICByZXR1cm4gcmVnZXhwVG9SZWdleHAocGF0aCwga2V5cywgb3B0aW9ucylcbiAgfVxuXG4gIGlmIChpc2FycmF5KHBhdGgpKSB7XG4gICAgcmV0dXJuIGFycmF5VG9SZWdleHAocGF0aCwga2V5cywgb3B0aW9ucylcbiAgfVxuXG4gIHJldHVybiBzdHJpbmdUb1JlZ2V4cChwYXRoLCBrZXlzLCBvcHRpb25zKVxufVxuIiwiKGZ1bmN0aW9uIChwcm9jZXNzKXtcbid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBFeHBvcnQgYGZyZWV6ZWBcbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZyZWV6ZVxuXG4vKipcbiAqIEFyZSB3ZSBydW5uaW5nIGluIGEgcHJvZHVjdGlvbiBidWlsZD9cbiAqL1xuXG52YXIgcHJvZHVjdGlvbiA9IHByb2Nlc3MgJiYgcHJvY2Vzcy5lbnYgJiYgcHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09ICdwcm9kdWN0aW9uJ1xuXG4vKipcbiAqIElzIEZyZWV6YWJsZT9cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0XG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICovXG5cbmZ1bmN0aW9uIGlzRnJlZXphYmxlKG9iamVjdCkge1xuICBpZiAob2JqZWN0ID09PSBudWxsKSByZXR1cm4gZmFsc2VcblxuICByZXR1cm4gQXJyYXkuaXNBcnJheShvYmplY3QpIHx8XG4gICAgdHlwZW9mIG9iamVjdCA9PT0gJ29iamVjdCdcbn1cblxuLyoqXG4gKiBDaGVjayBpZiB3ZSBuZWVkIHRvIGZyZWV6ZSB0aGlzIHZhbHVlXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdFxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqL1xuXG5mdW5jdGlvbiBuZWVkc0ZyZWV6aW5nKG9iamVjdCkge1xuICByZXR1cm4gaXNGcmVlemFibGUob2JqZWN0KSAmJiAhT2JqZWN0LmlzRnJvemVuKG9iamVjdClcbn1cblxuLyoqXG4gKiBSZWN1cnNlXG4gKlxuICogQHBhcmFtIHtPYmplY3R9XG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKi9cblxuZnVuY3Rpb24gcmVjdXIob2JqZWN0KSB7XG4gIE9iamVjdC5mcmVlemUob2JqZWN0KVxuXG4gIE9iamVjdC5rZXlzKG9iamVjdCkuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gICAgY29uc3QgdmFsdWUgPSBvYmplY3Rba2V5XVxuICAgIGlmIChuZWVkc0ZyZWV6aW5nKHZhbHVlKSkge1xuICAgICAgcmVjdXIodmFsdWUpXG4gICAgfVxuICB9KVxuXG4gIHJldHVybiBvYmplY3Rcbn1cblxuLyoqXG4gKiBEZWVwbHkgZnJlZXplIGEgcGxhaW4gamF2YXNjcmlwdCBvYmplY3QuXG4gKlxuICogSWYgYHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSAncHJvZHVjdGlvbidgLCB0aGlzIHJldHVybnMgdGhlIG9yaWdpbmFsIG9iamVjdFxuICogd2l0b3V0IGZyZWV6aW5nLlxuICpcbiAqIEBmdW5jdGlvblxuICogQHNpZyBhIC0+IGFcbiAqIEBwYXJhbSAge29iamVjdH0gb2JqZWN0IE9iamVjdCB0byBmcmVlemUuXG4gKiBAcmV0dXJuIHtvYmplY3R9IEZyb3plbiBvYmplY3QsIHVubGVzcyBpbiBwcm9kdWN0aW9uLCB0aGVuIHRoZSBzYW1lIG9iamVjdC5cbiAqL1xuXG5mdW5jdGlvbiBmcmVlemUob2JqZWN0KSB7XG4gIGlmIChwcm9kdWN0aW9uKSByZXR1cm4gb2JqZWN0XG5cbiAgaWYgKG5lZWRzRnJlZXppbmcob2JqZWN0KSkge1xuICAgIHJlY3VyKG9iamVjdClcbiAgfVxuXG4gIHJldHVybiBvYmplY3Rcbn1cblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCIuLi8uLi9tYWtvLWpzL25vZGVfbW9kdWxlcy9wcm9jZXNzL2Jyb3dzZXIuanNcIikpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCl7XG4vKiFcbiAqIEBvdmVydmlldyBlczYtcHJvbWlzZSAtIGEgdGlueSBpbXBsZW1lbnRhdGlvbiBvZiBQcm9taXNlcy9BKy5cbiAqIEBjb3B5cmlnaHQgQ29weXJpZ2h0IChjKSAyMDE0IFllaHVkYSBLYXR6LCBUb20gRGFsZSwgU3RlZmFuIFBlbm5lciBhbmQgY29udHJpYnV0b3JzIChDb252ZXJzaW9uIHRvIEVTNiBBUEkgYnkgSmFrZSBBcmNoaWJhbGQpXG4gKiBAbGljZW5zZSAgIExpY2Vuc2VkIHVuZGVyIE1JVCBsaWNlbnNlXG4gKiAgICAgICAgICAgIFNlZSBodHRwczovL3Jhdy5naXRodWJ1c2VyY29udGVudC5jb20vamFrZWFyY2hpYmFsZC9lczYtcHJvbWlzZS9tYXN0ZXIvTElDRU5TRVxuICogQHZlcnNpb24gICAzLjEuMlxuICovXG5cbihmdW5jdGlvbigpIHtcbiAgICBcInVzZSBzdHJpY3RcIjtcbiAgICBmdW5jdGlvbiBsaWIkZXM2JHByb21pc2UkdXRpbHMkJG9iamVjdE9yRnVuY3Rpb24oeCkge1xuICAgICAgcmV0dXJuIHR5cGVvZiB4ID09PSAnZnVuY3Rpb24nIHx8ICh0eXBlb2YgeCA9PT0gJ29iamVjdCcgJiYgeCAhPT0gbnVsbCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbGliJGVzNiRwcm9taXNlJHV0aWxzJCRpc0Z1bmN0aW9uKHgpIHtcbiAgICAgIHJldHVybiB0eXBlb2YgeCA9PT0gJ2Z1bmN0aW9uJztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsaWIkZXM2JHByb21pc2UkdXRpbHMkJGlzTWF5YmVUaGVuYWJsZSh4KSB7XG4gICAgICByZXR1cm4gdHlwZW9mIHggPT09ICdvYmplY3QnICYmIHggIT09IG51bGw7XG4gICAgfVxuXG4gICAgdmFyIGxpYiRlczYkcHJvbWlzZSR1dGlscyQkX2lzQXJyYXk7XG4gICAgaWYgKCFBcnJheS5pc0FycmF5KSB7XG4gICAgICBsaWIkZXM2JHByb21pc2UkdXRpbHMkJF9pc0FycmF5ID0gZnVuY3Rpb24gKHgpIHtcbiAgICAgICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh4KSA9PT0gJ1tvYmplY3QgQXJyYXldJztcbiAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgIGxpYiRlczYkcHJvbWlzZSR1dGlscyQkX2lzQXJyYXkgPSBBcnJheS5pc0FycmF5O1xuICAgIH1cblxuICAgIHZhciBsaWIkZXM2JHByb21pc2UkdXRpbHMkJGlzQXJyYXkgPSBsaWIkZXM2JHByb21pc2UkdXRpbHMkJF9pc0FycmF5O1xuICAgIHZhciBsaWIkZXM2JHByb21pc2UkYXNhcCQkbGVuID0gMDtcbiAgICB2YXIgbGliJGVzNiRwcm9taXNlJGFzYXAkJHZlcnR4TmV4dDtcbiAgICB2YXIgbGliJGVzNiRwcm9taXNlJGFzYXAkJGN1c3RvbVNjaGVkdWxlckZuO1xuXG4gICAgdmFyIGxpYiRlczYkcHJvbWlzZSRhc2FwJCRhc2FwID0gZnVuY3Rpb24gYXNhcChjYWxsYmFjaywgYXJnKSB7XG4gICAgICBsaWIkZXM2JHByb21pc2UkYXNhcCQkcXVldWVbbGliJGVzNiRwcm9taXNlJGFzYXAkJGxlbl0gPSBjYWxsYmFjaztcbiAgICAgIGxpYiRlczYkcHJvbWlzZSRhc2FwJCRxdWV1ZVtsaWIkZXM2JHByb21pc2UkYXNhcCQkbGVuICsgMV0gPSBhcmc7XG4gICAgICBsaWIkZXM2JHByb21pc2UkYXNhcCQkbGVuICs9IDI7XG4gICAgICBpZiAobGliJGVzNiRwcm9taXNlJGFzYXAkJGxlbiA9PT0gMikge1xuICAgICAgICAvLyBJZiBsZW4gaXMgMiwgdGhhdCBtZWFucyB0aGF0IHdlIG5lZWQgdG8gc2NoZWR1bGUgYW4gYXN5bmMgZmx1c2guXG4gICAgICAgIC8vIElmIGFkZGl0aW9uYWwgY2FsbGJhY2tzIGFyZSBxdWV1ZWQgYmVmb3JlIHRoZSBxdWV1ZSBpcyBmbHVzaGVkLCB0aGV5XG4gICAgICAgIC8vIHdpbGwgYmUgcHJvY2Vzc2VkIGJ5IHRoaXMgZmx1c2ggdGhhdCB3ZSBhcmUgc2NoZWR1bGluZy5cbiAgICAgICAgaWYgKGxpYiRlczYkcHJvbWlzZSRhc2FwJCRjdXN0b21TY2hlZHVsZXJGbikge1xuICAgICAgICAgIGxpYiRlczYkcHJvbWlzZSRhc2FwJCRjdXN0b21TY2hlZHVsZXJGbihsaWIkZXM2JHByb21pc2UkYXNhcCQkZmx1c2gpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGxpYiRlczYkcHJvbWlzZSRhc2FwJCRzY2hlZHVsZUZsdXNoKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsaWIkZXM2JHByb21pc2UkYXNhcCQkc2V0U2NoZWR1bGVyKHNjaGVkdWxlRm4pIHtcbiAgICAgIGxpYiRlczYkcHJvbWlzZSRhc2FwJCRjdXN0b21TY2hlZHVsZXJGbiA9IHNjaGVkdWxlRm47XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbGliJGVzNiRwcm9taXNlJGFzYXAkJHNldEFzYXAoYXNhcEZuKSB7XG4gICAgICBsaWIkZXM2JHByb21pc2UkYXNhcCQkYXNhcCA9IGFzYXBGbjtcbiAgICB9XG5cbiAgICB2YXIgbGliJGVzNiRwcm9taXNlJGFzYXAkJGJyb3dzZXJXaW5kb3cgPSAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcpID8gd2luZG93IDogdW5kZWZpbmVkO1xuICAgIHZhciBsaWIkZXM2JHByb21pc2UkYXNhcCQkYnJvd3Nlckdsb2JhbCA9IGxpYiRlczYkcHJvbWlzZSRhc2FwJCRicm93c2VyV2luZG93IHx8IHt9O1xuICAgIHZhciBsaWIkZXM2JHByb21pc2UkYXNhcCQkQnJvd3Nlck11dGF0aW9uT2JzZXJ2ZXIgPSBsaWIkZXM2JHByb21pc2UkYXNhcCQkYnJvd3Nlckdsb2JhbC5NdXRhdGlvbk9ic2VydmVyIHx8IGxpYiRlczYkcHJvbWlzZSRhc2FwJCRicm93c2VyR2xvYmFsLldlYktpdE11dGF0aW9uT2JzZXJ2ZXI7XG4gICAgdmFyIGxpYiRlczYkcHJvbWlzZSRhc2FwJCRpc05vZGUgPSB0eXBlb2YgcHJvY2VzcyAhPT0gJ3VuZGVmaW5lZCcgJiYge30udG9TdHJpbmcuY2FsbChwcm9jZXNzKSA9PT0gJ1tvYmplY3QgcHJvY2Vzc10nO1xuXG4gICAgLy8gdGVzdCBmb3Igd2ViIHdvcmtlciBidXQgbm90IGluIElFMTBcbiAgICB2YXIgbGliJGVzNiRwcm9taXNlJGFzYXAkJGlzV29ya2VyID0gdHlwZW9mIFVpbnQ4Q2xhbXBlZEFycmF5ICE9PSAndW5kZWZpbmVkJyAmJlxuICAgICAgdHlwZW9mIGltcG9ydFNjcmlwdHMgIT09ICd1bmRlZmluZWQnICYmXG4gICAgICB0eXBlb2YgTWVzc2FnZUNoYW5uZWwgIT09ICd1bmRlZmluZWQnO1xuXG4gICAgLy8gbm9kZVxuICAgIGZ1bmN0aW9uIGxpYiRlczYkcHJvbWlzZSRhc2FwJCR1c2VOZXh0VGljaygpIHtcbiAgICAgIC8vIG5vZGUgdmVyc2lvbiAwLjEwLnggZGlzcGxheXMgYSBkZXByZWNhdGlvbiB3YXJuaW5nIHdoZW4gbmV4dFRpY2sgaXMgdXNlZCByZWN1cnNpdmVseVxuICAgICAgLy8gc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9jdWpvanMvd2hlbi9pc3N1ZXMvNDEwIGZvciBkZXRhaWxzXG4gICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgIHByb2Nlc3MubmV4dFRpY2sobGliJGVzNiRwcm9taXNlJGFzYXAkJGZsdXNoKTtcbiAgICAgIH07XG4gICAgfVxuXG4gICAgLy8gdmVydHhcbiAgICBmdW5jdGlvbiBsaWIkZXM2JHByb21pc2UkYXNhcCQkdXNlVmVydHhUaW1lcigpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgbGliJGVzNiRwcm9taXNlJGFzYXAkJHZlcnR4TmV4dChsaWIkZXM2JHByb21pc2UkYXNhcCQkZmx1c2gpO1xuICAgICAgfTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsaWIkZXM2JHByb21pc2UkYXNhcCQkdXNlTXV0YXRpb25PYnNlcnZlcigpIHtcbiAgICAgIHZhciBpdGVyYXRpb25zID0gMDtcbiAgICAgIHZhciBvYnNlcnZlciA9IG5ldyBsaWIkZXM2JHByb21pc2UkYXNhcCQkQnJvd3Nlck11dGF0aW9uT2JzZXJ2ZXIobGliJGVzNiRwcm9taXNlJGFzYXAkJGZsdXNoKTtcbiAgICAgIHZhciBub2RlID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoJycpO1xuICAgICAgb2JzZXJ2ZXIub2JzZXJ2ZShub2RlLCB7IGNoYXJhY3RlckRhdGE6IHRydWUgfSk7XG5cbiAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgbm9kZS5kYXRhID0gKGl0ZXJhdGlvbnMgPSArK2l0ZXJhdGlvbnMgJSAyKTtcbiAgICAgIH07XG4gICAgfVxuXG4gICAgLy8gd2ViIHdvcmtlclxuICAgIGZ1bmN0aW9uIGxpYiRlczYkcHJvbWlzZSRhc2FwJCR1c2VNZXNzYWdlQ2hhbm5lbCgpIHtcbiAgICAgIHZhciBjaGFubmVsID0gbmV3IE1lc3NhZ2VDaGFubmVsKCk7XG4gICAgICBjaGFubmVsLnBvcnQxLm9ubWVzc2FnZSA9IGxpYiRlczYkcHJvbWlzZSRhc2FwJCRmbHVzaDtcbiAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGNoYW5uZWwucG9ydDIucG9zdE1lc3NhZ2UoMCk7XG4gICAgICB9O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxpYiRlczYkcHJvbWlzZSRhc2FwJCR1c2VTZXRUaW1lb3V0KCkge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICBzZXRUaW1lb3V0KGxpYiRlczYkcHJvbWlzZSRhc2FwJCRmbHVzaCwgMSk7XG4gICAgICB9O1xuICAgIH1cblxuICAgIHZhciBsaWIkZXM2JHByb21pc2UkYXNhcCQkcXVldWUgPSBuZXcgQXJyYXkoMTAwMCk7XG4gICAgZnVuY3Rpb24gbGliJGVzNiRwcm9taXNlJGFzYXAkJGZsdXNoKCkge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsaWIkZXM2JHByb21pc2UkYXNhcCQkbGVuOyBpKz0yKSB7XG4gICAgICAgIHZhciBjYWxsYmFjayA9IGxpYiRlczYkcHJvbWlzZSRhc2FwJCRxdWV1ZVtpXTtcbiAgICAgICAgdmFyIGFyZyA9IGxpYiRlczYkcHJvbWlzZSRhc2FwJCRxdWV1ZVtpKzFdO1xuXG4gICAgICAgIGNhbGxiYWNrKGFyZyk7XG5cbiAgICAgICAgbGliJGVzNiRwcm9taXNlJGFzYXAkJHF1ZXVlW2ldID0gdW5kZWZpbmVkO1xuICAgICAgICBsaWIkZXM2JHByb21pc2UkYXNhcCQkcXVldWVbaSsxXSA9IHVuZGVmaW5lZDtcbiAgICAgIH1cblxuICAgICAgbGliJGVzNiRwcm9taXNlJGFzYXAkJGxlbiA9IDA7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbGliJGVzNiRwcm9taXNlJGFzYXAkJGF0dGVtcHRWZXJ0eCgpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHZhciByID0gcmVxdWlyZTtcbiAgICAgICAgdmFyIHZlcnR4ID0gcigndmVydHgnKTtcbiAgICAgICAgbGliJGVzNiRwcm9taXNlJGFzYXAkJHZlcnR4TmV4dCA9IHZlcnR4LnJ1bk9uTG9vcCB8fCB2ZXJ0eC5ydW5PbkNvbnRleHQ7XG4gICAgICAgIHJldHVybiBsaWIkZXM2JHByb21pc2UkYXNhcCQkdXNlVmVydHhUaW1lcigpO1xuICAgICAgfSBjYXRjaChlKSB7XG4gICAgICAgIHJldHVybiBsaWIkZXM2JHByb21pc2UkYXNhcCQkdXNlU2V0VGltZW91dCgpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHZhciBsaWIkZXM2JHByb21pc2UkYXNhcCQkc2NoZWR1bGVGbHVzaDtcbiAgICAvLyBEZWNpZGUgd2hhdCBhc3luYyBtZXRob2QgdG8gdXNlIHRvIHRyaWdnZXJpbmcgcHJvY2Vzc2luZyBvZiBxdWV1ZWQgY2FsbGJhY2tzOlxuICAgIGlmIChsaWIkZXM2JHByb21pc2UkYXNhcCQkaXNOb2RlKSB7XG4gICAgICBsaWIkZXM2JHByb21pc2UkYXNhcCQkc2NoZWR1bGVGbHVzaCA9IGxpYiRlczYkcHJvbWlzZSRhc2FwJCR1c2VOZXh0VGljaygpO1xuICAgIH0gZWxzZSBpZiAobGliJGVzNiRwcm9taXNlJGFzYXAkJEJyb3dzZXJNdXRhdGlvbk9ic2VydmVyKSB7XG4gICAgICBsaWIkZXM2JHByb21pc2UkYXNhcCQkc2NoZWR1bGVGbHVzaCA9IGxpYiRlczYkcHJvbWlzZSRhc2FwJCR1c2VNdXRhdGlvbk9ic2VydmVyKCk7XG4gICAgfSBlbHNlIGlmIChsaWIkZXM2JHByb21pc2UkYXNhcCQkaXNXb3JrZXIpIHtcbiAgICAgIGxpYiRlczYkcHJvbWlzZSRhc2FwJCRzY2hlZHVsZUZsdXNoID0gbGliJGVzNiRwcm9taXNlJGFzYXAkJHVzZU1lc3NhZ2VDaGFubmVsKCk7XG4gICAgfSBlbHNlIGlmIChsaWIkZXM2JHByb21pc2UkYXNhcCQkYnJvd3NlcldpbmRvdyA9PT0gdW5kZWZpbmVkICYmIHR5cGVvZiByZXF1aXJlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBsaWIkZXM2JHByb21pc2UkYXNhcCQkc2NoZWR1bGVGbHVzaCA9IGxpYiRlczYkcHJvbWlzZSRhc2FwJCRhdHRlbXB0VmVydHgoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbGliJGVzNiRwcm9taXNlJGFzYXAkJHNjaGVkdWxlRmx1c2ggPSBsaWIkZXM2JHByb21pc2UkYXNhcCQkdXNlU2V0VGltZW91dCgpO1xuICAgIH1cbiAgICBmdW5jdGlvbiBsaWIkZXM2JHByb21pc2UkdGhlbiQkdGhlbihvbkZ1bGZpbGxtZW50LCBvblJlamVjdGlvbikge1xuICAgICAgdmFyIHBhcmVudCA9IHRoaXM7XG4gICAgICB2YXIgc3RhdGUgPSBwYXJlbnQuX3N0YXRlO1xuXG4gICAgICBpZiAoc3RhdGUgPT09IGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJEZVTEZJTExFRCAmJiAhb25GdWxmaWxsbWVudCB8fCBzdGF0ZSA9PT0gbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkUkVKRUNURUQgJiYgIW9uUmVqZWN0aW9uKSB7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfVxuXG4gICAgICB2YXIgY2hpbGQgPSBuZXcgdGhpcy5jb25zdHJ1Y3RvcihsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRub29wKTtcbiAgICAgIHZhciByZXN1bHQgPSBwYXJlbnQuX3Jlc3VsdDtcblxuICAgICAgaWYgKHN0YXRlKSB7XG4gICAgICAgIHZhciBjYWxsYmFjayA9IGFyZ3VtZW50c1tzdGF0ZSAtIDFdO1xuICAgICAgICBsaWIkZXM2JHByb21pc2UkYXNhcCQkYXNhcChmdW5jdGlvbigpe1xuICAgICAgICAgIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJGludm9rZUNhbGxiYWNrKHN0YXRlLCBjaGlsZCwgY2FsbGJhY2ssIHJlc3VsdCk7XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkc3Vic2NyaWJlKHBhcmVudCwgY2hpbGQsIG9uRnVsZmlsbG1lbnQsIG9uUmVqZWN0aW9uKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGNoaWxkO1xuICAgIH1cbiAgICB2YXIgbGliJGVzNiRwcm9taXNlJHRoZW4kJGRlZmF1bHQgPSBsaWIkZXM2JHByb21pc2UkdGhlbiQkdGhlbjtcbiAgICBmdW5jdGlvbiBsaWIkZXM2JHByb21pc2UkcHJvbWlzZSRyZXNvbHZlJCRyZXNvbHZlKG9iamVjdCkge1xuICAgICAgLypqc2hpbnQgdmFsaWR0aGlzOnRydWUgKi9cbiAgICAgIHZhciBDb25zdHJ1Y3RvciA9IHRoaXM7XG5cbiAgICAgIGlmIChvYmplY3QgJiYgdHlwZW9mIG9iamVjdCA9PT0gJ29iamVjdCcgJiYgb2JqZWN0LmNvbnN0cnVjdG9yID09PSBDb25zdHJ1Y3Rvcikge1xuICAgICAgICByZXR1cm4gb2JqZWN0O1xuICAgICAgfVxuXG4gICAgICB2YXIgcHJvbWlzZSA9IG5ldyBDb25zdHJ1Y3RvcihsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRub29wKTtcbiAgICAgIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJHJlc29sdmUocHJvbWlzZSwgb2JqZWN0KTtcbiAgICAgIHJldHVybiBwcm9taXNlO1xuICAgIH1cbiAgICB2YXIgbGliJGVzNiRwcm9taXNlJHByb21pc2UkcmVzb2x2ZSQkZGVmYXVsdCA9IGxpYiRlczYkcHJvbWlzZSRwcm9taXNlJHJlc29sdmUkJHJlc29sdmU7XG5cbiAgICBmdW5jdGlvbiBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRub29wKCkge31cblxuICAgIHZhciBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRQRU5ESU5HICAgPSB2b2lkIDA7XG4gICAgdmFyIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJEZVTEZJTExFRCA9IDE7XG4gICAgdmFyIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJFJFSkVDVEVEICA9IDI7XG5cbiAgICB2YXIgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkR0VUX1RIRU5fRVJST1IgPSBuZXcgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkRXJyb3JPYmplY3QoKTtcblxuICAgIGZ1bmN0aW9uIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJHNlbGZGdWxmaWxsbWVudCgpIHtcbiAgICAgIHJldHVybiBuZXcgVHlwZUVycm9yKFwiWW91IGNhbm5vdCByZXNvbHZlIGEgcHJvbWlzZSB3aXRoIGl0c2VsZlwiKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRjYW5ub3RSZXR1cm5Pd24oKSB7XG4gICAgICByZXR1cm4gbmV3IFR5cGVFcnJvcignQSBwcm9taXNlcyBjYWxsYmFjayBjYW5ub3QgcmV0dXJuIHRoYXQgc2FtZSBwcm9taXNlLicpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJGdldFRoZW4ocHJvbWlzZSkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIHByb21pc2UudGhlbjtcbiAgICAgIH0gY2F0Y2goZXJyb3IpIHtcbiAgICAgICAgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkR0VUX1RIRU5fRVJST1IuZXJyb3IgPSBlcnJvcjtcbiAgICAgICAgcmV0dXJuIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJEdFVF9USEVOX0VSUk9SO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJHRyeVRoZW4odGhlbiwgdmFsdWUsIGZ1bGZpbGxtZW50SGFuZGxlciwgcmVqZWN0aW9uSGFuZGxlcikge1xuICAgICAgdHJ5IHtcbiAgICAgICAgdGhlbi5jYWxsKHZhbHVlLCBmdWxmaWxsbWVudEhhbmRsZXIsIHJlamVjdGlvbkhhbmRsZXIpO1xuICAgICAgfSBjYXRjaChlKSB7XG4gICAgICAgIHJldHVybiBlO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJGhhbmRsZUZvcmVpZ25UaGVuYWJsZShwcm9taXNlLCB0aGVuYWJsZSwgdGhlbikge1xuICAgICAgIGxpYiRlczYkcHJvbWlzZSRhc2FwJCRhc2FwKGZ1bmN0aW9uKHByb21pc2UpIHtcbiAgICAgICAgdmFyIHNlYWxlZCA9IGZhbHNlO1xuICAgICAgICB2YXIgZXJyb3IgPSBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCR0cnlUaGVuKHRoZW4sIHRoZW5hYmxlLCBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgIGlmIChzZWFsZWQpIHsgcmV0dXJuOyB9XG4gICAgICAgICAgc2VhbGVkID0gdHJ1ZTtcbiAgICAgICAgICBpZiAodGhlbmFibGUgIT09IHZhbHVlKSB7XG4gICAgICAgICAgICBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRyZXNvbHZlKHByb21pc2UsIHZhbHVlKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkZnVsZmlsbChwcm9taXNlLCB2YWx1ZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9LCBmdW5jdGlvbihyZWFzb24pIHtcbiAgICAgICAgICBpZiAoc2VhbGVkKSB7IHJldHVybjsgfVxuICAgICAgICAgIHNlYWxlZCA9IHRydWU7XG5cbiAgICAgICAgICBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRyZWplY3QocHJvbWlzZSwgcmVhc29uKTtcbiAgICAgICAgfSwgJ1NldHRsZTogJyArIChwcm9taXNlLl9sYWJlbCB8fCAnIHVua25vd24gcHJvbWlzZScpKTtcblxuICAgICAgICBpZiAoIXNlYWxlZCAmJiBlcnJvcikge1xuICAgICAgICAgIHNlYWxlZCA9IHRydWU7XG4gICAgICAgICAgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkcmVqZWN0KHByb21pc2UsIGVycm9yKTtcbiAgICAgICAgfVxuICAgICAgfSwgcHJvbWlzZSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkaGFuZGxlT3duVGhlbmFibGUocHJvbWlzZSwgdGhlbmFibGUpIHtcbiAgICAgIGlmICh0aGVuYWJsZS5fc3RhdGUgPT09IGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJEZVTEZJTExFRCkge1xuICAgICAgICBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRmdWxmaWxsKHByb21pc2UsIHRoZW5hYmxlLl9yZXN1bHQpO1xuICAgICAgfSBlbHNlIGlmICh0aGVuYWJsZS5fc3RhdGUgPT09IGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJFJFSkVDVEVEKSB7XG4gICAgICAgIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJHJlamVjdChwcm9taXNlLCB0aGVuYWJsZS5fcmVzdWx0KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJHN1YnNjcmliZSh0aGVuYWJsZSwgdW5kZWZpbmVkLCBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJHJlc29sdmUocHJvbWlzZSwgdmFsdWUpO1xuICAgICAgICB9LCBmdW5jdGlvbihyZWFzb24pIHtcbiAgICAgICAgICBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRyZWplY3QocHJvbWlzZSwgcmVhc29uKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkaGFuZGxlTWF5YmVUaGVuYWJsZShwcm9taXNlLCBtYXliZVRoZW5hYmxlLCB0aGVuKSB7XG4gICAgICBpZiAobWF5YmVUaGVuYWJsZS5jb25zdHJ1Y3RvciA9PT0gcHJvbWlzZS5jb25zdHJ1Y3RvciAmJlxuICAgICAgICAgIHRoZW4gPT09IGxpYiRlczYkcHJvbWlzZSR0aGVuJCRkZWZhdWx0ICYmXG4gICAgICAgICAgY29uc3RydWN0b3IucmVzb2x2ZSA9PT0gbGliJGVzNiRwcm9taXNlJHByb21pc2UkcmVzb2x2ZSQkZGVmYXVsdCkge1xuICAgICAgICBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRoYW5kbGVPd25UaGVuYWJsZShwcm9taXNlLCBtYXliZVRoZW5hYmxlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmICh0aGVuID09PSBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRHRVRfVEhFTl9FUlJPUikge1xuICAgICAgICAgIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJHJlamVjdChwcm9taXNlLCBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRHRVRfVEhFTl9FUlJPUi5lcnJvcik7XG4gICAgICAgIH0gZWxzZSBpZiAodGhlbiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkZnVsZmlsbChwcm9taXNlLCBtYXliZVRoZW5hYmxlKTtcbiAgICAgICAgfSBlbHNlIGlmIChsaWIkZXM2JHByb21pc2UkdXRpbHMkJGlzRnVuY3Rpb24odGhlbikpIHtcbiAgICAgICAgICBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRoYW5kbGVGb3JlaWduVGhlbmFibGUocHJvbWlzZSwgbWF5YmVUaGVuYWJsZSwgdGhlbik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkZnVsZmlsbChwcm9taXNlLCBtYXliZVRoZW5hYmxlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJHJlc29sdmUocHJvbWlzZSwgdmFsdWUpIHtcbiAgICAgIGlmIChwcm9taXNlID09PSB2YWx1ZSkge1xuICAgICAgICBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRyZWplY3QocHJvbWlzZSwgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkc2VsZkZ1bGZpbGxtZW50KCkpO1xuICAgICAgfSBlbHNlIGlmIChsaWIkZXM2JHByb21pc2UkdXRpbHMkJG9iamVjdE9yRnVuY3Rpb24odmFsdWUpKSB7XG4gICAgICAgIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJGhhbmRsZU1heWJlVGhlbmFibGUocHJvbWlzZSwgdmFsdWUsIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJGdldFRoZW4odmFsdWUpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJGZ1bGZpbGwocHJvbWlzZSwgdmFsdWUpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJHB1Ymxpc2hSZWplY3Rpb24ocHJvbWlzZSkge1xuICAgICAgaWYgKHByb21pc2UuX29uZXJyb3IpIHtcbiAgICAgICAgcHJvbWlzZS5fb25lcnJvcihwcm9taXNlLl9yZXN1bHQpO1xuICAgICAgfVxuXG4gICAgICBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRwdWJsaXNoKHByb21pc2UpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJGZ1bGZpbGwocHJvbWlzZSwgdmFsdWUpIHtcbiAgICAgIGlmIChwcm9taXNlLl9zdGF0ZSAhPT0gbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkUEVORElORykgeyByZXR1cm47IH1cblxuICAgICAgcHJvbWlzZS5fcmVzdWx0ID0gdmFsdWU7XG4gICAgICBwcm9taXNlLl9zdGF0ZSA9IGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJEZVTEZJTExFRDtcblxuICAgICAgaWYgKHByb21pc2UuX3N1YnNjcmliZXJzLmxlbmd0aCAhPT0gMCkge1xuICAgICAgICBsaWIkZXM2JHByb21pc2UkYXNhcCQkYXNhcChsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRwdWJsaXNoLCBwcm9taXNlKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRyZWplY3QocHJvbWlzZSwgcmVhc29uKSB7XG4gICAgICBpZiAocHJvbWlzZS5fc3RhdGUgIT09IGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJFBFTkRJTkcpIHsgcmV0dXJuOyB9XG4gICAgICBwcm9taXNlLl9zdGF0ZSA9IGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJFJFSkVDVEVEO1xuICAgICAgcHJvbWlzZS5fcmVzdWx0ID0gcmVhc29uO1xuXG4gICAgICBsaWIkZXM2JHByb21pc2UkYXNhcCQkYXNhcChsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRwdWJsaXNoUmVqZWN0aW9uLCBwcm9taXNlKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRzdWJzY3JpYmUocGFyZW50LCBjaGlsZCwgb25GdWxmaWxsbWVudCwgb25SZWplY3Rpb24pIHtcbiAgICAgIHZhciBzdWJzY3JpYmVycyA9IHBhcmVudC5fc3Vic2NyaWJlcnM7XG4gICAgICB2YXIgbGVuZ3RoID0gc3Vic2NyaWJlcnMubGVuZ3RoO1xuXG4gICAgICBwYXJlbnQuX29uZXJyb3IgPSBudWxsO1xuXG4gICAgICBzdWJzY3JpYmVyc1tsZW5ndGhdID0gY2hpbGQ7XG4gICAgICBzdWJzY3JpYmVyc1tsZW5ndGggKyBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRGVUxGSUxMRURdID0gb25GdWxmaWxsbWVudDtcbiAgICAgIHN1YnNjcmliZXJzW2xlbmd0aCArIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJFJFSkVDVEVEXSAgPSBvblJlamVjdGlvbjtcblxuICAgICAgaWYgKGxlbmd0aCA9PT0gMCAmJiBwYXJlbnQuX3N0YXRlKSB7XG4gICAgICAgIGxpYiRlczYkcHJvbWlzZSRhc2FwJCRhc2FwKGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJHB1Ymxpc2gsIHBhcmVudCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkcHVibGlzaChwcm9taXNlKSB7XG4gICAgICB2YXIgc3Vic2NyaWJlcnMgPSBwcm9taXNlLl9zdWJzY3JpYmVycztcbiAgICAgIHZhciBzZXR0bGVkID0gcHJvbWlzZS5fc3RhdGU7XG5cbiAgICAgIGlmIChzdWJzY3JpYmVycy5sZW5ndGggPT09IDApIHsgcmV0dXJuOyB9XG5cbiAgICAgIHZhciBjaGlsZCwgY2FsbGJhY2ssIGRldGFpbCA9IHByb21pc2UuX3Jlc3VsdDtcblxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdWJzY3JpYmVycy5sZW5ndGg7IGkgKz0gMykge1xuICAgICAgICBjaGlsZCA9IHN1YnNjcmliZXJzW2ldO1xuICAgICAgICBjYWxsYmFjayA9IHN1YnNjcmliZXJzW2kgKyBzZXR0bGVkXTtcblxuICAgICAgICBpZiAoY2hpbGQpIHtcbiAgICAgICAgICBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRpbnZva2VDYWxsYmFjayhzZXR0bGVkLCBjaGlsZCwgY2FsbGJhY2ssIGRldGFpbCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY2FsbGJhY2soZGV0YWlsKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBwcm9taXNlLl9zdWJzY3JpYmVycy5sZW5ndGggPSAwO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJEVycm9yT2JqZWN0KCkge1xuICAgICAgdGhpcy5lcnJvciA9IG51bGw7XG4gICAgfVxuXG4gICAgdmFyIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJFRSWV9DQVRDSF9FUlJPUiA9IG5ldyBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRFcnJvck9iamVjdCgpO1xuXG4gICAgZnVuY3Rpb24gbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkdHJ5Q2F0Y2goY2FsbGJhY2ssIGRldGFpbCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIGNhbGxiYWNrKGRldGFpbCk7XG4gICAgICB9IGNhdGNoKGUpIHtcbiAgICAgICAgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkVFJZX0NBVENIX0VSUk9SLmVycm9yID0gZTtcbiAgICAgICAgcmV0dXJuIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJFRSWV9DQVRDSF9FUlJPUjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRpbnZva2VDYWxsYmFjayhzZXR0bGVkLCBwcm9taXNlLCBjYWxsYmFjaywgZGV0YWlsKSB7XG4gICAgICB2YXIgaGFzQ2FsbGJhY2sgPSBsaWIkZXM2JHByb21pc2UkdXRpbHMkJGlzRnVuY3Rpb24oY2FsbGJhY2spLFxuICAgICAgICAgIHZhbHVlLCBlcnJvciwgc3VjY2VlZGVkLCBmYWlsZWQ7XG5cbiAgICAgIGlmIChoYXNDYWxsYmFjaykge1xuICAgICAgICB2YWx1ZSA9IGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJHRyeUNhdGNoKGNhbGxiYWNrLCBkZXRhaWwpO1xuXG4gICAgICAgIGlmICh2YWx1ZSA9PT0gbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkVFJZX0NBVENIX0VSUk9SKSB7XG4gICAgICAgICAgZmFpbGVkID0gdHJ1ZTtcbiAgICAgICAgICBlcnJvciA9IHZhbHVlLmVycm9yO1xuICAgICAgICAgIHZhbHVlID0gbnVsbDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzdWNjZWVkZWQgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHByb21pc2UgPT09IHZhbHVlKSB7XG4gICAgICAgICAgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkcmVqZWN0KHByb21pc2UsIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJGNhbm5vdFJldHVybk93bigpKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFsdWUgPSBkZXRhaWw7XG4gICAgICAgIHN1Y2NlZWRlZCA9IHRydWU7XG4gICAgICB9XG5cbiAgICAgIGlmIChwcm9taXNlLl9zdGF0ZSAhPT0gbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkUEVORElORykge1xuICAgICAgICAvLyBub29wXG4gICAgICB9IGVsc2UgaWYgKGhhc0NhbGxiYWNrICYmIHN1Y2NlZWRlZCkge1xuICAgICAgICBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRyZXNvbHZlKHByb21pc2UsIHZhbHVlKTtcbiAgICAgIH0gZWxzZSBpZiAoZmFpbGVkKSB7XG4gICAgICAgIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJHJlamVjdChwcm9taXNlLCBlcnJvcik7XG4gICAgICB9IGVsc2UgaWYgKHNldHRsZWQgPT09IGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJEZVTEZJTExFRCkge1xuICAgICAgICBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRmdWxmaWxsKHByb21pc2UsIHZhbHVlKTtcbiAgICAgIH0gZWxzZSBpZiAoc2V0dGxlZCA9PT0gbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkUkVKRUNURUQpIHtcbiAgICAgICAgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkcmVqZWN0KHByb21pc2UsIHZhbHVlKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRpbml0aWFsaXplUHJvbWlzZShwcm9taXNlLCByZXNvbHZlcikge1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmVzb2x2ZXIoZnVuY3Rpb24gcmVzb2x2ZVByb21pc2UodmFsdWUpe1xuICAgICAgICAgIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJHJlc29sdmUocHJvbWlzZSwgdmFsdWUpO1xuICAgICAgICB9LCBmdW5jdGlvbiByZWplY3RQcm9taXNlKHJlYXNvbikge1xuICAgICAgICAgIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJHJlamVjdChwcm9taXNlLCByZWFzb24pO1xuICAgICAgICB9KTtcbiAgICAgIH0gY2F0Y2goZSkge1xuICAgICAgICBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRyZWplY3QocHJvbWlzZSwgZSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbGliJGVzNiRwcm9taXNlJHByb21pc2UkYWxsJCRhbGwoZW50cmllcykge1xuICAgICAgcmV0dXJuIG5ldyBsaWIkZXM2JHByb21pc2UkZW51bWVyYXRvciQkZGVmYXVsdCh0aGlzLCBlbnRyaWVzKS5wcm9taXNlO1xuICAgIH1cbiAgICB2YXIgbGliJGVzNiRwcm9taXNlJHByb21pc2UkYWxsJCRkZWZhdWx0ID0gbGliJGVzNiRwcm9taXNlJHByb21pc2UkYWxsJCRhbGw7XG4gICAgZnVuY3Rpb24gbGliJGVzNiRwcm9taXNlJHByb21pc2UkcmFjZSQkcmFjZShlbnRyaWVzKSB7XG4gICAgICAvKmpzaGludCB2YWxpZHRoaXM6dHJ1ZSAqL1xuICAgICAgdmFyIENvbnN0cnVjdG9yID0gdGhpcztcblxuICAgICAgdmFyIHByb21pc2UgPSBuZXcgQ29uc3RydWN0b3IobGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkbm9vcCk7XG5cbiAgICAgIGlmICghbGliJGVzNiRwcm9taXNlJHV0aWxzJCRpc0FycmF5KGVudHJpZXMpKSB7XG4gICAgICAgIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJHJlamVjdChwcm9taXNlLCBuZXcgVHlwZUVycm9yKCdZb3UgbXVzdCBwYXNzIGFuIGFycmF5IHRvIHJhY2UuJykpO1xuICAgICAgICByZXR1cm4gcHJvbWlzZTtcbiAgICAgIH1cblxuICAgICAgdmFyIGxlbmd0aCA9IGVudHJpZXMubGVuZ3RoO1xuXG4gICAgICBmdW5jdGlvbiBvbkZ1bGZpbGxtZW50KHZhbHVlKSB7XG4gICAgICAgIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJHJlc29sdmUocHJvbWlzZSwgdmFsdWUpO1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBvblJlamVjdGlvbihyZWFzb24pIHtcbiAgICAgICAgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkcmVqZWN0KHByb21pc2UsIHJlYXNvbik7XG4gICAgICB9XG5cbiAgICAgIGZvciAodmFyIGkgPSAwOyBwcm9taXNlLl9zdGF0ZSA9PT0gbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkUEVORElORyAmJiBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkc3Vic2NyaWJlKENvbnN0cnVjdG9yLnJlc29sdmUoZW50cmllc1tpXSksIHVuZGVmaW5lZCwgb25GdWxmaWxsbWVudCwgb25SZWplY3Rpb24pO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gcHJvbWlzZTtcbiAgICB9XG4gICAgdmFyIGxpYiRlczYkcHJvbWlzZSRwcm9taXNlJHJhY2UkJGRlZmF1bHQgPSBsaWIkZXM2JHByb21pc2UkcHJvbWlzZSRyYWNlJCRyYWNlO1xuICAgIGZ1bmN0aW9uIGxpYiRlczYkcHJvbWlzZSRwcm9taXNlJHJlamVjdCQkcmVqZWN0KHJlYXNvbikge1xuICAgICAgLypqc2hpbnQgdmFsaWR0aGlzOnRydWUgKi9cbiAgICAgIHZhciBDb25zdHJ1Y3RvciA9IHRoaXM7XG4gICAgICB2YXIgcHJvbWlzZSA9IG5ldyBDb25zdHJ1Y3RvcihsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRub29wKTtcbiAgICAgIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJHJlamVjdChwcm9taXNlLCByZWFzb24pO1xuICAgICAgcmV0dXJuIHByb21pc2U7XG4gICAgfVxuICAgIHZhciBsaWIkZXM2JHByb21pc2UkcHJvbWlzZSRyZWplY3QkJGRlZmF1bHQgPSBsaWIkZXM2JHByb21pc2UkcHJvbWlzZSRyZWplY3QkJHJlamVjdDtcblxuICAgIHZhciBsaWIkZXM2JHByb21pc2UkcHJvbWlzZSQkY291bnRlciA9IDA7XG5cbiAgICBmdW5jdGlvbiBsaWIkZXM2JHByb21pc2UkcHJvbWlzZSQkbmVlZHNSZXNvbHZlcigpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1lvdSBtdXN0IHBhc3MgYSByZXNvbHZlciBmdW5jdGlvbiBhcyB0aGUgZmlyc3QgYXJndW1lbnQgdG8gdGhlIHByb21pc2UgY29uc3RydWN0b3InKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsaWIkZXM2JHByb21pc2UkcHJvbWlzZSQkbmVlZHNOZXcoKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiRmFpbGVkIHRvIGNvbnN0cnVjdCAnUHJvbWlzZSc6IFBsZWFzZSB1c2UgdGhlICduZXcnIG9wZXJhdG9yLCB0aGlzIG9iamVjdCBjb25zdHJ1Y3RvciBjYW5ub3QgYmUgY2FsbGVkIGFzIGEgZnVuY3Rpb24uXCIpO1xuICAgIH1cblxuICAgIHZhciBsaWIkZXM2JHByb21pc2UkcHJvbWlzZSQkZGVmYXVsdCA9IGxpYiRlczYkcHJvbWlzZSRwcm9taXNlJCRQcm9taXNlO1xuICAgIC8qKlxuICAgICAgUHJvbWlzZSBvYmplY3RzIHJlcHJlc2VudCB0aGUgZXZlbnR1YWwgcmVzdWx0IG9mIGFuIGFzeW5jaHJvbm91cyBvcGVyYXRpb24uIFRoZVxuICAgICAgcHJpbWFyeSB3YXkgb2YgaW50ZXJhY3Rpbmcgd2l0aCBhIHByb21pc2UgaXMgdGhyb3VnaCBpdHMgYHRoZW5gIG1ldGhvZCwgd2hpY2hcbiAgICAgIHJlZ2lzdGVycyBjYWxsYmFja3MgdG8gcmVjZWl2ZSBlaXRoZXIgYSBwcm9taXNlJ3MgZXZlbnR1YWwgdmFsdWUgb3IgdGhlIHJlYXNvblxuICAgICAgd2h5IHRoZSBwcm9taXNlIGNhbm5vdCBiZSBmdWxmaWxsZWQuXG5cbiAgICAgIFRlcm1pbm9sb2d5XG4gICAgICAtLS0tLS0tLS0tLVxuXG4gICAgICAtIGBwcm9taXNlYCBpcyBhbiBvYmplY3Qgb3IgZnVuY3Rpb24gd2l0aCBhIGB0aGVuYCBtZXRob2Qgd2hvc2UgYmVoYXZpb3IgY29uZm9ybXMgdG8gdGhpcyBzcGVjaWZpY2F0aW9uLlxuICAgICAgLSBgdGhlbmFibGVgIGlzIGFuIG9iamVjdCBvciBmdW5jdGlvbiB0aGF0IGRlZmluZXMgYSBgdGhlbmAgbWV0aG9kLlxuICAgICAgLSBgdmFsdWVgIGlzIGFueSBsZWdhbCBKYXZhU2NyaXB0IHZhbHVlIChpbmNsdWRpbmcgdW5kZWZpbmVkLCBhIHRoZW5hYmxlLCBvciBhIHByb21pc2UpLlxuICAgICAgLSBgZXhjZXB0aW9uYCBpcyBhIHZhbHVlIHRoYXQgaXMgdGhyb3duIHVzaW5nIHRoZSB0aHJvdyBzdGF0ZW1lbnQuXG4gICAgICAtIGByZWFzb25gIGlzIGEgdmFsdWUgdGhhdCBpbmRpY2F0ZXMgd2h5IGEgcHJvbWlzZSB3YXMgcmVqZWN0ZWQuXG4gICAgICAtIGBzZXR0bGVkYCB0aGUgZmluYWwgcmVzdGluZyBzdGF0ZSBvZiBhIHByb21pc2UsIGZ1bGZpbGxlZCBvciByZWplY3RlZC5cblxuICAgICAgQSBwcm9taXNlIGNhbiBiZSBpbiBvbmUgb2YgdGhyZWUgc3RhdGVzOiBwZW5kaW5nLCBmdWxmaWxsZWQsIG9yIHJlamVjdGVkLlxuXG4gICAgICBQcm9taXNlcyB0aGF0IGFyZSBmdWxmaWxsZWQgaGF2ZSBhIGZ1bGZpbGxtZW50IHZhbHVlIGFuZCBhcmUgaW4gdGhlIGZ1bGZpbGxlZFxuICAgICAgc3RhdGUuICBQcm9taXNlcyB0aGF0IGFyZSByZWplY3RlZCBoYXZlIGEgcmVqZWN0aW9uIHJlYXNvbiBhbmQgYXJlIGluIHRoZVxuICAgICAgcmVqZWN0ZWQgc3RhdGUuICBBIGZ1bGZpbGxtZW50IHZhbHVlIGlzIG5ldmVyIGEgdGhlbmFibGUuXG5cbiAgICAgIFByb21pc2VzIGNhbiBhbHNvIGJlIHNhaWQgdG8gKnJlc29sdmUqIGEgdmFsdWUuICBJZiB0aGlzIHZhbHVlIGlzIGFsc28gYVxuICAgICAgcHJvbWlzZSwgdGhlbiB0aGUgb3JpZ2luYWwgcHJvbWlzZSdzIHNldHRsZWQgc3RhdGUgd2lsbCBtYXRjaCB0aGUgdmFsdWUnc1xuICAgICAgc2V0dGxlZCBzdGF0ZS4gIFNvIGEgcHJvbWlzZSB0aGF0ICpyZXNvbHZlcyogYSBwcm9taXNlIHRoYXQgcmVqZWN0cyB3aWxsXG4gICAgICBpdHNlbGYgcmVqZWN0LCBhbmQgYSBwcm9taXNlIHRoYXQgKnJlc29sdmVzKiBhIHByb21pc2UgdGhhdCBmdWxmaWxscyB3aWxsXG4gICAgICBpdHNlbGYgZnVsZmlsbC5cblxuXG4gICAgICBCYXNpYyBVc2FnZTpcbiAgICAgIC0tLS0tLS0tLS0tLVxuXG4gICAgICBgYGBqc1xuICAgICAgdmFyIHByb21pc2UgPSBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgLy8gb24gc3VjY2Vzc1xuICAgICAgICByZXNvbHZlKHZhbHVlKTtcblxuICAgICAgICAvLyBvbiBmYWlsdXJlXG4gICAgICAgIHJlamVjdChyZWFzb24pO1xuICAgICAgfSk7XG5cbiAgICAgIHByb21pc2UudGhlbihmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAvLyBvbiBmdWxmaWxsbWVudFxuICAgICAgfSwgZnVuY3Rpb24ocmVhc29uKSB7XG4gICAgICAgIC8vIG9uIHJlamVjdGlvblxuICAgICAgfSk7XG4gICAgICBgYGBcblxuICAgICAgQWR2YW5jZWQgVXNhZ2U6XG4gICAgICAtLS0tLS0tLS0tLS0tLS1cblxuICAgICAgUHJvbWlzZXMgc2hpbmUgd2hlbiBhYnN0cmFjdGluZyBhd2F5IGFzeW5jaHJvbm91cyBpbnRlcmFjdGlvbnMgc3VjaCBhc1xuICAgICAgYFhNTEh0dHBSZXF1ZXN0YHMuXG5cbiAgICAgIGBgYGpzXG4gICAgICBmdW5jdGlvbiBnZXRKU09OKHVybCkge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KXtcbiAgICAgICAgICB2YXIgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG5cbiAgICAgICAgICB4aHIub3BlbignR0VUJywgdXJsKTtcbiAgICAgICAgICB4aHIub25yZWFkeXN0YXRlY2hhbmdlID0gaGFuZGxlcjtcbiAgICAgICAgICB4aHIucmVzcG9uc2VUeXBlID0gJ2pzb24nO1xuICAgICAgICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKCdBY2NlcHQnLCAnYXBwbGljYXRpb24vanNvbicpO1xuICAgICAgICAgIHhoci5zZW5kKCk7XG5cbiAgICAgICAgICBmdW5jdGlvbiBoYW5kbGVyKCkge1xuICAgICAgICAgICAgaWYgKHRoaXMucmVhZHlTdGF0ZSA9PT0gdGhpcy5ET05FKSB7XG4gICAgICAgICAgICAgIGlmICh0aGlzLnN0YXR1cyA9PT0gMjAwKSB7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZSh0aGlzLnJlc3BvbnNlKTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZWplY3QobmV3IEVycm9yKCdnZXRKU09OOiBgJyArIHVybCArICdgIGZhaWxlZCB3aXRoIHN0YXR1czogWycgKyB0aGlzLnN0YXR1cyArICddJykpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfTtcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIGdldEpTT04oJy9wb3N0cy5qc29uJykudGhlbihmdW5jdGlvbihqc29uKSB7XG4gICAgICAgIC8vIG9uIGZ1bGZpbGxtZW50XG4gICAgICB9LCBmdW5jdGlvbihyZWFzb24pIHtcbiAgICAgICAgLy8gb24gcmVqZWN0aW9uXG4gICAgICB9KTtcbiAgICAgIGBgYFxuXG4gICAgICBVbmxpa2UgY2FsbGJhY2tzLCBwcm9taXNlcyBhcmUgZ3JlYXQgY29tcG9zYWJsZSBwcmltaXRpdmVzLlxuXG4gICAgICBgYGBqc1xuICAgICAgUHJvbWlzZS5hbGwoW1xuICAgICAgICBnZXRKU09OKCcvcG9zdHMnKSxcbiAgICAgICAgZ2V0SlNPTignL2NvbW1lbnRzJylcbiAgICAgIF0pLnRoZW4oZnVuY3Rpb24odmFsdWVzKXtcbiAgICAgICAgdmFsdWVzWzBdIC8vID0+IHBvc3RzSlNPTlxuICAgICAgICB2YWx1ZXNbMV0gLy8gPT4gY29tbWVudHNKU09OXG5cbiAgICAgICAgcmV0dXJuIHZhbHVlcztcbiAgICAgIH0pO1xuICAgICAgYGBgXG5cbiAgICAgIEBjbGFzcyBQcm9taXNlXG4gICAgICBAcGFyYW0ge2Z1bmN0aW9ufSByZXNvbHZlclxuICAgICAgVXNlZnVsIGZvciB0b29saW5nLlxuICAgICAgQGNvbnN0cnVjdG9yXG4gICAgKi9cbiAgICBmdW5jdGlvbiBsaWIkZXM2JHByb21pc2UkcHJvbWlzZSQkUHJvbWlzZShyZXNvbHZlcikge1xuICAgICAgdGhpcy5faWQgPSBsaWIkZXM2JHByb21pc2UkcHJvbWlzZSQkY291bnRlcisrO1xuICAgICAgdGhpcy5fc3RhdGUgPSB1bmRlZmluZWQ7XG4gICAgICB0aGlzLl9yZXN1bHQgPSB1bmRlZmluZWQ7XG4gICAgICB0aGlzLl9zdWJzY3JpYmVycyA9IFtdO1xuXG4gICAgICBpZiAobGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkbm9vcCAhPT0gcmVzb2x2ZXIpIHtcbiAgICAgICAgdHlwZW9mIHJlc29sdmVyICE9PSAnZnVuY3Rpb24nICYmIGxpYiRlczYkcHJvbWlzZSRwcm9taXNlJCRuZWVkc1Jlc29sdmVyKCk7XG4gICAgICAgIHRoaXMgaW5zdGFuY2VvZiBsaWIkZXM2JHByb21pc2UkcHJvbWlzZSQkUHJvbWlzZSA/IGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJGluaXRpYWxpemVQcm9taXNlKHRoaXMsIHJlc29sdmVyKSA6IGxpYiRlczYkcHJvbWlzZSRwcm9taXNlJCRuZWVkc05ldygpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGxpYiRlczYkcHJvbWlzZSRwcm9taXNlJCRQcm9taXNlLmFsbCA9IGxpYiRlczYkcHJvbWlzZSRwcm9taXNlJGFsbCQkZGVmYXVsdDtcbiAgICBsaWIkZXM2JHByb21pc2UkcHJvbWlzZSQkUHJvbWlzZS5yYWNlID0gbGliJGVzNiRwcm9taXNlJHByb21pc2UkcmFjZSQkZGVmYXVsdDtcbiAgICBsaWIkZXM2JHByb21pc2UkcHJvbWlzZSQkUHJvbWlzZS5yZXNvbHZlID0gbGliJGVzNiRwcm9taXNlJHByb21pc2UkcmVzb2x2ZSQkZGVmYXVsdDtcbiAgICBsaWIkZXM2JHByb21pc2UkcHJvbWlzZSQkUHJvbWlzZS5yZWplY3QgPSBsaWIkZXM2JHByb21pc2UkcHJvbWlzZSRyZWplY3QkJGRlZmF1bHQ7XG4gICAgbGliJGVzNiRwcm9taXNlJHByb21pc2UkJFByb21pc2UuX3NldFNjaGVkdWxlciA9IGxpYiRlczYkcHJvbWlzZSRhc2FwJCRzZXRTY2hlZHVsZXI7XG4gICAgbGliJGVzNiRwcm9taXNlJHByb21pc2UkJFByb21pc2UuX3NldEFzYXAgPSBsaWIkZXM2JHByb21pc2UkYXNhcCQkc2V0QXNhcDtcbiAgICBsaWIkZXM2JHByb21pc2UkcHJvbWlzZSQkUHJvbWlzZS5fYXNhcCA9IGxpYiRlczYkcHJvbWlzZSRhc2FwJCRhc2FwO1xuXG4gICAgbGliJGVzNiRwcm9taXNlJHByb21pc2UkJFByb21pc2UucHJvdG90eXBlID0ge1xuICAgICAgY29uc3RydWN0b3I6IGxpYiRlczYkcHJvbWlzZSRwcm9taXNlJCRQcm9taXNlLFxuXG4gICAgLyoqXG4gICAgICBUaGUgcHJpbWFyeSB3YXkgb2YgaW50ZXJhY3Rpbmcgd2l0aCBhIHByb21pc2UgaXMgdGhyb3VnaCBpdHMgYHRoZW5gIG1ldGhvZCxcbiAgICAgIHdoaWNoIHJlZ2lzdGVycyBjYWxsYmFja3MgdG8gcmVjZWl2ZSBlaXRoZXIgYSBwcm9taXNlJ3MgZXZlbnR1YWwgdmFsdWUgb3IgdGhlXG4gICAgICByZWFzb24gd2h5IHRoZSBwcm9taXNlIGNhbm5vdCBiZSBmdWxmaWxsZWQuXG5cbiAgICAgIGBgYGpzXG4gICAgICBmaW5kVXNlcigpLnRoZW4oZnVuY3Rpb24odXNlcil7XG4gICAgICAgIC8vIHVzZXIgaXMgYXZhaWxhYmxlXG4gICAgICB9LCBmdW5jdGlvbihyZWFzb24pe1xuICAgICAgICAvLyB1c2VyIGlzIHVuYXZhaWxhYmxlLCBhbmQgeW91IGFyZSBnaXZlbiB0aGUgcmVhc29uIHdoeVxuICAgICAgfSk7XG4gICAgICBgYGBcblxuICAgICAgQ2hhaW5pbmdcbiAgICAgIC0tLS0tLS0tXG5cbiAgICAgIFRoZSByZXR1cm4gdmFsdWUgb2YgYHRoZW5gIGlzIGl0c2VsZiBhIHByb21pc2UuICBUaGlzIHNlY29uZCwgJ2Rvd25zdHJlYW0nXG4gICAgICBwcm9taXNlIGlzIHJlc29sdmVkIHdpdGggdGhlIHJldHVybiB2YWx1ZSBvZiB0aGUgZmlyc3QgcHJvbWlzZSdzIGZ1bGZpbGxtZW50XG4gICAgICBvciByZWplY3Rpb24gaGFuZGxlciwgb3IgcmVqZWN0ZWQgaWYgdGhlIGhhbmRsZXIgdGhyb3dzIGFuIGV4Y2VwdGlvbi5cblxuICAgICAgYGBganNcbiAgICAgIGZpbmRVc2VyKCkudGhlbihmdW5jdGlvbiAodXNlcikge1xuICAgICAgICByZXR1cm4gdXNlci5uYW1lO1xuICAgICAgfSwgZnVuY3Rpb24gKHJlYXNvbikge1xuICAgICAgICByZXR1cm4gJ2RlZmF1bHQgbmFtZSc7XG4gICAgICB9KS50aGVuKGZ1bmN0aW9uICh1c2VyTmFtZSkge1xuICAgICAgICAvLyBJZiBgZmluZFVzZXJgIGZ1bGZpbGxlZCwgYHVzZXJOYW1lYCB3aWxsIGJlIHRoZSB1c2VyJ3MgbmFtZSwgb3RoZXJ3aXNlIGl0XG4gICAgICAgIC8vIHdpbGwgYmUgYCdkZWZhdWx0IG5hbWUnYFxuICAgICAgfSk7XG5cbiAgICAgIGZpbmRVc2VyKCkudGhlbihmdW5jdGlvbiAodXNlcikge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ZvdW5kIHVzZXIsIGJ1dCBzdGlsbCB1bmhhcHB5Jyk7XG4gICAgICB9LCBmdW5jdGlvbiAocmVhc29uKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignYGZpbmRVc2VyYCByZWplY3RlZCBhbmQgd2UncmUgdW5oYXBweScpO1xuICAgICAgfSkudGhlbihmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgLy8gbmV2ZXIgcmVhY2hlZFxuICAgICAgfSwgZnVuY3Rpb24gKHJlYXNvbikge1xuICAgICAgICAvLyBpZiBgZmluZFVzZXJgIGZ1bGZpbGxlZCwgYHJlYXNvbmAgd2lsbCBiZSAnRm91bmQgdXNlciwgYnV0IHN0aWxsIHVuaGFwcHknLlxuICAgICAgICAvLyBJZiBgZmluZFVzZXJgIHJlamVjdGVkLCBgcmVhc29uYCB3aWxsIGJlICdgZmluZFVzZXJgIHJlamVjdGVkIGFuZCB3ZSdyZSB1bmhhcHB5Jy5cbiAgICAgIH0pO1xuICAgICAgYGBgXG4gICAgICBJZiB0aGUgZG93bnN0cmVhbSBwcm9taXNlIGRvZXMgbm90IHNwZWNpZnkgYSByZWplY3Rpb24gaGFuZGxlciwgcmVqZWN0aW9uIHJlYXNvbnMgd2lsbCBiZSBwcm9wYWdhdGVkIGZ1cnRoZXIgZG93bnN0cmVhbS5cblxuICAgICAgYGBganNcbiAgICAgIGZpbmRVc2VyKCkudGhlbihmdW5jdGlvbiAodXNlcikge1xuICAgICAgICB0aHJvdyBuZXcgUGVkYWdvZ2ljYWxFeGNlcHRpb24oJ1Vwc3RyZWFtIGVycm9yJyk7XG4gICAgICB9KS50aGVuKGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAvLyBuZXZlciByZWFjaGVkXG4gICAgICB9KS50aGVuKGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAvLyBuZXZlciByZWFjaGVkXG4gICAgICB9LCBmdW5jdGlvbiAocmVhc29uKSB7XG4gICAgICAgIC8vIFRoZSBgUGVkZ2Fnb2NpYWxFeGNlcHRpb25gIGlzIHByb3BhZ2F0ZWQgYWxsIHRoZSB3YXkgZG93biB0byBoZXJlXG4gICAgICB9KTtcbiAgICAgIGBgYFxuXG4gICAgICBBc3NpbWlsYXRpb25cbiAgICAgIC0tLS0tLS0tLS0tLVxuXG4gICAgICBTb21ldGltZXMgdGhlIHZhbHVlIHlvdSB3YW50IHRvIHByb3BhZ2F0ZSB0byBhIGRvd25zdHJlYW0gcHJvbWlzZSBjYW4gb25seSBiZVxuICAgICAgcmV0cmlldmVkIGFzeW5jaHJvbm91c2x5LiBUaGlzIGNhbiBiZSBhY2hpZXZlZCBieSByZXR1cm5pbmcgYSBwcm9taXNlIGluIHRoZVxuICAgICAgZnVsZmlsbG1lbnQgb3IgcmVqZWN0aW9uIGhhbmRsZXIuIFRoZSBkb3duc3RyZWFtIHByb21pc2Ugd2lsbCB0aGVuIGJlIHBlbmRpbmdcbiAgICAgIHVudGlsIHRoZSByZXR1cm5lZCBwcm9taXNlIGlzIHNldHRsZWQuIFRoaXMgaXMgY2FsbGVkICphc3NpbWlsYXRpb24qLlxuXG4gICAgICBgYGBqc1xuICAgICAgZmluZFVzZXIoKS50aGVuKGZ1bmN0aW9uICh1c2VyKSB7XG4gICAgICAgIHJldHVybiBmaW5kQ29tbWVudHNCeUF1dGhvcih1c2VyKTtcbiAgICAgIH0pLnRoZW4oZnVuY3Rpb24gKGNvbW1lbnRzKSB7XG4gICAgICAgIC8vIFRoZSB1c2VyJ3MgY29tbWVudHMgYXJlIG5vdyBhdmFpbGFibGVcbiAgICAgIH0pO1xuICAgICAgYGBgXG5cbiAgICAgIElmIHRoZSBhc3NpbWxpYXRlZCBwcm9taXNlIHJlamVjdHMsIHRoZW4gdGhlIGRvd25zdHJlYW0gcHJvbWlzZSB3aWxsIGFsc28gcmVqZWN0LlxuXG4gICAgICBgYGBqc1xuICAgICAgZmluZFVzZXIoKS50aGVuKGZ1bmN0aW9uICh1c2VyKSB7XG4gICAgICAgIHJldHVybiBmaW5kQ29tbWVudHNCeUF1dGhvcih1c2VyKTtcbiAgICAgIH0pLnRoZW4oZnVuY3Rpb24gKGNvbW1lbnRzKSB7XG4gICAgICAgIC8vIElmIGBmaW5kQ29tbWVudHNCeUF1dGhvcmAgZnVsZmlsbHMsIHdlJ2xsIGhhdmUgdGhlIHZhbHVlIGhlcmVcbiAgICAgIH0sIGZ1bmN0aW9uIChyZWFzb24pIHtcbiAgICAgICAgLy8gSWYgYGZpbmRDb21tZW50c0J5QXV0aG9yYCByZWplY3RzLCB3ZSdsbCBoYXZlIHRoZSByZWFzb24gaGVyZVxuICAgICAgfSk7XG4gICAgICBgYGBcblxuICAgICAgU2ltcGxlIEV4YW1wbGVcbiAgICAgIC0tLS0tLS0tLS0tLS0tXG5cbiAgICAgIFN5bmNocm9ub3VzIEV4YW1wbGVcblxuICAgICAgYGBgamF2YXNjcmlwdFxuICAgICAgdmFyIHJlc3VsdDtcblxuICAgICAgdHJ5IHtcbiAgICAgICAgcmVzdWx0ID0gZmluZFJlc3VsdCgpO1xuICAgICAgICAvLyBzdWNjZXNzXG4gICAgICB9IGNhdGNoKHJlYXNvbikge1xuICAgICAgICAvLyBmYWlsdXJlXG4gICAgICB9XG4gICAgICBgYGBcblxuICAgICAgRXJyYmFjayBFeGFtcGxlXG5cbiAgICAgIGBgYGpzXG4gICAgICBmaW5kUmVzdWx0KGZ1bmN0aW9uKHJlc3VsdCwgZXJyKXtcbiAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgIC8vIGZhaWx1cmVcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBzdWNjZXNzXG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgYGBgXG5cbiAgICAgIFByb21pc2UgRXhhbXBsZTtcblxuICAgICAgYGBgamF2YXNjcmlwdFxuICAgICAgZmluZFJlc3VsdCgpLnRoZW4oZnVuY3Rpb24ocmVzdWx0KXtcbiAgICAgICAgLy8gc3VjY2Vzc1xuICAgICAgfSwgZnVuY3Rpb24ocmVhc29uKXtcbiAgICAgICAgLy8gZmFpbHVyZVxuICAgICAgfSk7XG4gICAgICBgYGBcblxuICAgICAgQWR2YW5jZWQgRXhhbXBsZVxuICAgICAgLS0tLS0tLS0tLS0tLS1cblxuICAgICAgU3luY2hyb25vdXMgRXhhbXBsZVxuXG4gICAgICBgYGBqYXZhc2NyaXB0XG4gICAgICB2YXIgYXV0aG9yLCBib29rcztcblxuICAgICAgdHJ5IHtcbiAgICAgICAgYXV0aG9yID0gZmluZEF1dGhvcigpO1xuICAgICAgICBib29rcyAgPSBmaW5kQm9va3NCeUF1dGhvcihhdXRob3IpO1xuICAgICAgICAvLyBzdWNjZXNzXG4gICAgICB9IGNhdGNoKHJlYXNvbikge1xuICAgICAgICAvLyBmYWlsdXJlXG4gICAgICB9XG4gICAgICBgYGBcblxuICAgICAgRXJyYmFjayBFeGFtcGxlXG5cbiAgICAgIGBgYGpzXG5cbiAgICAgIGZ1bmN0aW9uIGZvdW5kQm9va3MoYm9va3MpIHtcblxuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBmYWlsdXJlKHJlYXNvbikge1xuXG4gICAgICB9XG5cbiAgICAgIGZpbmRBdXRob3IoZnVuY3Rpb24oYXV0aG9yLCBlcnIpe1xuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgZmFpbHVyZShlcnIpO1xuICAgICAgICAgIC8vIGZhaWx1cmVcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgZmluZEJvb29rc0J5QXV0aG9yKGF1dGhvciwgZnVuY3Rpb24oYm9va3MsIGVycikge1xuICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgZmFpbHVyZShlcnIpO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICBmb3VuZEJvb2tzKGJvb2tzKTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoKHJlYXNvbikge1xuICAgICAgICAgICAgICAgICAgZmFpbHVyZShyZWFzb24pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSBjYXRjaChlcnJvcikge1xuICAgICAgICAgICAgZmFpbHVyZShlcnIpO1xuICAgICAgICAgIH1cbiAgICAgICAgICAvLyBzdWNjZXNzXG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgYGBgXG5cbiAgICAgIFByb21pc2UgRXhhbXBsZTtcblxuICAgICAgYGBgamF2YXNjcmlwdFxuICAgICAgZmluZEF1dGhvcigpLlxuICAgICAgICB0aGVuKGZpbmRCb29rc0J5QXV0aG9yKS5cbiAgICAgICAgdGhlbihmdW5jdGlvbihib29rcyl7XG4gICAgICAgICAgLy8gZm91bmQgYm9va3NcbiAgICAgIH0pLmNhdGNoKGZ1bmN0aW9uKHJlYXNvbil7XG4gICAgICAgIC8vIHNvbWV0aGluZyB3ZW50IHdyb25nXG4gICAgICB9KTtcbiAgICAgIGBgYFxuXG4gICAgICBAbWV0aG9kIHRoZW5cbiAgICAgIEBwYXJhbSB7RnVuY3Rpb259IG9uRnVsZmlsbGVkXG4gICAgICBAcGFyYW0ge0Z1bmN0aW9ufSBvblJlamVjdGVkXG4gICAgICBVc2VmdWwgZm9yIHRvb2xpbmcuXG4gICAgICBAcmV0dXJuIHtQcm9taXNlfVxuICAgICovXG4gICAgICB0aGVuOiBsaWIkZXM2JHByb21pc2UkdGhlbiQkZGVmYXVsdCxcblxuICAgIC8qKlxuICAgICAgYGNhdGNoYCBpcyBzaW1wbHkgc3VnYXIgZm9yIGB0aGVuKHVuZGVmaW5lZCwgb25SZWplY3Rpb24pYCB3aGljaCBtYWtlcyBpdCB0aGUgc2FtZVxuICAgICAgYXMgdGhlIGNhdGNoIGJsb2NrIG9mIGEgdHJ5L2NhdGNoIHN0YXRlbWVudC5cblxuICAgICAgYGBganNcbiAgICAgIGZ1bmN0aW9uIGZpbmRBdXRob3IoKXtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdjb3VsZG4ndCBmaW5kIHRoYXQgYXV0aG9yJyk7XG4gICAgICB9XG5cbiAgICAgIC8vIHN5bmNocm9ub3VzXG4gICAgICB0cnkge1xuICAgICAgICBmaW5kQXV0aG9yKCk7XG4gICAgICB9IGNhdGNoKHJlYXNvbikge1xuICAgICAgICAvLyBzb21ldGhpbmcgd2VudCB3cm9uZ1xuICAgICAgfVxuXG4gICAgICAvLyBhc3luYyB3aXRoIHByb21pc2VzXG4gICAgICBmaW5kQXV0aG9yKCkuY2F0Y2goZnVuY3Rpb24ocmVhc29uKXtcbiAgICAgICAgLy8gc29tZXRoaW5nIHdlbnQgd3JvbmdcbiAgICAgIH0pO1xuICAgICAgYGBgXG5cbiAgICAgIEBtZXRob2QgY2F0Y2hcbiAgICAgIEBwYXJhbSB7RnVuY3Rpb259IG9uUmVqZWN0aW9uXG4gICAgICBVc2VmdWwgZm9yIHRvb2xpbmcuXG4gICAgICBAcmV0dXJuIHtQcm9taXNlfVxuICAgICovXG4gICAgICAnY2F0Y2gnOiBmdW5jdGlvbihvblJlamVjdGlvbikge1xuICAgICAgICByZXR1cm4gdGhpcy50aGVuKG51bGwsIG9uUmVqZWN0aW9uKTtcbiAgICAgIH1cbiAgICB9O1xuICAgIHZhciBsaWIkZXM2JHByb21pc2UkZW51bWVyYXRvciQkZGVmYXVsdCA9IGxpYiRlczYkcHJvbWlzZSRlbnVtZXJhdG9yJCRFbnVtZXJhdG9yO1xuICAgIGZ1bmN0aW9uIGxpYiRlczYkcHJvbWlzZSRlbnVtZXJhdG9yJCRFbnVtZXJhdG9yKENvbnN0cnVjdG9yLCBpbnB1dCkge1xuICAgICAgdGhpcy5faW5zdGFuY2VDb25zdHJ1Y3RvciA9IENvbnN0cnVjdG9yO1xuICAgICAgdGhpcy5wcm9taXNlID0gbmV3IENvbnN0cnVjdG9yKGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJG5vb3ApO1xuXG4gICAgICBpZiAoQXJyYXkuaXNBcnJheShpbnB1dCkpIHtcbiAgICAgICAgdGhpcy5faW5wdXQgICAgID0gaW5wdXQ7XG4gICAgICAgIHRoaXMubGVuZ3RoICAgICA9IGlucHV0Lmxlbmd0aDtcbiAgICAgICAgdGhpcy5fcmVtYWluaW5nID0gaW5wdXQubGVuZ3RoO1xuXG4gICAgICAgIHRoaXMuX3Jlc3VsdCA9IG5ldyBBcnJheSh0aGlzLmxlbmd0aCk7XG5cbiAgICAgICAgaWYgKHRoaXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkZnVsZmlsbCh0aGlzLnByb21pc2UsIHRoaXMuX3Jlc3VsdCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5sZW5ndGggPSB0aGlzLmxlbmd0aCB8fCAwO1xuICAgICAgICAgIHRoaXMuX2VudW1lcmF0ZSgpO1xuICAgICAgICAgIGlmICh0aGlzLl9yZW1haW5pbmcgPT09IDApIHtcbiAgICAgICAgICAgIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJGZ1bGZpbGwodGhpcy5wcm9taXNlLCB0aGlzLl9yZXN1bHQpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkcmVqZWN0KHRoaXMucHJvbWlzZSwgdGhpcy5fdmFsaWRhdGlvbkVycm9yKCkpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGxpYiRlczYkcHJvbWlzZSRlbnVtZXJhdG9yJCRFbnVtZXJhdG9yLnByb3RvdHlwZS5fdmFsaWRhdGlvbkVycm9yID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gbmV3IEVycm9yKCdBcnJheSBNZXRob2RzIG11c3QgYmUgcHJvdmlkZWQgYW4gQXJyYXknKTtcbiAgICB9O1xuXG4gICAgbGliJGVzNiRwcm9taXNlJGVudW1lcmF0b3IkJEVudW1lcmF0b3IucHJvdG90eXBlLl9lbnVtZXJhdGUgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBsZW5ndGggID0gdGhpcy5sZW5ndGg7XG4gICAgICB2YXIgaW5wdXQgICA9IHRoaXMuX2lucHV0O1xuXG4gICAgICBmb3IgKHZhciBpID0gMDsgdGhpcy5fc3RhdGUgPT09IGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJFBFTkRJTkcgJiYgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHRoaXMuX2VhY2hFbnRyeShpbnB1dFtpXSwgaSk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIGxpYiRlczYkcHJvbWlzZSRlbnVtZXJhdG9yJCRFbnVtZXJhdG9yLnByb3RvdHlwZS5fZWFjaEVudHJ5ID0gZnVuY3Rpb24oZW50cnksIGkpIHtcbiAgICAgIHZhciBjID0gdGhpcy5faW5zdGFuY2VDb25zdHJ1Y3RvcjtcbiAgICAgIHZhciByZXNvbHZlID0gYy5yZXNvbHZlO1xuXG4gICAgICBpZiAocmVzb2x2ZSA9PT0gbGliJGVzNiRwcm9taXNlJHByb21pc2UkcmVzb2x2ZSQkZGVmYXVsdCkge1xuICAgICAgICB2YXIgdGhlbiA9IGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJGdldFRoZW4oZW50cnkpO1xuXG4gICAgICAgIGlmICh0aGVuID09PSBsaWIkZXM2JHByb21pc2UkdGhlbiQkZGVmYXVsdCAmJlxuICAgICAgICAgICAgZW50cnkuX3N0YXRlICE9PSBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRQRU5ESU5HKSB7XG4gICAgICAgICAgdGhpcy5fc2V0dGxlZEF0KGVudHJ5Ll9zdGF0ZSwgaSwgZW50cnkuX3Jlc3VsdCk7XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHRoZW4gIT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICB0aGlzLl9yZW1haW5pbmctLTtcbiAgICAgICAgICB0aGlzLl9yZXN1bHRbaV0gPSBlbnRyeTtcbiAgICAgICAgfSBlbHNlIGlmIChjID09PSBsaWIkZXM2JHByb21pc2UkcHJvbWlzZSQkZGVmYXVsdCkge1xuICAgICAgICAgIHZhciBwcm9taXNlID0gbmV3IGMobGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkbm9vcCk7XG4gICAgICAgICAgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkaGFuZGxlTWF5YmVUaGVuYWJsZShwcm9taXNlLCBlbnRyeSwgdGhlbik7XG4gICAgICAgICAgdGhpcy5fd2lsbFNldHRsZUF0KHByb21pc2UsIGkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuX3dpbGxTZXR0bGVBdChuZXcgYyhmdW5jdGlvbihyZXNvbHZlKSB7IHJlc29sdmUoZW50cnkpOyB9KSwgaSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX3dpbGxTZXR0bGVBdChyZXNvbHZlKGVudHJ5KSwgaSk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIGxpYiRlczYkcHJvbWlzZSRlbnVtZXJhdG9yJCRFbnVtZXJhdG9yLnByb3RvdHlwZS5fc2V0dGxlZEF0ID0gZnVuY3Rpb24oc3RhdGUsIGksIHZhbHVlKSB7XG4gICAgICB2YXIgcHJvbWlzZSA9IHRoaXMucHJvbWlzZTtcblxuICAgICAgaWYgKHByb21pc2UuX3N0YXRlID09PSBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRQRU5ESU5HKSB7XG4gICAgICAgIHRoaXMuX3JlbWFpbmluZy0tO1xuXG4gICAgICAgIGlmIChzdGF0ZSA9PT0gbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkUkVKRUNURUQpIHtcbiAgICAgICAgICBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRyZWplY3QocHJvbWlzZSwgdmFsdWUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuX3Jlc3VsdFtpXSA9IHZhbHVlO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLl9yZW1haW5pbmcgPT09IDApIHtcbiAgICAgICAgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkZnVsZmlsbChwcm9taXNlLCB0aGlzLl9yZXN1bHQpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBsaWIkZXM2JHByb21pc2UkZW51bWVyYXRvciQkRW51bWVyYXRvci5wcm90b3R5cGUuX3dpbGxTZXR0bGVBdCA9IGZ1bmN0aW9uKHByb21pc2UsIGkpIHtcbiAgICAgIHZhciBlbnVtZXJhdG9yID0gdGhpcztcblxuICAgICAgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkc3Vic2NyaWJlKHByb21pc2UsIHVuZGVmaW5lZCwgZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgZW51bWVyYXRvci5fc2V0dGxlZEF0KGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJEZVTEZJTExFRCwgaSwgdmFsdWUpO1xuICAgICAgfSwgZnVuY3Rpb24ocmVhc29uKSB7XG4gICAgICAgIGVudW1lcmF0b3IuX3NldHRsZWRBdChsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRSRUpFQ1RFRCwgaSwgcmVhc29uKTtcbiAgICAgIH0pO1xuICAgIH07XG4gICAgZnVuY3Rpb24gbGliJGVzNiRwcm9taXNlJHBvbHlmaWxsJCRwb2x5ZmlsbCgpIHtcbiAgICAgIHZhciBsb2NhbDtcblxuICAgICAgaWYgKHR5cGVvZiBnbG9iYWwgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgbG9jYWwgPSBnbG9iYWw7XG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiBzZWxmICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgIGxvY2FsID0gc2VsZjtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgbG9jYWwgPSBGdW5jdGlvbigncmV0dXJuIHRoaXMnKSgpO1xuICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdwb2x5ZmlsbCBmYWlsZWQgYmVjYXVzZSBnbG9iYWwgb2JqZWN0IGlzIHVuYXZhaWxhYmxlIGluIHRoaXMgZW52aXJvbm1lbnQnKTtcbiAgICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHZhciBQID0gbG9jYWwuUHJvbWlzZTtcblxuICAgICAgaWYgKFAgJiYgT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKFAucmVzb2x2ZSgpKSA9PT0gJ1tvYmplY3QgUHJvbWlzZV0nICYmICFQLmNhc3QpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBsb2NhbC5Qcm9taXNlID0gbGliJGVzNiRwcm9taXNlJHByb21pc2UkJGRlZmF1bHQ7XG4gICAgfVxuICAgIHZhciBsaWIkZXM2JHByb21pc2UkcG9seWZpbGwkJGRlZmF1bHQgPSBsaWIkZXM2JHByb21pc2UkcG9seWZpbGwkJHBvbHlmaWxsO1xuXG4gICAgdmFyIGxpYiRlczYkcHJvbWlzZSR1bWQkJEVTNlByb21pc2UgPSB7XG4gICAgICAnUHJvbWlzZSc6IGxpYiRlczYkcHJvbWlzZSRwcm9taXNlJCRkZWZhdWx0LFxuICAgICAgJ3BvbHlmaWxsJzogbGliJGVzNiRwcm9taXNlJHBvbHlmaWxsJCRkZWZhdWx0XG4gICAgfTtcblxuICAgIC8qIGdsb2JhbCBkZWZpbmU6dHJ1ZSBtb2R1bGU6dHJ1ZSB3aW5kb3c6IHRydWUgKi9cbiAgICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmVbJ2FtZCddKSB7XG4gICAgICBkZWZpbmUoZnVuY3Rpb24oKSB7IHJldHVybiBsaWIkZXM2JHByb21pc2UkdW1kJCRFUzZQcm9taXNlOyB9KTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnICYmIG1vZHVsZVsnZXhwb3J0cyddKSB7XG4gICAgICBtb2R1bGVbJ2V4cG9ydHMnXSA9IGxpYiRlczYkcHJvbWlzZSR1bWQkJEVTNlByb21pc2U7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgdGhpcyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHRoaXNbJ0VTNlByb21pc2UnXSA9IGxpYiRlczYkcHJvbWlzZSR1bWQkJEVTNlByb21pc2U7XG4gICAgfVxuXG4gICAgbGliJGVzNiRwcm9taXNlJHBvbHlmaWxsJCRkZWZhdWx0KCk7XG59KS5jYWxsKHRoaXMpO1xuXG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwiLi4vLi4vLi4vLi4vLi4vLi4vbWFrby1qcy9ub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzXCIpLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwiKGZ1bmN0aW9uIChwcm9jZXNzKXtcbm1vZHVsZS5leHBvcnRzID0gU3RhY2tVdGlscztcblxuZnVuY3Rpb24gU3RhY2tVdGlscyhvcHRzKSB7XG5cdGlmICghKHRoaXMgaW5zdGFuY2VvZiBTdGFja1V0aWxzKSkge1xuXHRcdHRocm93IG5ldyBFcnJvcignU3RhY2tVdGlscyBjb25zdHJ1Y3RvciBtdXN0IGJlIGNhbGxlZCB3aXRoIG5ldycpO1xuXHR9XG5cdG9wdHMgPSBvcHRzIHx8IHt9O1xuXHR0aGlzLl9jd2QgPSAob3B0cy5jd2QgfHwgcHJvY2Vzcy5jd2QoKSkucmVwbGFjZSgvXFxcXC9nLCAnLycpO1xuXHR0aGlzLl9pbnRlcm5hbHMgPSBvcHRzLmludGVybmFscyB8fCBbXTtcbn1cblxubW9kdWxlLmV4cG9ydHMubm9kZUludGVybmFscyA9IG5vZGVJbnRlcm5hbHM7XG5cbmZ1bmN0aW9uIG5vZGVJbnRlcm5hbHMoKSB7XG5cdHJldHVybiBbXG5cdFx0L1xcKG5hdGl2ZVxcKSQvLFxuXHRcdC9cXChkb21haW4uanM6XFxkKzpcXGQrXFwpJC8sXG5cdFx0L1xcKGV2ZW50cy5qczpcXGQrOlxcZCtcXCkkLyxcblx0XHQvXFwobm9kZS5qczpcXGQrOlxcZCtcXCkkLyxcblx0XHQvXFwodGltZXJzLmpzOlxcZCs6XFxkK1xcKSQvLFxuXHRcdC9cXChtb2R1bGUuanM6XFxkKzpcXGQrXFwpJC8sXG5cdFx0L1xcKGludGVybmFsXFwvW1xcd18tXStcXC5qczpcXGQrOlxcZCtcXCkkLyxcblx0XHQvXFxzKmF0IG5vZGVcXC5qczpcXGQrOlxcZCs/JC8sXG5cdFx0L1xcL1xcLm5vZGUtc3Bhd24td3JhcC1cXHcrLVxcdytcXC9ub2RlOlxcZCs6XFxkK1xcKT8kL1xuXHRdO1xufVxuXG5TdGFja1V0aWxzLnByb3RvdHlwZS5jbGVhbiA9IGZ1bmN0aW9uIChzdGFjaykge1xuXHRpZiAoIUFycmF5LmlzQXJyYXkoc3RhY2spKSB7XG5cdFx0c3RhY2sgPSBzdGFjay5zcGxpdCgnXFxuJyk7XG5cdH1cblxuXHRpZiAoISgvXlxccyphdCAvLnRlc3Qoc3RhY2tbMF0pKSAmJlxuXHRcdCgvXlxccyphdCAvLnRlc3Qoc3RhY2tbMV0pKSkge1xuXHRcdHN0YWNrID0gc3RhY2suc2xpY2UoMSk7XG5cdH1cblxuXHR2YXIgb3V0ZGVudCA9IGZhbHNlO1xuXHR2YXIgbGFzdE5vbkF0TGluZSA9IG51bGw7XG5cdHZhciByZXN1bHQgPSBbXTtcblxuXHRzdGFjay5mb3JFYWNoKGZ1bmN0aW9uIChzdCkge1xuXHRcdHN0ID0gc3QucmVwbGFjZSgvXFxcXC9nLCAnLycpO1xuXHRcdHZhciBpc0ludGVybmFsID0gdGhpcy5faW50ZXJuYWxzLnNvbWUoZnVuY3Rpb24gKGludGVybmFsKSB7XG5cdFx0XHRyZXR1cm4gaW50ZXJuYWwudGVzdChzdCk7XG5cdFx0fSk7XG5cblx0XHRpZiAoaXNJbnRlcm5hbCkge1xuXHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0fVxuXG5cdFx0dmFyIGlzQXRMaW5lID0gL15cXHMqYXQgLy50ZXN0KHN0KTtcblxuXHRcdGlmIChvdXRkZW50KSB7XG5cdFx0XHRzdCA9IHN0LnJlcGxhY2UoL1xccyskLywgJycpLnJlcGxhY2UoL14oXFxzKylhdCAvLCAnJDEnKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0c3QgPSBzdC50cmltKCk7XG5cdFx0XHRpZiAoaXNBdExpbmUpIHtcblx0XHRcdFx0c3QgPSBzdC5zdWJzdHJpbmcoMyk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0c3QgPSBzdC5yZXBsYWNlKHRoaXMuX2N3ZCArICcvJywgJycpO1xuXG5cdFx0aWYgKHN0KSB7XG5cdFx0XHRpZiAoaXNBdExpbmUpIHtcblx0XHRcdFx0aWYgKGxhc3ROb25BdExpbmUpIHtcblx0XHRcdFx0XHRyZXN1bHQucHVzaChsYXN0Tm9uQXRMaW5lKTtcblx0XHRcdFx0XHRsYXN0Tm9uQXRMaW5lID0gbnVsbDtcblx0XHRcdFx0fVxuXHRcdFx0XHRyZXN1bHQucHVzaChzdCk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRvdXRkZW50ID0gdHJ1ZTtcblx0XHRcdFx0bGFzdE5vbkF0TGluZSA9IHN0O1xuXHRcdFx0fVxuXHRcdH1cblx0fSwgdGhpcyk7XG5cblx0c3RhY2sgPSByZXN1bHQuam9pbignXFxuJykudHJpbSgpO1xuXG5cdGlmIChzdGFjaykge1xuXHRcdHJldHVybiBzdGFjayArICdcXG4nO1xuXHR9XG5cdHJldHVybiAnJztcbn07XG5cblN0YWNrVXRpbHMucHJvdG90eXBlLmNhcHR1cmVTdHJpbmcgPSBmdW5jdGlvbiAobGltaXQsIGZuKSB7XG5cdGlmICh0eXBlb2YgbGltaXQgPT09ICdmdW5jdGlvbicpIHtcblx0XHRmbiA9IGxpbWl0O1xuXHRcdGxpbWl0ID0gSW5maW5pdHk7XG5cdH1cblx0aWYgKCFmbikge1xuXHRcdGZuID0gdGhpcy5jYXB0dXJlU3RyaW5nO1xuXHR9XG5cblx0dmFyIGxpbWl0QmVmb3JlID0gRXJyb3Iuc3RhY2tUcmFjZUxpbWl0O1xuXHRpZiAobGltaXQpIHtcblx0XHRFcnJvci5zdGFja1RyYWNlTGltaXQgPSBsaW1pdDtcblx0fVxuXG5cdHZhciBvYmogPSB7fTtcblxuXHRFcnJvci5jYXB0dXJlU3RhY2tUcmFjZShvYmosIGZuKTtcblx0dmFyIHN0YWNrID0gb2JqLnN0YWNrO1xuXHRFcnJvci5zdGFja1RyYWNlTGltaXQgPSBsaW1pdEJlZm9yZTtcblxuXHRyZXR1cm4gdGhpcy5jbGVhbihzdGFjayk7XG59O1xuXG5TdGFja1V0aWxzLnByb3RvdHlwZS5jYXB0dXJlID0gZnVuY3Rpb24gKGxpbWl0LCBmbikge1xuXHRpZiAodHlwZW9mIGxpbWl0ID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0Zm4gPSBsaW1pdDtcblx0XHRsaW1pdCA9IEluZmluaXR5O1xuXHR9XG5cdGlmICghZm4pIHtcblx0XHRmbiA9IHRoaXMuY2FwdHVyZTtcblx0fVxuXHR2YXIgcHJlcEJlZm9yZSA9IEVycm9yLnByZXBhcmVTdGFja1RyYWNlO1xuXHR2YXIgbGltaXRCZWZvcmUgPSBFcnJvci5zdGFja1RyYWNlTGltaXQ7XG5cblx0RXJyb3IucHJlcGFyZVN0YWNrVHJhY2UgPSBmdW5jdGlvbiAob2JqLCBzaXRlKSB7XG5cdFx0cmV0dXJuIHNpdGU7XG5cdH07XG5cblx0aWYgKGxpbWl0KSB7XG5cdFx0RXJyb3Iuc3RhY2tUcmFjZUxpbWl0ID0gbGltaXQ7XG5cdH1cblxuXHR2YXIgb2JqID0ge307XG5cdEVycm9yLmNhcHR1cmVTdGFja1RyYWNlKG9iaiwgZm4pO1xuXHR2YXIgc3RhY2sgPSBvYmouc3RhY2s7XG5cdEVycm9yLnByZXBhcmVTdGFja1RyYWNlID0gcHJlcEJlZm9yZTtcblx0RXJyb3Iuc3RhY2tUcmFjZUxpbWl0ID0gbGltaXRCZWZvcmU7XG5cblx0cmV0dXJuIHN0YWNrO1xufTtcblxuU3RhY2tVdGlscy5wcm90b3R5cGUuYXQgPSBmdW5jdGlvbiBhdChmbikge1xuXHRpZiAoIWZuKSB7XG5cdFx0Zm4gPSBhdDtcblx0fVxuXG5cdHZhciBzaXRlID0gdGhpcy5jYXB0dXJlKDEsIGZuKVswXTtcblxuXHRpZiAoIXNpdGUpIHtcblx0XHRyZXR1cm4ge307XG5cdH1cblxuXHR2YXIgcmVzID0ge1xuXHRcdGxpbmU6IHNpdGUuZ2V0TGluZU51bWJlcigpLFxuXHRcdGNvbHVtbjogc2l0ZS5nZXRDb2x1bW5OdW1iZXIoKVxuXHR9O1xuXG5cdHRoaXMuX3NldEZpbGUocmVzLCBzaXRlLmdldEZpbGVOYW1lKCkpO1xuXG5cdGlmIChzaXRlLmlzQ29uc3RydWN0b3IoKSkge1xuXHRcdHJlcy5jb25zdHJ1Y3RvciA9IHRydWU7XG5cdH1cblxuXHRpZiAoc2l0ZS5pc0V2YWwoKSkge1xuXHRcdHJlcy5ldmFsT3JpZ2luID0gc2l0ZS5nZXRFdmFsT3JpZ2luKCk7XG5cdH1cblxuXHRpZiAoc2l0ZS5pc05hdGl2ZSgpKSB7XG5cdFx0cmVzLm5hdGl2ZSA9IHRydWU7XG5cdH1cblxuXHR2YXIgdHlwZW5hbWUgPSBudWxsO1xuXHR0cnkge1xuXHRcdHR5cGVuYW1lID0gc2l0ZS5nZXRUeXBlTmFtZSgpO1xuXHR9IGNhdGNoIChlcikge31cblxuXHRpZiAodHlwZW5hbWUgJiZcblx0XHR0eXBlbmFtZSAhPT0gJ09iamVjdCcgJiZcblx0XHR0eXBlbmFtZSAhPT0gJ1tvYmplY3QgT2JqZWN0XScpIHtcblx0XHRyZXMudHlwZSA9IHR5cGVuYW1lO1xuXHR9XG5cblx0dmFyIGZuYW1lID0gc2l0ZS5nZXRGdW5jdGlvbk5hbWUoKTtcblx0aWYgKGZuYW1lKSB7XG5cdFx0cmVzLmZ1bmN0aW9uID0gZm5hbWU7XG5cdH1cblxuXHR2YXIgbWV0aCA9IHNpdGUuZ2V0TWV0aG9kTmFtZSgpO1xuXHRpZiAobWV0aCAmJiBmbmFtZSAhPT0gbWV0aCkge1xuXHRcdHJlcy5tZXRob2QgPSBtZXRoO1xuXHR9XG5cblx0cmV0dXJuIHJlcztcbn07XG5cblN0YWNrVXRpbHMucHJvdG90eXBlLl9zZXRGaWxlID0gZnVuY3Rpb24gKHJlc3VsdCwgZmlsZW5hbWUpIHtcblx0aWYgKGZpbGVuYW1lKSB7XG5cdFx0ZmlsZW5hbWUgPSBmaWxlbmFtZS5yZXBsYWNlKC9cXFxcL2csICcvJyk7XG5cdFx0aWYgKChmaWxlbmFtZS5pbmRleE9mKHRoaXMuX2N3ZCArICcvJykgPT09IDApKSB7XG5cdFx0XHRmaWxlbmFtZSA9IGZpbGVuYW1lLnN1YnN0cih0aGlzLl9jd2QubGVuZ3RoICsgMSk7XG5cdFx0fVxuXHRcdHJlc3VsdC5maWxlID0gZmlsZW5hbWU7XG5cdH1cbn07XG5cbnZhciByZSA9IG5ldyBSZWdFeHAoXG5cdCdeJyArXG5cdFx0Ly8gU29tZXRpbWVzIHdlIHN0cmlwIG91dCB0aGUgJyAgICBhdCcgYmVjYXVzZSBpdCdzIG5vaXN5XG5cdCcoPzpcXFxccyphdCApPycgK1xuXHRcdC8vICQxID0gY3RvciBpZiAnbmV3J1xuXHQnKD86KG5ldykgKT8nICtcblx0XHQvLyBPYmplY3QubWV0aG9kIFthcyBmb29dICgsIG1heWJlXG5cdFx0Ly8gJDIgPSBmdW5jdGlvbiBuYW1lXG5cdFx0Ly8gJDMgPSBtZXRob2QgbmFtZVxuXHQnKD86KFteXFxcXChcXFxcW10qKSg/OiBcXFxcW2FzIChbXlxcXFxdXSspXFxcXF0pPyBcXFxcKCk/JyArXG5cdFx0Ly8gKGV2YWwgYXQgPGFub255bW91cz4gKGZpbGUuanM6MToxKSxcblx0XHQvLyAkNCA9IGV2YWwgb3JpZ2luXG5cdFx0Ly8gJDU6JDY6JDcgYXJlIGV2YWwgZmlsZS9saW5lL2NvbCwgYnV0IG5vdCBub3JtYWxseSByZXBvcnRlZFxuXHQnKD86ZXZhbCBhdCAoW14gXSspIFxcXFwoKFteXFxcXCldKyk6KFxcXFxkKyk6KFxcXFxkKylcXFxcKSwgKT8nICtcblx0XHQvLyBmaWxlOmxpbmU6Y29sXG5cdFx0Ly8gJDg6JDk6JDEwXG5cdFx0Ly8gJDExID0gJ25hdGl2ZScgaWYgbmF0aXZlXG5cdCcoPzooW15cXFxcKV0rKTooXFxcXGQrKTooXFxcXGQrKXwobmF0aXZlKSknICtcblx0XHQvLyBtYXliZSBjbG9zZSB0aGUgcGFyZW4sIHRoZW4gZW5kXG5cdCdcXFxcKT8kJ1xuKTtcblxuU3RhY2tVdGlscy5wcm90b3R5cGUucGFyc2VMaW5lID0gZnVuY3Rpb24gcGFyc2VMaW5lKGxpbmUpIHtcblx0dmFyIG1hdGNoID0gbGluZSAmJiBsaW5lLm1hdGNoKHJlKTtcblx0aWYgKCFtYXRjaCkge1xuXHRcdHJldHVybiBudWxsO1xuXHR9XG5cblx0dmFyIGN0b3IgPSBtYXRjaFsxXSA9PT0gJ25ldyc7XG5cdHZhciBmbmFtZSA9IG1hdGNoWzJdO1xuXHR2YXIgbWV0aCA9IG1hdGNoWzNdO1xuXHR2YXIgZXZhbE9yaWdpbiA9IG1hdGNoWzRdO1xuXHR2YXIgZXZhbEZpbGUgPSBtYXRjaFs1XTtcblx0dmFyIGV2YWxMaW5lID0gTnVtYmVyKG1hdGNoWzZdKTtcblx0dmFyIGV2YWxDb2wgPSBOdW1iZXIobWF0Y2hbN10pO1xuXHR2YXIgZmlsZSA9IG1hdGNoWzhdO1xuXHR2YXIgbG51bSA9IG1hdGNoWzldO1xuXHR2YXIgY29sID0gbWF0Y2hbMTBdO1xuXHR2YXIgbmF0aXZlID0gbWF0Y2hbMTFdID09PSAnbmF0aXZlJztcblxuXHR2YXIgcmVzID0ge307XG5cblx0aWYgKGxudW0pIHtcblx0XHRyZXMubGluZSA9IE51bWJlcihsbnVtKTtcblx0fVxuXG5cdGlmIChjb2wpIHtcblx0XHRyZXMuY29sdW1uID0gTnVtYmVyKGNvbCk7XG5cdH1cblxuXHR0aGlzLl9zZXRGaWxlKHJlcywgZmlsZSk7XG5cblx0aWYgKGN0b3IpIHtcblx0XHRyZXMuY29uc3RydWN0b3IgPSB0cnVlO1xuXHR9XG5cblx0aWYgKGV2YWxPcmlnaW4pIHtcblx0XHRyZXMuZXZhbE9yaWdpbiA9IGV2YWxPcmlnaW47XG5cdFx0cmVzLmV2YWxMaW5lID0gZXZhbExpbmU7XG5cdFx0cmVzLmV2YWxDb2x1bW4gPSBldmFsQ29sO1xuXHRcdHJlcy5ldmFsRmlsZSA9IGV2YWxGaWxlICYmIGV2YWxGaWxlLnJlcGxhY2UoL1xcXFwvZywgJy8nKTtcblx0fVxuXG5cdGlmIChuYXRpdmUpIHtcblx0XHRyZXMubmF0aXZlID0gdHJ1ZTtcblx0fVxuXG5cdGlmIChmbmFtZSkge1xuXHRcdHJlcy5mdW5jdGlvbiA9IGZuYW1lO1xuXHR9XG5cblx0aWYgKG1ldGggJiYgZm5hbWUgIT09IG1ldGgpIHtcblx0XHRyZXMubWV0aG9kID0gbWV0aDtcblx0fVxuXG5cdHJldHVybiByZXM7XG59O1xuXG52YXIgYm91bmQgPSBuZXcgU3RhY2tVdGlscygpO1xuXG5PYmplY3Qua2V5cyhTdGFja1V0aWxzLnByb3RvdHlwZSkuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG5cdFN0YWNrVXRpbHNba2V5XSA9IGJvdW5kW2tleV0uYmluZChib3VuZCk7XG59KTtcblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCIuLi8uLi8uLi8uLi8uLi8uLi8uLi9tYWtvLWpzL25vZGVfbW9kdWxlcy9wcm9jZXNzL2Jyb3dzZXIuanNcIikpIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgX2V4dGVuZHMgPSBPYmplY3QuYXNzaWduIHx8IGZ1bmN0aW9uICh0YXJnZXQpIHsgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHsgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpXTsgZm9yICh2YXIga2V5IGluIHNvdXJjZSkgeyBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHNvdXJjZSwga2V5KSkgeyB0YXJnZXRba2V5XSA9IHNvdXJjZVtrZXldOyB9IH0gfSByZXR1cm4gdGFyZ2V0OyB9O1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBhcHBseU1pZGRsZXdhcmU7XG5cbnZhciBfY29tcG9zZSA9IHJlcXVpcmUoJy4vY29tcG9zZScpO1xuXG52YXIgX2NvbXBvc2UyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfY29tcG9zZSk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IFwiZGVmYXVsdFwiOiBvYmogfTsgfVxuXG4vKipcbiAqIENyZWF0ZXMgYSBzdG9yZSBlbmhhbmNlciB0aGF0IGFwcGxpZXMgbWlkZGxld2FyZSB0byB0aGUgZGlzcGF0Y2ggbWV0aG9kXG4gKiBvZiB0aGUgUmVkdXggc3RvcmUuIFRoaXMgaXMgaGFuZHkgZm9yIGEgdmFyaWV0eSBvZiB0YXNrcywgc3VjaCBhcyBleHByZXNzaW5nXG4gKiBhc3luY2hyb25vdXMgYWN0aW9ucyBpbiBhIGNvbmNpc2UgbWFubmVyLCBvciBsb2dnaW5nIGV2ZXJ5IGFjdGlvbiBwYXlsb2FkLlxuICpcbiAqIFNlZSBgcmVkdXgtdGh1bmtgIHBhY2thZ2UgYXMgYW4gZXhhbXBsZSBvZiB0aGUgUmVkdXggbWlkZGxld2FyZS5cbiAqXG4gKiBCZWNhdXNlIG1pZGRsZXdhcmUgaXMgcG90ZW50aWFsbHkgYXN5bmNocm9ub3VzLCB0aGlzIHNob3VsZCBiZSB0aGUgZmlyc3RcbiAqIHN0b3JlIGVuaGFuY2VyIGluIHRoZSBjb21wb3NpdGlvbiBjaGFpbi5cbiAqXG4gKiBOb3RlIHRoYXQgZWFjaCBtaWRkbGV3YXJlIHdpbGwgYmUgZ2l2ZW4gdGhlIGBkaXNwYXRjaGAgYW5kIGBnZXRTdGF0ZWAgZnVuY3Rpb25zXG4gKiBhcyBuYW1lZCBhcmd1bWVudHMuXG4gKlxuICogQHBhcmFtIHsuLi5GdW5jdGlvbn0gbWlkZGxld2FyZXMgVGhlIG1pZGRsZXdhcmUgY2hhaW4gdG8gYmUgYXBwbGllZC5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gQSBzdG9yZSBlbmhhbmNlciBhcHBseWluZyB0aGUgbWlkZGxld2FyZS5cbiAqL1xuZnVuY3Rpb24gYXBwbHlNaWRkbGV3YXJlKCkge1xuICBmb3IgKHZhciBfbGVuID0gYXJndW1lbnRzLmxlbmd0aCwgbWlkZGxld2FyZXMgPSBBcnJheShfbGVuKSwgX2tleSA9IDA7IF9rZXkgPCBfbGVuOyBfa2V5KyspIHtcbiAgICBtaWRkbGV3YXJlc1tfa2V5XSA9IGFyZ3VtZW50c1tfa2V5XTtcbiAgfVxuXG4gIHJldHVybiBmdW5jdGlvbiAoY3JlYXRlU3RvcmUpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKHJlZHVjZXIsIGluaXRpYWxTdGF0ZSwgZW5oYW5jZXIpIHtcbiAgICAgIHZhciBzdG9yZSA9IGNyZWF0ZVN0b3JlKHJlZHVjZXIsIGluaXRpYWxTdGF0ZSwgZW5oYW5jZXIpO1xuICAgICAgdmFyIF9kaXNwYXRjaCA9IHN0b3JlLmRpc3BhdGNoO1xuICAgICAgdmFyIGNoYWluID0gW107XG5cbiAgICAgIHZhciBtaWRkbGV3YXJlQVBJID0ge1xuICAgICAgICBnZXRTdGF0ZTogc3RvcmUuZ2V0U3RhdGUsXG4gICAgICAgIGRpc3BhdGNoOiBmdW5jdGlvbiBkaXNwYXRjaChhY3Rpb24pIHtcbiAgICAgICAgICByZXR1cm4gX2Rpc3BhdGNoKGFjdGlvbik7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICBjaGFpbiA9IG1pZGRsZXdhcmVzLm1hcChmdW5jdGlvbiAobWlkZGxld2FyZSkge1xuICAgICAgICByZXR1cm4gbWlkZGxld2FyZShtaWRkbGV3YXJlQVBJKTtcbiAgICAgIH0pO1xuICAgICAgX2Rpc3BhdGNoID0gX2NvbXBvc2UyW1wiZGVmYXVsdFwiXS5hcHBseSh1bmRlZmluZWQsIGNoYWluKShzdG9yZS5kaXNwYXRjaCk7XG5cbiAgICAgIHJldHVybiBfZXh0ZW5kcyh7fSwgc3RvcmUsIHtcbiAgICAgICAgZGlzcGF0Y2g6IF9kaXNwYXRjaFxuICAgICAgfSk7XG4gICAgfTtcbiAgfTtcbn0iLCIvKipcbiAqIE1vZHVsZSBEZXBlbmRlbmNpZXNcbiAqL1xuXG52YXIgYXNzaWduID0gcmVxdWlyZSgnb2JqZWN0LWFzc2lnbicpXG52YXIgcmFmID0gcmVxdWlyZSgnY29tcG9uZW50LXJhZicpXG5cbi8qKlxuICogRXhwb3J0IGBjeWNsZWBcbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGN5Y2xlXG5cbi8qKlxuICogQ3JlYXRlIHRoZSBcImN5Y2xlXCJcbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSByZW5kZXJlclxuICogQHBhcmFtIHtPYmplY3R9IGRhdGFcbiAqL1xuXG5mdW5jdGlvbiBjeWNsZSAocmVuZGVyZXIsIHN0b3JlKSB7XG4gIHZhciBkZWJvdW5jZVxuXG4gIC8vIHJlbmRlclxuICBmdW5jdGlvbiByZW5kZXIgKCkge1xuICAgIGNsZWFyVGltZW91dChkZWJvdW5jZSlcbiAgICBkZWJvdW5jZSA9IG51bGxcbiAgICByZXR1cm4gcmVuZGVyZXIoYXNzaWduKHsgZGlzcGF0Y2g6IGRpc3BhdGNoIH0sIHN0b3JlKCkgKSlcbiAgfVxuXG4gIC8vIHN1YnNjcmliZSB0byBjaGFuZ2VzXG4gIHN0b3JlLnN1YnNjcmliZShmdW5jdGlvbiAoKSB7XG4gICAgaWYgKCFkZWJvdW5jZSkgZGVib3VuY2UgPSByYWYocmVuZGVyKVxuICB9KVxuXG4gIC8vIGRpc3BhdGNoIHZpYSBzb2NyYXRlc1xuICBmdW5jdGlvbiBkaXNwYXRjaCAoKSB7XG4gICAgcmV0dXJuIHN0b3JlLmFwcGx5KG51bGwsIGFyZ3VtZW50cylcbiAgfVxuXG4gIHJldHVybiByZW5kZXIoKVxufVxuIiwidmFyIGlzSG9zdE9iamVjdCA9IHJlcXVpcmUoJy4vX2lzSG9zdE9iamVjdCcpLFxuICAgIGlzT2JqZWN0TGlrZSA9IHJlcXVpcmUoJy4vaXNPYmplY3RMaWtlJyk7XG5cbi8qKiBgT2JqZWN0I3RvU3RyaW5nYCByZXN1bHQgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RUYWcgPSAnW29iamVjdCBPYmplY3RdJztcblxuLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqIFVzZWQgdG8gcmVzb2x2ZSB0aGUgZGVjb21waWxlZCBzb3VyY2Ugb2YgZnVuY3Rpb25zLiAqL1xudmFyIGZ1bmNUb1N0cmluZyA9IEZ1bmN0aW9uLnByb3RvdHlwZS50b1N0cmluZztcblxuLyoqIFVzZWQgdG8gaW5mZXIgdGhlIGBPYmplY3RgIGNvbnN0cnVjdG9yLiAqL1xudmFyIG9iamVjdEN0b3JTdHJpbmcgPSBmdW5jVG9TdHJpbmcuY2FsbChPYmplY3QpO1xuXG4vKipcbiAqIFVzZWQgdG8gcmVzb2x2ZSB0aGUgW2B0b1N0cmluZ1RhZ2BdKGh0dHA6Ly9lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzYuMC8jc2VjLW9iamVjdC5wcm90b3R5cGUudG9zdHJpbmcpXG4gKiBvZiB2YWx1ZXMuXG4gKi9cbnZhciBvYmplY3RUb1N0cmluZyA9IG9iamVjdFByb3RvLnRvU3RyaW5nO1xuXG4vKiogQnVpbHQtaW4gdmFsdWUgcmVmZXJlbmNlcy4gKi9cbnZhciBnZXRQcm90b3R5cGVPZiA9IE9iamVjdC5nZXRQcm90b3R5cGVPZjtcblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBhIHBsYWluIG9iamVjdCwgdGhhdCBpcywgYW4gb2JqZWN0IGNyZWF0ZWQgYnkgdGhlXG4gKiBgT2JqZWN0YCBjb25zdHJ1Y3RvciBvciBvbmUgd2l0aCBhIGBbW1Byb3RvdHlwZV1dYCBvZiBgbnVsbGAuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGEgcGxhaW4gb2JqZWN0LCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIGZ1bmN0aW9uIEZvbygpIHtcbiAqICAgdGhpcy5hID0gMTtcbiAqIH1cbiAqXG4gKiBfLmlzUGxhaW5PYmplY3QobmV3IEZvbyk7XG4gKiAvLyA9PiBmYWxzZVxuICpcbiAqIF8uaXNQbGFpbk9iamVjdChbMSwgMiwgM10pO1xuICogLy8gPT4gZmFsc2VcbiAqXG4gKiBfLmlzUGxhaW5PYmplY3QoeyAneCc6IDAsICd5JzogMCB9KTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzUGxhaW5PYmplY3QoT2JqZWN0LmNyZWF0ZShudWxsKSk7XG4gKiAvLyA9PiB0cnVlXG4gKi9cbmZ1bmN0aW9uIGlzUGxhaW5PYmplY3QodmFsdWUpIHtcbiAgaWYgKCFpc09iamVjdExpa2UodmFsdWUpIHx8XG4gICAgICBvYmplY3RUb1N0cmluZy5jYWxsKHZhbHVlKSAhPSBvYmplY3RUYWcgfHwgaXNIb3N0T2JqZWN0KHZhbHVlKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICB2YXIgcHJvdG8gPSBnZXRQcm90b3R5cGVPZih2YWx1ZSk7XG4gIGlmIChwcm90byA9PT0gbnVsbCkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIHZhciBDdG9yID0gcHJvdG8uY29uc3RydWN0b3I7XG4gIHJldHVybiAodHlwZW9mIEN0b3IgPT0gJ2Z1bmN0aW9uJyAmJlxuICAgIEN0b3IgaW5zdGFuY2VvZiBDdG9yICYmIGZ1bmNUb1N0cmluZy5jYWxsKEN0b3IpID09IG9iamVjdEN0b3JTdHJpbmcpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlzUGxhaW5PYmplY3Q7XG4iLCIvKipcbiAqIE1vZHVsZSBEZXBlbmRlbmNpZXNcbiAqL1xuXG52YXIgaXNfZXJyb3IgPSByZXF1aXJlKCdsb2Rhc2guaXNlcnJvcicpXG52YXIgaXNvYmogPSByZXF1aXJlKCdpc29iaicpXG52YXIga2V5cyA9IE9iamVjdC5rZXlzXG5cbi8qKlxuICogV2hpdGVsaXN0ZWQga2V5c1xuICovXG5cbnZhciB3aGl0ZWxpc3QgPSB7XG4gIHR5cGU6IDEsXG4gIG1ldGE6IDEsXG4gIGVycm9yOiAxLFxuICBwYXlsb2FkOiAxXG59XG5cbi8qKlxuICogRXhwb3J0IGBpc19mc2FgXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBpc19mc2FcblxuLyoqXG4gKiBDaGVjayBpZiB0aGUgdmFsdWUgaXMgYW4gYWN0aW9uXG4gKlxuICogU3BlYzogaHR0cHM6Ly9naXRodWIuY29tL2FjZGxpdGUvZmx1eC1zdGFuZGFyZC1hY3Rpb24jYWN0aW9uc1xuICpcbiAqIEBwYXJhbSB7TWl4ZWR9IHZhbHVlXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICovXG5cbmZ1bmN0aW9uIGlzX2ZzYSAodmFsdWUpIHtcbiAgLy8gdmFsdWUgbXVzdCBiZSBhbiBvYmplY3QgYW5kIGhhdmUgYSB0eXBlXG4gIGlmICghaXNvYmoodmFsdWUpIHx8ICF2YWx1ZS50eXBlKSByZXR1cm4gZmFsc2VcblxuICAvLyBpZiBhbnkgcHJvcGVydGllcyBvbiB0aGUgb2JqZWN0IGFyZVxuICAvLyBub3QgcGFydCBvZiB0aGUgd2hpdGVsaXN0IGZhaWwgdGhlblxuICAvLyByZXR1cm4gZmFsc2VcbiAgdmFyIHByb3BzID0ga2V5cyh2YWx1ZSlcbiAgZm9yICh2YXIgaSA9IDAsIHByb3A7IHByb3AgPSBwcm9wc1tpXTsgaSsrKSB7XG4gICAgaWYgKCF3aGl0ZWxpc3RbcHJvcF0pIHJldHVybiBmYWxzZVxuICB9XG5cbiAgLy8gbGFzdGx5IGNoZWNrIHRoYXQgaWYgdmFsdWUuZXJyb3IgaXMgXCJ0cnVlXCJcbiAgLy8gdGhhdCBvdXIgcGF5bG9hZCBpcyBhbiBFcnJvciBvYmplY3RcbiAgaWYgKHZhbHVlLmVycm9yID09PSB0cnVlICYmICFpc19lcnJvcih2YWx1ZS5wYXlsb2FkKSkge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG5cbiAgcmV0dXJuIHRydWVcbn1cbiIsIi8qKlxuICogTW9kdWxlc1xuICovXG5cbnZhciB0b0FycmF5ID0gcmVxdWlyZSgnQGYvdG8tYXJyYXknKVxuXG4vKipcbiAqIEV4cG9zZSBjb21wb3NlUmVkdWNlcnNcbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNvbXBvc2VSZWR1Y2Vyc1snZGVmYXVsdCddID0gY29tcG9zZVJlZHVjZXJzXG5cbi8qKlxuICogY29tcG9zZVJlZHVjZXJzXG4gKi9cblxuZnVuY3Rpb24gY29tcG9zZVJlZHVjZXJzICgvKiBhcmd1bWVudHMgKi8pIHtcbiAgdmFyIGFyZ3MgPSB0b0FycmF5KGFyZ3VtZW50cylcbiAgdmFyIGxlbiA9IGFyZ3MubGVuZ3RoXG5cbiAgcmV0dXJuIGZ1bmN0aW9uIChzdGF0ZSwgYWN0aW9uKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47ICsraSkge1xuICAgICAgc3RhdGUgPSBhcmdzW2ldKHN0YXRlLCBhY3Rpb24pXG4gICAgfVxuXG4gICAgcmV0dXJuIHN0YXRlXG4gIH1cbn1cbiIsIi8qKlxuICogTW9kdWxlIERlcGVuZGVuY2llc1xuICovXG5cbnZhciBzbGljZWQgPSByZXF1aXJlKCdzbGljZWQnKTtcbnZhciBub29wID0gZnVuY3Rpb24oKXt9O1xudmFyIGNvID0gcmVxdWlyZSgnY28nKTtcblxuLyoqXG4gKiBFeHBvcnQgYHdyYXBwZWRgXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSB3cmFwcGVkO1xuXG4vKipcbiAqIFdyYXAgYSBmdW5jdGlvbiB0byBzdXBwb3J0XG4gKiBzeW5jLCBhc3luYywgYW5kIGdlbiBmdW5jdGlvbnMuXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5mdW5jdGlvbiB3cmFwcGVkKGZuKSB7XG4gIGZ1bmN0aW9uIHdyYXAoKSB7XG4gICAgdmFyIGFyZ3MgPSBzbGljZWQoYXJndW1lbnRzKTtcbiAgICB2YXIgbGFzdCA9IGFyZ3NbYXJncy5sZW5ndGggLSAxXTtcbiAgICB2YXIgY3R4ID0gdGhpcztcblxuICAgIC8vIGRvbmVcbiAgICB2YXIgZG9uZSA9IHR5cGVvZiBsYXN0ID09ICdmdW5jdGlvbicgPyBhcmdzLnBvcCgpIDogbm9vcDtcblxuICAgIC8vIG5vdGhpbmdcbiAgICBpZiAoIWZuKSB7XG4gICAgICByZXR1cm4gZG9uZS5hcHBseShjdHgsIFtudWxsXS5jb25jYXQoYXJncykpO1xuICAgIH1cblxuICAgIC8vIGdlbmVyYXRvclxuICAgIGlmIChnZW5lcmF0b3IoZm4pKSB7XG4gICAgICByZXR1cm4gY28oZm4pLmFwcGx5KGN0eCwgYXJncy5jb25jYXQoZG9uZSkpO1xuICAgIH1cblxuICAgIC8vIGFzeW5jXG4gICAgaWYgKGZuLmxlbmd0aCA+IGFyZ3MubGVuZ3RoKSB7XG4gICAgICAvLyBOT1RFOiB0aGlzIG9ubHkgaGFuZGxlcyB1bmNhdWdodCBzeW5jaHJvbm91cyBlcnJvcnNcbiAgICAgIHRyeSB7XG4gICAgICAgIHJldHVybiBmbi5hcHBseShjdHgsIGFyZ3MuY29uY2F0KGRvbmUpKTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgcmV0dXJuIGRvbmUoZSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gc3luY1xuICAgIHJldHVybiBzeW5jKGZuLCBkb25lKS5hcHBseShjdHgsIGFyZ3MpO1xuICB9XG5cbiAgcmV0dXJuIHdyYXA7XG59XG5cbi8qKlxuICogV3JhcCBhIHN5bmNocm9ub3VzIGZ1bmN0aW9uIGV4ZWN1dGlvbi5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHBhcmFtIHtGdW5jdGlvbn0gZG9uZVxuICogQHJldHVybiB7RnVuY3Rpb259XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBzeW5jKGZuLCBkb25lKSB7XG4gIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHJldDtcblxuICAgIHRyeSB7XG4gICAgICByZXQgPSBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgcmV0dXJuIGRvbmUoZXJyKTtcbiAgICB9XG5cbiAgICBpZiAocHJvbWlzZShyZXQpKSB7XG4gICAgICByZXQudGhlbihmdW5jdGlvbiAodmFsdWUpIHsgZG9uZShudWxsLCB2YWx1ZSk7IH0sIGRvbmUpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXQgaW5zdGFuY2VvZiBFcnJvciA/IGRvbmUocmV0KSA6IGRvbmUobnVsbCwgcmV0KTtcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBJcyBgdmFsdWVgIGEgZ2VuZXJhdG9yP1xuICpcbiAqIEBwYXJhbSB7TWl4ZWR9IHZhbHVlXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gZ2VuZXJhdG9yKHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZVxuICAgICYmIHZhbHVlLmNvbnN0cnVjdG9yXG4gICAgJiYgJ0dlbmVyYXRvckZ1bmN0aW9uJyA9PSB2YWx1ZS5jb25zdHJ1Y3Rvci5uYW1lO1xufVxuXG5cbi8qKlxuICogSXMgYHZhbHVlYCBhIHByb21pc2U/XG4gKlxuICogQHBhcmFtIHtNaXhlZH0gdmFsdWVcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBwcm9taXNlKHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZSAmJiAnZnVuY3Rpb24nID09IHR5cGVvZiB2YWx1ZS50aGVuO1xufVxuIiwiLyoqXG4gKiBNb2R1bGVzXG4gKi9cblxudmFyIGlzRnVuY3Rpb24gPSByZXF1aXJlKCdAZi9pcy1mdW5jdGlvbicpXG5cbi8qKlxuICogRXhwb3NlIGlzT2JqZWN0XG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBpc09iamVjdFxuXG4vKipcbiAqIENvbnN0YW50c1xuICovXG5cbnZhciBvYmpTdHJpbmcgPSB0b1N0cmluZyhPYmplY3QpXG5cbi8qKlxuICogQ2hlY2sgZm9yIHBsYWluIG9iamVjdC5cbiAqXG4gKiBAcGFyYW0ge01peGVkfSB2YWxcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBpc09iamVjdCAodmFsKSB7XG4gIHJldHVybiAhIXZhbCAmJiAodmFsLmNvbnN0cnVjdG9yID09PSBPYmplY3QgfHwgaXNPYmplY3RTdHJpbmcodmFsLmNvbnN0cnVjdG9yKSlcbn1cblxuZnVuY3Rpb24gaXNPYmplY3RTdHJpbmcgKHZhbCkge1xuICByZXR1cm4gISF2YWwgJiYgaXNGdW5jdGlvbih2YWwpICYmIHRvU3RyaW5nKHZhbCkgPT09IG9ialN0cmluZ1xufVxuXG5mdW5jdGlvbiB0b1N0cmluZyAodmFsKSB7XG4gIHJldHVybiBGdW5jdGlvbi5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWwpXG59XG4iLCIvLyBDb3B5cmlnaHQgSm95ZW50LCBJbmMuIGFuZCBvdGhlciBOb2RlIGNvbnRyaWJ1dG9ycy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYVxuLy8gY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuLy8gXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXG4vLyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXG4vLyBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0XG4vLyBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGVcbi8vIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkXG4vLyBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTXG4vLyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXG4vLyBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOXG4vLyBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSxcbi8vIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUlxuLy8gT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRVxuLy8gVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgcHVueWNvZGUgPSByZXF1aXJlKCdwdW55Y29kZScpO1xudmFyIHV0aWwgPSByZXF1aXJlKCcuL3V0aWwnKTtcblxuZXhwb3J0cy5wYXJzZSA9IHVybFBhcnNlO1xuZXhwb3J0cy5yZXNvbHZlID0gdXJsUmVzb2x2ZTtcbmV4cG9ydHMucmVzb2x2ZU9iamVjdCA9IHVybFJlc29sdmVPYmplY3Q7XG5leHBvcnRzLmZvcm1hdCA9IHVybEZvcm1hdDtcblxuZXhwb3J0cy5VcmwgPSBVcmw7XG5cbmZ1bmN0aW9uIFVybCgpIHtcbiAgdGhpcy5wcm90b2NvbCA9IG51bGw7XG4gIHRoaXMuc2xhc2hlcyA9IG51bGw7XG4gIHRoaXMuYXV0aCA9IG51bGw7XG4gIHRoaXMuaG9zdCA9IG51bGw7XG4gIHRoaXMucG9ydCA9IG51bGw7XG4gIHRoaXMuaG9zdG5hbWUgPSBudWxsO1xuICB0aGlzLmhhc2ggPSBudWxsO1xuICB0aGlzLnNlYXJjaCA9IG51bGw7XG4gIHRoaXMucXVlcnkgPSBudWxsO1xuICB0aGlzLnBhdGhuYW1lID0gbnVsbDtcbiAgdGhpcy5wYXRoID0gbnVsbDtcbiAgdGhpcy5ocmVmID0gbnVsbDtcbn1cblxuLy8gUmVmZXJlbmNlOiBSRkMgMzk4NiwgUkZDIDE4MDgsIFJGQyAyMzk2XG5cbi8vIGRlZmluZSB0aGVzZSBoZXJlIHNvIGF0IGxlYXN0IHRoZXkgb25seSBoYXZlIHRvIGJlXG4vLyBjb21waWxlZCBvbmNlIG9uIHRoZSBmaXJzdCBtb2R1bGUgbG9hZC5cbnZhciBwcm90b2NvbFBhdHRlcm4gPSAvXihbYS16MC05ListXSs6KS9pLFxuICAgIHBvcnRQYXR0ZXJuID0gLzpbMC05XSokLyxcblxuICAgIC8vIFNwZWNpYWwgY2FzZSBmb3IgYSBzaW1wbGUgcGF0aCBVUkxcbiAgICBzaW1wbGVQYXRoUGF0dGVybiA9IC9eKFxcL1xcLz8oPyFcXC8pW15cXD9cXHNdKikoXFw/W15cXHNdKik/JC8sXG5cbiAgICAvLyBSRkMgMjM5NjogY2hhcmFjdGVycyByZXNlcnZlZCBmb3IgZGVsaW1pdGluZyBVUkxzLlxuICAgIC8vIFdlIGFjdHVhbGx5IGp1c3QgYXV0by1lc2NhcGUgdGhlc2UuXG4gICAgZGVsaW1zID0gWyc8JywgJz4nLCAnXCInLCAnYCcsICcgJywgJ1xccicsICdcXG4nLCAnXFx0J10sXG5cbiAgICAvLyBSRkMgMjM5NjogY2hhcmFjdGVycyBub3QgYWxsb3dlZCBmb3IgdmFyaW91cyByZWFzb25zLlxuICAgIHVud2lzZSA9IFsneycsICd9JywgJ3wnLCAnXFxcXCcsICdeJywgJ2AnXS5jb25jYXQoZGVsaW1zKSxcblxuICAgIC8vIEFsbG93ZWQgYnkgUkZDcywgYnV0IGNhdXNlIG9mIFhTUyBhdHRhY2tzLiAgQWx3YXlzIGVzY2FwZSB0aGVzZS5cbiAgICBhdXRvRXNjYXBlID0gWydcXCcnXS5jb25jYXQodW53aXNlKSxcbiAgICAvLyBDaGFyYWN0ZXJzIHRoYXQgYXJlIG5ldmVyIGV2ZXIgYWxsb3dlZCBpbiBhIGhvc3RuYW1lLlxuICAgIC8vIE5vdGUgdGhhdCBhbnkgaW52YWxpZCBjaGFycyBhcmUgYWxzbyBoYW5kbGVkLCBidXQgdGhlc2VcbiAgICAvLyBhcmUgdGhlIG9uZXMgdGhhdCBhcmUgKmV4cGVjdGVkKiB0byBiZSBzZWVuLCBzbyB3ZSBmYXN0LXBhdGhcbiAgICAvLyB0aGVtLlxuICAgIG5vbkhvc3RDaGFycyA9IFsnJScsICcvJywgJz8nLCAnOycsICcjJ10uY29uY2F0KGF1dG9Fc2NhcGUpLFxuICAgIGhvc3RFbmRpbmdDaGFycyA9IFsnLycsICc/JywgJyMnXSxcbiAgICBob3N0bmFtZU1heExlbiA9IDI1NSxcbiAgICBob3N0bmFtZVBhcnRQYXR0ZXJuID0gL15bK2EtejAtOUEtWl8tXXswLDYzfSQvLFxuICAgIGhvc3RuYW1lUGFydFN0YXJ0ID0gL14oWythLXowLTlBLVpfLV17MCw2M30pKC4qKSQvLFxuICAgIC8vIHByb3RvY29scyB0aGF0IGNhbiBhbGxvdyBcInVuc2FmZVwiIGFuZCBcInVud2lzZVwiIGNoYXJzLlxuICAgIHVuc2FmZVByb3RvY29sID0ge1xuICAgICAgJ2phdmFzY3JpcHQnOiB0cnVlLFxuICAgICAgJ2phdmFzY3JpcHQ6JzogdHJ1ZVxuICAgIH0sXG4gICAgLy8gcHJvdG9jb2xzIHRoYXQgbmV2ZXIgaGF2ZSBhIGhvc3RuYW1lLlxuICAgIGhvc3RsZXNzUHJvdG9jb2wgPSB7XG4gICAgICAnamF2YXNjcmlwdCc6IHRydWUsXG4gICAgICAnamF2YXNjcmlwdDonOiB0cnVlXG4gICAgfSxcbiAgICAvLyBwcm90b2NvbHMgdGhhdCBhbHdheXMgY29udGFpbiBhIC8vIGJpdC5cbiAgICBzbGFzaGVkUHJvdG9jb2wgPSB7XG4gICAgICAnaHR0cCc6IHRydWUsXG4gICAgICAnaHR0cHMnOiB0cnVlLFxuICAgICAgJ2Z0cCc6IHRydWUsXG4gICAgICAnZ29waGVyJzogdHJ1ZSxcbiAgICAgICdmaWxlJzogdHJ1ZSxcbiAgICAgICdodHRwOic6IHRydWUsXG4gICAgICAnaHR0cHM6JzogdHJ1ZSxcbiAgICAgICdmdHA6JzogdHJ1ZSxcbiAgICAgICdnb3BoZXI6JzogdHJ1ZSxcbiAgICAgICdmaWxlOic6IHRydWVcbiAgICB9LFxuICAgIHF1ZXJ5c3RyaW5nID0gcmVxdWlyZSgncXVlcnlzdHJpbmcnKTtcblxuZnVuY3Rpb24gdXJsUGFyc2UodXJsLCBwYXJzZVF1ZXJ5U3RyaW5nLCBzbGFzaGVzRGVub3RlSG9zdCkge1xuICBpZiAodXJsICYmIHV0aWwuaXNPYmplY3QodXJsKSAmJiB1cmwgaW5zdGFuY2VvZiBVcmwpIHJldHVybiB1cmw7XG5cbiAgdmFyIHUgPSBuZXcgVXJsO1xuICB1LnBhcnNlKHVybCwgcGFyc2VRdWVyeVN0cmluZywgc2xhc2hlc0Rlbm90ZUhvc3QpO1xuICByZXR1cm4gdTtcbn1cblxuVXJsLnByb3RvdHlwZS5wYXJzZSA9IGZ1bmN0aW9uKHVybCwgcGFyc2VRdWVyeVN0cmluZywgc2xhc2hlc0Rlbm90ZUhvc3QpIHtcbiAgaWYgKCF1dGlsLmlzU3RyaW5nKHVybCkpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiUGFyYW1ldGVyICd1cmwnIG11c3QgYmUgYSBzdHJpbmcsIG5vdCBcIiArIHR5cGVvZiB1cmwpO1xuICB9XG5cbiAgLy8gQ29weSBjaHJvbWUsIElFLCBvcGVyYSBiYWNrc2xhc2gtaGFuZGxpbmcgYmVoYXZpb3IuXG4gIC8vIEJhY2sgc2xhc2hlcyBiZWZvcmUgdGhlIHF1ZXJ5IHN0cmluZyBnZXQgY29udmVydGVkIHRvIGZvcndhcmQgc2xhc2hlc1xuICAvLyBTZWU6IGh0dHBzOi8vY29kZS5nb29nbGUuY29tL3AvY2hyb21pdW0vaXNzdWVzL2RldGFpbD9pZD0yNTkxNlxuICB2YXIgcXVlcnlJbmRleCA9IHVybC5pbmRleE9mKCc/JyksXG4gICAgICBzcGxpdHRlciA9XG4gICAgICAgICAgKHF1ZXJ5SW5kZXggIT09IC0xICYmIHF1ZXJ5SW5kZXggPCB1cmwuaW5kZXhPZignIycpKSA/ICc/JyA6ICcjJyxcbiAgICAgIHVTcGxpdCA9IHVybC5zcGxpdChzcGxpdHRlciksXG4gICAgICBzbGFzaFJlZ2V4ID0gL1xcXFwvZztcbiAgdVNwbGl0WzBdID0gdVNwbGl0WzBdLnJlcGxhY2Uoc2xhc2hSZWdleCwgJy8nKTtcbiAgdXJsID0gdVNwbGl0LmpvaW4oc3BsaXR0ZXIpO1xuXG4gIHZhciByZXN0ID0gdXJsO1xuXG4gIC8vIHRyaW0gYmVmb3JlIHByb2NlZWRpbmcuXG4gIC8vIFRoaXMgaXMgdG8gc3VwcG9ydCBwYXJzZSBzdHVmZiBsaWtlIFwiICBodHRwOi8vZm9vLmNvbSAgXFxuXCJcbiAgcmVzdCA9IHJlc3QudHJpbSgpO1xuXG4gIGlmICghc2xhc2hlc0Rlbm90ZUhvc3QgJiYgdXJsLnNwbGl0KCcjJykubGVuZ3RoID09PSAxKSB7XG4gICAgLy8gVHJ5IGZhc3QgcGF0aCByZWdleHBcbiAgICB2YXIgc2ltcGxlUGF0aCA9IHNpbXBsZVBhdGhQYXR0ZXJuLmV4ZWMocmVzdCk7XG4gICAgaWYgKHNpbXBsZVBhdGgpIHtcbiAgICAgIHRoaXMucGF0aCA9IHJlc3Q7XG4gICAgICB0aGlzLmhyZWYgPSByZXN0O1xuICAgICAgdGhpcy5wYXRobmFtZSA9IHNpbXBsZVBhdGhbMV07XG4gICAgICBpZiAoc2ltcGxlUGF0aFsyXSkge1xuICAgICAgICB0aGlzLnNlYXJjaCA9IHNpbXBsZVBhdGhbMl07XG4gICAgICAgIGlmIChwYXJzZVF1ZXJ5U3RyaW5nKSB7XG4gICAgICAgICAgdGhpcy5xdWVyeSA9IHF1ZXJ5c3RyaW5nLnBhcnNlKHRoaXMuc2VhcmNoLnN1YnN0cigxKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5xdWVyeSA9IHRoaXMuc2VhcmNoLnN1YnN0cigxKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChwYXJzZVF1ZXJ5U3RyaW5nKSB7XG4gICAgICAgIHRoaXMuc2VhcmNoID0gJyc7XG4gICAgICAgIHRoaXMucXVlcnkgPSB7fTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgfVxuXG4gIHZhciBwcm90byA9IHByb3RvY29sUGF0dGVybi5leGVjKHJlc3QpO1xuICBpZiAocHJvdG8pIHtcbiAgICBwcm90byA9IHByb3RvWzBdO1xuICAgIHZhciBsb3dlclByb3RvID0gcHJvdG8udG9Mb3dlckNhc2UoKTtcbiAgICB0aGlzLnByb3RvY29sID0gbG93ZXJQcm90bztcbiAgICByZXN0ID0gcmVzdC5zdWJzdHIocHJvdG8ubGVuZ3RoKTtcbiAgfVxuXG4gIC8vIGZpZ3VyZSBvdXQgaWYgaXQncyBnb3QgYSBob3N0XG4gIC8vIHVzZXJAc2VydmVyIGlzICphbHdheXMqIGludGVycHJldGVkIGFzIGEgaG9zdG5hbWUsIGFuZCB1cmxcbiAgLy8gcmVzb2x1dGlvbiB3aWxsIHRyZWF0IC8vZm9vL2JhciBhcyBob3N0PWZvbyxwYXRoPWJhciBiZWNhdXNlIHRoYXQnc1xuICAvLyBob3cgdGhlIGJyb3dzZXIgcmVzb2x2ZXMgcmVsYXRpdmUgVVJMcy5cbiAgaWYgKHNsYXNoZXNEZW5vdGVIb3N0IHx8IHByb3RvIHx8IHJlc3QubWF0Y2goL15cXC9cXC9bXkBcXC9dK0BbXkBcXC9dKy8pKSB7XG4gICAgdmFyIHNsYXNoZXMgPSByZXN0LnN1YnN0cigwLCAyKSA9PT0gJy8vJztcbiAgICBpZiAoc2xhc2hlcyAmJiAhKHByb3RvICYmIGhvc3RsZXNzUHJvdG9jb2xbcHJvdG9dKSkge1xuICAgICAgcmVzdCA9IHJlc3Quc3Vic3RyKDIpO1xuICAgICAgdGhpcy5zbGFzaGVzID0gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICBpZiAoIWhvc3RsZXNzUHJvdG9jb2xbcHJvdG9dICYmXG4gICAgICAoc2xhc2hlcyB8fCAocHJvdG8gJiYgIXNsYXNoZWRQcm90b2NvbFtwcm90b10pKSkge1xuXG4gICAgLy8gdGhlcmUncyBhIGhvc3RuYW1lLlxuICAgIC8vIHRoZSBmaXJzdCBpbnN0YW5jZSBvZiAvLCA/LCA7LCBvciAjIGVuZHMgdGhlIGhvc3QuXG4gICAgLy9cbiAgICAvLyBJZiB0aGVyZSBpcyBhbiBAIGluIHRoZSBob3N0bmFtZSwgdGhlbiBub24taG9zdCBjaGFycyAqYXJlKiBhbGxvd2VkXG4gICAgLy8gdG8gdGhlIGxlZnQgb2YgdGhlIGxhc3QgQCBzaWduLCB1bmxlc3Mgc29tZSBob3N0LWVuZGluZyBjaGFyYWN0ZXJcbiAgICAvLyBjb21lcyAqYmVmb3JlKiB0aGUgQC1zaWduLlxuICAgIC8vIFVSTHMgYXJlIG9ibm94aW91cy5cbiAgICAvL1xuICAgIC8vIGV4OlxuICAgIC8vIGh0dHA6Ly9hQGJAYy8gPT4gdXNlcjphQGIgaG9zdDpjXG4gICAgLy8gaHR0cDovL2FAYj9AYyA9PiB1c2VyOmEgaG9zdDpjIHBhdGg6Lz9AY1xuXG4gICAgLy8gdjAuMTIgVE9ETyhpc2FhY3MpOiBUaGlzIGlzIG5vdCBxdWl0ZSBob3cgQ2hyb21lIGRvZXMgdGhpbmdzLlxuICAgIC8vIFJldmlldyBvdXIgdGVzdCBjYXNlIGFnYWluc3QgYnJvd3NlcnMgbW9yZSBjb21wcmVoZW5zaXZlbHkuXG5cbiAgICAvLyBmaW5kIHRoZSBmaXJzdCBpbnN0YW5jZSBvZiBhbnkgaG9zdEVuZGluZ0NoYXJzXG4gICAgdmFyIGhvc3RFbmQgPSAtMTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGhvc3RFbmRpbmdDaGFycy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGhlYyA9IHJlc3QuaW5kZXhPZihob3N0RW5kaW5nQ2hhcnNbaV0pO1xuICAgICAgaWYgKGhlYyAhPT0gLTEgJiYgKGhvc3RFbmQgPT09IC0xIHx8IGhlYyA8IGhvc3RFbmQpKVxuICAgICAgICBob3N0RW5kID0gaGVjO1xuICAgIH1cblxuICAgIC8vIGF0IHRoaXMgcG9pbnQsIGVpdGhlciB3ZSBoYXZlIGFuIGV4cGxpY2l0IHBvaW50IHdoZXJlIHRoZVxuICAgIC8vIGF1dGggcG9ydGlvbiBjYW5ub3QgZ28gcGFzdCwgb3IgdGhlIGxhc3QgQCBjaGFyIGlzIHRoZSBkZWNpZGVyLlxuICAgIHZhciBhdXRoLCBhdFNpZ247XG4gICAgaWYgKGhvc3RFbmQgPT09IC0xKSB7XG4gICAgICAvLyBhdFNpZ24gY2FuIGJlIGFueXdoZXJlLlxuICAgICAgYXRTaWduID0gcmVzdC5sYXN0SW5kZXhPZignQCcpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBhdFNpZ24gbXVzdCBiZSBpbiBhdXRoIHBvcnRpb24uXG4gICAgICAvLyBodHRwOi8vYUBiL2NAZCA9PiBob3N0OmIgYXV0aDphIHBhdGg6L2NAZFxuICAgICAgYXRTaWduID0gcmVzdC5sYXN0SW5kZXhPZignQCcsIGhvc3RFbmQpO1xuICAgIH1cblxuICAgIC8vIE5vdyB3ZSBoYXZlIGEgcG9ydGlvbiB3aGljaCBpcyBkZWZpbml0ZWx5IHRoZSBhdXRoLlxuICAgIC8vIFB1bGwgdGhhdCBvZmYuXG4gICAgaWYgKGF0U2lnbiAhPT0gLTEpIHtcbiAgICAgIGF1dGggPSByZXN0LnNsaWNlKDAsIGF0U2lnbik7XG4gICAgICByZXN0ID0gcmVzdC5zbGljZShhdFNpZ24gKyAxKTtcbiAgICAgIHRoaXMuYXV0aCA9IGRlY29kZVVSSUNvbXBvbmVudChhdXRoKTtcbiAgICB9XG5cbiAgICAvLyB0aGUgaG9zdCBpcyB0aGUgcmVtYWluaW5nIHRvIHRoZSBsZWZ0IG9mIHRoZSBmaXJzdCBub24taG9zdCBjaGFyXG4gICAgaG9zdEVuZCA9IC0xO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbm9uSG9zdENoYXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgaGVjID0gcmVzdC5pbmRleE9mKG5vbkhvc3RDaGFyc1tpXSk7XG4gICAgICBpZiAoaGVjICE9PSAtMSAmJiAoaG9zdEVuZCA9PT0gLTEgfHwgaGVjIDwgaG9zdEVuZCkpXG4gICAgICAgIGhvc3RFbmQgPSBoZWM7XG4gICAgfVxuICAgIC8vIGlmIHdlIHN0aWxsIGhhdmUgbm90IGhpdCBpdCwgdGhlbiB0aGUgZW50aXJlIHRoaW5nIGlzIGEgaG9zdC5cbiAgICBpZiAoaG9zdEVuZCA9PT0gLTEpXG4gICAgICBob3N0RW5kID0gcmVzdC5sZW5ndGg7XG5cbiAgICB0aGlzLmhvc3QgPSByZXN0LnNsaWNlKDAsIGhvc3RFbmQpO1xuICAgIHJlc3QgPSByZXN0LnNsaWNlKGhvc3RFbmQpO1xuXG4gICAgLy8gcHVsbCBvdXQgcG9ydC5cbiAgICB0aGlzLnBhcnNlSG9zdCgpO1xuXG4gICAgLy8gd2UndmUgaW5kaWNhdGVkIHRoYXQgdGhlcmUgaXMgYSBob3N0bmFtZSxcbiAgICAvLyBzbyBldmVuIGlmIGl0J3MgZW1wdHksIGl0IGhhcyB0byBiZSBwcmVzZW50LlxuICAgIHRoaXMuaG9zdG5hbWUgPSB0aGlzLmhvc3RuYW1lIHx8ICcnO1xuXG4gICAgLy8gaWYgaG9zdG5hbWUgYmVnaW5zIHdpdGggWyBhbmQgZW5kcyB3aXRoIF1cbiAgICAvLyBhc3N1bWUgdGhhdCBpdCdzIGFuIElQdjYgYWRkcmVzcy5cbiAgICB2YXIgaXB2Nkhvc3RuYW1lID0gdGhpcy5ob3N0bmFtZVswXSA9PT0gJ1snICYmXG4gICAgICAgIHRoaXMuaG9zdG5hbWVbdGhpcy5ob3N0bmFtZS5sZW5ndGggLSAxXSA9PT0gJ10nO1xuXG4gICAgLy8gdmFsaWRhdGUgYSBsaXR0bGUuXG4gICAgaWYgKCFpcHY2SG9zdG5hbWUpIHtcbiAgICAgIHZhciBob3N0cGFydHMgPSB0aGlzLmhvc3RuYW1lLnNwbGl0KC9cXC4vKTtcbiAgICAgIGZvciAodmFyIGkgPSAwLCBsID0gaG9zdHBhcnRzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICB2YXIgcGFydCA9IGhvc3RwYXJ0c1tpXTtcbiAgICAgICAgaWYgKCFwYXJ0KSBjb250aW51ZTtcbiAgICAgICAgaWYgKCFwYXJ0Lm1hdGNoKGhvc3RuYW1lUGFydFBhdHRlcm4pKSB7XG4gICAgICAgICAgdmFyIG5ld3BhcnQgPSAnJztcbiAgICAgICAgICBmb3IgKHZhciBqID0gMCwgayA9IHBhcnQubGVuZ3RoOyBqIDwgazsgaisrKSB7XG4gICAgICAgICAgICBpZiAocGFydC5jaGFyQ29kZUF0KGopID4gMTI3KSB7XG4gICAgICAgICAgICAgIC8vIHdlIHJlcGxhY2Ugbm9uLUFTQ0lJIGNoYXIgd2l0aCBhIHRlbXBvcmFyeSBwbGFjZWhvbGRlclxuICAgICAgICAgICAgICAvLyB3ZSBuZWVkIHRoaXMgdG8gbWFrZSBzdXJlIHNpemUgb2YgaG9zdG5hbWUgaXMgbm90XG4gICAgICAgICAgICAgIC8vIGJyb2tlbiBieSByZXBsYWNpbmcgbm9uLUFTQ0lJIGJ5IG5vdGhpbmdcbiAgICAgICAgICAgICAgbmV3cGFydCArPSAneCc7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBuZXdwYXJ0ICs9IHBhcnRbal07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vIHdlIHRlc3QgYWdhaW4gd2l0aCBBU0NJSSBjaGFyIG9ubHlcbiAgICAgICAgICBpZiAoIW5ld3BhcnQubWF0Y2goaG9zdG5hbWVQYXJ0UGF0dGVybikpIHtcbiAgICAgICAgICAgIHZhciB2YWxpZFBhcnRzID0gaG9zdHBhcnRzLnNsaWNlKDAsIGkpO1xuICAgICAgICAgICAgdmFyIG5vdEhvc3QgPSBob3N0cGFydHMuc2xpY2UoaSArIDEpO1xuICAgICAgICAgICAgdmFyIGJpdCA9IHBhcnQubWF0Y2goaG9zdG5hbWVQYXJ0U3RhcnQpO1xuICAgICAgICAgICAgaWYgKGJpdCkge1xuICAgICAgICAgICAgICB2YWxpZFBhcnRzLnB1c2goYml0WzFdKTtcbiAgICAgICAgICAgICAgbm90SG9zdC51bnNoaWZ0KGJpdFsyXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAobm90SG9zdC5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgcmVzdCA9ICcvJyArIG5vdEhvc3Quam9pbignLicpICsgcmVzdDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuaG9zdG5hbWUgPSB2YWxpZFBhcnRzLmpvaW4oJy4nKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh0aGlzLmhvc3RuYW1lLmxlbmd0aCA+IGhvc3RuYW1lTWF4TGVuKSB7XG4gICAgICB0aGlzLmhvc3RuYW1lID0gJyc7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIGhvc3RuYW1lcyBhcmUgYWx3YXlzIGxvd2VyIGNhc2UuXG4gICAgICB0aGlzLmhvc3RuYW1lID0gdGhpcy5ob3N0bmFtZS50b0xvd2VyQ2FzZSgpO1xuICAgIH1cblxuICAgIGlmICghaXB2Nkhvc3RuYW1lKSB7XG4gICAgICAvLyBJRE5BIFN1cHBvcnQ6IFJldHVybnMgYSBwdW55Y29kZWQgcmVwcmVzZW50YXRpb24gb2YgXCJkb21haW5cIi5cbiAgICAgIC8vIEl0IG9ubHkgY29udmVydHMgcGFydHMgb2YgdGhlIGRvbWFpbiBuYW1lIHRoYXRcbiAgICAgIC8vIGhhdmUgbm9uLUFTQ0lJIGNoYXJhY3RlcnMsIGkuZS4gaXQgZG9lc24ndCBtYXR0ZXIgaWZcbiAgICAgIC8vIHlvdSBjYWxsIGl0IHdpdGggYSBkb21haW4gdGhhdCBhbHJlYWR5IGlzIEFTQ0lJLW9ubHkuXG4gICAgICB0aGlzLmhvc3RuYW1lID0gcHVueWNvZGUudG9BU0NJSSh0aGlzLmhvc3RuYW1lKTtcbiAgICB9XG5cbiAgICB2YXIgcCA9IHRoaXMucG9ydCA/ICc6JyArIHRoaXMucG9ydCA6ICcnO1xuICAgIHZhciBoID0gdGhpcy5ob3N0bmFtZSB8fCAnJztcbiAgICB0aGlzLmhvc3QgPSBoICsgcDtcbiAgICB0aGlzLmhyZWYgKz0gdGhpcy5ob3N0O1xuXG4gICAgLy8gc3RyaXAgWyBhbmQgXSBmcm9tIHRoZSBob3N0bmFtZVxuICAgIC8vIHRoZSBob3N0IGZpZWxkIHN0aWxsIHJldGFpbnMgdGhlbSwgdGhvdWdoXG4gICAgaWYgKGlwdjZIb3N0bmFtZSkge1xuICAgICAgdGhpcy5ob3N0bmFtZSA9IHRoaXMuaG9zdG5hbWUuc3Vic3RyKDEsIHRoaXMuaG9zdG5hbWUubGVuZ3RoIC0gMik7XG4gICAgICBpZiAocmVzdFswXSAhPT0gJy8nKSB7XG4gICAgICAgIHJlc3QgPSAnLycgKyByZXN0O1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vIG5vdyByZXN0IGlzIHNldCB0byB0aGUgcG9zdC1ob3N0IHN0dWZmLlxuICAvLyBjaG9wIG9mZiBhbnkgZGVsaW0gY2hhcnMuXG4gIGlmICghdW5zYWZlUHJvdG9jb2xbbG93ZXJQcm90b10pIHtcblxuICAgIC8vIEZpcnN0LCBtYWtlIDEwMCUgc3VyZSB0aGF0IGFueSBcImF1dG9Fc2NhcGVcIiBjaGFycyBnZXRcbiAgICAvLyBlc2NhcGVkLCBldmVuIGlmIGVuY29kZVVSSUNvbXBvbmVudCBkb2Vzbid0IHRoaW5rIHRoZXlcbiAgICAvLyBuZWVkIHRvIGJlLlxuICAgIGZvciAodmFyIGkgPSAwLCBsID0gYXV0b0VzY2FwZS5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgIHZhciBhZSA9IGF1dG9Fc2NhcGVbaV07XG4gICAgICBpZiAocmVzdC5pbmRleE9mKGFlKSA9PT0gLTEpXG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgdmFyIGVzYyA9IGVuY29kZVVSSUNvbXBvbmVudChhZSk7XG4gICAgICBpZiAoZXNjID09PSBhZSkge1xuICAgICAgICBlc2MgPSBlc2NhcGUoYWUpO1xuICAgICAgfVxuICAgICAgcmVzdCA9IHJlc3Quc3BsaXQoYWUpLmpvaW4oZXNjKTtcbiAgICB9XG4gIH1cblxuXG4gIC8vIGNob3Agb2ZmIGZyb20gdGhlIHRhaWwgZmlyc3QuXG4gIHZhciBoYXNoID0gcmVzdC5pbmRleE9mKCcjJyk7XG4gIGlmIChoYXNoICE9PSAtMSkge1xuICAgIC8vIGdvdCBhIGZyYWdtZW50IHN0cmluZy5cbiAgICB0aGlzLmhhc2ggPSByZXN0LnN1YnN0cihoYXNoKTtcbiAgICByZXN0ID0gcmVzdC5zbGljZSgwLCBoYXNoKTtcbiAgfVxuICB2YXIgcW0gPSByZXN0LmluZGV4T2YoJz8nKTtcbiAgaWYgKHFtICE9PSAtMSkge1xuICAgIHRoaXMuc2VhcmNoID0gcmVzdC5zdWJzdHIocW0pO1xuICAgIHRoaXMucXVlcnkgPSByZXN0LnN1YnN0cihxbSArIDEpO1xuICAgIGlmIChwYXJzZVF1ZXJ5U3RyaW5nKSB7XG4gICAgICB0aGlzLnF1ZXJ5ID0gcXVlcnlzdHJpbmcucGFyc2UodGhpcy5xdWVyeSk7XG4gICAgfVxuICAgIHJlc3QgPSByZXN0LnNsaWNlKDAsIHFtKTtcbiAgfSBlbHNlIGlmIChwYXJzZVF1ZXJ5U3RyaW5nKSB7XG4gICAgLy8gbm8gcXVlcnkgc3RyaW5nLCBidXQgcGFyc2VRdWVyeVN0cmluZyBzdGlsbCByZXF1ZXN0ZWRcbiAgICB0aGlzLnNlYXJjaCA9ICcnO1xuICAgIHRoaXMucXVlcnkgPSB7fTtcbiAgfVxuICBpZiAocmVzdCkgdGhpcy5wYXRobmFtZSA9IHJlc3Q7XG4gIGlmIChzbGFzaGVkUHJvdG9jb2xbbG93ZXJQcm90b10gJiZcbiAgICAgIHRoaXMuaG9zdG5hbWUgJiYgIXRoaXMucGF0aG5hbWUpIHtcbiAgICB0aGlzLnBhdGhuYW1lID0gJy8nO1xuICB9XG5cbiAgLy90byBzdXBwb3J0IGh0dHAucmVxdWVzdFxuICBpZiAodGhpcy5wYXRobmFtZSB8fCB0aGlzLnNlYXJjaCkge1xuICAgIHZhciBwID0gdGhpcy5wYXRobmFtZSB8fCAnJztcbiAgICB2YXIgcyA9IHRoaXMuc2VhcmNoIHx8ICcnO1xuICAgIHRoaXMucGF0aCA9IHAgKyBzO1xuICB9XG5cbiAgLy8gZmluYWxseSwgcmVjb25zdHJ1Y3QgdGhlIGhyZWYgYmFzZWQgb24gd2hhdCBoYXMgYmVlbiB2YWxpZGF0ZWQuXG4gIHRoaXMuaHJlZiA9IHRoaXMuZm9ybWF0KCk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLy8gZm9ybWF0IGEgcGFyc2VkIG9iamVjdCBpbnRvIGEgdXJsIHN0cmluZ1xuZnVuY3Rpb24gdXJsRm9ybWF0KG9iaikge1xuICAvLyBlbnN1cmUgaXQncyBhbiBvYmplY3QsIGFuZCBub3QgYSBzdHJpbmcgdXJsLlxuICAvLyBJZiBpdCdzIGFuIG9iaiwgdGhpcyBpcyBhIG5vLW9wLlxuICAvLyB0aGlzIHdheSwgeW91IGNhbiBjYWxsIHVybF9mb3JtYXQoKSBvbiBzdHJpbmdzXG4gIC8vIHRvIGNsZWFuIHVwIHBvdGVudGlhbGx5IHdvbmt5IHVybHMuXG4gIGlmICh1dGlsLmlzU3RyaW5nKG9iaikpIG9iaiA9IHVybFBhcnNlKG9iaik7XG4gIGlmICghKG9iaiBpbnN0YW5jZW9mIFVybCkpIHJldHVybiBVcmwucHJvdG90eXBlLmZvcm1hdC5jYWxsKG9iaik7XG4gIHJldHVybiBvYmouZm9ybWF0KCk7XG59XG5cblVybC5wcm90b3R5cGUuZm9ybWF0ID0gZnVuY3Rpb24oKSB7XG4gIHZhciBhdXRoID0gdGhpcy5hdXRoIHx8ICcnO1xuICBpZiAoYXV0aCkge1xuICAgIGF1dGggPSBlbmNvZGVVUklDb21wb25lbnQoYXV0aCk7XG4gICAgYXV0aCA9IGF1dGgucmVwbGFjZSgvJTNBL2ksICc6Jyk7XG4gICAgYXV0aCArPSAnQCc7XG4gIH1cblxuICB2YXIgcHJvdG9jb2wgPSB0aGlzLnByb3RvY29sIHx8ICcnLFxuICAgICAgcGF0aG5hbWUgPSB0aGlzLnBhdGhuYW1lIHx8ICcnLFxuICAgICAgaGFzaCA9IHRoaXMuaGFzaCB8fCAnJyxcbiAgICAgIGhvc3QgPSBmYWxzZSxcbiAgICAgIHF1ZXJ5ID0gJyc7XG5cbiAgaWYgKHRoaXMuaG9zdCkge1xuICAgIGhvc3QgPSBhdXRoICsgdGhpcy5ob3N0O1xuICB9IGVsc2UgaWYgKHRoaXMuaG9zdG5hbWUpIHtcbiAgICBob3N0ID0gYXV0aCArICh0aGlzLmhvc3RuYW1lLmluZGV4T2YoJzonKSA9PT0gLTEgP1xuICAgICAgICB0aGlzLmhvc3RuYW1lIDpcbiAgICAgICAgJ1snICsgdGhpcy5ob3N0bmFtZSArICddJyk7XG4gICAgaWYgKHRoaXMucG9ydCkge1xuICAgICAgaG9zdCArPSAnOicgKyB0aGlzLnBvcnQ7XG4gICAgfVxuICB9XG5cbiAgaWYgKHRoaXMucXVlcnkgJiZcbiAgICAgIHV0aWwuaXNPYmplY3QodGhpcy5xdWVyeSkgJiZcbiAgICAgIE9iamVjdC5rZXlzKHRoaXMucXVlcnkpLmxlbmd0aCkge1xuICAgIHF1ZXJ5ID0gcXVlcnlzdHJpbmcuc3RyaW5naWZ5KHRoaXMucXVlcnkpO1xuICB9XG5cbiAgdmFyIHNlYXJjaCA9IHRoaXMuc2VhcmNoIHx8IChxdWVyeSAmJiAoJz8nICsgcXVlcnkpKSB8fCAnJztcblxuICBpZiAocHJvdG9jb2wgJiYgcHJvdG9jb2wuc3Vic3RyKC0xKSAhPT0gJzonKSBwcm90b2NvbCArPSAnOic7XG5cbiAgLy8gb25seSB0aGUgc2xhc2hlZFByb3RvY29scyBnZXQgdGhlIC8vLiAgTm90IG1haWx0bzosIHhtcHA6LCBldGMuXG4gIC8vIHVubGVzcyB0aGV5IGhhZCB0aGVtIHRvIGJlZ2luIHdpdGguXG4gIGlmICh0aGlzLnNsYXNoZXMgfHxcbiAgICAgICghcHJvdG9jb2wgfHwgc2xhc2hlZFByb3RvY29sW3Byb3RvY29sXSkgJiYgaG9zdCAhPT0gZmFsc2UpIHtcbiAgICBob3N0ID0gJy8vJyArIChob3N0IHx8ICcnKTtcbiAgICBpZiAocGF0aG5hbWUgJiYgcGF0aG5hbWUuY2hhckF0KDApICE9PSAnLycpIHBhdGhuYW1lID0gJy8nICsgcGF0aG5hbWU7XG4gIH0gZWxzZSBpZiAoIWhvc3QpIHtcbiAgICBob3N0ID0gJyc7XG4gIH1cblxuICBpZiAoaGFzaCAmJiBoYXNoLmNoYXJBdCgwKSAhPT0gJyMnKSBoYXNoID0gJyMnICsgaGFzaDtcbiAgaWYgKHNlYXJjaCAmJiBzZWFyY2guY2hhckF0KDApICE9PSAnPycpIHNlYXJjaCA9ICc/JyArIHNlYXJjaDtcblxuICBwYXRobmFtZSA9IHBhdGhuYW1lLnJlcGxhY2UoL1s/I10vZywgZnVuY3Rpb24obWF0Y2gpIHtcbiAgICByZXR1cm4gZW5jb2RlVVJJQ29tcG9uZW50KG1hdGNoKTtcbiAgfSk7XG4gIHNlYXJjaCA9IHNlYXJjaC5yZXBsYWNlKCcjJywgJyUyMycpO1xuXG4gIHJldHVybiBwcm90b2NvbCArIGhvc3QgKyBwYXRobmFtZSArIHNlYXJjaCArIGhhc2g7XG59O1xuXG5mdW5jdGlvbiB1cmxSZXNvbHZlKHNvdXJjZSwgcmVsYXRpdmUpIHtcbiAgcmV0dXJuIHVybFBhcnNlKHNvdXJjZSwgZmFsc2UsIHRydWUpLnJlc29sdmUocmVsYXRpdmUpO1xufVxuXG5VcmwucHJvdG90eXBlLnJlc29sdmUgPSBmdW5jdGlvbihyZWxhdGl2ZSkge1xuICByZXR1cm4gdGhpcy5yZXNvbHZlT2JqZWN0KHVybFBhcnNlKHJlbGF0aXZlLCBmYWxzZSwgdHJ1ZSkpLmZvcm1hdCgpO1xufTtcblxuZnVuY3Rpb24gdXJsUmVzb2x2ZU9iamVjdChzb3VyY2UsIHJlbGF0aXZlKSB7XG4gIGlmICghc291cmNlKSByZXR1cm4gcmVsYXRpdmU7XG4gIHJldHVybiB1cmxQYXJzZShzb3VyY2UsIGZhbHNlLCB0cnVlKS5yZXNvbHZlT2JqZWN0KHJlbGF0aXZlKTtcbn1cblxuVXJsLnByb3RvdHlwZS5yZXNvbHZlT2JqZWN0ID0gZnVuY3Rpb24ocmVsYXRpdmUpIHtcbiAgaWYgKHV0aWwuaXNTdHJpbmcocmVsYXRpdmUpKSB7XG4gICAgdmFyIHJlbCA9IG5ldyBVcmwoKTtcbiAgICByZWwucGFyc2UocmVsYXRpdmUsIGZhbHNlLCB0cnVlKTtcbiAgICByZWxhdGl2ZSA9IHJlbDtcbiAgfVxuXG4gIHZhciByZXN1bHQgPSBuZXcgVXJsKCk7XG4gIHZhciB0a2V5cyA9IE9iamVjdC5rZXlzKHRoaXMpO1xuICBmb3IgKHZhciB0ayA9IDA7IHRrIDwgdGtleXMubGVuZ3RoOyB0aysrKSB7XG4gICAgdmFyIHRrZXkgPSB0a2V5c1t0a107XG4gICAgcmVzdWx0W3RrZXldID0gdGhpc1t0a2V5XTtcbiAgfVxuXG4gIC8vIGhhc2ggaXMgYWx3YXlzIG92ZXJyaWRkZW4sIG5vIG1hdHRlciB3aGF0LlxuICAvLyBldmVuIGhyZWY9XCJcIiB3aWxsIHJlbW92ZSBpdC5cbiAgcmVzdWx0Lmhhc2ggPSByZWxhdGl2ZS5oYXNoO1xuXG4gIC8vIGlmIHRoZSByZWxhdGl2ZSB1cmwgaXMgZW1wdHksIHRoZW4gdGhlcmUncyBub3RoaW5nIGxlZnQgdG8gZG8gaGVyZS5cbiAgaWYgKHJlbGF0aXZlLmhyZWYgPT09ICcnKSB7XG4gICAgcmVzdWx0LmhyZWYgPSByZXN1bHQuZm9ybWF0KCk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIC8vIGhyZWZzIGxpa2UgLy9mb28vYmFyIGFsd2F5cyBjdXQgdG8gdGhlIHByb3RvY29sLlxuICBpZiAocmVsYXRpdmUuc2xhc2hlcyAmJiAhcmVsYXRpdmUucHJvdG9jb2wpIHtcbiAgICAvLyB0YWtlIGV2ZXJ5dGhpbmcgZXhjZXB0IHRoZSBwcm90b2NvbCBmcm9tIHJlbGF0aXZlXG4gICAgdmFyIHJrZXlzID0gT2JqZWN0LmtleXMocmVsYXRpdmUpO1xuICAgIGZvciAodmFyIHJrID0gMDsgcmsgPCBya2V5cy5sZW5ndGg7IHJrKyspIHtcbiAgICAgIHZhciBya2V5ID0gcmtleXNbcmtdO1xuICAgICAgaWYgKHJrZXkgIT09ICdwcm90b2NvbCcpXG4gICAgICAgIHJlc3VsdFtya2V5XSA9IHJlbGF0aXZlW3JrZXldO1xuICAgIH1cblxuICAgIC8vdXJsUGFyc2UgYXBwZW5kcyB0cmFpbGluZyAvIHRvIHVybHMgbGlrZSBodHRwOi8vd3d3LmV4YW1wbGUuY29tXG4gICAgaWYgKHNsYXNoZWRQcm90b2NvbFtyZXN1bHQucHJvdG9jb2xdICYmXG4gICAgICAgIHJlc3VsdC5ob3N0bmFtZSAmJiAhcmVzdWx0LnBhdGhuYW1lKSB7XG4gICAgICByZXN1bHQucGF0aCA9IHJlc3VsdC5wYXRobmFtZSA9ICcvJztcbiAgICB9XG5cbiAgICByZXN1bHQuaHJlZiA9IHJlc3VsdC5mb3JtYXQoKTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgaWYgKHJlbGF0aXZlLnByb3RvY29sICYmIHJlbGF0aXZlLnByb3RvY29sICE9PSByZXN1bHQucHJvdG9jb2wpIHtcbiAgICAvLyBpZiBpdCdzIGEga25vd24gdXJsIHByb3RvY29sLCB0aGVuIGNoYW5naW5nXG4gICAgLy8gdGhlIHByb3RvY29sIGRvZXMgd2VpcmQgdGhpbmdzXG4gICAgLy8gZmlyc3QsIGlmIGl0J3Mgbm90IGZpbGU6LCB0aGVuIHdlIE1VU1QgaGF2ZSBhIGhvc3QsXG4gICAgLy8gYW5kIGlmIHRoZXJlIHdhcyBhIHBhdGhcbiAgICAvLyB0byBiZWdpbiB3aXRoLCB0aGVuIHdlIE1VU1QgaGF2ZSBhIHBhdGguXG4gICAgLy8gaWYgaXQgaXMgZmlsZTosIHRoZW4gdGhlIGhvc3QgaXMgZHJvcHBlZCxcbiAgICAvLyBiZWNhdXNlIHRoYXQncyBrbm93biB0byBiZSBob3N0bGVzcy5cbiAgICAvLyBhbnl0aGluZyBlbHNlIGlzIGFzc3VtZWQgdG8gYmUgYWJzb2x1dGUuXG4gICAgaWYgKCFzbGFzaGVkUHJvdG9jb2xbcmVsYXRpdmUucHJvdG9jb2xdKSB7XG4gICAgICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKHJlbGF0aXZlKTtcbiAgICAgIGZvciAodmFyIHYgPSAwOyB2IDwga2V5cy5sZW5ndGg7IHYrKykge1xuICAgICAgICB2YXIgayA9IGtleXNbdl07XG4gICAgICAgIHJlc3VsdFtrXSA9IHJlbGF0aXZlW2tdO1xuICAgICAgfVxuICAgICAgcmVzdWx0LmhyZWYgPSByZXN1bHQuZm9ybWF0KCk7XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIHJlc3VsdC5wcm90b2NvbCA9IHJlbGF0aXZlLnByb3RvY29sO1xuICAgIGlmICghcmVsYXRpdmUuaG9zdCAmJiAhaG9zdGxlc3NQcm90b2NvbFtyZWxhdGl2ZS5wcm90b2NvbF0pIHtcbiAgICAgIHZhciByZWxQYXRoID0gKHJlbGF0aXZlLnBhdGhuYW1lIHx8ICcnKS5zcGxpdCgnLycpO1xuICAgICAgd2hpbGUgKHJlbFBhdGgubGVuZ3RoICYmICEocmVsYXRpdmUuaG9zdCA9IHJlbFBhdGguc2hpZnQoKSkpO1xuICAgICAgaWYgKCFyZWxhdGl2ZS5ob3N0KSByZWxhdGl2ZS5ob3N0ID0gJyc7XG4gICAgICBpZiAoIXJlbGF0aXZlLmhvc3RuYW1lKSByZWxhdGl2ZS5ob3N0bmFtZSA9ICcnO1xuICAgICAgaWYgKHJlbFBhdGhbMF0gIT09ICcnKSByZWxQYXRoLnVuc2hpZnQoJycpO1xuICAgICAgaWYgKHJlbFBhdGgubGVuZ3RoIDwgMikgcmVsUGF0aC51bnNoaWZ0KCcnKTtcbiAgICAgIHJlc3VsdC5wYXRobmFtZSA9IHJlbFBhdGguam9pbignLycpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXN1bHQucGF0aG5hbWUgPSByZWxhdGl2ZS5wYXRobmFtZTtcbiAgICB9XG4gICAgcmVzdWx0LnNlYXJjaCA9IHJlbGF0aXZlLnNlYXJjaDtcbiAgICByZXN1bHQucXVlcnkgPSByZWxhdGl2ZS5xdWVyeTtcbiAgICByZXN1bHQuaG9zdCA9IHJlbGF0aXZlLmhvc3QgfHwgJyc7XG4gICAgcmVzdWx0LmF1dGggPSByZWxhdGl2ZS5hdXRoO1xuICAgIHJlc3VsdC5ob3N0bmFtZSA9IHJlbGF0aXZlLmhvc3RuYW1lIHx8IHJlbGF0aXZlLmhvc3Q7XG4gICAgcmVzdWx0LnBvcnQgPSByZWxhdGl2ZS5wb3J0O1xuICAgIC8vIHRvIHN1cHBvcnQgaHR0cC5yZXF1ZXN0XG4gICAgaWYgKHJlc3VsdC5wYXRobmFtZSB8fCByZXN1bHQuc2VhcmNoKSB7XG4gICAgICB2YXIgcCA9IHJlc3VsdC5wYXRobmFtZSB8fCAnJztcbiAgICAgIHZhciBzID0gcmVzdWx0LnNlYXJjaCB8fCAnJztcbiAgICAgIHJlc3VsdC5wYXRoID0gcCArIHM7XG4gICAgfVxuICAgIHJlc3VsdC5zbGFzaGVzID0gcmVzdWx0LnNsYXNoZXMgfHwgcmVsYXRpdmUuc2xhc2hlcztcbiAgICByZXN1bHQuaHJlZiA9IHJlc3VsdC5mb3JtYXQoKTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgdmFyIGlzU291cmNlQWJzID0gKHJlc3VsdC5wYXRobmFtZSAmJiByZXN1bHQucGF0aG5hbWUuY2hhckF0KDApID09PSAnLycpLFxuICAgICAgaXNSZWxBYnMgPSAoXG4gICAgICAgICAgcmVsYXRpdmUuaG9zdCB8fFxuICAgICAgICAgIHJlbGF0aXZlLnBhdGhuYW1lICYmIHJlbGF0aXZlLnBhdGhuYW1lLmNoYXJBdCgwKSA9PT0gJy8nXG4gICAgICApLFxuICAgICAgbXVzdEVuZEFicyA9IChpc1JlbEFicyB8fCBpc1NvdXJjZUFicyB8fFxuICAgICAgICAgICAgICAgICAgICAocmVzdWx0Lmhvc3QgJiYgcmVsYXRpdmUucGF0aG5hbWUpKSxcbiAgICAgIHJlbW92ZUFsbERvdHMgPSBtdXN0RW5kQWJzLFxuICAgICAgc3JjUGF0aCA9IHJlc3VsdC5wYXRobmFtZSAmJiByZXN1bHQucGF0aG5hbWUuc3BsaXQoJy8nKSB8fCBbXSxcbiAgICAgIHJlbFBhdGggPSByZWxhdGl2ZS5wYXRobmFtZSAmJiByZWxhdGl2ZS5wYXRobmFtZS5zcGxpdCgnLycpIHx8IFtdLFxuICAgICAgcHN5Y2hvdGljID0gcmVzdWx0LnByb3RvY29sICYmICFzbGFzaGVkUHJvdG9jb2xbcmVzdWx0LnByb3RvY29sXTtcblxuICAvLyBpZiB0aGUgdXJsIGlzIGEgbm9uLXNsYXNoZWQgdXJsLCB0aGVuIHJlbGF0aXZlXG4gIC8vIGxpbmtzIGxpa2UgLi4vLi4gc2hvdWxkIGJlIGFibGVcbiAgLy8gdG8gY3Jhd2wgdXAgdG8gdGhlIGhvc3RuYW1lLCBhcyB3ZWxsLiAgVGhpcyBpcyBzdHJhbmdlLlxuICAvLyByZXN1bHQucHJvdG9jb2wgaGFzIGFscmVhZHkgYmVlbiBzZXQgYnkgbm93LlxuICAvLyBMYXRlciBvbiwgcHV0IHRoZSBmaXJzdCBwYXRoIHBhcnQgaW50byB0aGUgaG9zdCBmaWVsZC5cbiAgaWYgKHBzeWNob3RpYykge1xuICAgIHJlc3VsdC5ob3N0bmFtZSA9ICcnO1xuICAgIHJlc3VsdC5wb3J0ID0gbnVsbDtcbiAgICBpZiAocmVzdWx0Lmhvc3QpIHtcbiAgICAgIGlmIChzcmNQYXRoWzBdID09PSAnJykgc3JjUGF0aFswXSA9IHJlc3VsdC5ob3N0O1xuICAgICAgZWxzZSBzcmNQYXRoLnVuc2hpZnQocmVzdWx0Lmhvc3QpO1xuICAgIH1cbiAgICByZXN1bHQuaG9zdCA9ICcnO1xuICAgIGlmIChyZWxhdGl2ZS5wcm90b2NvbCkge1xuICAgICAgcmVsYXRpdmUuaG9zdG5hbWUgPSBudWxsO1xuICAgICAgcmVsYXRpdmUucG9ydCA9IG51bGw7XG4gICAgICBpZiAocmVsYXRpdmUuaG9zdCkge1xuICAgICAgICBpZiAocmVsUGF0aFswXSA9PT0gJycpIHJlbFBhdGhbMF0gPSByZWxhdGl2ZS5ob3N0O1xuICAgICAgICBlbHNlIHJlbFBhdGgudW5zaGlmdChyZWxhdGl2ZS5ob3N0KTtcbiAgICAgIH1cbiAgICAgIHJlbGF0aXZlLmhvc3QgPSBudWxsO1xuICAgIH1cbiAgICBtdXN0RW5kQWJzID0gbXVzdEVuZEFicyAmJiAocmVsUGF0aFswXSA9PT0gJycgfHwgc3JjUGF0aFswXSA9PT0gJycpO1xuICB9XG5cbiAgaWYgKGlzUmVsQWJzKSB7XG4gICAgLy8gaXQncyBhYnNvbHV0ZS5cbiAgICByZXN1bHQuaG9zdCA9IChyZWxhdGl2ZS5ob3N0IHx8IHJlbGF0aXZlLmhvc3QgPT09ICcnKSA/XG4gICAgICAgICAgICAgICAgICByZWxhdGl2ZS5ob3N0IDogcmVzdWx0Lmhvc3Q7XG4gICAgcmVzdWx0Lmhvc3RuYW1lID0gKHJlbGF0aXZlLmhvc3RuYW1lIHx8IHJlbGF0aXZlLmhvc3RuYW1lID09PSAnJykgP1xuICAgICAgICAgICAgICAgICAgICAgIHJlbGF0aXZlLmhvc3RuYW1lIDogcmVzdWx0Lmhvc3RuYW1lO1xuICAgIHJlc3VsdC5zZWFyY2ggPSByZWxhdGl2ZS5zZWFyY2g7XG4gICAgcmVzdWx0LnF1ZXJ5ID0gcmVsYXRpdmUucXVlcnk7XG4gICAgc3JjUGF0aCA9IHJlbFBhdGg7XG4gICAgLy8gZmFsbCB0aHJvdWdoIHRvIHRoZSBkb3QtaGFuZGxpbmcgYmVsb3cuXG4gIH0gZWxzZSBpZiAocmVsUGF0aC5sZW5ndGgpIHtcbiAgICAvLyBpdCdzIHJlbGF0aXZlXG4gICAgLy8gdGhyb3cgYXdheSB0aGUgZXhpc3RpbmcgZmlsZSwgYW5kIHRha2UgdGhlIG5ldyBwYXRoIGluc3RlYWQuXG4gICAgaWYgKCFzcmNQYXRoKSBzcmNQYXRoID0gW107XG4gICAgc3JjUGF0aC5wb3AoKTtcbiAgICBzcmNQYXRoID0gc3JjUGF0aC5jb25jYXQocmVsUGF0aCk7XG4gICAgcmVzdWx0LnNlYXJjaCA9IHJlbGF0aXZlLnNlYXJjaDtcbiAgICByZXN1bHQucXVlcnkgPSByZWxhdGl2ZS5xdWVyeTtcbiAgfSBlbHNlIGlmICghdXRpbC5pc051bGxPclVuZGVmaW5lZChyZWxhdGl2ZS5zZWFyY2gpKSB7XG4gICAgLy8ganVzdCBwdWxsIG91dCB0aGUgc2VhcmNoLlxuICAgIC8vIGxpa2UgaHJlZj0nP2ZvbycuXG4gICAgLy8gUHV0IHRoaXMgYWZ0ZXIgdGhlIG90aGVyIHR3byBjYXNlcyBiZWNhdXNlIGl0IHNpbXBsaWZpZXMgdGhlIGJvb2xlYW5zXG4gICAgaWYgKHBzeWNob3RpYykge1xuICAgICAgcmVzdWx0Lmhvc3RuYW1lID0gcmVzdWx0Lmhvc3QgPSBzcmNQYXRoLnNoaWZ0KCk7XG4gICAgICAvL29jY2F0aW9uYWx5IHRoZSBhdXRoIGNhbiBnZXQgc3R1Y2sgb25seSBpbiBob3N0XG4gICAgICAvL3RoaXMgZXNwZWNpYWxseSBoYXBwZW5zIGluIGNhc2VzIGxpa2VcbiAgICAgIC8vdXJsLnJlc29sdmVPYmplY3QoJ21haWx0bzpsb2NhbDFAZG9tYWluMScsICdsb2NhbDJAZG9tYWluMicpXG4gICAgICB2YXIgYXV0aEluSG9zdCA9IHJlc3VsdC5ob3N0ICYmIHJlc3VsdC5ob3N0LmluZGV4T2YoJ0AnKSA+IDAgP1xuICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQuaG9zdC5zcGxpdCgnQCcpIDogZmFsc2U7XG4gICAgICBpZiAoYXV0aEluSG9zdCkge1xuICAgICAgICByZXN1bHQuYXV0aCA9IGF1dGhJbkhvc3Quc2hpZnQoKTtcbiAgICAgICAgcmVzdWx0Lmhvc3QgPSByZXN1bHQuaG9zdG5hbWUgPSBhdXRoSW5Ib3N0LnNoaWZ0KCk7XG4gICAgICB9XG4gICAgfVxuICAgIHJlc3VsdC5zZWFyY2ggPSByZWxhdGl2ZS5zZWFyY2g7XG4gICAgcmVzdWx0LnF1ZXJ5ID0gcmVsYXRpdmUucXVlcnk7XG4gICAgLy90byBzdXBwb3J0IGh0dHAucmVxdWVzdFxuICAgIGlmICghdXRpbC5pc051bGwocmVzdWx0LnBhdGhuYW1lKSB8fCAhdXRpbC5pc051bGwocmVzdWx0LnNlYXJjaCkpIHtcbiAgICAgIHJlc3VsdC5wYXRoID0gKHJlc3VsdC5wYXRobmFtZSA/IHJlc3VsdC5wYXRobmFtZSA6ICcnKSArXG4gICAgICAgICAgICAgICAgICAgIChyZXN1bHQuc2VhcmNoID8gcmVzdWx0LnNlYXJjaCA6ICcnKTtcbiAgICB9XG4gICAgcmVzdWx0LmhyZWYgPSByZXN1bHQuZm9ybWF0KCk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIGlmICghc3JjUGF0aC5sZW5ndGgpIHtcbiAgICAvLyBubyBwYXRoIGF0IGFsbC4gIGVhc3kuXG4gICAgLy8gd2UndmUgYWxyZWFkeSBoYW5kbGVkIHRoZSBvdGhlciBzdHVmZiBhYm92ZS5cbiAgICByZXN1bHQucGF0aG5hbWUgPSBudWxsO1xuICAgIC8vdG8gc3VwcG9ydCBodHRwLnJlcXVlc3RcbiAgICBpZiAocmVzdWx0LnNlYXJjaCkge1xuICAgICAgcmVzdWx0LnBhdGggPSAnLycgKyByZXN1bHQuc2VhcmNoO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXN1bHQucGF0aCA9IG51bGw7XG4gICAgfVxuICAgIHJlc3VsdC5ocmVmID0gcmVzdWx0LmZvcm1hdCgpO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICAvLyBpZiBhIHVybCBFTkRzIGluIC4gb3IgLi4sIHRoZW4gaXQgbXVzdCBnZXQgYSB0cmFpbGluZyBzbGFzaC5cbiAgLy8gaG93ZXZlciwgaWYgaXQgZW5kcyBpbiBhbnl0aGluZyBlbHNlIG5vbi1zbGFzaHksXG4gIC8vIHRoZW4gaXQgbXVzdCBOT1QgZ2V0IGEgdHJhaWxpbmcgc2xhc2guXG4gIHZhciBsYXN0ID0gc3JjUGF0aC5zbGljZSgtMSlbMF07XG4gIHZhciBoYXNUcmFpbGluZ1NsYXNoID0gKFxuICAgICAgKHJlc3VsdC5ob3N0IHx8IHJlbGF0aXZlLmhvc3QgfHwgc3JjUGF0aC5sZW5ndGggPiAxKSAmJlxuICAgICAgKGxhc3QgPT09ICcuJyB8fCBsYXN0ID09PSAnLi4nKSB8fCBsYXN0ID09PSAnJyk7XG5cbiAgLy8gc3RyaXAgc2luZ2xlIGRvdHMsIHJlc29sdmUgZG91YmxlIGRvdHMgdG8gcGFyZW50IGRpclxuICAvLyBpZiB0aGUgcGF0aCB0cmllcyB0byBnbyBhYm92ZSB0aGUgcm9vdCwgYHVwYCBlbmRzIHVwID4gMFxuICB2YXIgdXAgPSAwO1xuICBmb3IgKHZhciBpID0gc3JjUGF0aC5sZW5ndGg7IGkgPj0gMDsgaS0tKSB7XG4gICAgbGFzdCA9IHNyY1BhdGhbaV07XG4gICAgaWYgKGxhc3QgPT09ICcuJykge1xuICAgICAgc3JjUGF0aC5zcGxpY2UoaSwgMSk7XG4gICAgfSBlbHNlIGlmIChsYXN0ID09PSAnLi4nKSB7XG4gICAgICBzcmNQYXRoLnNwbGljZShpLCAxKTtcbiAgICAgIHVwKys7XG4gICAgfSBlbHNlIGlmICh1cCkge1xuICAgICAgc3JjUGF0aC5zcGxpY2UoaSwgMSk7XG4gICAgICB1cC0tO1xuICAgIH1cbiAgfVxuXG4gIC8vIGlmIHRoZSBwYXRoIGlzIGFsbG93ZWQgdG8gZ28gYWJvdmUgdGhlIHJvb3QsIHJlc3RvcmUgbGVhZGluZyAuLnNcbiAgaWYgKCFtdXN0RW5kQWJzICYmICFyZW1vdmVBbGxEb3RzKSB7XG4gICAgZm9yICg7IHVwLS07IHVwKSB7XG4gICAgICBzcmNQYXRoLnVuc2hpZnQoJy4uJyk7XG4gICAgfVxuICB9XG5cbiAgaWYgKG11c3RFbmRBYnMgJiYgc3JjUGF0aFswXSAhPT0gJycgJiZcbiAgICAgICghc3JjUGF0aFswXSB8fCBzcmNQYXRoWzBdLmNoYXJBdCgwKSAhPT0gJy8nKSkge1xuICAgIHNyY1BhdGgudW5zaGlmdCgnJyk7XG4gIH1cblxuICBpZiAoaGFzVHJhaWxpbmdTbGFzaCAmJiAoc3JjUGF0aC5qb2luKCcvJykuc3Vic3RyKC0xKSAhPT0gJy8nKSkge1xuICAgIHNyY1BhdGgucHVzaCgnJyk7XG4gIH1cblxuICB2YXIgaXNBYnNvbHV0ZSA9IHNyY1BhdGhbMF0gPT09ICcnIHx8XG4gICAgICAoc3JjUGF0aFswXSAmJiBzcmNQYXRoWzBdLmNoYXJBdCgwKSA9PT0gJy8nKTtcblxuICAvLyBwdXQgdGhlIGhvc3QgYmFja1xuICBpZiAocHN5Y2hvdGljKSB7XG4gICAgcmVzdWx0Lmhvc3RuYW1lID0gcmVzdWx0Lmhvc3QgPSBpc0Fic29sdXRlID8gJycgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3JjUGF0aC5sZW5ndGggPyBzcmNQYXRoLnNoaWZ0KCkgOiAnJztcbiAgICAvL29jY2F0aW9uYWx5IHRoZSBhdXRoIGNhbiBnZXQgc3R1Y2sgb25seSBpbiBob3N0XG4gICAgLy90aGlzIGVzcGVjaWFsbHkgaGFwcGVucyBpbiBjYXNlcyBsaWtlXG4gICAgLy91cmwucmVzb2x2ZU9iamVjdCgnbWFpbHRvOmxvY2FsMUBkb21haW4xJywgJ2xvY2FsMkBkb21haW4yJylcbiAgICB2YXIgYXV0aEluSG9zdCA9IHJlc3VsdC5ob3N0ICYmIHJlc3VsdC5ob3N0LmluZGV4T2YoJ0AnKSA+IDAgP1xuICAgICAgICAgICAgICAgICAgICAgcmVzdWx0Lmhvc3Quc3BsaXQoJ0AnKSA6IGZhbHNlO1xuICAgIGlmIChhdXRoSW5Ib3N0KSB7XG4gICAgICByZXN1bHQuYXV0aCA9IGF1dGhJbkhvc3Quc2hpZnQoKTtcbiAgICAgIHJlc3VsdC5ob3N0ID0gcmVzdWx0Lmhvc3RuYW1lID0gYXV0aEluSG9zdC5zaGlmdCgpO1xuICAgIH1cbiAgfVxuXG4gIG11c3RFbmRBYnMgPSBtdXN0RW5kQWJzIHx8IChyZXN1bHQuaG9zdCAmJiBzcmNQYXRoLmxlbmd0aCk7XG5cbiAgaWYgKG11c3RFbmRBYnMgJiYgIWlzQWJzb2x1dGUpIHtcbiAgICBzcmNQYXRoLnVuc2hpZnQoJycpO1xuICB9XG5cbiAgaWYgKCFzcmNQYXRoLmxlbmd0aCkge1xuICAgIHJlc3VsdC5wYXRobmFtZSA9IG51bGw7XG4gICAgcmVzdWx0LnBhdGggPSBudWxsO1xuICB9IGVsc2Uge1xuICAgIHJlc3VsdC5wYXRobmFtZSA9IHNyY1BhdGguam9pbignLycpO1xuICB9XG5cbiAgLy90byBzdXBwb3J0IHJlcXVlc3QuaHR0cFxuICBpZiAoIXV0aWwuaXNOdWxsKHJlc3VsdC5wYXRobmFtZSkgfHwgIXV0aWwuaXNOdWxsKHJlc3VsdC5zZWFyY2gpKSB7XG4gICAgcmVzdWx0LnBhdGggPSAocmVzdWx0LnBhdGhuYW1lID8gcmVzdWx0LnBhdGhuYW1lIDogJycpICtcbiAgICAgICAgICAgICAgICAgIChyZXN1bHQuc2VhcmNoID8gcmVzdWx0LnNlYXJjaCA6ICcnKTtcbiAgfVxuICByZXN1bHQuYXV0aCA9IHJlbGF0aXZlLmF1dGggfHwgcmVzdWx0LmF1dGg7XG4gIHJlc3VsdC5zbGFzaGVzID0gcmVzdWx0LnNsYXNoZXMgfHwgcmVsYXRpdmUuc2xhc2hlcztcbiAgcmVzdWx0LmhyZWYgPSByZXN1bHQuZm9ybWF0KCk7XG4gIHJldHVybiByZXN1bHQ7XG59O1xuXG5VcmwucHJvdG90eXBlLnBhcnNlSG9zdCA9IGZ1bmN0aW9uKCkge1xuICB2YXIgaG9zdCA9IHRoaXMuaG9zdDtcbiAgdmFyIHBvcnQgPSBwb3J0UGF0dGVybi5leGVjKGhvc3QpO1xuICBpZiAocG9ydCkge1xuICAgIHBvcnQgPSBwb3J0WzBdO1xuICAgIGlmIChwb3J0ICE9PSAnOicpIHtcbiAgICAgIHRoaXMucG9ydCA9IHBvcnQuc3Vic3RyKDEpO1xuICAgIH1cbiAgICBob3N0ID0gaG9zdC5zdWJzdHIoMCwgaG9zdC5sZW5ndGggLSBwb3J0Lmxlbmd0aCk7XG4gIH1cbiAgaWYgKGhvc3QpIHRoaXMuaG9zdG5hbWUgPSBob3N0O1xufTtcbiIsIi8qKlxuICogTW9kdWxlIERlcGVuZGVuY2llc1xuICovXG5cbnZhciBSZWdleHAgPSByZXF1aXJlKCdwYXRoLXRvLXJlZ2V4cCcpXG52YXIgYXNzaWduID0gcmVxdWlyZSgnb2JqZWN0LWFzc2lnbicpXG5cbi8qKlxuICogRXhwb3J0IGBFbnJvdXRlYFxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gRW5yb3V0ZVxuXG4vKipcbiAqIENyZWF0ZSBgZW5yb3V0ZWBcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gcm91dGVzXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAqL1xuXG5mdW5jdGlvbiBFbnJvdXRlIChyb3V0ZXMpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIGVucm91dGUgKGxvY2F0aW9uLCBwcm9wcykge1xuICAgIGlmICghbG9jYXRpb24pIHRocm93IG5ldyBFcnJvcignZW5yb3V0ZSByZXF1aXJlcyBhIGxvY2F0aW9uJylcbiAgICBwcm9wcyA9IHByb3BzIHx8IHt9XG4gICAgdmFyIHBhcmFtcyA9IHt9XG5cbiAgICBmb3IgKHZhciByb3V0ZSBpbiByb3V0ZXMpIHtcbiAgICAgIHZhciBtID0gbWF0Y2gocm91dGUsIHBhcmFtcywgbG9jYXRpb24pXG4gICAgICB2YXIgZm4gPSByb3V0ZXNbcm91dGVdXG5cbiAgICAgIGlmIChtKSB7XG4gICAgICAgIGlmICh0eXBlb2YgZm4gIT09ICdmdW5jdGlvbicpIHJldHVybiBmblxuICAgICAgICBlbHNlIHJldHVybiBmbihwYXJhbXMsIHByb3BzKVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBudWxsXG4gIH1cbn1cblxuLyoqXG4gKiBDaGVjayBpZiB0aGlzIHJvdXRlIG1hdGNoZXMgYHBhdGhgLCBpZiBzb1xuICogcG9wdWxhdGUgYHBhcmFtc2AuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHBhdGhcbiAqIEBwYXJhbSB7T2JqZWN0fSBwYXJhbXNcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBtYXRjaChwYXRoLCBwYXJhbXMsIHBhdGhuYW1lKSB7XG4gIHZhciBrZXlzID0gW107XG4gIHZhciByZWdleHAgPSBSZWdleHAocGF0aCwga2V5cyk7XG4gIHZhciBtID0gcmVnZXhwLmV4ZWMocGF0aG5hbWUpO1xuXG4gIGlmICghbSkgcmV0dXJuIGZhbHNlO1xuICBlbHNlIGlmICghcGFyYW1zKSByZXR1cm4gdHJ1ZTtcblxuICBmb3IgKHZhciBpID0gMSwgbGVuID0gbS5sZW5ndGg7IGkgPCBsZW47ICsraSkge1xuICAgIHZhciBrZXkgPSBrZXlzW2kgLSAxXTtcbiAgICB2YXIgdmFsID0gJ3N0cmluZycgPT0gdHlwZW9mIG1baV0gPyBkZWNvZGVVUklDb21wb25lbnQobVtpXSkgOiBtW2ldO1xuICAgIGlmIChrZXkpIHBhcmFtc1trZXkubmFtZV0gPSB2YWw7XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn1cbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBNb2R1bGUgRGVwZW5kZW5jaWVzXG4gKi9cblxudmFyIGlzX3BsYWluX29iamVjdCA9IHJlcXVpcmUoJ2lzb2JqJylcbnZhciBhc3NpZ24gPSByZXF1aXJlKCdvYmplY3QtYXNzaWduJylcbnZhciBmcmVlemUgPSByZXF1aXJlKCcuL2ZyZWV6ZScpXG52YXIgc2xpY2VkID0gcmVxdWlyZSgnc2xpY2VkJylcbnZhciBpc19hcnJheSA9IEFycmF5LmlzQXJyYXlcbnZhciBrZXlzID0gT2JqZWN0LmtleXNcblxuLyoqXG4gKiBFeHBvcnQgYHVwZGF0ZWBcbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IHVwZGF0ZVxuXG4vKipcbiAqIFVwZGF0ZSB0aGUgb2JqZWN0IG9yIGFycmF5XG4gKlxuICogQHBhcmFtIHtNaXhlZH0gb3JpZ2luYWxcbiAqIEBwYXJhbSB7TWl4ZWQsIC4uLn0gdXBkYXRlc1xuICogQHJldHVybiB7TWl4ZWR9XG4gKi9cblxuZnVuY3Rpb24gdXBkYXRlIChvcmlnaW5hbCwgdXBkYXRlKSB7XG4gIHVwZGF0ZSA9IHNsaWNlZChhcmd1bWVudHMsIDIpLnJlZHVjZShmdW5jdGlvbiAobywgbikgeyByZXR1cm4gcmVzb2x2ZShvLCBuLCB0cnVlKSB9LCB1cGRhdGUpXG4gIHJldHVybiBmcmVlemUocmVzb2x2ZShvcmlnaW5hbCwgdXBkYXRlKSlcbn1cblxuLyoqXG4gKiBSZXNvbHZlIHRoZSB1cGRhdGVzXG4gKlxuICogQHBhcmFtIHtNaXhlZH0gb3JpZ2luYWxcbiAqIEBwYXJhbSB7QXJyYXl9IHVwZGF0ZXNcbiAqL1xuXG5mdW5jdGlvbiByZXNvbHZlIChvcmlnaW5hbCwgdXBkYXRlcywga2VlcF9udWxsKSB7XG4gIHJldHVybiBpc19wbGFpbl9vYmplY3Qob3JpZ2luYWwpICYmIGlzX3BsYWluX29iamVjdCh1cGRhdGVzKVxuICAgID8gb2JqZWN0KG9yaWdpbmFsLCB1cGRhdGVzLCBrZWVwX251bGwpXG4gICAgOiBpc19hcnJheShvcmlnaW5hbCkgJiYgaXNfYXJyYXkodXBkYXRlcylcbiAgICA/IGFycmF5KG9yaWdpbmFsLCB1cGRhdGVzKVxuICAgIDogdXBkYXRlcyA9PT0gdW5kZWZpbmVkID8gb3JpZ2luYWwgOiB1cGRhdGVzXG59XG5cbi8qKlxuICogVXBkYXRlIG9iamVjdHNcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb3JpZ2luYWxcbiAqIEBwYXJhbSB7QXJyYXl9IHVwZGF0ZXNcbiAqIEByZXR1cm4ge0FycmF5fVxuICovXG5cbmZ1bmN0aW9uIG9iamVjdCAob3JpZ2luYWwsIHVwZGF0ZXMsIGtlZXBfbnVsbCkge1xuICByZXR1cm4ga2V5cyh1cGRhdGVzKS5yZWR1Y2UoZnVuY3Rpb24gKG9iaiwga2V5LCBpKSB7XG4gICAgaWYgKCFrZWVwX251bGwgJiYgdXBkYXRlc1trZXldID09PSBudWxsKSB7XG4gICAgICBkZWxldGUgb2JqW2tleV1cbiAgICB9IGVsc2Uge1xuICAgICAgb2JqW2tleV0gPSByZXNvbHZlKG9yaWdpbmFsW2tleV0sIHVwZGF0ZXNba2V5XSlcbiAgICB9XG5cbiAgICByZXR1cm4gb2JqXG4gIH0sIGFzc2lnbih7fSwgb3JpZ2luYWwpKVxufVxuXG4vKipcbiAqIFVwZGF0ZSBhcnJheXNcbiAqXG4gKiBAcGFyYW0ge0FycmF5fSBvcmlnaW5hbFxuICogQHBhcmFtIHtBcnJheX0gdXBkYXRlc1xuICogQHJldHVybiB7QXJyYXl9XG4gKi9cblxuZnVuY3Rpb24gYXJyYXkgKG9yaWdpbmFsLCB1cGRhdGVzKSB7XG4gIHJldHVybiBbXS5jb25jYXQodXBkYXRlcylcbn1cblxuXG4vLyB2YXIgZnJ1aXRzID0gWydhcHBsZXMnLCAnb3JhbmdlcycsICdwZWFycyddXG4vLyB2YXIgb2JqID0ge1xuLy8gICBuYW1lOiAnbWF0dCcsXG4vLyAgIGFnZTogMjYsXG4vLyAgIHNldHRpbmdzOiB7XG4vLyAgICAgdGhlbWU6ICdyZWQnLFxuLy8gICAgIHR6OiAnQW1lcmljYS9Mb3MgQW5nZWxlcydcbi8vICAgfSxcbi8vICAgZnJ1aXRzOiBmcnVpdHNcbi8vIH1cblxuLy8gdmFyIGEgPSB7XG4vLyAgIHBlc2t5OiAnY2hhbmdlJ1xuLy8gfVxuXG4vLyB2YXIgb3V0ID0gdXBkYXRlKG9iaiwge1xuLy8gICBuYW1lOiAnbWF0dCcsXG4vLyAgIHNldHRpbmdzOiB7XG4vLyAgICAgdHo6ICdBbWVyaWNhL0NoaWNhZ28nXG4vLyAgIH1cbi8vIH0sIHtcbi8vICAgc2V0dGluZ3M6IFthXSxcbi8vIH0pXG5cbi8vIGEucGVza3kgPSAnbG9sLi4uJ1xuLy8gZnJ1aXRzLnB1c2goJ2Fwcmljb3RzJylcbi8vIGNvbnNvbGUubG9nKG91dClcblxuLy8gdmFyIGZydWl0cyA9IFsnYScsICdiJywgJ2MnXVxuLy8gY29uc29sZS5sb2codXBkYXRlKGZydWl0cywgJ2QnKSlcbi8vIGZydWl0cy5wdXNoKCdkJylcbiIsIihmdW5jdGlvbiAocHJvY2Vzcyl7XG4vKipcbiAqIE1vZHVsZSBkZXBlbmRlbmNpZXNcbiAqL1xuXG52YXIgU3RhY2sgPSByZXF1aXJlKCdzdGFjay11dGlscycpXG5cbi8qKlxuICogRXhwb3J0IGBlcnJvcmBcbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGVycm9yXG5cbi8qKlxuICogQ2xlYW4gdXAgb3IgY29tYmluZSBlcnJvcnNcbiAqXG4gKiBAcGFyYW0ge0Vycm9yfEFycmF5fSBlcnJvcnNcbiAqIEByZXR1cm4ge0Vycm9yfVxuICovXG5cbmZ1bmN0aW9uIGVycm9yIChlcnJvcnMpIHtcbiAgZXJyb3JzID0gQXJyYXkuaXNBcnJheShlcnJvcnMpID8gZXJyb3JzIDogW2Vycm9yc11cbiAgcmV0dXJuIGNvbWJpbmUoZXJyb3JzKVxufVxuXG4vKipcbiAqIEluaXRpYWxpemUgYGNvbWJpbmVgXG4gKi9cblxuZnVuY3Rpb24gY29tYmluZSAoZXJyb3JzKSB7XG4gIGlmIChlcnJvcnMubGVuZ3RoID09PSAxKSByZXR1cm4gaW1wcm92ZShlcnJvcnNbMF0pXG5cbiAgZXJyb3JzID0gZXJyb3JzLm1hcChmdW5jdGlvbihlcnJvciwgaSkge1xuICAgIHJldHVybiBpbXByb3ZlKGVycm9yKVxuICB9KVxuXG4gIHZhciBtZXNzYWdlID0gZXJyb3JzLm1hcChmdW5jdGlvbiAoZXJyb3IpIHtcbiAgICByZXR1cm4gZXJyb3IubWVzc2FnZVxuICB9KS5qb2luKCdcXG5cXG4nKVxuXG4gIHZhciBzdGFjayA9IGVycm9ycy5tYXAoZnVuY3Rpb24gKGVycm9yKSB7XG4gICAgcmV0dXJuIGVycm9yLnN0YWNrXG4gIH0pLmpvaW4oJycpXG5cbiAgdmFyIGVycm9yID0gbmV3IEVycm9yKClcbiAgZXJyb3IubWVzc2FnZSA9IG1lc3NhZ2VcbiAgZXJyb3Iuc3RhY2sgPSBzdGFja1xuICBlcnJvci5jYW5keSA9IHRydWVcblxuICByZXR1cm4gZXJyb3Jcbn1cblxuLyoqXG4gKiBJbXByb3ZlIHRoZSBlcnJvclxuICpcbiAqIEBwYXJhbSB7RXJyb3J9IGVyclxuICogQHJldHVybiB7RXJyb3J9XG4gKi9cblxuZnVuY3Rpb24gaW1wcm92ZSAoZXJyLCBwcmVmaXgpIHtcbiAgaWYgKGVyci5jYW5keSkgcmV0dXJuIGVyclxuXG4gIHByZWZpeCA9IHByZWZpeCB8fCAnICBcXHUyNzE2ICdcblxuICAvLyBjbGVhbiB0aGUgc3RhY2tcbiAgdmFyIHN0YWNrID0gY2xlYW4oZXJyLnN0YWNrKVxuXG4gIC8vIGNyZWF0ZSBhIG5ldyBlcnJvclxuICB2YXIgZXJyb3IgPSBuZXcgRXJyb3IoKVxuICBlcnJvci5jYW5keSA9IHRydWVcblxuICAvLyBpbXByb3ZlIHRoZSBtZXNzYWdlXG4gIHZhciBtZXNzYWdlID0gbm9ybWFsaXplKGVycilcbiAgZXJyb3IubWVzc2FnZSA9IHByZWZpeCArIG1lc3NhZ2VcblxuICAvLyBpbXByb3ZlIHRoZSBzdGFja1xuICBlcnJvci5zdGFjayA9IHN0YWNrXG4gICAgPyBwcmVmaXggKyBtZXNzYWdlICsgJ1xcblxcbicgKyBzdGFjayArICdcXG5cXG4nXG4gICAgOiBwcmVmaXggKyBtZXNzYWdlICsgJ1xcblxcbidcblxuICByZXR1cm4gZXJyb3Jcbn1cblxuLyoqXG4gKiBOb3JtYWxpemUgdGhlIG1lc3NhZ2VcbiAqXG4gKiBAcGFyYW0ge0Vycm9yfSBlcnJcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqL1xuXG5mdW5jdGlvbiBub3JtYWxpemUgKGVycikge1xuICBpZiAoZXJyLmNvZGVGcmFtZSkgeyAvLyBiYWJlbGlmeUA2LnhcbiAgICByZXR1cm4gW2Vyci5tZXNzYWdlLCBpbmRlbnQoZXJyLmNvZGVGcmFtZSwgNCldLmpvaW4oJ1xcblxcbicpXG4gIH0gZWxzZSB7IC8vIGJhYmVsaWZ5QDUueCBhbmQgYnJvd3NlcmlmeVxuICAgIHJldHVybiBlcnIuYW5ub3RhdGVkIHx8IGVyci5tZXNzYWdlXG4gIH1cbn1cblxuLyoqXG4gKiBDbGVhbiB0aGUgc3RhY2sgdHJhY2VzXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0YWNrXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKi9cblxuZnVuY3Rpb24gY2xlYW4gKHN0YWNrKSB7XG4gIHJldHVybiBuZXcgU3RhY2soe1xuICAgIGludGVybmFsczogU3RhY2subm9kZUludGVybmFscygpLmNvbmNhdCgvXFxiXFwvbm9kZV9tb2R1bGVzXFwvYmFiZWwtY29yZVxcYi8pLFxuICAgIGN3ZDogcHJvY2Vzcy5jd2QoKVxuICB9KVxuICAuY2xlYW4oc3RhY2spXG4gIC5zcGxpdCgnXFxuJylcbiAgLmZpbHRlcihmdW5jdGlvbiAobGluZSkgeyByZXR1cm4gbGluZSB9KVxuICAubWFwKGZ1bmN0aW9uIChsaW5lKSB7IHJldHVybiAnICAgIFxcdTI1QjggJyArIGxpbmUgfSlcbiAgLmpvaW4oJ1xcbicpXG59XG5cbi8qKlxuICogSW5kZW50IGEgYml0XG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHJldHVybiB7U3RyaW5nfVxuICovXG5cbmZ1bmN0aW9uIGluZGVudChzdHIsIG4pIHtcbiAgcmV0dXJuIHN0clxuICAgIC5zcGxpdCgnXFxuJylcbiAgICAubWFwKGZ1bmN0aW9uIChsaW5lKSB7IHJldHVybiByZXBlYXQoJyAnLCBuKSArIGxpbmUgfSlcbiAgICAuam9pbignXFxuJylcbn1cblxuLyoqXG4gKiBSZXBlYXQgYSBzdHJpbmcgYSBuIHRpbWVzXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHBhcmFtIHtOdW1iZXJ9IG5cbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqL1xuXG5mdW5jdGlvbiByZXBlYXQgKHN0ciwgbikge1xuICByZXR1cm4gbmV3IEFycmF5KG4gKyAxKS5qb2luKHN0cilcbn1cblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCIuLi8uLi8uLi8uLi8uLi9tYWtvLWpzL25vZGVfbW9kdWxlcy9wcm9jZXNzL2Jyb3dzZXIuanNcIikpIiwiLyoqXG4gKiBNb2R1bGUgRGVwZW5kZW5jaWVzXG4gKi9cblxudmFyIHByZWFjdCA9IHJlcXVpcmUoJ3ByZWFjdCcpXG52YXIgY3ljbGUgPSByZXF1aXJlKCcuL2N5Y2xlJylcbnZhciBSZW5kZXIgPSBwcmVhY3QucmVuZGVyXG52YXIgaCA9IHByZWFjdC5oXG5cbi8qKlxuICogRXhwb3J0IGByZW5kZXJgXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSByZW5kZXJcbnJlbmRlci5yZW5kZXIgPSByZW5kZXJcbnJlbmRlci5oID0gaFxuXG4vKipcbiAqIFJlbmRlclxuICpcbiAqIEBwYXJhbSB7UmVuZGVyYWJsZX0gUmVuZGVyYWJsZVxuICogQHBhcmFtIHtTdG9yZX0gZGF0YVxuICogQHBhcmFtIHtPYmplY3R9IHBhcmVudFxuICogQHJldHVybiB7T2JqZWN0fVxuICovXG5cbmZ1bmN0aW9uIHJlbmRlciAoUmVuZGVyYWJsZSwgZGF0YSwgcGFyZW50KSB7XG4gIHZhciByZW5kZXJlciA9IFJlbmRlcmVyKFJlbmRlcmFibGUsIHBhcmVudClcbiAgcmV0dXJuIGN5Y2xlKHJlbmRlcmVyLCBkYXRhKVxufVxuXG4vKipcbiAqIFJlbmRlcmVyXG4gKlxuICogQHBhcmFtIHtSZW5kZXJhYmxlfSBSZW5kZXJhYmxlXG4gKiBAcGFyYW0ge09iamVjdH0gcGFyZW50XG4gKi9cblxuZnVuY3Rpb24gUmVuZGVyZXIgKFJlbmRlcmFibGUsIHBhcmVudCkge1xuICB2YXIgcm9vdCA9IG51bGxcblxuICByZXR1cm4gZnVuY3Rpb24gcmVuZGVyIChwcm9wcykge1xuICAgIHJvb3QgPSBSZW5kZXIoaChSZW5kZXJhYmxlLCBwcm9wcyksIHBhcmVudCwgcm9vdClcbiAgfVxufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuZXhwb3J0cy5BY3Rpb25UeXBlcyA9IHVuZGVmaW5lZDtcbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gY3JlYXRlU3RvcmU7XG5cbnZhciBfaXNQbGFpbk9iamVjdCA9IHJlcXVpcmUoJ2xvZGFzaC9pc1BsYWluT2JqZWN0Jyk7XG5cbnZhciBfaXNQbGFpbk9iamVjdDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9pc1BsYWluT2JqZWN0KTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgXCJkZWZhdWx0XCI6IG9iaiB9OyB9XG5cbi8qKlxuICogVGhlc2UgYXJlIHByaXZhdGUgYWN0aW9uIHR5cGVzIHJlc2VydmVkIGJ5IFJlZHV4LlxuICogRm9yIGFueSB1bmtub3duIGFjdGlvbnMsIHlvdSBtdXN0IHJldHVybiB0aGUgY3VycmVudCBzdGF0ZS5cbiAqIElmIHRoZSBjdXJyZW50IHN0YXRlIGlzIHVuZGVmaW5lZCwgeW91IG11c3QgcmV0dXJuIHRoZSBpbml0aWFsIHN0YXRlLlxuICogRG8gbm90IHJlZmVyZW5jZSB0aGVzZSBhY3Rpb24gdHlwZXMgZGlyZWN0bHkgaW4geW91ciBjb2RlLlxuICovXG52YXIgQWN0aW9uVHlwZXMgPSBleHBvcnRzLkFjdGlvblR5cGVzID0ge1xuICBJTklUOiAnQEByZWR1eC9JTklUJ1xufTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgUmVkdXggc3RvcmUgdGhhdCBob2xkcyB0aGUgc3RhdGUgdHJlZS5cbiAqIFRoZSBvbmx5IHdheSB0byBjaGFuZ2UgdGhlIGRhdGEgaW4gdGhlIHN0b3JlIGlzIHRvIGNhbGwgYGRpc3BhdGNoKClgIG9uIGl0LlxuICpcbiAqIFRoZXJlIHNob3VsZCBvbmx5IGJlIGEgc2luZ2xlIHN0b3JlIGluIHlvdXIgYXBwLiBUbyBzcGVjaWZ5IGhvdyBkaWZmZXJlbnRcbiAqIHBhcnRzIG9mIHRoZSBzdGF0ZSB0cmVlIHJlc3BvbmQgdG8gYWN0aW9ucywgeW91IG1heSBjb21iaW5lIHNldmVyYWwgcmVkdWNlcnNcbiAqIGludG8gYSBzaW5nbGUgcmVkdWNlciBmdW5jdGlvbiBieSB1c2luZyBgY29tYmluZVJlZHVjZXJzYC5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSByZWR1Y2VyIEEgZnVuY3Rpb24gdGhhdCByZXR1cm5zIHRoZSBuZXh0IHN0YXRlIHRyZWUsIGdpdmVuXG4gKiB0aGUgY3VycmVudCBzdGF0ZSB0cmVlIGFuZCB0aGUgYWN0aW9uIHRvIGhhbmRsZS5cbiAqXG4gKiBAcGFyYW0ge2FueX0gW2luaXRpYWxTdGF0ZV0gVGhlIGluaXRpYWwgc3RhdGUuIFlvdSBtYXkgb3B0aW9uYWxseSBzcGVjaWZ5IGl0XG4gKiB0byBoeWRyYXRlIHRoZSBzdGF0ZSBmcm9tIHRoZSBzZXJ2ZXIgaW4gdW5pdmVyc2FsIGFwcHMsIG9yIHRvIHJlc3RvcmUgYVxuICogcHJldmlvdXNseSBzZXJpYWxpemVkIHVzZXIgc2Vzc2lvbi5cbiAqIElmIHlvdSB1c2UgYGNvbWJpbmVSZWR1Y2Vyc2AgdG8gcHJvZHVjZSB0aGUgcm9vdCByZWR1Y2VyIGZ1bmN0aW9uLCB0aGlzIG11c3QgYmVcbiAqIGFuIG9iamVjdCB3aXRoIHRoZSBzYW1lIHNoYXBlIGFzIGBjb21iaW5lUmVkdWNlcnNgIGtleXMuXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZW5oYW5jZXIgVGhlIHN0b3JlIGVuaGFuY2VyLiBZb3UgbWF5IG9wdGlvbmFsbHkgc3BlY2lmeSBpdFxuICogdG8gZW5oYW5jZSB0aGUgc3RvcmUgd2l0aCB0aGlyZC1wYXJ0eSBjYXBhYmlsaXRpZXMgc3VjaCBhcyBtaWRkbGV3YXJlLFxuICogdGltZSB0cmF2ZWwsIHBlcnNpc3RlbmNlLCBldGMuIFRoZSBvbmx5IHN0b3JlIGVuaGFuY2VyIHRoYXQgc2hpcHMgd2l0aCBSZWR1eFxuICogaXMgYGFwcGx5TWlkZGxld2FyZSgpYC5cbiAqXG4gKiBAcmV0dXJucyB7U3RvcmV9IEEgUmVkdXggc3RvcmUgdGhhdCBsZXRzIHlvdSByZWFkIHRoZSBzdGF0ZSwgZGlzcGF0Y2ggYWN0aW9uc1xuICogYW5kIHN1YnNjcmliZSB0byBjaGFuZ2VzLlxuICovXG5mdW5jdGlvbiBjcmVhdGVTdG9yZShyZWR1Y2VyLCBpbml0aWFsU3RhdGUsIGVuaGFuY2VyKSB7XG4gIGlmICh0eXBlb2YgaW5pdGlhbFN0YXRlID09PSAnZnVuY3Rpb24nICYmIHR5cGVvZiBlbmhhbmNlciA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBlbmhhbmNlciA9IGluaXRpYWxTdGF0ZTtcbiAgICBpbml0aWFsU3RhdGUgPSB1bmRlZmluZWQ7XG4gIH1cblxuICBpZiAodHlwZW9mIGVuaGFuY2VyICE9PSAndW5kZWZpbmVkJykge1xuICAgIGlmICh0eXBlb2YgZW5oYW5jZXIgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignRXhwZWN0ZWQgdGhlIGVuaGFuY2VyIHRvIGJlIGEgZnVuY3Rpb24uJyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGVuaGFuY2VyKGNyZWF0ZVN0b3JlKShyZWR1Y2VyLCBpbml0aWFsU3RhdGUpO1xuICB9XG5cbiAgaWYgKHR5cGVvZiByZWR1Y2VyICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdFeHBlY3RlZCB0aGUgcmVkdWNlciB0byBiZSBhIGZ1bmN0aW9uLicpO1xuICB9XG5cbiAgdmFyIGN1cnJlbnRSZWR1Y2VyID0gcmVkdWNlcjtcbiAgdmFyIGN1cnJlbnRTdGF0ZSA9IGluaXRpYWxTdGF0ZTtcbiAgdmFyIGN1cnJlbnRMaXN0ZW5lcnMgPSBbXTtcbiAgdmFyIG5leHRMaXN0ZW5lcnMgPSBjdXJyZW50TGlzdGVuZXJzO1xuICB2YXIgaXNEaXNwYXRjaGluZyA9IGZhbHNlO1xuXG4gIGZ1bmN0aW9uIGVuc3VyZUNhbk11dGF0ZU5leHRMaXN0ZW5lcnMoKSB7XG4gICAgaWYgKG5leHRMaXN0ZW5lcnMgPT09IGN1cnJlbnRMaXN0ZW5lcnMpIHtcbiAgICAgIG5leHRMaXN0ZW5lcnMgPSBjdXJyZW50TGlzdGVuZXJzLnNsaWNlKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJlYWRzIHRoZSBzdGF0ZSB0cmVlIG1hbmFnZWQgYnkgdGhlIHN0b3JlLlxuICAgKlxuICAgKiBAcmV0dXJucyB7YW55fSBUaGUgY3VycmVudCBzdGF0ZSB0cmVlIG9mIHlvdXIgYXBwbGljYXRpb24uXG4gICAqL1xuICBmdW5jdGlvbiBnZXRTdGF0ZSgpIHtcbiAgICByZXR1cm4gY3VycmVudFN0YXRlO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZHMgYSBjaGFuZ2UgbGlzdGVuZXIuIEl0IHdpbGwgYmUgY2FsbGVkIGFueSB0aW1lIGFuIGFjdGlvbiBpcyBkaXNwYXRjaGVkLFxuICAgKiBhbmQgc29tZSBwYXJ0IG9mIHRoZSBzdGF0ZSB0cmVlIG1heSBwb3RlbnRpYWxseSBoYXZlIGNoYW5nZWQuIFlvdSBtYXkgdGhlblxuICAgKiBjYWxsIGBnZXRTdGF0ZSgpYCB0byByZWFkIHRoZSBjdXJyZW50IHN0YXRlIHRyZWUgaW5zaWRlIHRoZSBjYWxsYmFjay5cbiAgICpcbiAgICogWW91IG1heSBjYWxsIGBkaXNwYXRjaCgpYCBmcm9tIGEgY2hhbmdlIGxpc3RlbmVyLCB3aXRoIHRoZSBmb2xsb3dpbmdcbiAgICogY2F2ZWF0czpcbiAgICpcbiAgICogMS4gVGhlIHN1YnNjcmlwdGlvbnMgYXJlIHNuYXBzaG90dGVkIGp1c3QgYmVmb3JlIGV2ZXJ5IGBkaXNwYXRjaCgpYCBjYWxsLlxuICAgKiBJZiB5b3Ugc3Vic2NyaWJlIG9yIHVuc3Vic2NyaWJlIHdoaWxlIHRoZSBsaXN0ZW5lcnMgYXJlIGJlaW5nIGludm9rZWQsIHRoaXNcbiAgICogd2lsbCBub3QgaGF2ZSBhbnkgZWZmZWN0IG9uIHRoZSBgZGlzcGF0Y2goKWAgdGhhdCBpcyBjdXJyZW50bHkgaW4gcHJvZ3Jlc3MuXG4gICAqIEhvd2V2ZXIsIHRoZSBuZXh0IGBkaXNwYXRjaCgpYCBjYWxsLCB3aGV0aGVyIG5lc3RlZCBvciBub3QsIHdpbGwgdXNlIGEgbW9yZVxuICAgKiByZWNlbnQgc25hcHNob3Qgb2YgdGhlIHN1YnNjcmlwdGlvbiBsaXN0LlxuICAgKlxuICAgKiAyLiBUaGUgbGlzdGVuZXIgc2hvdWxkIG5vdCBleHBlY3QgdG8gc2VlIGFsbCBzdGF0ZXMgY2hhbmdlcywgYXMgdGhlIHN0YXRlXG4gICAqIG1pZ2h0IGhhdmUgYmVlbiB1cGRhdGVkIG11bHRpcGxlIHRpbWVzIGR1cmluZyBhIG5lc3RlZCBgZGlzcGF0Y2goKWAgYmVmb3JlXG4gICAqIHRoZSBsaXN0ZW5lciBpcyBjYWxsZWQuIEl0IGlzLCBob3dldmVyLCBndWFyYW50ZWVkIHRoYXQgYWxsIHN1YnNjcmliZXJzXG4gICAqIHJlZ2lzdGVyZWQgYmVmb3JlIHRoZSBgZGlzcGF0Y2goKWAgc3RhcnRlZCB3aWxsIGJlIGNhbGxlZCB3aXRoIHRoZSBsYXRlc3RcbiAgICogc3RhdGUgYnkgdGhlIHRpbWUgaXQgZXhpdHMuXG4gICAqXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGxpc3RlbmVyIEEgY2FsbGJhY2sgdG8gYmUgaW52b2tlZCBvbiBldmVyeSBkaXNwYXRjaC5cbiAgICogQHJldHVybnMge0Z1bmN0aW9ufSBBIGZ1bmN0aW9uIHRvIHJlbW92ZSB0aGlzIGNoYW5nZSBsaXN0ZW5lci5cbiAgICovXG4gIGZ1bmN0aW9uIHN1YnNjcmliZShsaXN0ZW5lcikge1xuICAgIGlmICh0eXBlb2YgbGlzdGVuZXIgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignRXhwZWN0ZWQgbGlzdGVuZXIgdG8gYmUgYSBmdW5jdGlvbi4nKTtcbiAgICB9XG5cbiAgICB2YXIgaXNTdWJzY3JpYmVkID0gdHJ1ZTtcblxuICAgIGVuc3VyZUNhbk11dGF0ZU5leHRMaXN0ZW5lcnMoKTtcbiAgICBuZXh0TGlzdGVuZXJzLnB1c2gobGlzdGVuZXIpO1xuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIHVuc3Vic2NyaWJlKCkge1xuICAgICAgaWYgKCFpc1N1YnNjcmliZWQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpc1N1YnNjcmliZWQgPSBmYWxzZTtcblxuICAgICAgZW5zdXJlQ2FuTXV0YXRlTmV4dExpc3RlbmVycygpO1xuICAgICAgdmFyIGluZGV4ID0gbmV4dExpc3RlbmVycy5pbmRleE9mKGxpc3RlbmVyKTtcbiAgICAgIG5leHRMaXN0ZW5lcnMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIERpc3BhdGNoZXMgYW4gYWN0aW9uLiBJdCBpcyB0aGUgb25seSB3YXkgdG8gdHJpZ2dlciBhIHN0YXRlIGNoYW5nZS5cbiAgICpcbiAgICogVGhlIGByZWR1Y2VyYCBmdW5jdGlvbiwgdXNlZCB0byBjcmVhdGUgdGhlIHN0b3JlLCB3aWxsIGJlIGNhbGxlZCB3aXRoIHRoZVxuICAgKiBjdXJyZW50IHN0YXRlIHRyZWUgYW5kIHRoZSBnaXZlbiBgYWN0aW9uYC4gSXRzIHJldHVybiB2YWx1ZSB3aWxsXG4gICAqIGJlIGNvbnNpZGVyZWQgdGhlICoqbmV4dCoqIHN0YXRlIG9mIHRoZSB0cmVlLCBhbmQgdGhlIGNoYW5nZSBsaXN0ZW5lcnNcbiAgICogd2lsbCBiZSBub3RpZmllZC5cbiAgICpcbiAgICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb25seSBzdXBwb3J0cyBwbGFpbiBvYmplY3QgYWN0aW9ucy4gSWYgeW91IHdhbnQgdG9cbiAgICogZGlzcGF0Y2ggYSBQcm9taXNlLCBhbiBPYnNlcnZhYmxlLCBhIHRodW5rLCBvciBzb21ldGhpbmcgZWxzZSwgeW91IG5lZWQgdG9cbiAgICogd3JhcCB5b3VyIHN0b3JlIGNyZWF0aW5nIGZ1bmN0aW9uIGludG8gdGhlIGNvcnJlc3BvbmRpbmcgbWlkZGxld2FyZS4gRm9yXG4gICAqIGV4YW1wbGUsIHNlZSB0aGUgZG9jdW1lbnRhdGlvbiBmb3IgdGhlIGByZWR1eC10aHVua2AgcGFja2FnZS4gRXZlbiB0aGVcbiAgICogbWlkZGxld2FyZSB3aWxsIGV2ZW50dWFsbHkgZGlzcGF0Y2ggcGxhaW4gb2JqZWN0IGFjdGlvbnMgdXNpbmcgdGhpcyBtZXRob2QuXG4gICAqXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBhY3Rpb24gQSBwbGFpbiBvYmplY3QgcmVwcmVzZW50aW5nIOKAnHdoYXQgY2hhbmdlZOKAnS4gSXQgaXNcbiAgICogYSBnb29kIGlkZWEgdG8ga2VlcCBhY3Rpb25zIHNlcmlhbGl6YWJsZSBzbyB5b3UgY2FuIHJlY29yZCBhbmQgcmVwbGF5IHVzZXJcbiAgICogc2Vzc2lvbnMsIG9yIHVzZSB0aGUgdGltZSB0cmF2ZWxsaW5nIGByZWR1eC1kZXZ0b29sc2AuIEFuIGFjdGlvbiBtdXN0IGhhdmVcbiAgICogYSBgdHlwZWAgcHJvcGVydHkgd2hpY2ggbWF5IG5vdCBiZSBgdW5kZWZpbmVkYC4gSXQgaXMgYSBnb29kIGlkZWEgdG8gdXNlXG4gICAqIHN0cmluZyBjb25zdGFudHMgZm9yIGFjdGlvbiB0eXBlcy5cbiAgICpcbiAgICogQHJldHVybnMge09iamVjdH0gRm9yIGNvbnZlbmllbmNlLCB0aGUgc2FtZSBhY3Rpb24gb2JqZWN0IHlvdSBkaXNwYXRjaGVkLlxuICAgKlxuICAgKiBOb3RlIHRoYXQsIGlmIHlvdSB1c2UgYSBjdXN0b20gbWlkZGxld2FyZSwgaXQgbWF5IHdyYXAgYGRpc3BhdGNoKClgIHRvXG4gICAqIHJldHVybiBzb21ldGhpbmcgZWxzZSAoZm9yIGV4YW1wbGUsIGEgUHJvbWlzZSB5b3UgY2FuIGF3YWl0KS5cbiAgICovXG4gIGZ1bmN0aW9uIGRpc3BhdGNoKGFjdGlvbikge1xuICAgIGlmICghKDAsIF9pc1BsYWluT2JqZWN0MltcImRlZmF1bHRcIl0pKGFjdGlvbikpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignQWN0aW9ucyBtdXN0IGJlIHBsYWluIG9iamVjdHMuICcgKyAnVXNlIGN1c3RvbSBtaWRkbGV3YXJlIGZvciBhc3luYyBhY3Rpb25zLicpO1xuICAgIH1cblxuICAgIGlmICh0eXBlb2YgYWN0aW9uLnR5cGUgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0FjdGlvbnMgbWF5IG5vdCBoYXZlIGFuIHVuZGVmaW5lZCBcInR5cGVcIiBwcm9wZXJ0eS4gJyArICdIYXZlIHlvdSBtaXNzcGVsbGVkIGEgY29uc3RhbnQ/Jyk7XG4gICAgfVxuXG4gICAgaWYgKGlzRGlzcGF0Y2hpbmcpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignUmVkdWNlcnMgbWF5IG5vdCBkaXNwYXRjaCBhY3Rpb25zLicpO1xuICAgIH1cblxuICAgIHRyeSB7XG4gICAgICBpc0Rpc3BhdGNoaW5nID0gdHJ1ZTtcbiAgICAgIGN1cnJlbnRTdGF0ZSA9IGN1cnJlbnRSZWR1Y2VyKGN1cnJlbnRTdGF0ZSwgYWN0aW9uKTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgaXNEaXNwYXRjaGluZyA9IGZhbHNlO1xuICAgIH1cblxuICAgIHZhciBsaXN0ZW5lcnMgPSBjdXJyZW50TGlzdGVuZXJzID0gbmV4dExpc3RlbmVycztcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxpc3RlbmVycy5sZW5ndGg7IGkrKykge1xuICAgICAgbGlzdGVuZXJzW2ldKCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGFjdGlvbjtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXBsYWNlcyB0aGUgcmVkdWNlciBjdXJyZW50bHkgdXNlZCBieSB0aGUgc3RvcmUgdG8gY2FsY3VsYXRlIHRoZSBzdGF0ZS5cbiAgICpcbiAgICogWW91IG1pZ2h0IG5lZWQgdGhpcyBpZiB5b3VyIGFwcCBpbXBsZW1lbnRzIGNvZGUgc3BsaXR0aW5nIGFuZCB5b3Ugd2FudCB0b1xuICAgKiBsb2FkIHNvbWUgb2YgdGhlIHJlZHVjZXJzIGR5bmFtaWNhbGx5LiBZb3UgbWlnaHQgYWxzbyBuZWVkIHRoaXMgaWYgeW91XG4gICAqIGltcGxlbWVudCBhIGhvdCByZWxvYWRpbmcgbWVjaGFuaXNtIGZvciBSZWR1eC5cbiAgICpcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gbmV4dFJlZHVjZXIgVGhlIHJlZHVjZXIgZm9yIHRoZSBzdG9yZSB0byB1c2UgaW5zdGVhZC5cbiAgICogQHJldHVybnMge3ZvaWR9XG4gICAqL1xuICBmdW5jdGlvbiByZXBsYWNlUmVkdWNlcihuZXh0UmVkdWNlcikge1xuICAgIGlmICh0eXBlb2YgbmV4dFJlZHVjZXIgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignRXhwZWN0ZWQgdGhlIG5leHRSZWR1Y2VyIHRvIGJlIGEgZnVuY3Rpb24uJyk7XG4gICAgfVxuXG4gICAgY3VycmVudFJlZHVjZXIgPSBuZXh0UmVkdWNlcjtcbiAgICBkaXNwYXRjaCh7IHR5cGU6IEFjdGlvblR5cGVzLklOSVQgfSk7XG4gIH1cblxuICAvLyBXaGVuIGEgc3RvcmUgaXMgY3JlYXRlZCwgYW4gXCJJTklUXCIgYWN0aW9uIGlzIGRpc3BhdGNoZWQgc28gdGhhdCBldmVyeVxuICAvLyByZWR1Y2VyIHJldHVybnMgdGhlaXIgaW5pdGlhbCBzdGF0ZS4gVGhpcyBlZmZlY3RpdmVseSBwb3B1bGF0ZXNcbiAgLy8gdGhlIGluaXRpYWwgc3RhdGUgdHJlZS5cbiAgZGlzcGF0Y2goeyB0eXBlOiBBY3Rpb25UeXBlcy5JTklUIH0pO1xuXG4gIHJldHVybiB7XG4gICAgZGlzcGF0Y2g6IGRpc3BhdGNoLFxuICAgIHN1YnNjcmliZTogc3Vic2NyaWJlLFxuICAgIGdldFN0YXRlOiBnZXRTdGF0ZSxcbiAgICByZXBsYWNlUmVkdWNlcjogcmVwbGFjZVJlZHVjZXJcbiAgfTtcbn0iLCIvKipcbiAqIE1vZHVsZXNcbiAqL1xuXG52YXIgY29tcG9zZVJlZHVjZXJzID0gcmVxdWlyZSgnQGYvY29tcG9zZS1yZWR1Y2VycycpXG52YXIgaXNVbmRlZmluZWQgPSByZXF1aXJlKCdAZi9pcy11bmRlZmluZWQnKVxuXG4vKipcbiAqIEV4cG9zZSBoYW5kbGVBY3Rpb25zXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBoYW5kbGVBY3Rpb25zWydkZWZhdWx0J10gPSBoYW5kbGVBY3Rpb25zXG5cbi8qKlxuICogaGFuZGxlQWN0aW9uc1xuICovXG5cbmZ1bmN0aW9uIGhhbmRsZUFjdGlvbnMgKG1hcCwgZGVmYXVsdFN0YXRlKSB7XG4gIHJldHVybiBjb21wb3NlUmVkdWNlcnMuYXBwbHkobnVsbCwgT2JqZWN0XG4gICAgLmtleXMobWFwKVxuICAgIC5tYXAoZnVuY3Rpb24gKHR5cGUpIHtcbiAgICAgIHJldHVybiBzY29wZVJlZHVjZXIodHlwZSwgbWFwW3R5cGVdLCBkZWZhdWx0U3RhdGUpXG4gICAgfSkpXG59XG5cbmZ1bmN0aW9uIHNjb3BlUmVkdWNlciAodHlwZSwgcmVkdWNlciwgZGVmYXVsdFN0YXRlKSB7XG4gIHJldHVybiBmdW5jdGlvbiAoc3RhdGUsIGFjdGlvbikge1xuICAgIHJldHVybiBhY3Rpb24udHlwZSA9PT0gdHlwZVxuICAgICAgPyByZWR1Y2VyKHN0YXRlLCBhY3Rpb24ucGF5bG9hZClcbiAgICAgIDogKGlzVW5kZWZpbmVkKHN0YXRlKSA/IGRlZmF1bHRTdGF0ZSA6IHN0YXRlKVxuICB9XG59XG4iLCIvKipcbiAqIE1vZHVsZXNcbiAqL1xuXG52YXIgaXNPYmplY3QgPSByZXF1aXJlKCdAZi9pcy1vYmplY3QnKVxudmFyIGlzQXJyYXkgPSByZXF1aXJlKCdAZi9pcy1hcnJheScpXG52YXIgZm9yRWFjaE9iaiA9IHJlcXVpcmUoJ0BmL2ZvcmVhY2gtb2JqJylcbnZhciBmb3JFYWNoQXJyID0gcmVxdWlyZSgnQGYvZm9yZWFjaC1hcnJheScpXG5cbi8qKlxuICogRXhwb3NlIGZvcmVhY2hcbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZvckVhY2hbJ2RlZmF1bHQnXSA9IGZvckVhY2hcblxuLyoqXG4gKiBGb3IgZWFjaFxuICogQHBhcmFtICB7RnVuY3Rpb259IGZuICBpdGVyYXRvclxuICogQHBhcmFtICB7T2JqZWN0fSAgIG9iaiBvYmplY3QgdG8gaXRlcmF0ZSBvdmVyXG4gKi9cblxuZnVuY3Rpb24gZm9yRWFjaCAoZm4sIGEpIHtcbiAgaWYgKGlzQXJyYXkoYSkpIHJldHVybiBmb3JFYWNoQXJyLmNhbGwodGhpcywgZm4sIGEpXG4gIGlmIChpc09iamVjdChhKSkgcmV0dXJuIGZvckVhY2hPYmouY2FsbCh0aGlzLCBmbiwgYSlcbn1cbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBUaW55IGhpc3RvcnkgbWlkZGxld2FyZVxuICpcbiAqIC0gaHR0cHM6Ly9naXRodWIuY29tL2NhbGx1bS9yZWR1eC1yb3V0aW5nL2Jsb2IvbWFzdGVyL3NyYy9IaXN0b3J5LmpzXG4gKlxuICogVE9ETzogc2VwYXJhdGUgbW9kdWxlLCBvbmNlIEknbSBzdXJlIGl0J3Mgc29saWRcbiAqL1xuXG52YXIgcXVlcnlzdHJpbmcgPSByZXF1aXJlKCdxdWVyeXN0cmluZycpO1xudmFyIHBhcnNlID0gcmVxdWlyZSgndXJsJykucGFyc2U7XG5cbi8qKlxuICogRXhwb3J0IGBtaWRkbGV3YXJlYFxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gbWlkZGxld2FyZVsnZGVmYXVsdCddID0gbWlkZGxld2FyZTtcblxuLyoqXG4gKiBtaWRkbGV3YXJlIG1pZGRsZXdhcmVcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICogQHJldHVybiB7RnVuY3Rpb259XG4gKi9cblxuZnVuY3Rpb24gbWlkZGxld2FyZShvcHRpb25zKSB7XG4gIHJldHVybiBmdW5jdGlvbiAoc3RvcmUpIHtcbiAgICB2YXIgaGlzdG9yeSA9IEhpc3Rvcnkoc3RvcmUpLmxpc3RlbigpO1xuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIChuZXh0KSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24gKGFjdGlvbikge1xuICAgICAgICBpZiAoYWN0aW9uLnR5cGUgIT09ICduYXZpZ2F0ZScpIHJldHVybiBuZXh0KGFjdGlvbik7XG4gICAgICAgIHZhciB1cmwgPSBwYXJzZShhY3Rpb24ucGF5bG9hZC51cmwpO1xuXG4gICAgICAgIHZhciBsb2NhdGlvbiA9IHtcbiAgICAgICAgICBoYXNoOiB1cmwuaGFzaCB8fCB1bmRlZmluZWQsXG4gICAgICAgICAgcGF0aG5hbWU6IHVybC5wYXRobmFtZSxcbiAgICAgICAgICBzZWFyY2g6IHVybC5zZWFyY2ggfHwgdW5kZWZpbmVkXG4gICAgICAgIH07XG5cbiAgICAgICAgdmFyIHF1ZXJ5ID0gdXJsLnF1ZXJ5ID8gcXMucGFyc2UodXJsLnF1ZXJ5KSA6IG51bGw7XG5cbiAgICAgICAgYWN0aW9uLnBheWxvYWQudXJsID0gdXJsLmZvcm1hdChsb2NhdGlvbik7XG4gICAgICAgIHZhciByZXN1bHQgPSBuZXh0KGFjdGlvbik7XG4gICAgICAgIGhpc3RvcnkudXBkYXRlKHJlc3VsdCk7XG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgIH07XG4gICAgfTtcbiAgfTtcbn1cblxuLyoqXG4gKiBIaXN0b3J5IGNsYXNzXG4gKi9cblxuZnVuY3Rpb24gSGlzdG9yeShzdG9yZSkge1xuICBpZiAoISh0aGlzIGluc3RhbmNlb2YgSGlzdG9yeSkpIHJldHVybiBuZXcgSGlzdG9yeShzdG9yZSk7XG4gIHRoaXMuc3RvcmUgPSBzdG9yZTtcbn1cblxuLyoqXG4gKiBsaXN0ZW5cbiAqL1xuXG5IaXN0b3J5LnByb3RvdHlwZS5saXN0ZW4gPSBmdW5jdGlvbiAoYWN0aW9uKSB7XG4gIHZhciBzZWxmID0gdGhpcztcbiAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3BvcHN0YXRlJywgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgc2VsZi5vbnBvcChldmVudC5zdGF0ZSk7XG4gIH0sIGZhbHNlKTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogdXBkYXRlXG4gKi9cblxuSGlzdG9yeS5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24gKGFjdGlvbikge1xuICB2YXIgdXJsID0gd2luZG93Lmhpc3Rvcnkuc3RhdGU7XG5cbiAgaWYgKGFjdGlvbi50eXBlID09PSAnbmF2aWdhdGUnKSB7XG4gICAgdXJsICYmIGFjdGlvbi5wYXlsb2FkLnVybCA9PT0gdXJsID8gdGhpcy5yZXBsYWNlKGFjdGlvbi5wYXlsb2FkLnVybCkgOiB0aGlzLnB1c2goYWN0aW9uLnBheWxvYWQudXJsKTtcbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBwdXNoXG4gKi9cblxuSGlzdG9yeS5wcm90b3R5cGUucHVzaCA9IGZ1bmN0aW9uICh1cmwpIHtcbiAgd2luZG93Lmhpc3RvcnkucHVzaFN0YXRlKHVybCwgbnVsbCwgdXJsKTtcbn07XG5cbi8qKlxuICogUmVwbGFjZVxuICovXG5cbkhpc3RvcnkucHJvdG90eXBlLnJlcGxhY2UgPSBmdW5jdGlvbiAodXJsKSB7XG4gIHdpbmRvdy5oaXN0b3J5LnJlcGxhY2VTdGF0ZSh1cmwsIG51bGwsIHVybCk7XG59O1xuXG4vKipcbiAqIG9ucG9wXG4gKi9cblxuSGlzdG9yeS5wcm90b3R5cGUub25wb3AgPSBmdW5jdGlvbiAodXJsKSB7XG4gIHRoaXMuc3RvcmUuZGlzcGF0Y2goeyB0eXBlOiAnbmF2aWdhdGUnLCBwYXlsb2FkOiB7IHVybDogdXJsIH0gfSk7XG59OyIsIi8qKlxuICogTW9kdWxlIERlcGVuZGVuY2llc1xuICovXG5cbnZhciBjb21wYWN0ID0gcmVxdWlyZSgnbG9kYXNoLmNvbXBhY3QnKVxudmFyIGVycm9yID0gcmVxdWlyZSgnZXJyLWNhbmR5JylcbnZhciB3cmFwcGVkID0gcmVxdWlyZSgnd3JhcHBlZCcpXG52YXIgdHlwZSA9IHJlcXVpcmUoJy4vdHlwZScpXG52YXIga2V5cyA9IE9iamVjdC5rZXlzXG5cbi8qKlxuICogRXhwb3J0IGBjb21waWxlYFxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gY29tcGlsZVxuXG4vKipcbiAqIENvbXBpbGVcbiAqL1xuXG5mdW5jdGlvbiBjb21waWxlIChtaXhlZCkge1xuICBzd2l0Y2ggKHR5cGUobWl4ZWQpKSB7XG4gICAgY2FzZSAnZnVuY3Rpb24nOiByZXR1cm4gRnVuYyhtaXhlZClcbiAgICBjYXNlICdvYmplY3QnOiByZXR1cm4gb2JqZWN0KG1peGVkKVxuICAgIGNhc2UgJ2NhdGNoJzogcmV0dXJuIENhdGNoZXIobWl4ZWQpXG4gICAgY2FzZSAnYXJyYXknOiByZXR1cm4gYXJyYXkobWl4ZWQpXG4gICAgY2FzZSAndm8nOiByZXR1cm4gVm8obWl4ZWQpXG4gICAgZGVmYXVsdDogcmV0dXJuIElkZW50aXR5KG1peGVkKVxuICB9XG59XG5cbi8qKlxuICogV3JhcCBmdW5jdGlvbnNcbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7RnVuY3Rpb259XG4gKi9cblxuZnVuY3Rpb24gRnVuYyAoZm4pIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIGZ1bmMgKGFyZ3MsIGRvbmUpIHtcbiAgICB3cmFwcGVkKGZuKS5hcHBseSh0aGlzLCBhcmdzLmNvbmNhdChuZXh0KSlcblxuICAgIGZ1bmN0aW9uIG5leHQoZXJyKSB7XG4gICAgICBpZiAoZXJyKSByZXR1cm4gZG9uZShlcnJvcihlcnIpKVxuICAgICAgcmV0dXJuIGRvbmUuYXBwbHkobnVsbCwgYXJndW1lbnRzKVxuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIFdyYXAgT2JqZWN0c1xuICpcbiAqIEBwYXJhbSB7T2JqZWN0fEFycmF5fSBpdGVyYWJsZVxuICogQHJldHVybiB7RnVuY3Rpb259XG4gKi9cblxuZnVuY3Rpb24gb2JqZWN0IChvKSB7XG4gIC8vIGNvbXBpbGUgdGhlIG9iamVjdFxuICBvID0ga2V5cyhvKS5yZWR1Y2UoZnVuY3Rpb24gKG8sIGspIHtcbiAgICBvW2tdID0gY29tcGlsZShvW2tdKVxuICAgIHJldHVybiBvXG4gIH0sIG8pXG5cbiAgcmV0dXJuIGZ1bmN0aW9uIG9iaiAoYXJncywgZG9uZSkge1xuICAgIHZhciBwZW5kaW5nID0ga2V5cyhvKS5sZW5ndGhcbiAgICB2YXIgY29udGV4dCA9IHRoaXNcbiAgICB2YXIgZXJyb3JzID0gW11cbiAgICB2YXIgb3V0ID0ge31cblxuICAgIC8vIGlmIHdlIGRvbid0IGhhdmUgYW55IHBlbmRpbmdcbiAgICAvLyB2YWx1ZXMsIHJldHVybiBpbW1lZGlhdGVseVxuICAgIGlmICghcGVuZGluZykgcmV0dXJuIGRvbmUobnVsbCwgb3V0KVxuXG4gICAga2V5cyhvKS5tYXAoZnVuY3Rpb24oaywgaSkge1xuICAgICAgb1trXS5jYWxsKGNvbnRleHQsIGFyZ3MsIGZ1bmN0aW9uKGVyciwgYXJncykge1xuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgZXJyb3JzW2ldID0gZXJyXG4gICAgICAgICAgb3V0W2tdID0gZXJyXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgb3V0W2tdID0gYXJnc1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCEtLXBlbmRpbmcpIHtcbiAgICAgICAgICBlcnJvcnMgPSBjb21wYWN0KGVycm9ycylcbiAgICAgICAgICByZXR1cm4gZXJyb3JzLmxlbmd0aFxuICAgICAgICAgICAgPyBkb25lKGVycm9yKGVycm9ycyksIG91dClcbiAgICAgICAgICAgIDogZG9uZShudWxsLCBvdXQpXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfSlcbiAgfVxufVxuXG4vKipcbiAqIFdyYXAgQXJyYXlzXG4gKi9cblxuZnVuY3Rpb24gYXJyYXkgKGEpIHtcbiAgYSA9IGEubWFwKGNvbXBpbGUpXG5cbiAgcmV0dXJuIGZ1bmN0aW9uIGFyciAoYXJncywgZG9uZSkge1xuICAgIHZhciBwZW5kaW5nID0gYS5sZW5ndGhcbiAgICB2YXIgY29udGV4dCA9IHRoaXNcbiAgICB2YXIgZXJyb3JzID0gW11cbiAgICB2YXIgb3V0ID0gW11cblxuICAgIC8vIGlmIHdlIGRvbid0IGhhdmUgYW55IHBlbmRpbmdcbiAgICAvLyB2YWx1ZXMsIHJldHVybiBpbW1lZGlhdGVseVxuICAgIGlmICghcGVuZGluZykgcmV0dXJuIGRvbmUobnVsbCwgb3V0KVxuXG4gICAgLy8gcnVuIGluIHBhcmFsbGVsXG4gICAgYS5tYXAoZnVuY3Rpb24gKGZuLCBpKSB7XG4gICAgICBmbi5jYWxsKGNvbnRleHQsIGFyZ3MsIGZ1bmN0aW9uKGVyciwgYXJncykge1xuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgZXJyb3JzW2ldID0gZXJyXG4gICAgICAgICAgb3V0W2ldID0gZXJyXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgb3V0W2ldID0gYXJnc1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCEtLXBlbmRpbmcpIHtcbiAgICAgICAgICBlcnJvcnMgPSBjb21wYWN0KGVycm9ycylcbiAgICAgICAgICByZXR1cm4gZXJyb3JzLmxlbmd0aFxuICAgICAgICAgICAgPyBkb25lKGVycm9yKGVycm9ycyksIG91dClcbiAgICAgICAgICAgIDogZG9uZShudWxsLCBvdXQpXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfSlcbiAgfVxufVxuXG4vKipcbiAqIFdyYXAgdm9cbiAqXG4gKiBAcGFyYW0ge1ZvfSB2b1xuICogQHJldHVybiB7RnVuY3Rpb259XG4gKi9cblxuZnVuY3Rpb24gVm8gKHYpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIHZvIChhcmdzLCBkb25lKSB7XG4gICAgcmV0dXJuIHYuYXBwbHkodGhpcywgYXJncy5jb25jYXQoZnVuY3Rpb24oZXJyLCB2KSB7XG4gICAgICBpZiAoZXJyKSByZXR1cm4gZG9uZShlcnJvcihlcnIpKVxuICAgICAgcmV0dXJuIGRvbmUuYXBwbHkobnVsbCwgYXJndW1lbnRzKVxuICAgIH0pKVxuICB9XG59XG5cbi8qKlxuICogQ2F0Y2hlclxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAqL1xuXG5mdW5jdGlvbiBDYXRjaGVyKGZuKSB7XG4gIHJldHVybiBmdW5jdGlvbiBjYXRjaGVyIChlcnIsIGFyZ3MsIGRvbmUpIHtcbiAgICByZXR1cm4gd3JhcHBlZChmbigpKS5hcHBseSh0aGlzLCBbZXJyXS5jb25jYXQoYXJncykuY29uY2F0KGRvbmUpKVxuICB9XG59XG5cbi8qKlxuICogSWRlbnRpdHlcbiAqXG4gKiBAcGFyYW0ge0FycmF5fSBhcmdzXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBkb25lXG4gKi9cblxuZnVuY3Rpb24gSWRlbnRpdHkgKHZhbHVlKSB7XG4gIHJldHVybiBmdW5jdGlvbiBpZGVudGl0eSAoYXJncywgZG9uZSkge1xuICAgIHJldHVybiBkb25lKG51bGwsIHZhbHVlKVxuICB9XG59XG4iLCIoZnVuY3Rpb24gKHByb2Nlc3Mpe1xuJ3VzZSBzdHJpY3QnO1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBjb21iaW5lUmVkdWNlcnM7XG5cbnZhciBfY3JlYXRlU3RvcmUgPSByZXF1aXJlKCcuL2NyZWF0ZVN0b3JlJyk7XG5cbnZhciBfaXNQbGFpbk9iamVjdCA9IHJlcXVpcmUoJ2xvZGFzaC9pc1BsYWluT2JqZWN0Jyk7XG5cbnZhciBfaXNQbGFpbk9iamVjdDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9pc1BsYWluT2JqZWN0KTtcblxudmFyIF93YXJuaW5nID0gcmVxdWlyZSgnLi91dGlscy93YXJuaW5nJyk7XG5cbnZhciBfd2FybmluZzIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF93YXJuaW5nKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgXCJkZWZhdWx0XCI6IG9iaiB9OyB9XG5cbmZ1bmN0aW9uIGdldFVuZGVmaW5lZFN0YXRlRXJyb3JNZXNzYWdlKGtleSwgYWN0aW9uKSB7XG4gIHZhciBhY3Rpb25UeXBlID0gYWN0aW9uICYmIGFjdGlvbi50eXBlO1xuICB2YXIgYWN0aW9uTmFtZSA9IGFjdGlvblR5cGUgJiYgJ1wiJyArIGFjdGlvblR5cGUudG9TdHJpbmcoKSArICdcIicgfHwgJ2FuIGFjdGlvbic7XG5cbiAgcmV0dXJuICdSZWR1Y2VyIFwiJyArIGtleSArICdcIiByZXR1cm5lZCB1bmRlZmluZWQgaGFuZGxpbmcgJyArIGFjdGlvbk5hbWUgKyAnLiAnICsgJ1RvIGlnbm9yZSBhbiBhY3Rpb24sIHlvdSBtdXN0IGV4cGxpY2l0bHkgcmV0dXJuIHRoZSBwcmV2aW91cyBzdGF0ZS4nO1xufVxuXG5mdW5jdGlvbiBnZXRVbmV4cGVjdGVkU3RhdGVTaGFwZVdhcm5pbmdNZXNzYWdlKGlucHV0U3RhdGUsIHJlZHVjZXJzLCBhY3Rpb24pIHtcbiAgdmFyIHJlZHVjZXJLZXlzID0gT2JqZWN0LmtleXMocmVkdWNlcnMpO1xuICB2YXIgYXJndW1lbnROYW1lID0gYWN0aW9uICYmIGFjdGlvbi50eXBlID09PSBfY3JlYXRlU3RvcmUuQWN0aW9uVHlwZXMuSU5JVCA/ICdpbml0aWFsU3RhdGUgYXJndW1lbnQgcGFzc2VkIHRvIGNyZWF0ZVN0b3JlJyA6ICdwcmV2aW91cyBzdGF0ZSByZWNlaXZlZCBieSB0aGUgcmVkdWNlcic7XG5cbiAgaWYgKHJlZHVjZXJLZXlzLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiAnU3RvcmUgZG9lcyBub3QgaGF2ZSBhIHZhbGlkIHJlZHVjZXIuIE1ha2Ugc3VyZSB0aGUgYXJndW1lbnQgcGFzc2VkICcgKyAndG8gY29tYmluZVJlZHVjZXJzIGlzIGFuIG9iamVjdCB3aG9zZSB2YWx1ZXMgYXJlIHJlZHVjZXJzLic7XG4gIH1cblxuICBpZiAoISgwLCBfaXNQbGFpbk9iamVjdDJbXCJkZWZhdWx0XCJdKShpbnB1dFN0YXRlKSkge1xuICAgIHJldHVybiAnVGhlICcgKyBhcmd1bWVudE5hbWUgKyAnIGhhcyB1bmV4cGVjdGVkIHR5cGUgb2YgXCInICsge30udG9TdHJpbmcuY2FsbChpbnB1dFN0YXRlKS5tYXRjaCgvXFxzKFthLXp8QS1aXSspLylbMV0gKyAnXCIuIEV4cGVjdGVkIGFyZ3VtZW50IHRvIGJlIGFuIG9iamVjdCB3aXRoIHRoZSBmb2xsb3dpbmcgJyArICgna2V5czogXCInICsgcmVkdWNlcktleXMuam9pbignXCIsIFwiJykgKyAnXCInKTtcbiAgfVxuXG4gIHZhciB1bmV4cGVjdGVkS2V5cyA9IE9iamVjdC5rZXlzKGlucHV0U3RhdGUpLmZpbHRlcihmdW5jdGlvbiAoa2V5KSB7XG4gICAgcmV0dXJuICFyZWR1Y2Vycy5oYXNPd25Qcm9wZXJ0eShrZXkpO1xuICB9KTtcblxuICBpZiAodW5leHBlY3RlZEtleXMubGVuZ3RoID4gMCkge1xuICAgIHJldHVybiAnVW5leHBlY3RlZCAnICsgKHVuZXhwZWN0ZWRLZXlzLmxlbmd0aCA+IDEgPyAna2V5cycgOiAna2V5JykgKyAnICcgKyAoJ1wiJyArIHVuZXhwZWN0ZWRLZXlzLmpvaW4oJ1wiLCBcIicpICsgJ1wiIGZvdW5kIGluICcgKyBhcmd1bWVudE5hbWUgKyAnLiAnKSArICdFeHBlY3RlZCB0byBmaW5kIG9uZSBvZiB0aGUga25vd24gcmVkdWNlciBrZXlzIGluc3RlYWQ6ICcgKyAoJ1wiJyArIHJlZHVjZXJLZXlzLmpvaW4oJ1wiLCBcIicpICsgJ1wiLiBVbmV4cGVjdGVkIGtleXMgd2lsbCBiZSBpZ25vcmVkLicpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGFzc2VydFJlZHVjZXJTYW5pdHkocmVkdWNlcnMpIHtcbiAgT2JqZWN0LmtleXMocmVkdWNlcnMpLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICAgIHZhciByZWR1Y2VyID0gcmVkdWNlcnNba2V5XTtcbiAgICB2YXIgaW5pdGlhbFN0YXRlID0gcmVkdWNlcih1bmRlZmluZWQsIHsgdHlwZTogX2NyZWF0ZVN0b3JlLkFjdGlvblR5cGVzLklOSVQgfSk7XG5cbiAgICBpZiAodHlwZW9mIGluaXRpYWxTdGF0ZSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignUmVkdWNlciBcIicgKyBrZXkgKyAnXCIgcmV0dXJuZWQgdW5kZWZpbmVkIGR1cmluZyBpbml0aWFsaXphdGlvbi4gJyArICdJZiB0aGUgc3RhdGUgcGFzc2VkIHRvIHRoZSByZWR1Y2VyIGlzIHVuZGVmaW5lZCwgeW91IG11c3QgJyArICdleHBsaWNpdGx5IHJldHVybiB0aGUgaW5pdGlhbCBzdGF0ZS4gVGhlIGluaXRpYWwgc3RhdGUgbWF5ICcgKyAnbm90IGJlIHVuZGVmaW5lZC4nKTtcbiAgICB9XG5cbiAgICB2YXIgdHlwZSA9ICdAQHJlZHV4L1BST0JFX1VOS05PV05fQUNUSU9OXycgKyBNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zdWJzdHJpbmcoNykuc3BsaXQoJycpLmpvaW4oJy4nKTtcbiAgICBpZiAodHlwZW9mIHJlZHVjZXIodW5kZWZpbmVkLCB7IHR5cGU6IHR5cGUgfSkgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1JlZHVjZXIgXCInICsga2V5ICsgJ1wiIHJldHVybmVkIHVuZGVmaW5lZCB3aGVuIHByb2JlZCB3aXRoIGEgcmFuZG9tIHR5cGUuICcgKyAoJ0RvblxcJ3QgdHJ5IHRvIGhhbmRsZSAnICsgX2NyZWF0ZVN0b3JlLkFjdGlvblR5cGVzLklOSVQgKyAnIG9yIG90aGVyIGFjdGlvbnMgaW4gXCJyZWR1eC8qXCIgJykgKyAnbmFtZXNwYWNlLiBUaGV5IGFyZSBjb25zaWRlcmVkIHByaXZhdGUuIEluc3RlYWQsIHlvdSBtdXN0IHJldHVybiB0aGUgJyArICdjdXJyZW50IHN0YXRlIGZvciBhbnkgdW5rbm93biBhY3Rpb25zLCB1bmxlc3MgaXQgaXMgdW5kZWZpbmVkLCAnICsgJ2luIHdoaWNoIGNhc2UgeW91IG11c3QgcmV0dXJuIHRoZSBpbml0aWFsIHN0YXRlLCByZWdhcmRsZXNzIG9mIHRoZSAnICsgJ2FjdGlvbiB0eXBlLiBUaGUgaW5pdGlhbCBzdGF0ZSBtYXkgbm90IGJlIHVuZGVmaW5lZC4nKTtcbiAgICB9XG4gIH0pO1xufVxuXG4vKipcbiAqIFR1cm5zIGFuIG9iamVjdCB3aG9zZSB2YWx1ZXMgYXJlIGRpZmZlcmVudCByZWR1Y2VyIGZ1bmN0aW9ucywgaW50byBhIHNpbmdsZVxuICogcmVkdWNlciBmdW5jdGlvbi4gSXQgd2lsbCBjYWxsIGV2ZXJ5IGNoaWxkIHJlZHVjZXIsIGFuZCBnYXRoZXIgdGhlaXIgcmVzdWx0c1xuICogaW50byBhIHNpbmdsZSBzdGF0ZSBvYmplY3QsIHdob3NlIGtleXMgY29ycmVzcG9uZCB0byB0aGUga2V5cyBvZiB0aGUgcGFzc2VkXG4gKiByZWR1Y2VyIGZ1bmN0aW9ucy5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gcmVkdWNlcnMgQW4gb2JqZWN0IHdob3NlIHZhbHVlcyBjb3JyZXNwb25kIHRvIGRpZmZlcmVudFxuICogcmVkdWNlciBmdW5jdGlvbnMgdGhhdCBuZWVkIHRvIGJlIGNvbWJpbmVkIGludG8gb25lLiBPbmUgaGFuZHkgd2F5IHRvIG9idGFpblxuICogaXQgaXMgdG8gdXNlIEVTNiBgaW1wb3J0ICogYXMgcmVkdWNlcnNgIHN5bnRheC4gVGhlIHJlZHVjZXJzIG1heSBuZXZlciByZXR1cm5cbiAqIHVuZGVmaW5lZCBmb3IgYW55IGFjdGlvbi4gSW5zdGVhZCwgdGhleSBzaG91bGQgcmV0dXJuIHRoZWlyIGluaXRpYWwgc3RhdGVcbiAqIGlmIHRoZSBzdGF0ZSBwYXNzZWQgdG8gdGhlbSB3YXMgdW5kZWZpbmVkLCBhbmQgdGhlIGN1cnJlbnQgc3RhdGUgZm9yIGFueVxuICogdW5yZWNvZ25pemVkIGFjdGlvbi5cbiAqXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IEEgcmVkdWNlciBmdW5jdGlvbiB0aGF0IGludm9rZXMgZXZlcnkgcmVkdWNlciBpbnNpZGUgdGhlXG4gKiBwYXNzZWQgb2JqZWN0LCBhbmQgYnVpbGRzIGEgc3RhdGUgb2JqZWN0IHdpdGggdGhlIHNhbWUgc2hhcGUuXG4gKi9cbmZ1bmN0aW9uIGNvbWJpbmVSZWR1Y2VycyhyZWR1Y2Vycykge1xuICB2YXIgcmVkdWNlcktleXMgPSBPYmplY3Qua2V5cyhyZWR1Y2Vycyk7XG4gIHZhciBmaW5hbFJlZHVjZXJzID0ge307XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgcmVkdWNlcktleXMubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIga2V5ID0gcmVkdWNlcktleXNbaV07XG4gICAgaWYgKHR5cGVvZiByZWR1Y2Vyc1trZXldID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBmaW5hbFJlZHVjZXJzW2tleV0gPSByZWR1Y2Vyc1trZXldO1xuICAgIH1cbiAgfVxuICB2YXIgZmluYWxSZWR1Y2VyS2V5cyA9IE9iamVjdC5rZXlzKGZpbmFsUmVkdWNlcnMpO1xuXG4gIHZhciBzYW5pdHlFcnJvcjtcbiAgdHJ5IHtcbiAgICBhc3NlcnRSZWR1Y2VyU2FuaXR5KGZpbmFsUmVkdWNlcnMpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgc2FuaXR5RXJyb3IgPSBlO1xuICB9XG5cbiAgcmV0dXJuIGZ1bmN0aW9uIGNvbWJpbmF0aW9uKCkge1xuICAgIHZhciBzdGF0ZSA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMCB8fCBhcmd1bWVudHNbMF0gPT09IHVuZGVmaW5lZCA/IHt9IDogYXJndW1lbnRzWzBdO1xuICAgIHZhciBhY3Rpb24gPSBhcmd1bWVudHNbMV07XG5cbiAgICBpZiAoc2FuaXR5RXJyb3IpIHtcbiAgICAgIHRocm93IHNhbml0eUVycm9yO1xuICAgIH1cblxuICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSB7XG4gICAgICB2YXIgd2FybmluZ01lc3NhZ2UgPSBnZXRVbmV4cGVjdGVkU3RhdGVTaGFwZVdhcm5pbmdNZXNzYWdlKHN0YXRlLCBmaW5hbFJlZHVjZXJzLCBhY3Rpb24pO1xuICAgICAgaWYgKHdhcm5pbmdNZXNzYWdlKSB7XG4gICAgICAgICgwLCBfd2FybmluZzJbXCJkZWZhdWx0XCJdKSh3YXJuaW5nTWVzc2FnZSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdmFyIGhhc0NoYW5nZWQgPSBmYWxzZTtcbiAgICB2YXIgbmV4dFN0YXRlID0ge307XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBmaW5hbFJlZHVjZXJLZXlzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIga2V5ID0gZmluYWxSZWR1Y2VyS2V5c1tpXTtcbiAgICAgIHZhciByZWR1Y2VyID0gZmluYWxSZWR1Y2Vyc1trZXldO1xuICAgICAgdmFyIHByZXZpb3VzU3RhdGVGb3JLZXkgPSBzdGF0ZVtrZXldO1xuICAgICAgdmFyIG5leHRTdGF0ZUZvcktleSA9IHJlZHVjZXIocHJldmlvdXNTdGF0ZUZvcktleSwgYWN0aW9uKTtcbiAgICAgIGlmICh0eXBlb2YgbmV4dFN0YXRlRm9yS2V5ID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICB2YXIgZXJyb3JNZXNzYWdlID0gZ2V0VW5kZWZpbmVkU3RhdGVFcnJvck1lc3NhZ2Uoa2V5LCBhY3Rpb24pO1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZXJyb3JNZXNzYWdlKTtcbiAgICAgIH1cbiAgICAgIG5leHRTdGF0ZVtrZXldID0gbmV4dFN0YXRlRm9yS2V5O1xuICAgICAgaGFzQ2hhbmdlZCA9IGhhc0NoYW5nZWQgfHwgbmV4dFN0YXRlRm9yS2V5ICE9PSBwcmV2aW91c1N0YXRlRm9yS2V5O1xuICAgIH1cbiAgICByZXR1cm4gaGFzQ2hhbmdlZCA/IG5leHRTdGF0ZSA6IHN0YXRlO1xuICB9O1xufVxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCIuLi8uLi8uLi8uLi9tYWtvLWpzL25vZGVfbW9kdWxlcy9wcm9jZXNzL2Jyb3dzZXIuanNcIikpIiwiLyoqXG4gKiBNb2R1bGVzXG4gKi9cblxudmFyIGZvckVhY2ggPSByZXF1aXJlKCdAZi9mb3JlYWNoJylcblxuLyoqXG4gKiBFeHBvc2UgY2xvbmVPYmpcbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNsb25lT2JqWydkZWZhdWx0J10gPSBjbG9uZU9ialxuXG4vKipcbiAqIENsb25lIGFuIG9iamVjdC5cbiAqIEBwYXJhbSAge09iamVjdH0gb2JqIE9iamVjdCB0byBDbG9uZVxuICogQHJldHVybiB7T2JqZWN0fVxuICovXG5cbmZ1bmN0aW9uIGNsb25lT2JqIChvYmopIHtcbiAgdmFyIG5ld09iaiA9IHt9XG5cbiAgZm9yRWFjaChmdW5jdGlvbiAodmFsLCBrZXkpIHtcbiAgICBuZXdPYmpba2V5XSA9IHZhbFxuICB9LCBvYmopXG5cbiAgcmV0dXJuIG5ld09ialxufVxuIiwiLyoqXG4gKiBNb2R1bGUgRGVwZW5kZW5jaWVzXG4gKi9cblxudmFyIGNvbXBpbGUgPSByZXF1aXJlKCcuL2NvbXBpbGUnKVxudmFyIHNsaWNlZCA9IHJlcXVpcmUoJ3NsaWNlZCcpXG5cbi8qKlxuICogRXhwb3J0IGBQaXBlbGluZWBcbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IFBpcGVsaW5lXG5cbi8qKlxuICogSW5pdGlhbGl6ZSBgUGlwZWxpbmVgXG4gKlxuICogQHBhcmFtIHtBcnJheX0gc2VyaWVzIGFycmF5IG9mIGZ1bmN0aW9uc1xuICogQHBhcmFtIHtBcnJheX0gYXJnc1xuICogQHBhcmFtIHtGdW5jdGlvbn0gZG9uZVxuICovXG5cbmZ1bmN0aW9uIFBpcGVsaW5lIChwaXBlbGluZSwgY29udGV4dCwgYXJncywgZG9uZSkge1xuICBwaXBlbGluZSA9IHBpcGVsaW5lLm1hcChjb21waWxlKVxuXG4gIC8vIHJ1biBpbiBzZXJpZXNcbiAgZnVuY3Rpb24gbmV4dCAoZXJyKSB7XG4gICAgaWYgKGVycikgcmV0dXJuIGVycm9yKGVyciwgc2xpY2VkKGFyZ3VtZW50cywgMSkpXG4gICAgdmFyIGZuID0gcGlwZWxpbmUuc2hpZnQoKVxuICAgIHdoaWxlIChmbiAmJiBmbi5sZW5ndGggIT09IDIpIGZuID0gcGlwZWxpbmUuc2hpZnQoKVxuICAgIGlmICghZm4pIHJldHVybiBkb25lLmNhbGwoY29udGV4dCwgbnVsbCwgc2xpY2VkKGFyZ3VtZW50cywgMSkpXG4gICAgZm4uY2FsbChjb250ZXh0LCBzbGljZWQoYXJndW1lbnRzLCAxKSwgbmV4dClcbiAgfVxuXG4gIC8vIGVycm9yIGhhbmRsaW5nXG4gIGZ1bmN0aW9uIGVycm9yIChlcnIsIGFyZ3MpIHtcbiAgICB2YXIgZm4gPSBwaXBlbGluZS5zaGlmdCgpXG4gICAgd2hpbGUgKGZuICYmIGZuLmxlbmd0aCAhPT0gMykgZm4gPSBwaXBlbGluZS5zaGlmdCgpXG4gICAgaWYgKGZuKSByZXR1cm4gZm4uY2FsbChjb250ZXh0LCBlcnIsIGFyZ3MsIG5leHQpXG4gICAgZWxzZSByZXR1cm4gZG9uZS5jYWxsKGNvbnRleHQsIGVycilcbiAgfVxuXG4gIC8vIGtpY2sgdXMgb2ZmXG4gIG5leHQuYXBwbHkobnVsbCwgW251bGxdLmNvbmNhdChhcmdzKSlcbn1cbiIsIi8qKlxuICogTW9kdWxlIERlcGVuZGVuY2llc1xuICovXG5cbnZhciBjb21waWxlID0gcmVxdWlyZSgnLi9jb21waWxlJylcblxuLyoqXG4gKiBFeHBvcnQgYFN0YWNrYFxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gU3RhY2tcblxuLyoqXG4gKiBJbml0aWFsaXplIGBTdGFja2BcbiAqXG4gKiBAcGFyYW0ge0FycmF5fSBzZXJpZXMgYXJyYXkgb2YgZnVuY3Rpb25zXG4gKiBAcGFyYW0ge0FycmF5fSBhcmdzXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBkb25lXG4gKi9cblxuZnVuY3Rpb24gU3RhY2sgKHN0YWNrLCBjb250ZXh0LCBhcmdzLCBkb25lKSB7XG4gIHN0YWNrID0gc3RhY2subWFwKGNvbXBpbGUpXG5cbiAgLy8gcnVuIGluIHN0YWNrXG4gIGZ1bmN0aW9uIG5leHQgKGVycikge1xuICAgIGlmIChlcnIpIHJldHVybiBlcnJvcihlcnIpXG4gICAgdmFyIGZuID0gc3RhY2suc2hpZnQoKVxuICAgIHdoaWxlIChmbiAmJiBmbi5sZW5ndGggIT09IDIpIGZuID0gc3RhY2suc2hpZnQoKVxuICAgIGlmICghZm4pIHJldHVybiBkb25lLmNhbGwoY29udGV4dCwgbnVsbCwgYXJncylcbiAgICBmbi5jYWxsKGNvbnRleHQsIGFyZ3MsIG5leHQpXG4gIH1cblxuICAvLyBlcnJvciBoYW5kbGluZ1xuICBmdW5jdGlvbiBlcnJvciAoZXJyKSB7XG4gICAgdmFyIGZuID0gc3RhY2suc2hpZnQoKVxuICAgIHdoaWxlIChmbiAmJiBmbi5sZW5ndGggIT09IDMpIGZuID0gc3RhY2suc2hpZnQoKVxuICAgIGlmIChmbikgcmV0dXJuIGZuLmNhbGwoY29udGV4dCwgZXJyLCBhcmdzLCBuZXh0KVxuICAgIGVsc2UgcmV0dXJuIGRvbmUuY2FsbChjb250ZXh0LCBlcnIpXG4gIH1cblxuICAvLyBraWNrIHVzIG9mZlxuICBuZXh0KClcbn1cbiIsIihmdW5jdGlvbiAocHJvY2Vzcyl7XG4ndXNlIHN0cmljdCc7XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG5leHBvcnRzLmNvbXBvc2UgPSBleHBvcnRzLmFwcGx5TWlkZGxld2FyZSA9IGV4cG9ydHMuYmluZEFjdGlvbkNyZWF0b3JzID0gZXhwb3J0cy5jb21iaW5lUmVkdWNlcnMgPSBleHBvcnRzLmNyZWF0ZVN0b3JlID0gdW5kZWZpbmVkO1xuXG52YXIgX2NyZWF0ZVN0b3JlID0gcmVxdWlyZSgnLi9jcmVhdGVTdG9yZScpO1xuXG52YXIgX2NyZWF0ZVN0b3JlMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2NyZWF0ZVN0b3JlKTtcblxudmFyIF9jb21iaW5lUmVkdWNlcnMgPSByZXF1aXJlKCcuL2NvbWJpbmVSZWR1Y2VycycpO1xuXG52YXIgX2NvbWJpbmVSZWR1Y2VyczIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9jb21iaW5lUmVkdWNlcnMpO1xuXG52YXIgX2JpbmRBY3Rpb25DcmVhdG9ycyA9IHJlcXVpcmUoJy4vYmluZEFjdGlvbkNyZWF0b3JzJyk7XG5cbnZhciBfYmluZEFjdGlvbkNyZWF0b3JzMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2JpbmRBY3Rpb25DcmVhdG9ycyk7XG5cbnZhciBfYXBwbHlNaWRkbGV3YXJlID0gcmVxdWlyZSgnLi9hcHBseU1pZGRsZXdhcmUnKTtcblxudmFyIF9hcHBseU1pZGRsZXdhcmUyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfYXBwbHlNaWRkbGV3YXJlKTtcblxudmFyIF9jb21wb3NlID0gcmVxdWlyZSgnLi9jb21wb3NlJyk7XG5cbnZhciBfY29tcG9zZTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9jb21wb3NlKTtcblxudmFyIF93YXJuaW5nID0gcmVxdWlyZSgnLi91dGlscy93YXJuaW5nJyk7XG5cbnZhciBfd2FybmluZzIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF93YXJuaW5nKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgXCJkZWZhdWx0XCI6IG9iaiB9OyB9XG5cbi8qXG4qIFRoaXMgaXMgYSBkdW1teSBmdW5jdGlvbiB0byBjaGVjayBpZiB0aGUgZnVuY3Rpb24gbmFtZSBoYXMgYmVlbiBhbHRlcmVkIGJ5IG1pbmlmaWNhdGlvbi5cbiogSWYgdGhlIGZ1bmN0aW9uIGhhcyBiZWVuIG1pbmlmaWVkIGFuZCBOT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nLCB3YXJuIHRoZSB1c2VyLlxuKi9cbmZ1bmN0aW9uIGlzQ3J1c2hlZCgpIHt9XG5cbmlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nICYmIHR5cGVvZiBpc0NydXNoZWQubmFtZSA9PT0gJ3N0cmluZycgJiYgaXNDcnVzaGVkLm5hbWUgIT09ICdpc0NydXNoZWQnKSB7XG4gICgwLCBfd2FybmluZzJbXCJkZWZhdWx0XCJdKSgnWW91IGFyZSBjdXJyZW50bHkgdXNpbmcgbWluaWZpZWQgY29kZSBvdXRzaWRlIG9mIE5PREVfRU5WID09PSBcXCdwcm9kdWN0aW9uXFwnLiAnICsgJ1RoaXMgbWVhbnMgdGhhdCB5b3UgYXJlIHJ1bm5pbmcgYSBzbG93ZXIgZGV2ZWxvcG1lbnQgYnVpbGQgb2YgUmVkdXguICcgKyAnWW91IGNhbiB1c2UgbG9vc2UtZW52aWZ5IChodHRwczovL2dpdGh1Yi5jb20vemVydG9zaC9sb29zZS1lbnZpZnkpIGZvciBicm93c2VyaWZ5ICcgKyAnb3IgRGVmaW5lUGx1Z2luIGZvciB3ZWJwYWNrIChodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzMwMDMwMDMxKSAnICsgJ3RvIGVuc3VyZSB5b3UgaGF2ZSB0aGUgY29ycmVjdCBjb2RlIGZvciB5b3VyIHByb2R1Y3Rpb24gYnVpbGQuJyk7XG59XG5cbmV4cG9ydHMuY3JlYXRlU3RvcmUgPSBfY3JlYXRlU3RvcmUyW1wiZGVmYXVsdFwiXTtcbmV4cG9ydHMuY29tYmluZVJlZHVjZXJzID0gX2NvbWJpbmVSZWR1Y2VyczJbXCJkZWZhdWx0XCJdO1xuZXhwb3J0cy5iaW5kQWN0aW9uQ3JlYXRvcnMgPSBfYmluZEFjdGlvbkNyZWF0b3JzMltcImRlZmF1bHRcIl07XG5leHBvcnRzLmFwcGx5TWlkZGxld2FyZSA9IF9hcHBseU1pZGRsZXdhcmUyW1wiZGVmYXVsdFwiXTtcbmV4cG9ydHMuY29tcG9zZSA9IF9jb21wb3NlMltcImRlZmF1bHRcIl07XG59KS5jYWxsKHRoaXMscmVxdWlyZShcIi4uLy4uLy4uLy4uL21ha28tanMvbm9kZV9tb2R1bGVzL3Byb2Nlc3MvYnJvd3Nlci5qc1wiKSkiLCIvKipcbiAqIE1vZHVsZXNcbiAqL1xuXG52YXIgY2xvbmVPYmogPSByZXF1aXJlKCdAZi9jbG9uZS1vYmonKVxudmFyIGNsb25lQXJyYXkgPSByZXF1aXJlKCdAZi9zbGljZScpXG52YXIgaXNBcnJheSA9IHJlcXVpcmUoJ0BmL2lzLWFycmF5JylcblxuLyoqXG4gKiBFeHBvc2UgY2xvbmVTaGFsbG93XG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBjbG9uZVNoYWxsb3dcblxuLyoqXG4gKiBDbG9uZSBvYmplY3Qgb3IgYXJyYXkgc2hhbGxvd1xuICogQHBhcmFtICB7T2JqZWN0fEFycmF5fSBhIG9iamVjdCB0byBjb3B5XG4gKiBAcmV0dXJuIHtPYmplY3R8QXJyYXl9XG4gKi9cblxuZnVuY3Rpb24gY2xvbmVTaGFsbG93IChhKSB7XG4gIHJldHVybiBpc0FycmF5KClcbiAgICA/IGNsb25lQXJyYXkoYSlcbiAgICA6IGNsb25lT2JqKGEpXG59XG4iLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG4ndXNlIHN0cmljdCdcblxuLyoqXG4gKiBNb2R1bGUgRGVwZW5kZW5jaWVzXG4gKi9cblxudmFyIFByb21pc2UgPSBnbG9iYWwuUHJvbWlzZSB8fCByZXF1aXJlKCdlczYtcHJvbWlzZScpLlByb21pc2VcbnZhciBQaXBlbGluZSA9IHJlcXVpcmUoJy4vbGliL3BpcGVsaW5lJylcbnZhciBTdGFjayA9IHJlcXVpcmUoJy4vbGliL3N0YWNrJylcbnZhciBzbGljZWQgPSByZXF1aXJlKCdzbGljZWQnKVxudmFyIGlzQXJyYXkgPSBBcnJheS5pc0FycmF5XG52YXIgbm9vcCA9IGZ1bmN0aW9uICgpIHt9XG52YXIga2V5cyA9IE9iamVjdC5rZXlzXG5cbi8qKlxuICogTW9kdWxlIEV4cG9ydHNcbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IFZvXG5cbi8qKlxuICogSW5pdGlhbGl6ZSBhIGBWb2AgaW5zdGFuY2VcbiAqXG4gKiBAcGFyYW0ge0FycmF5fE9iamVjdHxGdW5jdGlvbiwgLi4ufVxuICogQHJldHVybiB7RnVuY3Rpb259XG4gKi9cblxuZnVuY3Rpb24gVm8oKSB7XG4gIHZhciBwaXBlbGluZSA9IGlzQXJyYXkodGhpcykgPyBzbGljZWQodGhpcykgOiBzbGljZWQoYXJndW1lbnRzKVxuXG4gIC8vIHJ1biB2b1xuICByZXR1cm4gcnVuKGZ1bmN0aW9uIChjb250ZXh0LCBhcmdzLCBkb25lKSB7XG4gICAgUGlwZWxpbmUocGlwZWxpbmUsIGNvbnRleHQsIGFyZ3MsIGZ1bmN0aW9uKGVyciwgYXJncykge1xuICAgICAgaWYgKGVycikgcmV0dXJuIGRvbmUuY2FsbChjb250ZXh0LCBlcnIpXG4gICAgICByZXR1cm4gZG9uZS5hcHBseShjb250ZXh0LCBbbnVsbF0uY29uY2F0KGFyZ3MpKVxuICAgIH0pXG4gIH0pXG59XG5cbi8qKlxuICogUGlwZWxpbmUgdGhlIGZ1bmN0aW9uc1xuICpcbiAqIEBwYXJhbSB7TWl4ZWR9XG4gKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAqL1xuXG5Wby5zdGFjayA9IGZ1bmN0aW9uIHN0YWNrICgpIHtcbiAgdmFyIHN0YWNrID0gaXNBcnJheSh0aGlzKSA/IHNsaWNlZCh0aGlzKSA6IHNsaWNlZChhcmd1bWVudHMpXG5cbiAgLy8gcnVuIHRoZSBzdGFja1xuICByZXR1cm4gcnVuKGZ1bmN0aW9uIChjb250ZXh0LCBhcmdzLCBkb25lKSB7XG4gICAgU3RhY2soc3RhY2ssIGNvbnRleHQsIGFyZ3MsIGZ1bmN0aW9uKGVyciwgdikge1xuICAgICAgaWYgKGVycikgcmV0dXJuIGRvbmUoZXJyKVxuICAgICAgcmV0dXJuIGRvbmUuYXBwbHkodGhpcywgW251bGxdLmNvbmNhdCh2KSlcbiAgICB9KVxuICB9KVxufVxuXG4vKipcbiAqIFNpbXBsZSB3cmFwcGVyIHRoYXQgd2lsbCBhbGxvdyB1c1xuICogdG8gc3dpdGNoIGJldHdlZW4gZml4ZWQgYXJndW1lbnRzXG4gKiBhbmQgdHJhbnNmb3JtIHBpcGVsaW5lc1xuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAqL1xuXG5mdW5jdGlvbiBydW4gKGZuKSB7XG4gIGZ1bmN0aW9uIHZvICgpIHtcbiAgICB2YXIgYXJncyA9IHNsaWNlZChhcmd1bWVudHMpXG4gICAgdmFyIGxhc3QgPSBhcmdzW2FyZ3MubGVuZ3RoIC0gMV1cbiAgICB2YXIgY29udGV4dCA9IHRoaXNcblxuICAgIGlmICh0eXBlb2YgbGFzdCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgdmFyIGRvbmUgPSBhcmdzLnBvcCgpXG4gICAgICBmbihjb250ZXh0LCBhcmdzLCBkb25lKVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyByZXR1cm4gYSBwcm9taXNlXG4gICAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHN1Y2Nlc3MsIGZhaWx1cmUpIHtcbiAgICAgICAgZm4oY29udGV4dCwgYXJncywgZnVuY3Rpb24oZXJyLCByZXQpIHtcbiAgICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDIpIHJldCA9IHNsaWNlZChhcmd1bWVudHMsIDEpXG4gICAgICAgICAgcmV0dXJuIGVyciA/IGZhaWx1cmUoZXJyKSA6IHN1Y2Nlc3MocmV0KVxuICAgICAgICB9KVxuICAgICAgfSlcbiAgICB9XG4gIH1cblxuICAvLyB3aXRoIFwidm8gaW5zdGFuY2VvZiBWb1wiXG4gIHZvLnZvID0gdHJ1ZVxuXG4gIHJldHVybiB2b1xufVxuXG4vKipcbiAqIENhdGNoIGVycm9yc1xuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAqL1xuXG5Wby5jYXRjaCA9IGZ1bmN0aW9uIChmbikge1xuICAvLyBzaW1wbGUgd3JhcHBlciB0byBhdm9pZCBhdHRhY2hpbmcgdG8gdGhlIHBhc3NlZC1pbiBmdW5jdGlvblxuICBmdW5jdGlvbiBjYXRjaGVyICgpIHsgcmV0dXJuIGZuIH1cbiAgY2F0Y2hlci5jYXRjaCA9IHRydWVcbiAgcmV0dXJuIGNhdGNoZXJcbn1cblxufSkuY2FsbCh0aGlzLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwiLyoqXG4gKiBNb2R1bGVzXG4gKi9cblxudmFyIGNsb25lID0gcmVxdWlyZSgnQGYvY2xvbmUtc2hhbGxvdycpXG52YXIgY29tcG9zZVJlZHVjZXJzID0gcmVxdWlyZSgnQGYvY29tcG9zZS1yZWR1Y2VycycpXG5cbi8qKlxuICogRXhwb3NlIGNvbWJpbmVSZWR1Y2Vyc1xuICovXG5cbm1vZHVsZS5leHBvcnRzID0gY29tYmluZVJlZHVjZXJzWydkZWZhdWx0J10gPSBjb21iaW5lUmVkdWNlcnNcblxuLyoqXG4gKiBjb21iaW5lUmVkdWNlcnNcbiAqL1xuXG5mdW5jdGlvbiBjb21iaW5lUmVkdWNlcnMgKHJlZHVjZXJzLCBkZWZhdWx0U3RhdGUpIHtcbiAgZGVmYXVsdFN0YXRlID0gZGVmYXVsdFN0YXRlIHx8IHt9XG5cbiAgcmV0dXJuIGNvbXBvc2VSZWR1Y2Vycy5hcHBseShudWxsLCBPYmplY3RcbiAgICAua2V5cyhyZWR1Y2VycylcbiAgICAubWFwKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgIHJldHVybiBzY29wZVJlZHVjZXIocmVkdWNlcnNba2V5XSwga2V5LCBkZWZhdWx0U3RhdGUpXG4gICAgfSkpXG59XG5cbmZ1bmN0aW9uIHNjb3BlUmVkdWNlciAocmVkdWNlciwgcHJvcCwgZGVmYXVsdFN0YXRlKSB7XG4gIHJldHVybiBmdW5jdGlvbiAoc3RhdGUsIGFjdGlvbikge1xuICAgIGlmIChzdGF0ZSA9PT0gdW5kZWZpbmVkKSBzdGF0ZSA9IGRlZmF1bHRTdGF0ZVxuXG4gICAgdmFyIGNoaWxkU3RhdGUgPSByZWR1Y2VyKHN0YXRlW3Byb3BdLCBhY3Rpb24pXG5cbiAgICBpZiAoY2hpbGRTdGF0ZSAhPT0gc3RhdGVbcHJvcF0pIHtcbiAgICAgIHN0YXRlID0gY2xvbmUoc3RhdGUpXG4gICAgICBzdGF0ZVtwcm9wXSA9IGNoaWxkU3RhdGVcbiAgICB9XG5cbiAgICByZXR1cm4gc3RhdGVcbiAgfVxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbi8qKlxuICogTW9kdWxlIERlcGVuZGVuY2llc1xuICovXG5cbnZhciBpc19mc2EgPSByZXF1aXJlKCcuL2lzLWZzYScpXG52YXIgZnJlZXplID0gcmVxdWlyZSgnLi9mcmVlemUnKVxudmFyIHNsaWNlZCA9IHJlcXVpcmUoJ3NsaWNlZCcpXG52YXIgcmVkdXggPSByZXF1aXJlKCdyZWR1eCcpXG52YXIgaXNBcnJheSA9IEFycmF5LmlzQXJyYXlcbnZhciB2byA9IHJlcXVpcmUoJ3ZvJylcblxuLyoqXG4gKiBFeHBvcnQgYG1pZGRsZXdhcmVgXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSByZXNvbHZlXG5cbi8qKlxuICogUmVzb2x2ZSBwcm9taXNlcywgYXJyYXlzLCBvYmplY3RzLCBldGMuXG4gKi9cblxuZnVuY3Rpb24gcmVzb2x2ZSAoc3RvcmUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIChuZXh0KSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChhY3Rpb24pIHtcbiAgICAgIHZhciBhY3Rpb25zID0gc2xpY2VkKGFyZ3VtZW50cykubWFwKGZ1bmN0aW9uKGFjdGlvbikge1xuICAgICAgICByZXR1cm4gaXNBcnJheShhY3Rpb24pXG4gICAgICAgICAgPyBhY3Rpb24ubWFwKGZ1bmN0aW9uIChhKSB7IHJldHVybiB2byhhLCBuZXh0KSB9KVxuICAgICAgICAgIDogdm8oYWN0aW9uLCBmc2FfY2hlY2ssIG5leHQpXG4gICAgICB9KVxuXG4gICAgICByZXR1cm4gdm8uc3RhY2suYXBwbHkoYWN0aW9ucykoZnJlZXplKHN0b3JlLmdldFN0YXRlKCkpKVxuICAgICAgICAudGhlbihmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXR1cm4gc3RvcmUuZ2V0U3RhdGUoKVxuICAgICAgICB9KVxuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIEVuc3VyZSB0aGF0IHdoYXQncyByZXR1cm5lZFxuICogaXMgYSBmbHV4IHN0YW5kYXJkIGFjdGlvblxuICpcbiAqIEBwYXJhbSB7TWl4ZWR9IG1peGVkXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKi9cblxuZnVuY3Rpb24gZnNhX2NoZWNrIChtaXhlZCkge1xuICBpZiAoaXNfZnNhKG1peGVkKSkgcmV0dXJuIG1peGVkXG4gIHRocm93IG5ldyBFcnJvcigncmVzb2x2ZWQgYWN0aW9uICgnICsgc3RyaW5naWZ5KG1peGVkKSArICcpIGlzIG5vdCB0aGUgY29ycmVjdCBmb3JtYXQuIFBsZWFzZSByZWZlciB0byB0aGUgc3BlYzogaHR0cHM6Ly9naXRodWIuY29tL2FjZGxpdGUvZmx1eC1zdGFuZGFyZC1hY3Rpb24jYWN0aW9ucycpXG59XG5cbi8qKlxuICogU2VyaWFsaXplIG91ciB2YWx1ZVxuICpcbiAqIEBwYXJhbSB7TWl4ZWR9IG1peGVkXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKi9cblxuZnVuY3Rpb24gc3RyaW5naWZ5IChtaXhlZCkge1xuICB0cnkge1xuICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShtaXhlZClcbiAgfSBjYXRjaCAoZSkge1xuICAgIHJldHVybiBtaXhlZFxuICB9XG59XG4iLCIvKipcbiAqIE1vZHVsZSBkZXBlbmRlbmNpZXNcbiAqL1xuXG52YXIgY29tYmluZV9yZWR1Y2VyID0gcmVxdWlyZSgnQGYvY29tYmluZS1yZWR1Y2VycycpXG52YXIgY29tcG9zZV9yZWR1Y2VyID0gcmVxdWlyZSgnQGYvY29tcG9zZS1yZWR1Y2VycycpXG52YXIgaGFuZGxlX2FjdGlvbiA9IHJlcXVpcmUoJ0BmL2hhbmRsZS1hY3Rpb25zJylcbnZhciB4b3IgPSByZXF1aXJlKCdjb21wb25lbnQteG9yJylcbnZhciBrZXlzID0gT2JqZWN0LmtleXNcblxuLyoqXG4gKiBFeHBvcnQgYFRyZWVgXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBUcmVlXG5cbi8qKlxuICogSW5pdGlhbGl6ZSBgVHJlZWBcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gbWFwXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufVxuICovXG5cbmZ1bmN0aW9uIFRyZWUgKHRyZWUpIHtcbiAgcmV0dXJuIHdhbGsodHJlZSlcbn1cblxuLyoqXG4gKiBXYWxrIHRoZSBvYmplY3QgdHJlZVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB0cmVlXG4gKiBAcGFyYW0ge0FycmF5fSB0cmFpbFxuICogQHJldHVybiB7RnVuY3Rpb259XG4gKi9cblxuZnVuY3Rpb24gd2FsayAodHJlZSwgdHJhaWwpIHtcbiAgdHJhaWwgPSB0cmFpbCB8fCBbXVxuXG4gIHZhciBmdW5jcyA9IHt9XG4gIHZhciBtYXAgPSB7fVxuICB2YXIgcGF0aFxuXG4gIC8vIHNlZ21lbnRcbiAgZm9yICh2YXIgayBpbiB0cmVlKSB7XG4gICAgaWYgKHR5cGVvZiB0cmVlW2tdID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBwYXRoID0gdHJhaWwubGVuZ3RoID8gayArICcgJyArIHRyYWlsLmpvaW4oJy4nKSA6IGtcbiAgICAgIGZ1bmNzW3BhdGhdID0gdHJlZVtrXVxuICAgIH0gZWxzZSB7XG4gICAgICBtYXBba10gPSB3YWxrKHRyZWVba10sIHRyYWlsLmNvbmNhdChrKSlcbiAgICB9XG4gIH1cblxuICB2YXIgZmwgPSBrZXlzKGZ1bmNzKS5sZW5ndGhcbiAgdmFyIG1sID0ga2V5cyhtYXApLmxlbmd0aFxuXG4gIC8vIGlmIHdlIGhhdmUgb25seSBvZiBvbmUgdHlwZVxuICAvLyBvciBhbm90aGVyLCByZXR1cm4gcmVkdWNlcnNcbiAgaWYgKHhvcihmbCwgbWwpKSB7XG4gICAgcmV0dXJuIGZsXG4gICAgICA/IGhhbmRsZV9hY3Rpb24oZnVuY3MpXG4gICAgICA6IGNvbWJpbmVfcmVkdWNlcihtYXApXG4gIH1cblxuICAvLyBvdGhlcndpc2UgY29tcG9zZSB0aGUgdHdvXG4gIC8vIGRpZmZlcmVudCBzZWdtZW50cyBpbnRvIGFcbiAgLy8gc2luZ2xlIHJlZHVjZXJcbiAgcmV0dXJuIGNvbXBvc2VfcmVkdWNlcihcbiAgICBoYW5kbGVfYWN0aW9uKGZ1bmNzKSxcbiAgICBjb21iaW5lX3JlZHVjZXIobWFwKVxuICApXG59XG5cbi8vIHZhciBzdGF0ZSA9IHtcbi8vICAgdXNlcjoge1xuLy8gICAgIG5hbWU6ICdtYXR0Jyxcbi8vICAgICBhZ2U6IDI2XG4vLyAgIH0sXG4vLyAgIGJvb2s6IHtcbi8vICAgICBuYW1lOiAnYWxjaGVtaXN0Jyxcbi8vICAgICBwYWdlczogW1xuLy8gICAgICAge1xuLy8gICAgICAgICBudW1iZXI6IDEsXG4vLyAgICAgICAgIHRleHQ6ICd0aGlzIGlzIGEgZ29vZCBzdG9yeSdcbi8vICAgICAgIH0sXG4vLyAgICAgICB7XG4vLyAgICAgICAgIG51bWJlcjogMixcbi8vICAgICAgICAgdGV4dDogJ2Fib3V0IGEgYm95J1xuLy8gICAgICAgfVxuLy8gICAgIF1cbi8vICAgfVxuLy8gfVxuXG4vLyB2YXIgdHJlZSA9IFRyZWUoe1xuLy8gICB1c2VyOiB7XG4vLyAgICAgdXBkYXRlOiBmdW5jdGlvbiAoc3RhdGUsIGFjdGlvbikge1xuLy8gICAgICAgY29uc29sZS5sb2coJ3VwZGF0ZScsIHN0YXRlLCBhY3Rpb24pXG4vLyAgICAgfVxuLy8gICB9LFxuLy8gICBib29rOiB7XG4vLyAgICAgcmVuYW1lOiBmdW5jdGlvbiAoc3RhdGUsIGFjdGlvbikge1xuLy8gICAgICAgY29uc29sZS5sb2coJ3JlbmFtZScsIHN0YXRlLCBhY3Rpb24pXG4vLyAgICAgfSxcbi8vICAgICBwYWdlczoge1xuLy8gICAgICAgYWRkOiBmdW5jdGlvbiAoc3RhdGUsIGFjdGlvbikge1xuLy8gICAgICAgICBjb25zb2xlLmxvZygnYWRkJywgc3RhdGUsIGFjdGlvbilcbi8vICAgICAgIH0sXG4vLyAgICAgICBlZGl0OiBmdW5jdGlvbiAoc3RhdGUsIGFjdGlvbikge1xuLy8gICAgICAgICBjb25zb2xlLmxvZygnZWRpdCcsIHN0YXRlLCBhY3Rpb24pXG4vLyAgICAgICB9XG4vLyAgICAgfVxuLy8gICB9XG4vLyB9KVxuXG4vLyB0cmVlKHN0YXRlLCB7XG4vLyAgIHR5cGU6ICdyZW5hbWUgYm9vaycsXG4vLyAgIHBheWxvYWQ6IHtcbi8vICAgICBuYW1lOiAnbmV3IG5hbWUnXG4vLyAgIH1cbi8vIH0pXG5cbi8vIHRyZWUoc3RhdGUsIHtcbi8vICAgdHlwZTogJ2FkZCBib29rLnBhZ2VzJyxcbi8vICAgcGF5bG9hZDogW1xuLy8gICAgIHtcbi8vICAgICAgIG51bWJlcjogJzMnLFxuLy8gICAgICAgdGV4dDogJ2Fub3RoZXIgZ3JlYXQgcGFnZSdcbi8vICAgICB9XG4vLyAgIF1cbi8vIH0pXG5cbi8vIHZhciBzID0gdHJlZShzdGF0ZSwge1xuLy8gICB0eXBlOiAnZWRpdCBib29rLnBhZ2VzJyxcbi8vICAgcGF5bG9hZDoge1xuLy8gICAgIG51bWJlcjogNSxcbi8vICAgICB0ZXh0OiAnYW5vdGhlciBncmVhdCBwYWdlJ1xuLy8gICB9XG4vLyB9KVxuIiwiLyoqXG4gKiBNb2R1bGUgZGVwZW5kZW5jaWVzXG4gKi9cblxudmFyIHVwZGF0ZSA9IHJlcXVpcmUoJy4vdXBkYXRlJylcbnZhciB0cmVlID0gcmVxdWlyZSgnLi90cmVlJylcbnZhciBpc29iaiA9IHJlcXVpcmUoJ2lzb2JqJylcblxuLyoqXG4gKiBFeHBvcnQgYHJlZHVjZXJgXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSByZWR1Y2VyO1xuXG4vKipcbiAqIEluaXRpYWxpemUgYHJlZHVjZXJgXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbnxPYmplY3R9IGZuXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAqL1xuXG5mdW5jdGlvbiByZWR1Y2VyIChmbikge1xuICBmbiA9IGlzb2JqKGZuKSA/IHRyZWUoZm4pIDogZm5cbiAgcmV0dXJuIGZ1bmN0aW9uIHJlZHVjZSAoc3RhdGUsIGFjdGlvbikge1xuICAgIHZhciB1cGRhdGVzID0gZm4oc3RhdGUsIGFjdGlvbilcbiAgICByZXR1cm4gdXBkYXRlKHN0YXRlLCB1cGRhdGVzKVxuICB9XG59XG4iLCIndXNlIHN0cmljdCdcblxuLyoqXG4gKiBNb2R1bGUgRGVwZW5kZW5jaWVzXG4gKi9cblxudmFyIGFzc2lnbiA9IHJlcXVpcmUoJ29iamVjdC1hc3NpZ24nKVxudmFyIHJlZHVjZXIgPSByZXF1aXJlKCcuL3JlZHVjZXInKVxudmFyIHJlc29sdmUgPSByZXF1aXJlKCcuL3Jlc29sdmUnKVxudmFyIGZyZWV6ZSA9IHJlcXVpcmUoJy4vZnJlZXplJylcbnZhciBzbGljZWQgPSByZXF1aXJlKCdzbGljZWQnKVxudmFyIHJlZHV4ID0gcmVxdWlyZSgncmVkdXgnKVxudmFyIGlzQXJyYXkgPSBBcnJheS5pc0FycmF5XG5cbi8qKlxuICogUmVkdXggbWV0aG9kc1xuICovXG5cbnZhciBNaWRkbGV3YXJlID0gcmVkdXguYXBwbHlNaWRkbGV3YXJlXG52YXIgU3RvcmUgPSByZWR1eC5jcmVhdGVTdG9yZVxuXG4vKipcbiAqIEV4cG9ydCBgU29jcmF0ZXNgXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBTb2NyYXRlc1xuXG4vKipcbiAqIEluaXRpYWxpemUgYFNvY3JhdGVzYFxuICpcbiAqIEBwYXJhbSB7QXJyYXl9IG1pZGRsZXdhcmVzXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSByb290IHJlZHVjZXJcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufSBzb2NyYXRlc1xuICovXG5cbmZ1bmN0aW9uIFNvY3JhdGVzIChtaWRkbGV3YXJlcywgcmVkdWNlKSB7XG4gIGlmICghaXNBcnJheShtaWRkbGV3YXJlcykpIHJlZHVjZSA9IG1pZGRsZXdhcmVzLCBtaWRkbGV3YXJlcyA9IFtdXG4gIG1pZGRsZXdhcmVzID0gW3Jlc29sdmVdLmNvbmNhdChtaWRkbGV3YXJlcylcbiAgcmVkdWNlID0gcmVkdWNlIHx8IGlkZW50aXR5XG5cbiAgLy8gY3JlYXRlIG91ciByZWR1eCBjbGllbnRcbiAgdmFyIHJlZHV4ID0gU3RvcmUocmVkdWNlcihyZWR1Y2UpLCB7fSwgTWlkZGxld2FyZS5hcHBseShudWxsLCBtaWRkbGV3YXJlcykpXG5cbiAgLy8gaW5pdGlhbGl6ZSBhIHN0b3JlXG4gIGZ1bmN0aW9uIHN0b3JlIChhY3Rpb24pIHtcbiAgICB2YXIgYXJyYXlfY29udGV4dCA9IGlzQXJyYXkodGhpcylcbiAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGggJiYgIWFycmF5X2NvbnRleHQpIHJldHVybiBmcmVlemUocmVkdXguZ2V0U3RhdGUoKSlcbiAgICB2YXIgYWN0aW9ucyA9IGFycmF5X2NvbnRleHQgPyBzbGljZWQodGhpcykgOiBzbGljZWQoYXJndW1lbnRzKVxuICAgIGFjdGlvbnMgPSB3cmFwX2VtaXR0ZXJfc3R5bGUoYWN0aW9ucylcbiAgICByZXR1cm4gcmVkdXguZGlzcGF0Y2guYXBwbHkocmVkdXgsIGFjdGlvbnMpXG4gIH1cblxuICAvLyBzdWJzY3JpYmUgdG8gY2hhbmdlc1xuICBzdG9yZS5zdWJzY3JpYmUgPSBmdW5jdGlvbiBzdWJzY3JpYmUgKGZuKSB7XG4gICAgcmV0dXJuIHJlZHV4LnN1YnNjcmliZShmdW5jdGlvbiBsaXN0ZW5lciAoKSB7XG4gICAgICByZXR1cm4gZm4oZnJlZXplKHJlZHV4LmdldFN0YXRlKCkpKVxuICAgIH0pXG4gIH1cblxuICByZXR1cm4gc3RvcmVcbn1cblxuLyoqXG4gKiBNYXliZSB3cmFwIHRoZSBlbWl0dGVyIHN0eWxlXG4gKiBpbnRvIGEgZmx1eCBzdGFuZGFyZCBhY3Rpb25cbiAqXG4gKiBAcGFyYW0ge0FycmF5fSBhY3Rpb25zXG4gKiBAcmV0dXJuIHtBcnJheX1cbiAqL1xuXG5mdW5jdGlvbiB3cmFwX2VtaXR0ZXJfc3R5bGUgKGFjdGlvbnMpIHtcbiAgaWYgKGFjdGlvbnMubGVuZ3RoIDwgMikgcmV0dXJuIGFjdGlvbnNcbiAgaWYgKHR5cGVvZiBhY3Rpb25zWzBdICE9PSAnc3RyaW5nJykgcmV0dXJuIGFjdGlvbnNcbiAgcmV0dXJuIFt7XG4gICAgdHlwZTogYWN0aW9uc1swXSxcbiAgICBwYXlsb2FkOiBhc3NpZ24uYXBwbHkobnVsbCwgYWN0aW9ucy5zbGljZSgxKSlcbiAgfV1cbn1cblxuLyoqXG4gKiBJZGVudGl0eSBmdW5jdGlvbiB0aGF0XG4gKiBqdXN0IGJ1aWxkcyBvbiBhbiBhY3Rpb24ncyBwYXlsb2FkXG4gKi9cblxuZnVuY3Rpb24gaWRlbnRpdHkgKHN0YXRlLCBhY3Rpb24pIHtcbiAgcmV0dXJuIGFjdGlvbi5wYXlsb2FkXG59XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBfZXh0ZW5kcyA9IE9iamVjdC5hc3NpZ24gfHwgZnVuY3Rpb24gKHRhcmdldCkgeyBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykgeyB2YXIgc291cmNlID0gYXJndW1lbnRzW2ldOyBmb3IgKHZhciBrZXkgaW4gc291cmNlKSB7IGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoc291cmNlLCBrZXkpKSB7IHRhcmdldFtrZXldID0gc291cmNlW2tleV07IH0gfSB9IHJldHVybiB0YXJnZXQ7IH07IC8qKlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICogTW9kdWxlIERlcGVuZGVuY2llc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICovXG5cbnZhciBfcHJlYWN0U29jcmF0ZXMgPSByZXF1aXJlKCdwcmVhY3Qtc29jcmF0ZXMnKTtcblxudmFyIF9yZWR1eExvZ2dlciA9IHJlcXVpcmUoJ3JlZHV4LWxvZ2dlcicpO1xuXG52YXIgX3JlZHV4TG9nZ2VyMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3JlZHV4TG9nZ2VyKTtcblxudmFyIF9zb2NyYXRlcyA9IHJlcXVpcmUoJ3NvY3JhdGVzJyk7XG5cbnZhciBfc29jcmF0ZXMyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfc29jcmF0ZXMpO1xuXG52YXIgX2hpc3RvcnkgPSByZXF1aXJlKCdoaXN0b3J5Jyk7XG5cbnZhciBfaGlzdG9yeTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9oaXN0b3J5KTtcblxudmFyIF9lbnJvdXRlID0gcmVxdWlyZSgnZW5yb3V0ZScpO1xuXG52YXIgX2Vucm91dGUyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfZW5yb3V0ZSk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IGRlZmF1bHQ6IG9iaiB9OyB9XG5cbi8qKlxuICogSW5pdGlhbGl6ZSBTb2NyYXRlc1xuICpcbiAqIEJ5IGRlZmF1bHQsIGl0IHdpbGwganVzdCBzdG9yZSB3aGF0IHlvdSBwYXNzIGluLFxuICogd2hpY2ggaXMgZmluZSBmb3IgdGhpcyBkZW1vLCBidXQgeW91J2xsIHByb2JhYmx5XG4gKiB3YW50IHRvIHVzZSB5b3VyIG93biByZWR1Y2VyIGlmIHlvdSdyZSBhY3R1YWxseVxuICogYnVpbGRpbmcgYW4gYXBwXG4gKi9cblxudmFyIHN0b3JlID0gKDAsIF9zb2NyYXRlczIuZGVmYXVsdCkoWygwLCBfcmVkdXhMb2dnZXIyLmRlZmF1bHQpKCksICgwLCBfaGlzdG9yeTIuZGVmYXVsdCkoKV0pO1xuXG4vKipcbiAqIEFwcFxuICovXG5cbnZhciBBcHAgPSBmdW5jdGlvbiBBcHAocHJvcHMpIHtcbiAgcmV0dXJuICgwLCBfZW5yb3V0ZTIuZGVmYXVsdCkoe1xuICAgICcvYmxvZyc6IGZ1bmN0aW9uIGJsb2cocGFyYW1zKSB7XG4gICAgICByZXR1cm4gKDAsIF9wcmVhY3RTb2NyYXRlcy5oKShCbG9nLCBfZXh0ZW5kcyh7fSwgcGFyYW1zLCBwcm9wcykpO1xuICAgIH0sXG4gICAgJyonOiBmdW5jdGlvbiBfKHBhcmFtcykge1xuICAgICAgcmV0dXJuICgwLCBfcHJlYWN0U29jcmF0ZXMuaCkoSG9tZSwgX2V4dGVuZHMoe30sIHBhcmFtcywgcHJvcHMpKTtcbiAgICB9XG4gIH0pKHByb3BzLnVybCk7XG59O1xuXG4vKipcbiAqIEhvbWVcbiAqL1xuXG52YXIgSG9tZSA9IGZ1bmN0aW9uIEhvbWUoX3JlZikge1xuICB2YXIgZGlzcGF0Y2ggPSBfcmVmLmRpc3BhdGNoO1xuICB2YXIgZ3JlZXRpbmcgPSBfcmVmLmdyZWV0aW5nO1xuICByZXR1cm4gKDAsIF9wcmVhY3RTb2NyYXRlcy5oKShcbiAgICAnZGl2JyxcbiAgICB7ICdjbGFzcyc6ICdob21lJyB9LFxuICAgICgwLCBfcHJlYWN0U29jcmF0ZXMuaCkoXG4gICAgICAnaDInLFxuICAgICAgbnVsbCxcbiAgICAgIGdyZWV0aW5nXG4gICAgKSxcbiAgICAoMCwgX3ByZWFjdFNvY3JhdGVzLmgpKFxuICAgICAgJ2J1dHRvbicsXG4gICAgICB7IG9uQ2xpY2s6IGZ1bmN0aW9uIG9uQ2xpY2soZSkge1xuICAgICAgICAgIHJldHVybiBkaXNwYXRjaCgnbmF2aWdhdGUnLCB7IHVybDogJy9ibG9nJyB9KTtcbiAgICAgICAgfSB9LFxuICAgICAgJ0dvIHRvIHRoZSBibG9nJ1xuICAgIClcbiAgKTtcbn07XG5cbi8qKlxuICogQmxvZ1xuICovXG5cbnZhciBCbG9nID0gZnVuY3Rpb24gQmxvZyhfcmVmMikge1xuICB2YXIgZGlzcGF0Y2ggPSBfcmVmMi5kaXNwYXRjaDtcbiAgcmV0dXJuICgwLCBfcHJlYWN0U29jcmF0ZXMuaCkoXG4gICAgJ2RpdicsXG4gICAgeyAnY2xhc3MnOiAnYmxvZycgfSxcbiAgICAoMCwgX3ByZWFjdFNvY3JhdGVzLmgpKFxuICAgICAgJ2gyJyxcbiAgICAgIG51bGwsXG4gICAgICAnV2VsY29tZSB0byB0aGUgQmxvZyEnXG4gICAgKSxcbiAgICAoMCwgX3ByZWFjdFNvY3JhdGVzLmgpKFxuICAgICAgJ2J1dHRvbicsXG4gICAgICB7IG9uQ2xpY2s6IGZ1bmN0aW9uIG9uQ2xpY2soZSkge1xuICAgICAgICAgIHJldHVybiBkaXNwYXRjaCgnbmF2aWdhdGUnLCB7IHVybDogJy8nIH0pO1xuICAgICAgICB9IH0sXG4gICAgICAnR28gYmFjayB0byBIb21lJ1xuICAgIClcbiAgKTtcbn07XG5cbi8qKlxuICogSW5pdGlhbGl6ZSB0aGUgc3RvcmVcbiAqL1xuXG5zdG9yZSgnYm9vdCcsIHtcbiAgdXJsOiBkb2N1bWVudC5sb2NhdGlvbi5wYXRobmFtZSxcbiAgZ3JlZXRpbmc6ICdXZWxjb21lIHRvIHRoZSB3ZWJzaXRlLCBmcmllbmQhJ1xufSk7XG5cbi8qKlxuICogUmVuZGVyXG4gKi9cblxuKDAsIF9wcmVhY3RTb2NyYXRlcy5yZW5kZXIpKEFwcCwgc3RvcmUsIGRvY3VtZW50LmJvZHkpOyJdfQ==