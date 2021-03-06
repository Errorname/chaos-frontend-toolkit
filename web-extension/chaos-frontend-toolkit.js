(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.chaosFrontendToolkit = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
class BlackAndWhite {
  start() {
    if (this.previousFilter) {
      return
    }

    this.previousFilter = document.documentElement.style.filter || ''

    document.documentElement.style.filter = 'grayscale(1) ' + this.previousFilter
  }

  stop() {
    if (this.previousFilter === undefined) {
      return
    }

    document.documentElement.style.filter = this.previousFilter
    this.previousFilter = undefined
  }

  getStatus() {
    return {
      running: this.previousFilter !== undefined,
    }
  }
}

module.exports = new BlackAndWhite()

},{}],2:[function(require,module,exports){
const defaultOptions = {
  delay: 100,
}

class DoubleClicks {
  options = defaultOptions

  start(options = {}) {
    if (this.secondClick) {
      return
    }

    this.options = {
      ...defaultOptions,
      ...options,
    }

    this.secondClick = (evt) => {
      let { target } = evt

      // If click originates from user
      if (evt.pointerId > 0) {
        this.timeoutId = setTimeout(() => {
          if (!target) {
            return
          }

          while (!target.click && target.parentNode) {
            target = target.parentNode
          }

          target.click()
        }, this.options.delay)
      }
    }

    document.body.addEventListener('click', this.secondClick)
  }

  stop() {
    if (!this.secondClick) {
      return
    }

    document.body.removeEventListener('click', this.secondClick)
    clearTimeout(this.timeoutId)
    this.secondClick = undefined
  }

  getStatus() {
    return {
      running: this.secondClick !== undefined,
      options: this.options,
    }
  }
}

module.exports = new DoubleClicks()

},{}],3:[function(require,module,exports){
const gremlins = require('gremlins.js')

const defaultOptions = {
  numberOfWaves: 100,
}

class Gremlins {
  options = defaultOptions

  start(options = {}) {
    if (this.horde) {
      return
    }

    this.options = {
      ...defaultOptions,
      ...options,
    }

    this.horde = gremlins.createHorde({
      strategies: [
        gremlins.strategies.allTogether({
          delay: 10,
          nb: this.options.numberOfWaves,
        }),
      ],
    })
    this.horde.unleash().then(() => {
      this.stop()
    })
  }

  stop() {
    if (!this.horde) {
      return
    }

    this.horde.stop()
    this.horde = undefined
  }

  getStatus() {
    return {
      running: !!this.horde,
      options: this.options,
    }
  }
}

module.exports = new Gremlins()

},{"gremlins.js":14}],4:[function(require,module,exports){
const defaultOptions = {
  interval: 60,
  probabilityOfSwitch: 0.1,
}

class HistorySwitch {
  options = defaultOptions

  start(options = {}) {
    if (this.intervalId) {
      return
    }

    this.options = {
      ...defaultOptions,
      ...options,
    }

    this.intervalId = setInterval(() => {
      const rnd = Math.random()

      if (rnd < this.options.probabilityOfSwitch) {
        console.info('[Chaos] Switched history back')
        window.history.back()
      } else if (rnd < this.options.probabilityOfSwitch * 2) {
        console.info('[Chaos] Switched history forward')
        window.history.forward()
      }
    }, options.interval * 1000)
  }

  stop() {
    if (!this.intervalId) {
      return
    }

    clearInterval(this.intervalId)
    this.intervalId = undefined
  }

  getStatus() {
    return {
      running: this.intervalId !== undefined,
      options: this.options,
    }
  }
}

module.exports = new HistorySwitch()

},{}],5:[function(require,module,exports){
module.exports = {
  blackAndWhite: require('./black-and-white'),
  doubleClicks: require('./double-clicks'),
  gremlins: require('./gremlins'),
  historySwitch: require('./history-switch'),
  pseudoLocalization: require('./pseudo-localization'),
  requestDelaying: require('./request-delaying'),
  requestDenylist: require('./request-denylist'),
  requestFailing: require('./request-failing'),
  timerThrottling: require('./timer-throttling'),
}

},{"./black-and-white":1,"./double-clicks":2,"./gremlins":3,"./history-switch":4,"./pseudo-localization":6,"./request-delaying":7,"./request-denylist":8,"./request-failing":9,"./timer-throttling":10}],6:[function(require,module,exports){
const pseudoLocalization = require('pseudo-localization').default

const defaultOptions = {
  strategy: 'accented',
}

class PseudoLocalization {
  running = false
  options = defaultOptions

  start(options = {}) {
    if (this.running) {
      return
    }

    this.options = {
      ...defaultOptions,
      ...options,
    }

    pseudoLocalization.start(this.options)
    this.running = true
  }

  stop() {
    if (!this.running) {
      return
    }

    pseudoLocalization.stop()

    // Unfortunately, this is required to clean the DOM
    location.reload()
  }

  getStatus() {
    return {
      running: this.running,
      options: this.options,
    }
  }
}

module.exports = new PseudoLocalization()

},{"pseudo-localization":16}],7:[function(require,module,exports){
const defaultOptions = {
  maxDelay: 15000,
  probabilityOfDelay: 0.5,
}

class RequestDelaying {
  options = defaultOptions

  start(options = {}) {
    if (this._fetch) {
      return
    }

    this.options = {
      ...defaultOptions,
      ...options,
    }

    /* FETCH */

    this._fetch = window.fetch

    window.fetch = (...args) => {
      if (Math.random() < this.options.probabilityOfDelay) {
        const delay = Math.random() ** 2 * this.options.maxDelay

        return new Promise((resolve) => {
          setTimeout(() => {
            this._fetch(...args).then(resolve)
          }, delay)
        })
      }

      return this._fetch(...args)
    }

    /* XHR */

    this._xhr = window.XMLHttpRequest
    const that = this

    window.XMLHttpRequest = function () {
      const xhr = new that._xhr()

      xhr._open = xhr.open
      xhr.open = (...args) => {
        let promise

        if (Math.random() < that.options.probabilityOfDelay) {
          const delay = Math.random() ** 2 * that.options.maxDelay

          promise = new Promise((resolve) => setTimeout(resolve, delay))
        } else {
          promise = Promise.resolve()
        }

        xhr._open(...args)
        xhr._promise = promise
      }

      xhr._send = xhr.send
      xhr.send = (...args) => {
        ;(xhr._promise || Promise.resolve()).then(() => xhr._send(...args))
      }

      return xhr
    }
  }

  stop() {
    if (!this._fetch) {
      return
    }

    window.fetch = this._fetch
    this._fetch = undefined

    window.XMLHttpRequest = this._xhr
    this._xhr = undefined
  }

  getStatus() {
    return {
      running: this._fetch !== undefined,
      options: this.options,
    }
  }
}

module.exports = new RequestDelaying()

},{}],8:[function(require,module,exports){
const defaultOptions = {
  list: [],
}

class RequestDenylist {
  options = defaultOptions

  start(options = {}) {
    if (this._fetch) {
      return
    }

    this.options = {
      ...defaultOptions,
      ...options,
    }

    /* FETCH */

    this._fetch = window.fetch

    window.fetch = (...args) => {
      let url

      if (args[0] instanceof Request) {
        url = args[0].url
      } else if (typeof args[0] === 'string') {
        url = args[0]
      }

      if (url && this.options.list.some((pattern) => url.match(pattern))) {
        console.log(`[Chaos] Simulating 403 HTTP error for ${xhr._url}`)

        return Promise.reject(
          new Response(null, {
            status: 403,
            statusText: 'Forbidden',
          })
        )
      }

      return this._fetch(...args)
    }

    /* XHR */

    this._xhr = window.XMLHttpRequest
    const that = this

    window.XMLHttpRequest = function () {
      const xhr = new that._xhr()

      xhr._open = xhr.open
      xhr.open = (...args) => {
        if (args[0].startsWith('http')) {
          xhr._url = args[0]
        } else if (args[1].startsWith('http')) {
          xhr._url = args[1]
        }

        return xhr._open(...args)
      }

      xhr._send = xhr.send
      xhr.send = (...args) => {
        if (xhr._url && that.options.list.some((pattern) => xhr._url.match(pattern))) {
          Object.defineProperty(xhr, 'readyState', {
            value: 4,
            writable: true,
          })
          Object.defineProperty(xhr, 'status', {
            value: 403,
            writable: true,
          })
          Object.defineProperty(xhr, 'statusText', {
            value: '403 Forbidden',
            writable: true,
          })

          console.log(`[Chaos] Simulating 403 HTTP error for ${xhr._url}`)

          setTimeout(() => {
            xhr.dispatchEvent(new Event('error'))
            xhr.onreadystatechange?.()
          }, 200)
          return
        }

        xhr._send(...args)
      }

      return xhr
    }
  }

  stop() {
    if (!this._fetch) {
      return
    }

    window.fetch = this._fetch
    this._fetch = undefined

    window.XMLHttpRequest = this._xhr
    this._xhr = undefined
  }

  getStatus() {
    return {
      running: this._fetch !== undefined,
      options: this.options,
    }
  }
}

module.exports = new RequestDenylist()

},{}],9:[function(require,module,exports){
const defaultOptions = {
  probabilityOfFail: 0.05,
}

class RequestFailing {
  options = defaultOptions

  start(options = {}) {
    if (this._fetch) {
      return
    }

    this.options = {
      ...defaultOptions,
      ...options,
    }

    /* FETCH */

    this._fetch = window.fetch

    window.fetch = (...args) => {
      const isFailing = Math.random() < this.options.probabilityOfFail

      if (isFailing) {
        console.log(`[Chaos] Simulating HTTP 500 Internal Server Error for ${xhr._url}`)

        return Promise.reject(
          new Response(null, {
            status: 500,
            statusText: 'Internal Server Error',
          })
        )
      }

      return this._fetch(...args)
    }

    /* XHR */

    this._xhr = window.XMLHttpRequest
    const that = this

    window.XMLHttpRequest = function () {
      const xhr = new that._xhr()

      xhr._send = xhr.send
      xhr.send = (...args) => {
        const isFailing = Math.random() < that.options.probabilityOfFail

        if (isFailing) {
          Object.defineProperty(xhr, 'readyState', {
            value: 4,
            writable: true,
          })
          Object.defineProperty(xhr, 'status', {
            value: 500,
            writable: true,
          })
          Object.defineProperty(xhr, 'statusText', {
            value: '500 Internal Server Error',
            writable: true,
          })

          console.log(`[Chaos] Simulating HTTP 500 Internal Server Error for ${xhr._url}`)

          setTimeout(() => {
            xhr.dispatchEvent(new Event('error'))
            xhr.onreadystatechange?.()
          }, 200)
          return
        }

        xhr._send(...args)
      }

      return xhr
    }
  }

  stop() {
    if (!this._fetch) {
      return
    }

    window.fetch = this._fetch
    this._fetch = undefined

    window.XMLHttpRequest = this._xhr
    this._xhr = undefined
  }

  getStatus() {
    return {
      running: this._fetch !== undefined,
      options: this.options,
    }
  }
}

module.exports = new RequestFailing()

},{}],10:[function(require,module,exports){
const defaultOptions = {
  probabilityOfDelay: 0.5,
  maxDelayDeviation: 500,
}

class TimerThrottling {
  options = defaultOptions

  start(options = {}) {
    if (this._setTimeout || this._setInterval) {
      return
    }

    this.options = {
      ...defaultOptions,
      ...options,
    }

    this._setTimeout = window.setTimeout
    this._setInterval = window.setInterval

    const addDelay =
      (initialFn) =>
      (fn, delay = 0, ...args) => {
        if (Math.random() > this.options.probabilityOfDelay) {
          delay +=
            Math.floor(Math.random() * this.options.maxDelayDeviation * 2) -
            this.options.maxDelayDeviation
        }

        return initialFn(fn, delay, ...args)
      }

    window.setTimeout = addDelay(this._setTimeout)
    window.setInterval = addDelay(this._setInterval)
  }

  stop() {
    if (!this._setTimeout || !this._setInterval) {
      return
    }

    window.setTimeout = this._setTimeout
    window.setInterval = this._setInterval
    this._setTimeout = undefined
    this._setInterval = undefined
  }

  getStatus() {
    return {
      running: this._setTimeout !== undefined,
      options: this.options,
    }
  }
}

module.exports = new TimerThrottling()

},{}],11:[function(require,module,exports){
const experiments = require('./experiments')

class ChaosFrontendToolkit {
  start(options = {}) {
    this.stop()

    this.currentOptions = options

    for (const [name, experimentOptions] of Object.entries(this.currentOptions)) {
      if (experiments[name] && experimentOptions) {
        if (experimentOptions === true) {
          experiments[name].start()
        } else {
          experiments[name].start(experimentOptions)
        }
      }
    }
  }

  stop() {
    for (const experiment of Object.values(experiments)) {
      experiment.stop()
    }
  }

  getStatus() {
    const experimentsStatuses = Object.fromEntries(
      Object.entries(experiments).map(([name, experiment]) => [name, experiment.getStatus()])
    )

    return {
      running:
        Object.keys(experimentsStatuses).filter((name) => experimentsStatuses[name].running)
          .length > 0,
      experiments: experimentsStatuses,
    }
  }
}

const chaosFrontendToolkit = new ChaosFrontendToolkit()

for (const [name, experiment] of Object.entries(experiments)) {
  chaosFrontendToolkit[name] = experiment
}

module.exports = chaosFrontendToolkit

},{"./experiments":5}],12:[function(require,module,exports){
'use strict'

exports.byteLength = byteLength
exports.toByteArray = toByteArray
exports.fromByteArray = fromByteArray

var lookup = []
var revLookup = []
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
for (var i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code[i]
  revLookup[code.charCodeAt(i)] = i
}

// Support decoding URL-safe base64 strings, as Node.js does.
// See: https://en.wikipedia.org/wiki/Base64#URL_applications
revLookup['-'.charCodeAt(0)] = 62
revLookup['_'.charCodeAt(0)] = 63

function getLens (b64) {
  var len = b64.length

  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }

  // Trim off extra bytes after placeholder bytes are found
  // See: https://github.com/beatgammit/base64-js/issues/42
  var validLen = b64.indexOf('=')
  if (validLen === -1) validLen = len

  var placeHoldersLen = validLen === len
    ? 0
    : 4 - (validLen % 4)

  return [validLen, placeHoldersLen]
}

// base64 is 4/3 + up to two characters of the original data
function byteLength (b64) {
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function _byteLength (b64, validLen, placeHoldersLen) {
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function toByteArray (b64) {
  var tmp
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]

  var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen))

  var curByte = 0

  // if there are placeholders, only get up to the last complete 4 chars
  var len = placeHoldersLen > 0
    ? validLen - 4
    : validLen

  var i
  for (i = 0; i < len; i += 4) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 18) |
      (revLookup[b64.charCodeAt(i + 1)] << 12) |
      (revLookup[b64.charCodeAt(i + 2)] << 6) |
      revLookup[b64.charCodeAt(i + 3)]
    arr[curByte++] = (tmp >> 16) & 0xFF
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 2) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 2) |
      (revLookup[b64.charCodeAt(i + 1)] >> 4)
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 1) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 10) |
      (revLookup[b64.charCodeAt(i + 1)] << 4) |
      (revLookup[b64.charCodeAt(i + 2)] >> 2)
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  return arr
}

function tripletToBase64 (num) {
  return lookup[num >> 18 & 0x3F] +
    lookup[num >> 12 & 0x3F] +
    lookup[num >> 6 & 0x3F] +
    lookup[num & 0x3F]
}

function encodeChunk (uint8, start, end) {
  var tmp
  var output = []
  for (var i = start; i < end; i += 3) {
    tmp =
      ((uint8[i] << 16) & 0xFF0000) +
      ((uint8[i + 1] << 8) & 0xFF00) +
      (uint8[i + 2] & 0xFF)
    output.push(tripletToBase64(tmp))
  }
  return output.join('')
}

function fromByteArray (uint8) {
  var tmp
  var len = uint8.length
  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
  var parts = []
  var maxChunkLength = 16383 // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)))
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1]
    parts.push(
      lookup[tmp >> 2] +
      lookup[(tmp << 4) & 0x3F] +
      '=='
    )
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + uint8[len - 1]
    parts.push(
      lookup[tmp >> 10] +
      lookup[(tmp >> 4) & 0x3F] +
      lookup[(tmp << 2) & 0x3F] +
      '='
    )
  }

  return parts.join('')
}

},{}],13:[function(require,module,exports){
(function (Buffer){(function (){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */

'use strict'

var base64 = require('base64-js')
var ieee754 = require('ieee754')

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50

var K_MAX_LENGTH = 0x7fffffff
exports.kMaxLength = K_MAX_LENGTH

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Print warning and recommend using `buffer` v4.x which has an Object
 *               implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * We report that the browser does not support typed arrays if the are not subclassable
 * using __proto__. Firefox 4-29 lacks support for adding new properties to `Uint8Array`
 * (See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438). IE 10 lacks support
 * for __proto__ and has a buggy typed array implementation.
 */
Buffer.TYPED_ARRAY_SUPPORT = typedArraySupport()

if (!Buffer.TYPED_ARRAY_SUPPORT && typeof console !== 'undefined' &&
    typeof console.error === 'function') {
  console.error(
    'This browser lacks typed array (Uint8Array) support which is required by ' +
    '`buffer` v5.x. Use `buffer` v4.x if you require old browser support.'
  )
}

function typedArraySupport () {
  // Can typed array instances can be augmented?
  try {
    var arr = new Uint8Array(1)
    arr.__proto__ = { __proto__: Uint8Array.prototype, foo: function () { return 42 } }
    return arr.foo() === 42
  } catch (e) {
    return false
  }
}

Object.defineProperty(Buffer.prototype, 'parent', {
  enumerable: true,
  get: function () {
    if (!Buffer.isBuffer(this)) return undefined
    return this.buffer
  }
})

Object.defineProperty(Buffer.prototype, 'offset', {
  enumerable: true,
  get: function () {
    if (!Buffer.isBuffer(this)) return undefined
    return this.byteOffset
  }
})

function createBuffer (length) {
  if (length > K_MAX_LENGTH) {
    throw new RangeError('The value "' + length + '" is invalid for option "size"')
  }
  // Return an augmented `Uint8Array` instance
  var buf = new Uint8Array(length)
  buf.__proto__ = Buffer.prototype
  return buf
}

/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */

function Buffer (arg, encodingOrOffset, length) {
  // Common case.
  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new TypeError(
        'The "string" argument must be of type string. Received type number'
      )
    }
    return allocUnsafe(arg)
  }
  return from(arg, encodingOrOffset, length)
}

// Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
if (typeof Symbol !== 'undefined' && Symbol.species != null &&
    Buffer[Symbol.species] === Buffer) {
  Object.defineProperty(Buffer, Symbol.species, {
    value: null,
    configurable: true,
    enumerable: false,
    writable: false
  })
}

Buffer.poolSize = 8192 // not used by this implementation

function from (value, encodingOrOffset, length) {
  if (typeof value === 'string') {
    return fromString(value, encodingOrOffset)
  }

  if (ArrayBuffer.isView(value)) {
    return fromArrayLike(value)
  }

  if (value == null) {
    throw TypeError(
      'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
      'or Array-like Object. Received type ' + (typeof value)
    )
  }

  if (isInstance(value, ArrayBuffer) ||
      (value && isInstance(value.buffer, ArrayBuffer))) {
    return fromArrayBuffer(value, encodingOrOffset, length)
  }

  if (typeof value === 'number') {
    throw new TypeError(
      'The "value" argument must not be of type number. Received type number'
    )
  }

  var valueOf = value.valueOf && value.valueOf()
  if (valueOf != null && valueOf !== value) {
    return Buffer.from(valueOf, encodingOrOffset, length)
  }

  var b = fromObject(value)
  if (b) return b

  if (typeof Symbol !== 'undefined' && Symbol.toPrimitive != null &&
      typeof value[Symbol.toPrimitive] === 'function') {
    return Buffer.from(
      value[Symbol.toPrimitive]('string'), encodingOrOffset, length
    )
  }

  throw new TypeError(
    'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
    'or Array-like Object. Received type ' + (typeof value)
  )
}

/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/
Buffer.from = function (value, encodingOrOffset, length) {
  return from(value, encodingOrOffset, length)
}

// Note: Change prototype *after* Buffer.from is defined to workaround Chrome bug:
// https://github.com/feross/buffer/pull/148
Buffer.prototype.__proto__ = Uint8Array.prototype
Buffer.__proto__ = Uint8Array

function assertSize (size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be of type number')
  } else if (size < 0) {
    throw new RangeError('The value "' + size + '" is invalid for option "size"')
  }
}

function alloc (size, fill, encoding) {
  assertSize(size)
  if (size <= 0) {
    return createBuffer(size)
  }
  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpretted as a start offset.
    return typeof encoding === 'string'
      ? createBuffer(size).fill(fill, encoding)
      : createBuffer(size).fill(fill)
  }
  return createBuffer(size)
}

/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/
Buffer.alloc = function (size, fill, encoding) {
  return alloc(size, fill, encoding)
}

function allocUnsafe (size) {
  assertSize(size)
  return createBuffer(size < 0 ? 0 : checked(size) | 0)
}

/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
Buffer.allocUnsafe = function (size) {
  return allocUnsafe(size)
}
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */
Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(size)
}

function fromString (string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8'
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('Unknown encoding: ' + encoding)
  }

  var length = byteLength(string, encoding) | 0
  var buf = createBuffer(length)

  var actual = buf.write(string, encoding)

  if (actual !== length) {
    // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    buf = buf.slice(0, actual)
  }

  return buf
}

function fromArrayLike (array) {
  var length = array.length < 0 ? 0 : checked(array.length) | 0
  var buf = createBuffer(length)
  for (var i = 0; i < length; i += 1) {
    buf[i] = array[i] & 255
  }
  return buf
}

function fromArrayBuffer (array, byteOffset, length) {
  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('"offset" is outside of buffer bounds')
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('"length" is outside of buffer bounds')
  }

  var buf
  if (byteOffset === undefined && length === undefined) {
    buf = new Uint8Array(array)
  } else if (length === undefined) {
    buf = new Uint8Array(array, byteOffset)
  } else {
    buf = new Uint8Array(array, byteOffset, length)
  }

  // Return an augmented `Uint8Array` instance
  buf.__proto__ = Buffer.prototype
  return buf
}

function fromObject (obj) {
  if (Buffer.isBuffer(obj)) {
    var len = checked(obj.length) | 0
    var buf = createBuffer(len)

    if (buf.length === 0) {
      return buf
    }

    obj.copy(buf, 0, 0, len)
    return buf
  }

  if (obj.length !== undefined) {
    if (typeof obj.length !== 'number' || numberIsNaN(obj.length)) {
      return createBuffer(0)
    }
    return fromArrayLike(obj)
  }

  if (obj.type === 'Buffer' && Array.isArray(obj.data)) {
    return fromArrayLike(obj.data)
  }
}

function checked (length) {
  // Note: cannot use `length < K_MAX_LENGTH` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= K_MAX_LENGTH) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + K_MAX_LENGTH.toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (length) {
  if (+length != length) { // eslint-disable-line eqeqeq
    length = 0
  }
  return Buffer.alloc(+length)
}

Buffer.isBuffer = function isBuffer (b) {
  return b != null && b._isBuffer === true &&
    b !== Buffer.prototype // so Buffer.isBuffer(Buffer.prototype) will be false
}

Buffer.compare = function compare (a, b) {
  if (isInstance(a, Uint8Array)) a = Buffer.from(a, a.offset, a.byteLength)
  if (isInstance(b, Uint8Array)) b = Buffer.from(b, b.offset, b.byteLength)
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError(
      'The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array'
    )
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i]
      y = b[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'latin1':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!Array.isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers')
  }

  if (list.length === 0) {
    return Buffer.alloc(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; ++i) {
      length += list[i].length
    }
  }

  var buffer = Buffer.allocUnsafe(length)
  var pos = 0
  for (i = 0; i < list.length; ++i) {
    var buf = list[i]
    if (isInstance(buf, Uint8Array)) {
      buf = Buffer.from(buf)
    }
    if (!Buffer.isBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    }
    buf.copy(buffer, pos)
    pos += buf.length
  }
  return buffer
}

function byteLength (string, encoding) {
  if (Buffer.isBuffer(string)) {
    return string.length
  }
  if (ArrayBuffer.isView(string) || isInstance(string, ArrayBuffer)) {
    return string.byteLength
  }
  if (typeof string !== 'string') {
    throw new TypeError(
      'The "string" argument must be one of type string, Buffer, or ArrayBuffer. ' +
      'Received type ' + typeof string
    )
  }

  var len = string.length
  var mustMatch = (arguments.length > 2 && arguments[2] === true)
  if (!mustMatch && len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'latin1':
      case 'binary':
        return len
      case 'utf8':
      case 'utf-8':
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) {
          return mustMatch ? -1 : utf8ToBytes(string).length // assume utf8
        }
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

function slowToString (encoding, start, end) {
  var loweredCase = false

  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
  // property of a typed array.

  // This behaves neither like String nor Uint8Array in that we set start/end
  // to their upper/lower bounds if the value passed is out of range.
  // undefined is handled specially as per ECMA-262 6th Edition,
  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
  if (start === undefined || start < 0) {
    start = 0
  }
  // Return early if start > this.length. Done here to prevent potential uint32
  // coercion fail below.
  if (start > this.length) {
    return ''
  }

  if (end === undefined || end > this.length) {
    end = this.length
  }

  if (end <= 0) {
    return ''
  }

  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
  end >>>= 0
  start >>>= 0

  if (end <= start) {
    return ''
  }

  if (!encoding) encoding = 'utf8'

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'latin1':
      case 'binary':
        return latin1Slice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

// This property is used by `Buffer.isBuffer` (and the `is-buffer` npm package)
// to detect a Buffer instance. It's not possible to use `instanceof Buffer`
// reliably in a browserify context because there could be multiple different
// copies of the 'buffer' package in use. This method works even for Buffer
// instances that were created from another copy of the `buffer` package.
// See: https://github.com/feross/buffer/issues/154
Buffer.prototype._isBuffer = true

function swap (b, n, m) {
  var i = b[n]
  b[n] = b[m]
  b[m] = i
}

Buffer.prototype.swap16 = function swap16 () {
  var len = this.length
  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits')
  }
  for (var i = 0; i < len; i += 2) {
    swap(this, i, i + 1)
  }
  return this
}

Buffer.prototype.swap32 = function swap32 () {
  var len = this.length
  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits')
  }
  for (var i = 0; i < len; i += 4) {
    swap(this, i, i + 3)
    swap(this, i + 1, i + 2)
  }
  return this
}

Buffer.prototype.swap64 = function swap64 () {
  var len = this.length
  if (len % 8 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 64-bits')
  }
  for (var i = 0; i < len; i += 8) {
    swap(this, i, i + 7)
    swap(this, i + 1, i + 6)
    swap(this, i + 2, i + 5)
    swap(this, i + 3, i + 4)
  }
  return this
}

Buffer.prototype.toString = function toString () {
  var length = this.length
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.toLocaleString = Buffer.prototype.toString

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  str = this.toString('hex', 0, max).replace(/(.{2})/g, '$1 ').trim()
  if (this.length > max) str += ' ... '
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
  if (isInstance(target, Uint8Array)) {
    target = Buffer.from(target, target.offset, target.byteLength)
  }
  if (!Buffer.isBuffer(target)) {
    throw new TypeError(
      'The "target" argument must be one of type Buffer or Uint8Array. ' +
      'Received type ' + (typeof target)
    )
  }

  if (start === undefined) {
    start = 0
  }
  if (end === undefined) {
    end = target ? target.length : 0
  }
  if (thisStart === undefined) {
    thisStart = 0
  }
  if (thisEnd === undefined) {
    thisEnd = this.length
  }

  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index')
  }

  if (thisStart >= thisEnd && start >= end) {
    return 0
  }
  if (thisStart >= thisEnd) {
    return -1
  }
  if (start >= end) {
    return 1
  }

  start >>>= 0
  end >>>= 0
  thisStart >>>= 0
  thisEnd >>>= 0

  if (this === target) return 0

  var x = thisEnd - thisStart
  var y = end - start
  var len = Math.min(x, y)

  var thisCopy = this.slice(thisStart, thisEnd)
  var targetCopy = target.slice(start, end)

  for (var i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i]
      y = targetCopy[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf
function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
  // Empty buffer means no match
  if (buffer.length === 0) return -1

  // Normalize byteOffset
  if (typeof byteOffset === 'string') {
    encoding = byteOffset
    byteOffset = 0
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000
  }
  byteOffset = +byteOffset // Coerce to Number.
  if (numberIsNaN(byteOffset)) {
    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
    byteOffset = dir ? 0 : (buffer.length - 1)
  }

  // Normalize byteOffset: negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = buffer.length + byteOffset
  if (byteOffset >= buffer.length) {
    if (dir) return -1
    else byteOffset = buffer.length - 1
  } else if (byteOffset < 0) {
    if (dir) byteOffset = 0
    else return -1
  }

  // Normalize val
  if (typeof val === 'string') {
    val = Buffer.from(val, encoding)
  }

  // Finally, search either indexOf (if dir is true) or lastIndexOf
  if (Buffer.isBuffer(val)) {
    // Special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1
    }
    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
  } else if (typeof val === 'number') {
    val = val & 0xFF // Search for a byte value [0-255]
    if (typeof Uint8Array.prototype.indexOf === 'function') {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
      }
    }
    return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
  }

  throw new TypeError('val must be string, number or Buffer')
}

function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
  var indexSize = 1
  var arrLength = arr.length
  var valLength = val.length

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase()
    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
        encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1
      }
      indexSize = 2
      arrLength /= 2
      valLength /= 2
      byteOffset /= 2
    }
  }

  function read (buf, i) {
    if (indexSize === 1) {
      return buf[i]
    } else {
      return buf.readUInt16BE(i * indexSize)
    }
  }

  var i
  if (dir) {
    var foundIndex = -1
    for (i = byteOffset; i < arrLength; i++) {
      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
      } else {
        if (foundIndex !== -1) i -= i - foundIndex
        foundIndex = -1
      }
    }
  } else {
    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
    for (i = byteOffset; i >= 0; i--) {
      var found = true
      for (var j = 0; j < valLength; j++) {
        if (read(arr, i + j) !== read(val, j)) {
          found = false
          break
        }
      }
      if (found) return i
    }
  }

  return -1
}

Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
}

Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  var strLen = string.length

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; ++i) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (numberIsNaN(parsed)) return i
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function latin1Write (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset >>> 0
    if (isFinite(length)) {
      length = length >>> 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  } else {
    throw new Error(
      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
    )
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'latin1':
      case 'binary':
        return latin1Write(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
        : (firstByte > 0xBF) ? 2
          : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function latin1Slice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; ++i) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + (bytes[i + 1] * 256))
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf = this.subarray(start, end)
  // Return an augmented `Uint8Array` instance
  newBuf.__proto__ = Buffer.prototype
  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset + 3] = (value >>> 24)
  this[offset + 2] = (value >>> 16)
  this[offset + 1] = (value >>> 8)
  this[offset] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  this[offset + 2] = (value >>> 16)
  this[offset + 3] = (value >>> 24)
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
  if (offset < 0) throw new RangeError('Index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!Buffer.isBuffer(target)) throw new TypeError('argument should be a Buffer')
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('Index out of range')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start

  if (this === target && typeof Uint8Array.prototype.copyWithin === 'function') {
    // Use built-in when available, missing from IE11
    this.copyWithin(targetStart, start, end)
  } else if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (var i = len - 1; i >= 0; --i) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    Uint8Array.prototype.set.call(
      target,
      this.subarray(start, end),
      targetStart
    )
  }

  return len
}

// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
Buffer.prototype.fill = function fill (val, start, end, encoding) {
  // Handle string cases:
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start
      start = 0
      end = this.length
    } else if (typeof end === 'string') {
      encoding = end
      end = this.length
    }
    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string')
    }
    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding)
    }
    if (val.length === 1) {
      var code = val.charCodeAt(0)
      if ((encoding === 'utf8' && code < 128) ||
          encoding === 'latin1') {
        // Fast path: If `val` fits into a single byte, use that numeric value.
        val = code
      }
    }
  } else if (typeof val === 'number') {
    val = val & 255
  }

  // Invalid ranges are not set to a default, so can range check early.
  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index')
  }

  if (end <= start) {
    return this
  }

  start = start >>> 0
  end = end === undefined ? this.length : end >>> 0

  if (!val) val = 0

  var i
  if (typeof val === 'number') {
    for (i = start; i < end; ++i) {
      this[i] = val
    }
  } else {
    var bytes = Buffer.isBuffer(val)
      ? val
      : Buffer.from(val, encoding)
    var len = bytes.length
    if (len === 0) {
      throw new TypeError('The value "' + val +
        '" is invalid for argument "value"')
    }
    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len]
    }
  }

  return this
}

// HELPER FUNCTIONS
// ================

var INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node takes equal signs as end of the Base64 encoding
  str = str.split('=')[0]
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = str.trim().replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; ++i) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

// ArrayBuffer or Uint8Array objects from other contexts (i.e. iframes) do not pass
// the `instanceof` check but they should be treated as of that type.
// See: https://github.com/feross/buffer/issues/166
function isInstance (obj, type) {
  return obj instanceof type ||
    (obj != null && obj.constructor != null && obj.constructor.name != null &&
      obj.constructor.name === type.name)
}
function numberIsNaN (obj) {
  // For IE11 support
  return obj !== obj // eslint-disable-line no-self-compare
}

}).call(this)}).call(this,require("buffer").Buffer)
},{"base64-js":12,"buffer":13,"ieee754":15}],14:[function(require,module,exports){
(function (global,Buffer){(function (){
!function(e,a){"object"==typeof exports&&"undefined"!=typeof module?a(exports):"function"==typeof define&&define.amd?define(["exports"],a):a((e=e||self).gremlins={})}(this,(function(e){"use strict";var a="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{};function n(e,a){return e(a={exports:{}},a.exports),a.exports}var i,r=function(e){return e&&e.Math==Math&&e},t=r("object"==typeof globalThis&&globalThis)||r("object"==typeof window&&window)||r("object"==typeof self&&self)||r("object"==typeof a&&a)||Function("return this")(),o={CSSRuleList:0,CSSStyleDeclaration:0,CSSValueList:0,ClientRectList:0,DOMRectList:0,DOMStringList:0,DOMTokenList:1,DataTransferItemList:0,FileList:0,HTMLAllCollection:0,HTMLCollection:0,HTMLFormElement:0,HTMLSelectElement:0,MediaList:0,MimeTypeArray:0,NamedNodeMap:0,NodeList:1,PaintRequestList:0,Plugin:0,PluginArray:0,SVGLengthList:0,SVGNumberList:0,SVGPathSegList:0,SVGPointList:0,SVGStringList:0,SVGTransformList:0,SourceBufferList:0,StyleSheetList:0,TextTrackCueList:0,TextTrackList:0,TouchList:0},s=function(e){try{return!!e()}catch(e){return!0}},l={}.toString,c="".split,m=s((function(){return!Object("z").propertyIsEnumerable(0)}))?function(e){return"String"==function(e){return l.call(e).slice(8,-1)}(e)?c.call(e,""):Object(e)}:Object,u=function(e){if(null==e)throw TypeError("Can't call method on "+e);return e},d=function(e){return m(u(e))},h=!s((function(){return 7!=Object.defineProperty({},1,{get:function(){return 7}})[1]})),p=function(e){return"object"==typeof e?null!==e:"function"==typeof e},b=t.document,g=p(b)&&p(b.createElement),C=function(e){return g?b.createElement(e):{}},f=!h&&!s((function(){return 7!=Object.defineProperty(C("div"),"a",{get:function(){return 7}}).a})),y=function(e){if(!p(e))throw TypeError(String(e)+" is not an object");return e},v=function(e,a){if(!p(e))return e;var n,i;if(a&&"function"==typeof(n=e.toString)&&!p(i=n.call(e)))return i;if("function"==typeof(n=e.valueOf)&&!p(i=n.call(e)))return i;if(!a&&"function"==typeof(n=e.toString)&&!p(i=n.call(e)))return i;throw TypeError("Can't convert object to primitive value")},A=Object.defineProperty,S={f:h?A:function(e,a,n){if(y(e),a=v(a,!0),y(n),f)try{return A(e,a,n)}catch(e){}if("get"in n||"set"in n)throw TypeError("Accessors not supported");return"value"in n&&(e[a]=n.value),e}},M=function(e,a){return{enumerable:!(1&e),configurable:!(2&e),writable:!(4&e),value:a}},T=h?function(e,a,n){return S.f(e,a,M(1,n))}:function(e,a,n){return e[a]=n,e},B=function(e,a){try{T(t,e,a)}catch(n){t[e]=a}return a},I=t["__core-js_shared__"]||B("__core-js_shared__",{}),k=n((function(e){(e.exports=function(e,a){return I[e]||(I[e]=void 0!==a?a:{})})("versions",[]).push({version:"3.6.4",mode:"global",copyright:"?? 2020 Denis Pushkarev (zloirock.ru)"})})),P={}.hasOwnProperty,G=function(e,a){return P.call(e,a)},E=0,L=Math.random(),w=function(e){return"Symbol("+String(void 0===e?"":e)+")_"+(++E+L).toString(36)},D=!!Object.getOwnPropertySymbols&&!s((function(){return!String(Symbol())})),R=D&&!Symbol.sham&&"symbol"==typeof Symbol.iterator,x=k("wks"),F=t.Symbol,N=R?F:F&&F.withoutSetter||w,H=function(e){return G(x,e)||(D&&G(F,e)?x[e]=F[e]:x[e]=N("Symbol."+e)),x[e]},z=Math.ceil,W=Math.floor,O=function(e){return isNaN(e=+e)?0:(e>0?W:z)(e)},_=Math.min,K=Math.max,U=Math.min,V=function(e){return function(a,n,i){var r,t,o=d(a),s=(r=o.length)>0?_(O(r),9007199254740991):0,l=function(e,a){var n=O(e);return n<0?K(n+a,0):U(n,a)}(i,s);if(e&&n!=n){for(;s>l;)if((t=o[l++])!=t)return!0}else for(;s>l;l++)if((e||l in o)&&o[l]===n)return e||l||0;return!e&&-1}},J={includes:V(!0),indexOf:V(!1)},j={},Y=J.indexOf,Z=function(e,a){var n,i=d(e),r=0,t=[];for(n in i)!G(j,n)&&G(i,n)&&t.push(n);for(;a.length>r;)G(i,n=a[r++])&&(~Y(t,n)||t.push(n));return t},q=["constructor","hasOwnProperty","isPrototypeOf","propertyIsEnumerable","toLocaleString","toString","valueOf"],Q=Object.keys||function(e){return Z(e,q)},X=h?Object.defineProperties:function(e,a){y(e);for(var n,i=Q(a),r=i.length,t=0;r>t;)S.f(e,n=i[t++],a[n]);return e},$=t,ee=function(e){return"function"==typeof e?e:void 0},ae=function(e,a){return arguments.length<2?ee($[e])||ee(t[e]):$[e]&&$[e][a]||t[e]&&t[e][a]},ne=ae("document","documentElement"),ie=k("keys"),re=function(e){return ie[e]||(ie[e]=w(e))},te=re("IE_PROTO"),oe=function(){},se=function(e){return"<script>"+e+"<\/script>"},le=function(){try{i=document.domain&&new ActiveXObject("htmlfile")}catch(e){}var e,a;le=i?function(e){e.write(se("")),e.close();var a=e.parentWindow.Object;return e=null,a}(i):((a=C("iframe")).style.display="none",ne.appendChild(a),a.src=String("javascript:"),(e=a.contentWindow.document).open(),e.write(se("document.F=Object")),e.close(),e.F);for(var n=q.length;n--;)delete le.prototype[q[n]];return le()};j[te]=!0;var ce=Object.create||function(e,a){var n;return null!==e?(oe.prototype=y(e),n=new oe,oe.prototype=null,n[te]=e):n=le(),void 0===a?n:X(n,a)},me=H("unscopables"),ue=Array.prototype;null==ue[me]&&S.f(ue,me,{configurable:!0,value:ce(null)});var de=function(e){ue[me][e]=!0},he=Function.toString;"function"!=typeof I.inspectSource&&(I.inspectSource=function(e){return he.call(e)});var pe,be,ge,Ce=I.inspectSource,fe=t.WeakMap,ye="function"==typeof fe&&/native code/.test(Ce(fe)),ve=t.WeakMap;if(ye){var Ae=new ve,Se=Ae.get,Me=Ae.has,Te=Ae.set;pe=function(e,a){return Te.call(Ae,e,a),a},be=function(e){return Se.call(Ae,e)||{}},ge=function(e){return Me.call(Ae,e)}}else{var Be=re("state");j[Be]=!0,pe=function(e,a){return T(e,Be,a),a},be=function(e){return G(e,Be)?e[Be]:{}},ge=function(e){return G(e,Be)}}var Ie,ke,Pe,Ge={set:pe,get:be,has:ge,enforce:function(e){return ge(e)?be(e):pe(e,{})},getterFor:function(e){return function(a){var n;if(!p(a)||(n=be(a)).type!==e)throw TypeError("Incompatible receiver, "+e+" required");return n}}},Ee={}.propertyIsEnumerable,Le=Object.getOwnPropertyDescriptor,we={f:Le&&!Ee.call({1:2},1)?function(e){var a=Le(this,e);return!!a&&a.enumerable}:Ee},De=Object.getOwnPropertyDescriptor,Re={f:h?De:function(e,a){if(e=d(e),a=v(a,!0),f)try{return De(e,a)}catch(e){}if(G(e,a))return M(!we.f.call(e,a),e[a])}},xe=n((function(e){var a=Ge.get,n=Ge.enforce,i=String(String).split("String");(e.exports=function(e,a,r,o){var s=!!o&&!!o.unsafe,l=!!o&&!!o.enumerable,c=!!o&&!!o.noTargetGet;"function"==typeof r&&("string"!=typeof a||G(r,"name")||T(r,"name",a),n(r).source=i.join("string"==typeof a?a:"")),e!==t?(s?!c&&e[a]&&(l=!0):delete e[a],l?e[a]=r:T(e,a,r)):l?e[a]=r:B(a,r)})(Function.prototype,"toString",(function(){return"function"==typeof this&&a(this).source||Ce(this)}))})),Fe=q.concat("length","prototype"),Ne={f:Object.getOwnPropertyNames||function(e){return Z(e,Fe)}},He={f:Object.getOwnPropertySymbols},ze=ae("Reflect","ownKeys")||function(e){var a=Ne.f(y(e)),n=He.f;return n?a.concat(n(e)):a},We=function(e,a){for(var n=ze(a),i=S.f,r=Re.f,t=0;t<n.length;t++){var o=n[t];G(e,o)||i(e,o,r(a,o))}},Oe=/#|\.prototype\./,_e=function(e,a){var n=Ue[Ke(e)];return n==Je||n!=Ve&&("function"==typeof a?s(a):!!a)},Ke=_e.normalize=function(e){return String(e).replace(Oe,".").toLowerCase()},Ue=_e.data={},Ve=_e.NATIVE="N",Je=_e.POLYFILL="P",je=_e,Ye=Re.f,Ze=!s((function(){function e(){}return e.prototype.constructor=null,Object.getPrototypeOf(new e)!==e.prototype})),qe=re("IE_PROTO"),Qe=Object.prototype,Xe=Ze?Object.getPrototypeOf:function(e){return e=Object(u(e)),G(e,qe)?e[qe]:"function"==typeof e.constructor&&e instanceof e.constructor?e.constructor.prototype:e instanceof Object?Qe:null},$e=H("iterator"),ea=!1;[].keys&&("next"in(Pe=[].keys())?(ke=Xe(Xe(Pe)))!==Object.prototype&&(Ie=ke):ea=!0),null==Ie&&(Ie={}),G(Ie,$e)||T(Ie,$e,(function(){return this}));var aa={IteratorPrototype:Ie,BUGGY_SAFARI_ITERATORS:ea},na=S.f,ia=H("toStringTag"),ra=function(e,a,n){e&&!G(e=n?e:e.prototype,ia)&&na(e,ia,{configurable:!0,value:a})},ta=aa.IteratorPrototype,oa=Object.setPrototypeOf||("__proto__"in{}?function(){var e,a=!1,n={};try{(e=Object.getOwnPropertyDescriptor(Object.prototype,"__proto__").set).call(n,[]),a=n instanceof Array}catch(e){}return function(n,i){return y(n),function(e){if(!p(e)&&null!==e)throw TypeError("Can't set "+String(e)+" as a prototype")}(i),a?e.call(n,i):n.__proto__=i,n}}():void 0),sa=aa.IteratorPrototype,la=aa.BUGGY_SAFARI_ITERATORS,ca=H("iterator"),ma=function(){return this},ua=Ge.set,da=Ge.getterFor("Array Iterator"),ha=function(e,a,n,i,r,o,s){!function(e,a,n){var i=a+" Iterator";e.prototype=ce(ta,{next:M(1,n)}),ra(e,i,!1)}(n,a,i);var l,c,m,u=function(e){if(e===r&&g)return g;if(!la&&e in p)return p[e];switch(e){case"keys":case"values":case"entries":return function(){return new n(this,e)}}return function(){return new n(this)}},d=a+" Iterator",h=!1,p=e.prototype,b=p[ca]||p["@@iterator"]||r&&p[r],g=!la&&b||u(r),C="Array"==a&&p.entries||b;if(C&&(l=Xe(C.call(new e)),sa!==Object.prototype&&l.next&&(Xe(l)!==sa&&(oa?oa(l,sa):"function"!=typeof l[ca]&&T(l,ca,ma)),ra(l,d,!0))),"values"==r&&b&&"values"!==b.name&&(h=!0,g=function(){return b.call(this)}),p[ca]!==g&&T(p,ca,g),r)if(c={values:u("values"),keys:o?g:u("keys"),entries:u("entries")},s)for(m in c)(la||h||!(m in p))&&xe(p,m,c[m]);else!function(e,a){var n,i,r,o,s,l=e.target,c=e.global,m=e.stat;if(n=c?t:m?t[l]||B(l,{}):(t[l]||{}).prototype)for(i in a){if(o=a[i],r=e.noTargetGet?(s=Ye(n,i))&&s.value:n[i],!je(c?i:l+(m?".":"#")+i,e.forced)&&void 0!==r){if(typeof o==typeof r)continue;We(o,r)}(e.sham||r&&r.sham)&&T(o,"sham",!0),xe(n,i,o,e)}}({target:a,proto:!0,forced:la||h},c);return c}(Array,"Array",(function(e,a){ua(this,{type:"Array Iterator",target:d(e),index:0,kind:a})}),(function(){var e=da(this),a=e.target,n=e.kind,i=e.index++;return!a||i>=a.length?(e.target=void 0,{value:void 0,done:!0}):"keys"==n?{value:i,done:!1}:"values"==n?{value:a[i],done:!1}:{value:[i,a[i]],done:!1}}),"values");de("keys"),de("values"),de("entries");var pa=H("iterator"),ba=H("toStringTag"),ga=ha.values;for(var Ca in o){var fa=t[Ca],ya=fa&&fa.prototype;if(ya){if(ya[pa]!==ga)try{T(ya,pa,ga)}catch(e){ya[pa]=ga}if(ya[ba]||T(ya,ba,Ca),o[Ca])for(var va in ha)if(ya[va]!==ha[va])try{T(ya,va,ha[va])}catch(e){ya[va]=ha[va]}}}var Aa=n((function(e,a){!function(){var n=9007199254740992,i="abcdefghijklmnopqrstuvwxyz",r=i.toUpperCase(),t="0123456789abcdef";function o(e){this.name="UnsupportedError",this.message=e||"This feature is not supported on this platform"}o.prototype=new Error,o.prototype.constructor=o;var s=Array.prototype.slice;function l(e){if(!(this instanceof l))return e||(e=null),null===e?new l:new l(e);if("function"==typeof e)return this.random=e,this;arguments.length&&(this.seed=0);for(var a=0;a<arguments.length;a++){var n=0;if("[object String]"===Object.prototype.toString.call(arguments[a]))for(var i=0;i<arguments[a].length;i++){for(var r=0,t=0;t<arguments[a].length;t++)r=arguments[a].charCodeAt(t)+(r<<6)+(r<<16)-r;n+=r}else n=arguments[a];this.seed+=(arguments.length-a)*n}return this.mt=this.mersenne_twister(this.seed),this.bimd5=this.blueimp_md5(),this.random=function(){return this.mt.random(this.seed)},this}function c(e,a){if(e=e||{},a)for(var n in a)void 0===e[n]&&(e[n]=a[n]);return e}function m(e,a){if(e)throw new RangeError(a)}l.prototype.VERSION="1.1.4";var u=function(){throw new Error("No Base64 encoder available.")};function d(e){this.c=e}function h(e){this.c=e}function p(e){this.c=e}function b(e){return function(){return this.natural(e)}}"function"==typeof btoa?u=btoa:"function"==typeof Buffer&&(u=function(e){return new Buffer(e).toString("base64")}),l.prototype.bool=function(e){return m((e=c(e,{likelihood:50})).likelihood<0||e.likelihood>100,"Chance: Likelihood accepts values from 0 to 100."),100*this.random()<e.likelihood},l.prototype.falsy=function(e){var a=(e=c(e,{pool:[!1,null,0,NaN,""]})).pool;return a[this.integer({min:0,max:a.length})]},l.prototype.animal=function(e){if(void 0!==(e=c(e)).type)return m(!this.get("animals")[e.type.toLowerCase()],"Please pick from desert, ocean, grassland, forest, zoo, pets, farm."),this.pick(this.get("animals")[e.type.toLowerCase()]);return this.pick(this.get("animals")[this.pick(["desert","forest","ocean","zoo","farm","pet","grassland"])])},l.prototype.character=function(e){var a,n;return a="lower"===(e=c(e)).casing?i:"upper"===e.casing?r:i+r,e.pool?n=e.pool:(n="",e.alpha&&(n+=a),e.numeric&&(n+="0123456789"),e.symbols&&(n+="!@#$%^&*()[]"),n||(n=a+"0123456789!@#$%^&*()[]")),n.charAt(this.natural({max:n.length-1}))},l.prototype.floating=function(e){m((e=c(e,{fixed:4})).fixed&&e.precision,"Chance: Cannot specify both fixed and precision.");var a=Math.pow(10,e.fixed),i=n/a,r=-i;m(e.min&&e.fixed&&e.min<r,"Chance: Min specified is out of range with fixed. Min should be, at least, "+r),m(e.max&&e.fixed&&e.max>i,"Chance: Max specified is out of range with fixed. Max should be, at most, "+i),e=c(e,{min:r,max:i});var t=(this.integer({min:e.min*a,max:e.max*a})/a).toFixed(e.fixed);return parseFloat(t)},l.prototype.integer=function(e){return m((e=c(e,{min:-9007199254740992,max:n})).min>e.max,"Chance: Min cannot be greater than Max."),Math.floor(this.random()*(e.max-e.min+1)+e.min)},l.prototype.natural=function(e){if("number"==typeof(e=c(e,{min:0,max:n})).numerals&&(m(e.numerals<1,"Chance: Numerals cannot be less than one."),e.min=Math.pow(10,e.numerals-1),e.max=Math.pow(10,e.numerals)-1),m(e.min<0,"Chance: Min cannot be less than zero."),e.exclude){for(var a in m(!Array.isArray(e.exclude),"Chance: exclude must be an array."),e.exclude)m(!Number.isInteger(e.exclude[a]),"Chance: exclude must be numbers.");let n=e.min+this.natural({max:e.max-e.min-e.exclude.length});var i=e.exclude.sort();for(var a in i){if(n<i[a])break;n++}return n}return this.integer(e)},l.prototype.prime=function(e){m((e=c(e,{min:0,max:1e4})).min<0,"Chance: Min cannot be less than zero."),m(e.min>e.max,"Chance: Min cannot be greater than Max.");var a=g.primes[g.primes.length-1];if(e.max>a)for(var n=a+2;n<=e.max;++n)this.is_prime(n)&&g.primes.push(n);var i=g.primes.filter((function(a){return a>=e.min&&a<=e.max}));return this.pick(i)},l.prototype.is_prime=function(e){if(e%1||e<2)return!1;if(e%2==0)return 2===e;if(e%3==0)return 3===e;for(var a=Math.sqrt(e),n=5;n<=a;n+=6)if(e%n==0||e%(n+2)==0)return!1;return!0},l.prototype.hex=function(e){m((e=c(e,{min:0,max:n,casing:"lower"})).min<0,"Chance: Min cannot be less than zero.");var a=this.natural({min:e.min,max:e.max});return"upper"===e.casing?a.toString(16).toUpperCase():a.toString(16)},l.prototype.letter=function(e){e=c(e,{casing:"lower"});var a=this.character({pool:"abcdefghijklmnopqrstuvwxyz"});return"upper"===e.casing&&(a=a.toUpperCase()),a},l.prototype.string=function(e){(e=c(e,{min:5,max:20})).length||(e.length=this.natural({min:e.min,max:e.max})),m(e.length<0,"Chance: Length cannot be less than zero.");var a=e.length;return this.n(this.character,a,e).join("")},d.prototype={substitute:function(){return this.c}},h.prototype={substitute:function(){if(!/[{}\\]/.test(this.c))throw new Error('Invalid escape sequence: "\\'+this.c+'".');return this.c}},p.prototype={replacers:{"#":function(e){return e.character({pool:"0123456789"})},A:function(e){return e.character({pool:r})},a:function(e){return e.character({pool:i})}},substitute:function(e){var a=this.replacers[this.c];if(!a)throw new Error('Invalid replacement character: "'+this.c+'".');return a(e)}},l.prototype.template=function(e){if(!e)throw new Error("Template string is required");var a=this;return function(e){for(var a=[],n="identity",i=0;i<e.length;i++){var r=e[i];switch(n){case"escape":a.push(new h(r)),n="identity";break;case"identity":"{"===r?n="replace":"\\"===r?n="escape":a.push(new d(r));break;case"replace":"}"===r?n="identity":a.push(new p(r))}}return a}(e).map((function(e){return e.substitute(a)})).join("")},l.prototype.buffer=function(e){if("undefined"==typeof Buffer)throw new o("Sorry, the buffer() function is not supported on your platform");m((e=c(e,{length:this.natural({min:5,max:20})})).length<0,"Chance: Length cannot be less than zero.");var a=e.length,n=this.n(this.character,a,e);return Buffer.from(n)},l.prototype.capitalize=function(e){return e.charAt(0).toUpperCase()+e.substr(1)},l.prototype.mixin=function(e){for(var a in e)l.prototype[a]=e[a];return this},l.prototype.unique=function(e,a,n){m("function"!=typeof e,"Chance: The first argument must be a function.");var i=function(e,a){return-1!==e.indexOf(a)};n&&(i=n.comparator||i);for(var r,t=[],o=0,l=50*a,c=s.call(arguments,2);t.length<a;){var u=JSON.parse(JSON.stringify(c));if(i(t,r=e.apply(this,u))||(t.push(r),o=0),++o>l)throw new RangeError("Chance: num is likely too large for sample set")}return t},l.prototype.n=function(e,a){m("function"!=typeof e,"Chance: The first argument must be a function."),void 0===a&&(a=1);var n=a,i=[],r=s.call(arguments,2);for(n=Math.max(0,n);n--;null)i.push(e.apply(this,r));return i},l.prototype.pad=function(e,a,n){return n=n||"0",(e+="").length>=a?e:new Array(a-e.length+1).join(n)+e},l.prototype.pick=function(e,a){if(0===e.length)throw new RangeError("Chance: Cannot pick() from an empty array");return a&&1!==a?this.shuffle(e).slice(0,a):e[this.natural({max:e.length-1})]},l.prototype.pickone=function(e){if(0===e.length)throw new RangeError("Chance: Cannot pickone() from an empty array");return e[this.natural({max:e.length-1})]},l.prototype.pickset=function(e,a){if(0===a)return[];if(0===e.length)throw new RangeError("Chance: Cannot pickset() from an empty array");if(a<0)throw new RangeError("Chance: Count must be a positive number");if(a&&1!==a){var n=e.slice(0),i=n.length;return this.n((function(){var e=this.natural({max:--i}),a=n[e];return n[e]=n[i],a}),Math.min(i,a))}return[this.pickone(e)]},l.prototype.shuffle=function(e){for(var a,n,i=[],r=0,t=Number(e.length),o=(n=t,Array.apply(null,Array(n)).map((function(e,a){return a}))),s=t-1,l=0;l<t;l++)r=o[a=this.natural({max:s})],i[l]=e[r],o[a]=o[s],s-=1;return i},l.prototype.weighted=function(e,a,n){if(e.length!==a.length)throw new RangeError("Chance: Length of array and weights must match");for(var i,r=0,t=0;t<a.length;++t){if(i=a[t],isNaN(i))throw new RangeError("Chance: All weights must be numbers");i>0&&(r+=i)}if(0===r)throw new RangeError("Chance: No valid entries in array weights");var o,s=this.random()*r,l=0,c=-1;for(t=0;t<a.length;++t){if(l+=i=a[t],i>0){if(s<=l){o=t;break}c=t}t===a.length-1&&(o=c)}var m=e[o];return(n=void 0!==n&&n)&&(e.splice(o,1),a.splice(o,1)),m},l.prototype.paragraph=function(e){var a=(e=c(e)).sentences||this.natural({min:3,max:7});return this.n(this.sentence,a).join(" ")},l.prototype.sentence=function(e){var a,n=(e=c(e)).words||this.natural({min:12,max:18}),i=e.punctuation;return a=this.n(this.word,n).join(" "),a=this.capitalize(a),!1===i||/^[.?;!:]$/.test(i)||(i="."),i&&(a+=i),a},l.prototype.syllable=function(e){for(var a,n=(e=c(e)).length||this.natural({min:2,max:3}),i="",r=0;r<n;r++)i+=a=0===r?this.character({pool:"bcdfghjklmnprstvwzaeiou"}):-1==="bcdfghjklmnprstvwz".indexOf(a)?this.character({pool:"bcdfghjklmnprstvwz"}):this.character({pool:"aeiou"});return e.capitalize&&(i=this.capitalize(i)),i},l.prototype.word=function(e){m((e=c(e)).syllables&&e.length,"Chance: Cannot specify both syllables AND length.");var a=e.syllables||this.natural({min:1,max:3}),n="";if(e.length){do{n+=this.syllable()}while(n.length<e.length);n=n.substring(0,e.length)}else for(var i=0;i<a;i++)n+=this.syllable();return e.capitalize&&(n=this.capitalize(n)),n},l.prototype.age=function(e){var a;switch((e=c(e)).type){case"child":a={min:0,max:12};break;case"teen":a={min:13,max:19};break;case"adult":a={min:18,max:65};break;case"senior":a={min:65,max:100};break;case"all":a={min:0,max:100};break;default:a={min:18,max:65}}return this.natural(a)},l.prototype.birthday=function(e){var a=this.age(e),n=(new Date).getFullYear();if(e&&e.type){var i=new Date,r=new Date;i.setFullYear(n-a-1),r.setFullYear(n-a),e=c(e,{min:i,max:r})}else e=c(e,{year:n-a});return this.date(e)},l.prototype.cpf=function(e){e=c(e,{formatted:!0});var a=this.n(this.natural,9,{max:9}),n=2*a[8]+3*a[7]+4*a[6]+5*a[5]+6*a[4]+7*a[3]+8*a[2]+9*a[1]+10*a[0];(n=11-n%11)>=10&&(n=0);var i=2*n+3*a[8]+4*a[7]+5*a[6]+6*a[5]+7*a[4]+8*a[3]+9*a[2]+10*a[1]+11*a[0];(i=11-i%11)>=10&&(i=0);var r=""+a[0]+a[1]+a[2]+"."+a[3]+a[4]+a[5]+"."+a[6]+a[7]+a[8]+"-"+n+i;return e.formatted?r:r.replace(/\D/g,"")},l.prototype.cnpj=function(e){e=c(e,{formatted:!0});var a=this.n(this.natural,12,{max:12}),n=2*a[11]+3*a[10]+4*a[9]+5*a[8]+6*a[7]+7*a[6]+8*a[5]+9*a[4]+2*a[3]+3*a[2]+4*a[1]+5*a[0];(n=11-n%11)<2&&(n=0);var i=2*n+3*a[11]+4*a[10]+5*a[9]+6*a[8]+7*a[7]+8*a[6]+9*a[5]+2*a[4]+3*a[3]+4*a[2]+5*a[1]+6*a[0];(i=11-i%11)<2&&(i=0);var r=""+a[0]+a[1]+"."+a[2]+a[3]+a[4]+"."+a[5]+a[6]+a[7]+"/"+a[8]+a[9]+a[10]+a[11]+"-"+n+i;return e.formatted?r:r.replace(/\D/g,"")},l.prototype.first=function(e){return e=c(e,{gender:this.gender(),nationality:"en"}),this.pick(this.get("firstNames")[e.gender.toLowerCase()][e.nationality.toLowerCase()])},l.prototype.profession=function(e){return(e=c(e)).rank?this.pick(["Apprentice ","Junior ","Senior ","Lead "])+this.pick(this.get("profession")):this.pick(this.get("profession"))},l.prototype.company=function(){return this.pick(this.get("company"))},l.prototype.gender=function(e){return e=c(e,{extraGenders:[]}),this.pick(["Male","Female"].concat(e.extraGenders))},l.prototype.last=function(e){if("*"===(e=c(e,{nationality:"*"})).nationality){var a=[],n=this.get("lastNames");return Object.keys(n).forEach((function(e){a=a.concat(n[e])})),this.pick(a)}return this.pick(this.get("lastNames")[e.nationality.toLowerCase()])},l.prototype.israelId=function(){for(var e=this.string({pool:"0123456789",length:8}),a=0,n=0;n<e.length;n++){var i=e[n]*(n/2===parseInt(n/2)?1:2);i=this.pad(i,2).toString(),a+=i=parseInt(i[0])+parseInt(i[1])}return e+=(10-parseInt(a.toString().slice(-1))).toString().slice(-1)},l.prototype.mrz=function(e){var a,n,i,r,t=function(e){var a="<ABCDEFGHIJKLMNOPQRSTUVWXYXZ".split(""),n=[7,3,1],i=0;return"string"!=typeof e&&(e=e.toString()),e.split("").forEach((function(e,r){var t=a.indexOf(e);e=-1!==t?0===t?0:t+9:parseInt(e,10),i+=e*=n[r%n.length]})),i%10},o=this;return e=c(e,{first:this.first(),last:this.last(),passportNumber:this.integer({min:1e8,max:999999999}),dob:(a=o.birthday({type:"adult"}),[a.getFullYear().toString().substr(2),o.pad(a.getMonth()+1,2),o.pad(a.getDate(),2)].join("")),expiry:function(){var e=new Date;return[(e.getFullYear()+5).toString().substr(2),o.pad(e.getMonth()+1,2),o.pad(e.getDate(),2)].join("")}(),gender:"Female"===this.gender()?"F":"M",issuer:"GBR",nationality:"GBR"}),i=function(e){return new Array(e+1).join("<")},(r=["P<",(n=e).issuer,n.last.toUpperCase(),"<<",n.first.toUpperCase(),i(39-(n.last.length+n.first.length+2)),n.passportNumber,t(n.passportNumber),n.nationality,n.dob,t(n.dob),n.gender,n.expiry,t(n.expiry),i(14),t(i(14))].join(""))+t(r.substr(44,10)+r.substr(57,7)+r.substr(65,7))},l.prototype.name=function(e){e=c(e);var a,n=this.first(e),i=this.last(e);return a=e.middle?n+" "+this.first(e)+" "+i:e.middle_initial?n+" "+this.character({alpha:!0,casing:"upper"})+". "+i:n+" "+i,e.prefix&&(a=this.prefix(e)+" "+a),e.suffix&&(a=a+" "+this.suffix(e)),a},l.prototype.name_prefixes=function(e){var a=[{name:"Doctor",abbreviation:"Dr."}];return"male"!==(e=(e=e||"all").toLowerCase())&&"all"!==e||a.push({name:"Mister",abbreviation:"Mr."}),"female"!==e&&"all"!==e||(a.push({name:"Miss",abbreviation:"Miss"}),a.push({name:"Misses",abbreviation:"Mrs."})),a},l.prototype.prefix=function(e){return this.name_prefix(e)},l.prototype.name_prefix=function(e){return(e=c(e,{gender:"all"})).full?this.pick(this.name_prefixes(e.gender)).name:this.pick(this.name_prefixes(e.gender)).abbreviation},l.prototype.HIDN=function(){var e="";return e+=this.string({pool:"0123456789",length:6}),e+=this.string({pool:"ABCDEFGHIJKLMNOPQRSTUVWXYXZ",length:2})},l.prototype.ssn=function(e){var a=(e=c(e,{ssnFour:!1,dashes:!0})).dashes?"-":"";return e.ssnFour?this.string({pool:"1234567890",length:4}):this.string({pool:"1234567890",length:3})+a+this.string({pool:"1234567890",length:2})+a+this.string({pool:"1234567890",length:4})},l.prototype.aadhar=function(e){var a=(e=c(e,{onlyLastFour:!1,separatedByWhiteSpace:!0})).separatedByWhiteSpace?" ":"";return e.onlyLastFour?this.string({pool:"1234567890",length:4}):this.string({pool:"1234567890",length:4})+a+this.string({pool:"1234567890",length:4})+a+this.string({pool:"1234567890",length:4})},l.prototype.name_suffixes=function(){return[{name:"Doctor of Osteopathic Medicine",abbreviation:"D.O."},{name:"Doctor of Philosophy",abbreviation:"Ph.D."},{name:"Esquire",abbreviation:"Esq."},{name:"Junior",abbreviation:"Jr."},{name:"Juris Doctor",abbreviation:"J.D."},{name:"Master of Arts",abbreviation:"M.A."},{name:"Master of Business Administration",abbreviation:"M.B.A."},{name:"Master of Science",abbreviation:"M.S."},{name:"Medical Doctor",abbreviation:"M.D."},{name:"Senior",abbreviation:"Sr."},{name:"The Third",abbreviation:"III"},{name:"The Fourth",abbreviation:"IV"},{name:"Bachelor of Engineering",abbreviation:"B.E"},{name:"Bachelor of Technology",abbreviation:"B.TECH"}]},l.prototype.suffix=function(e){return this.name_suffix(e)},l.prototype.name_suffix=function(e){return(e=c(e)).full?this.pick(this.name_suffixes()).name:this.pick(this.name_suffixes()).abbreviation},l.prototype.nationalities=function(){return this.get("nationalities")},l.prototype.nationality=function(){return this.pick(this.nationalities()).name},l.prototype.android_id=function(){return"APA91"+this.string({pool:"0123456789abcefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-_",length:178})},l.prototype.apple_token=function(){return this.string({pool:"abcdef1234567890",length:64})},l.prototype.wp8_anid2=function(){return u(this.hash({length:32}))},l.prototype.wp7_anid=function(){return"A="+this.guid().replace(/-/g,"").toUpperCase()+"&E="+this.hash({length:3})+"&W="+this.integer({min:0,max:9})},l.prototype.bb_pin=function(){return this.hash({length:8})},l.prototype.avatar=function(e){var a={protocol:null,email:null,fileExtension:null,size:null,fallback:null,rating:null};if(e)if("string"==typeof e)a.email=e,e={};else{if("object"!=typeof e)return null;if("Array"===e.constructor)return null}else a.email=this.email(),e={};return(a=c(e,a)).email||(a.email=this.email()),a.protocol={http:"http",https:"https"}[a.protocol]?a.protocol+":":"",a.size=parseInt(a.size,0)?a.size:"",a.rating={g:"g",pg:"pg",r:"r",x:"x"}[a.rating]?a.rating:"",a.fallback={404:"404",mm:"mm",identicon:"identicon",monsterid:"monsterid",wavatar:"wavatar",retro:"retro",blank:"blank"}[a.fallback]?a.fallback:"",a.fileExtension={bmp:"bmp",gif:"gif",jpg:"jpg",png:"png"}[a.fileExtension]?a.fileExtension:"",a.protocol+"//www.gravatar.com/avatar/"+this.bimd5.md5(a.email)+(a.fileExtension?"."+a.fileExtension:"")+(a.size||a.rating||a.fallback?"?":"")+(a.size?"&s="+a.size.toString():"")+(a.rating?"&r="+a.rating:"")+(a.fallback?"&d="+a.fallback:"")},l.prototype.color=function(e){function a(e,a){return[e,e,e].join(a||"")}function n(e){var n=e?"rgba":"rgb",i=e?","+this.floating({min:b,max:g}):"";return n+"("+(t?a(this.natural({min:o,max:s}),","):this.natural({min:u,max:d})+","+this.natural({min:h,max:p})+","+this.natural({max:255}))+i+")"}function i(n,i,r){var c=r?"#":"",b="";return t?(b=a(this.pad(this.hex({min:o,max:s}),2)),"shorthex"===e.format&&(b=a(this.hex({min:0,max:15})))):b="shorthex"===e.format?this.pad(this.hex({min:Math.floor(l/16),max:Math.floor(m/16)}),1)+this.pad(this.hex({min:Math.floor(u/16),max:Math.floor(d/16)}),1)+this.pad(this.hex({min:Math.floor(h/16),max:Math.floor(p/16)}),1):void 0!==l||void 0!==m||void 0!==u||void 0!==d||void 0!==h||void 0!==p?this.pad(this.hex({min:l,max:m}),2)+this.pad(this.hex({min:u,max:d}),2)+this.pad(this.hex({min:h,max:p}),2):this.pad(this.hex({min:o,max:s}),2)+this.pad(this.hex({min:o,max:s}),2)+this.pad(this.hex({min:o,max:s}),2),c+b}var r,t=(e=c(e,{format:this.pick(["hex","shorthex","rgb","rgba","0x","name"]),grayscale:!1,casing:"lower",min:0,max:255,min_red:void 0,max_red:void 0,min_green:void 0,max_green:void 0,min_blue:void 0,max_blue:void 0,min_alpha:0,max_alpha:1})).grayscale,o=e.min,s=e.max,l=e.min_red,m=e.max_red,u=e.min_green,d=e.max_green,h=e.min_blue,p=e.max_blue,b=e.min_alpha,g=e.max_alpha;if(void 0===e.min_red&&(l=o),void 0===e.max_red&&(m=s),void 0===e.min_green&&(u=o),void 0===e.max_green&&(d=s),void 0===e.min_blue&&(h=o),void 0===e.max_blue&&(p=s),void 0===e.min_alpha&&(b=0),void 0===e.max_alpha&&(g=1),t&&0===o&&255===s&&void 0!==l&&void 0!==m&&(o=(l+u+h)/3,s=(m+d+p)/3),"hex"===e.format)r=i.call(this,2,6,!0);else if("shorthex"===e.format)r=i.call(this,1,3,!0);else if("rgb"===e.format)r=n.call(this,!1);else if("rgba"===e.format)r=n.call(this,!0);else{if("0x"!==e.format){if("name"===e.format)return this.pick(this.get("colorNames"));throw new RangeError('Invalid format provided. Please provide one of "hex", "shorthex", "rgb", "rgba", "0x" or "name".')}r="0x"+i.call(this,2,6)}return"upper"===e.casing&&(r=r.toUpperCase()),r},l.prototype.domain=function(e){return e=c(e),this.word()+"."+(e.tld||this.tld())},l.prototype.email=function(e){return e=c(e),this.word({length:e.length})+"@"+(e.domain||this.domain())},l.prototype.fbid=function(){return"10000"+this.string({pool:"1234567890",length:11})},l.prototype.google_analytics=function(){return"UA-"+this.pad(this.natural({max:999999}),6)+"-"+this.pad(this.natural({max:99}),2)},l.prototype.hashtag=function(){return"#"+this.word()},l.prototype.ip=function(){return this.natural({min:1,max:254})+"."+this.natural({max:255})+"."+this.natural({max:255})+"."+this.natural({min:1,max:254})},l.prototype.ipv6=function(){return this.n(this.hash,8,{length:4}).join(":")},l.prototype.klout=function(){return this.natural({min:1,max:99})},l.prototype.semver=function(e){e=c(e,{include_prerelease:!0});var a=this.pickone(["^","~","<",">","<=",">=","="]);e.range&&(a=e.range);var n="";return e.include_prerelease&&(n=this.weighted(["","-dev","-beta","-alpha"],[50,10,5,1])),a+this.rpg("3d10").join(".")+n},l.prototype.tlds=function(){return["com","org","edu","gov","co.uk","net","io","ac","ad","ae","af","ag","ai","al","am","ao","aq","ar","as","at","au","aw","ax","az","ba","bb","bd","be","bf","bg","bh","bi","bj","bm","bn","bo","br","bs","bt","bv","bw","by","bz","ca","cc","cd","cf","cg","ch","ci","ck","cl","cm","cn","co","cr","cu","cv","cw","cx","cy","cz","de","dj","dk","dm","do","dz","ec","ee","eg","eh","er","es","et","eu","fi","fj","fk","fm","fo","fr","ga","gb","gd","ge","gf","gg","gh","gi","gl","gm","gn","gp","gq","gr","gs","gt","gu","gw","gy","hk","hm","hn","hr","ht","hu","id","ie","il","im","in","io","iq","ir","is","it","je","jm","jo","jp","ke","kg","kh","ki","km","kn","kp","kr","kw","ky","kz","la","lb","lc","li","lk","lr","ls","lt","lu","lv","ly","ma","mc","md","me","mg","mh","mk","ml","mm","mn","mo","mp","mq","mr","ms","mt","mu","mv","mw","mx","my","mz","na","nc","ne","nf","ng","ni","nl","no","np","nr","nu","nz","om","pa","pe","pf","pg","ph","pk","pl","pm","pn","pr","ps","pt","pw","py","qa","re","ro","rs","ru","rw","sa","sb","sc","sd","se","sg","sh","si","sj","sk","sl","sm","sn","so","sr","ss","st","su","sv","sx","sy","sz","tc","td","tf","tg","th","tj","tk","tl","tm","tn","to","tp","tr","tt","tv","tw","tz","ua","ug","uk","us","uy","uz","va","vc","ve","vg","vi","vn","vu","wf","ws","ye","yt","za","zm","zw"]},l.prototype.tld=function(){return this.pick(this.tlds())},l.prototype.twitter=function(){return"@"+this.word()},l.prototype.url=function(e){var a=(e=c(e,{protocol:"http",domain:this.domain(e),domain_prefix:"",path:this.word(),extensions:[]})).extensions.length>0?"."+this.pick(e.extensions):"",n=e.domain_prefix?e.domain_prefix+"."+e.domain:e.domain;return e.protocol+"://"+n+"/"+e.path+a},l.prototype.port=function(){return this.integer({min:0,max:65535})},l.prototype.locale=function(e){return(e=c(e)).region?this.pick(this.get("locale_regions")):this.pick(this.get("locale_languages"))},l.prototype.locales=function(e){return(e=c(e)).region?this.get("locale_regions"):this.get("locale_languages")},l.prototype.loremPicsum=function(e){var a=(e=c(e,{width:500,height:500,greyscale:!1,blurred:!1})).greyscale?"g/":"",n=e.blurred?"/?blur":"/?random";return"https://picsum.photos/"+a+e.width+"/"+e.height+n},l.prototype.address=function(e){return e=c(e),this.natural({min:5,max:2e3})+" "+this.street(e)},l.prototype.altitude=function(e){return e=c(e,{fixed:5,min:0,max:8848}),this.floating({min:e.min,max:e.max,fixed:e.fixed})},l.prototype.areacode=function(e){e=c(e,{parens:!0});var a=this.natural({min:2,max:9}).toString()+this.natural({min:0,max:8}).toString()+this.natural({min:0,max:9}).toString();return e.parens?"("+a+")":a},l.prototype.city=function(){return this.capitalize(this.word({syllables:3}))},l.prototype.coordinates=function(e){return this.latitude(e)+", "+this.longitude(e)},l.prototype.countries=function(){return this.get("countries")},l.prototype.country=function(e){e=c(e);var a=this.pick(this.countries());return e.raw?a:e.full?a.name:a.abbreviation},l.prototype.depth=function(e){return e=c(e,{fixed:5,min:-10994,max:0}),this.floating({min:e.min,max:e.max,fixed:e.fixed})},l.prototype.geohash=function(e){return e=c(e,{length:7}),this.string({length:e.length,pool:"0123456789bcdefghjkmnpqrstuvwxyz"})},l.prototype.geojson=function(e){return this.latitude(e)+", "+this.longitude(e)+", "+this.altitude(e)},l.prototype.latitude=function(e){return e=c(e,{fixed:5,min:-90,max:90}),this.floating({min:e.min,max:e.max,fixed:e.fixed})},l.prototype.longitude=function(e){return e=c(e,{fixed:5,min:-180,max:180}),this.floating({min:e.min,max:e.max,fixed:e.fixed})},l.prototype.phone=function(e){var a,n,i=this,r=function(e){var a=[];return e.sections.forEach((function(e){a.push(i.string({pool:"0123456789",length:e}))})),e.area+a.join(" ")};switch((e=c(e,{formatted:!0,country:"us",mobile:!1})).formatted||(e.parens=!1),e.country){case"fr":e.mobile?(a=this.pick(["06","07"])+i.string({pool:"0123456789",length:8}),n=e.formatted?a.match(/../g).join(" "):a):(a=this.pick(["01"+this.pick(["30","34","39","40","41","42","43","44","45","46","47","48","49","53","55","56","58","60","64","69","70","72","73","74","75","76","77","78","79","80","81","82","83"])+i.string({pool:"0123456789",length:6}),"02"+this.pick(["14","18","22","23","28","29","30","31","32","33","34","35","36","37","38","40","41","43","44","45","46","47","48","49","50","51","52","53","54","56","57","61","62","69","72","76","77","78","85","90","96","97","98","99"])+i.string({pool:"0123456789",length:6}),"03"+this.pick(["10","20","21","22","23","24","25","26","27","28","29","39","44","45","51","52","54","55","57","58","59","60","61","62","63","64","65","66","67","68","69","70","71","72","73","80","81","82","83","84","85","86","87","88","89","90"])+i.string({pool:"0123456789",length:6}),"04"+this.pick(["11","13","15","20","22","26","27","30","32","34","37","42","43","44","50","56","57","63","66","67","68","69","70","71","72","73","74","75","76","77","78","79","80","81","82","83","84","85","86","88","89","90","91","92","93","94","95","97","98"])+i.string({pool:"0123456789",length:6}),"05"+this.pick(["08","16","17","19","24","31","32","33","34","35","40","45","46","47","49","53","55","56","57","58","59","61","62","63","64","65","67","79","81","82","86","87","90","94"])+i.string({pool:"0123456789",length:6}),"09"+i.string({pool:"0123456789",length:8})]),n=e.formatted?a.match(/../g).join(" "):a);break;case"uk":e.mobile?(a=this.pick([{area:"07"+this.pick(["4","5","7","8","9"]),sections:[2,6]},{area:"07624 ",sections:[6]}]),n=e.formatted?r(a):r(a).replace(" ","")):(a=this.pick([{area:"01"+this.character({pool:"234569"})+"1 ",sections:[3,4]},{area:"020 "+this.character({pool:"378"}),sections:[3,4]},{area:"023 "+this.character({pool:"89"}),sections:[3,4]},{area:"024 7",sections:[3,4]},{area:"028 "+this.pick(["25","28","37","71","82","90","92","95"]),sections:[2,4]},{area:"012"+this.pick(["04","08","54","76","97","98"])+" ",sections:[6]},{area:"013"+this.pick(["63","64","84","86"])+" ",sections:[6]},{area:"014"+this.pick(["04","20","60","61","80","88"])+" ",sections:[6]},{area:"015"+this.pick(["24","27","62","66"])+" ",sections:[6]},{area:"016"+this.pick(["06","29","35","47","59","95"])+" ",sections:[6]},{area:"017"+this.pick(["26","44","50","68"])+" ",sections:[6]},{area:"018"+this.pick(["27","37","84","97"])+" ",sections:[6]},{area:"019"+this.pick(["00","05","35","46","49","63","95"])+" ",sections:[6]}]),n=e.formatted?r(a):r(a).replace(" ","","g"));break;case"za":e.mobile?(a=this.pick(["060"+this.pick(["3","4","5","6","7","8","9"])+i.string({pool:"0123456789",length:6}),"061"+this.pick(["0","1","2","3","4","5","8"])+i.string({pool:"0123456789",length:6}),"06"+i.string({pool:"0123456789",length:7}),"071"+this.pick(["0","1","2","3","4","5","6","7","8","9"])+i.string({pool:"0123456789",length:6}),"07"+this.pick(["2","3","4","6","7","8","9"])+i.string({pool:"0123456789",length:7}),"08"+this.pick(["0","1","2","3","4","5"])+i.string({pool:"0123456789",length:7})]),n=e.formatted||a):(a=this.pick(["01"+this.pick(["0","1","2","3","4","5","6","7","8"])+i.string({pool:"0123456789",length:7}),"02"+this.pick(["1","2","3","4","7","8"])+i.string({pool:"0123456789",length:7}),"03"+this.pick(["1","2","3","5","6","9"])+i.string({pool:"0123456789",length:7}),"04"+this.pick(["1","2","3","4","5","6","7","8","9"])+i.string({pool:"0123456789",length:7}),"05"+this.pick(["1","3","4","6","7","8"])+i.string({pool:"0123456789",length:7})]),n=e.formatted||a);break;case"us":var t=this.areacode(e).toString(),o=this.natural({min:2,max:9}).toString()+this.natural({min:0,max:9}).toString()+this.natural({min:0,max:9}).toString(),s=this.natural({min:1e3,max:9999}).toString();n=e.formatted?t+" "+o+"-"+s:t+o+s;break;case"br":var l,m=this.pick(["11","12","13","14","15","16","17","18","19","21","22","24","27","28","31","32","33","34","35","37","38","41","42","43","44","45","46","47","48","49","51","53","54","55","61","62","63","64","65","66","67","68","69","71","73","74","75","77","79","81","82","83","84","85","86","87","88","89","91","92","93","94","95","96","97","98","99"]);l=e.mobile?"9"+i.string({pool:"0123456789",length:4}):this.natural({min:2e3,max:5999}).toString();var u=i.string({pool:"0123456789",length:4});n=e.formatted?"("+m+") "+l+"-"+u:m+l+u}return n},l.prototype.postal=function(){return this.character({pool:"XVTSRPNKLMHJGECBA"})+this.natural({max:9})+this.character({alpha:!0,casing:"upper"})+" "+(this.natural({max:9})+this.character({alpha:!0,casing:"upper"})+this.natural({max:9}))},l.prototype.postcode=function(){return this.pick(this.get("postcodeAreas")).code+this.natural({max:9})+(this.bool()?this.character({alpha:!0,casing:"upper"}):"")+" "+(this.natural({max:9})+(this.character({alpha:!0,casing:"upper"})+this.character({alpha:!0,casing:"upper"})))},l.prototype.counties=function(e){return e=c(e,{country:"uk"}),this.get("counties")[e.country.toLowerCase()]},l.prototype.county=function(e){return this.pick(this.counties(e)).name},l.prototype.provinces=function(e){return e=c(e,{country:"ca"}),this.get("provinces")[e.country.toLowerCase()]},l.prototype.province=function(e){return e&&e.full?this.pick(this.provinces(e)).name:this.pick(this.provinces(e)).abbreviation},l.prototype.state=function(e){return e&&e.full?this.pick(this.states(e)).name:this.pick(this.states(e)).abbreviation},l.prototype.states=function(e){var a;switch((e=c(e,{country:"us",us_states_and_dc:!0})).country.toLowerCase()){case"us":var n=this.get("us_states_and_dc"),i=this.get("territories"),r=this.get("armed_forces");a=[],e.us_states_and_dc&&(a=a.concat(n)),e.territories&&(a=a.concat(i)),e.armed_forces&&(a=a.concat(r));break;case"it":case"mx":a=this.get("country_regions")[e.country.toLowerCase()];break;case"uk":a=this.get("counties")[e.country.toLowerCase()]}return a},l.prototype.street=function(e){var a;switch((e=c(e,{country:"us",syllables:2})).country.toLowerCase()){case"us":a=this.word({syllables:e.syllables}),a=this.capitalize(a),a+=" ",a+=e.short_suffix?this.street_suffix(e).abbreviation:this.street_suffix(e).name;break;case"it":a=this.word({syllables:e.syllables}),a=this.capitalize(a),a=(e.short_suffix?this.street_suffix(e).abbreviation:this.street_suffix(e).name)+" "+a}return a},l.prototype.street_suffix=function(e){return e=c(e,{country:"us"}),this.pick(this.street_suffixes(e))},l.prototype.street_suffixes=function(e){return e=c(e,{country:"us"}),this.get("street_suffixes")[e.country.toLowerCase()]},l.prototype.zip=function(e){var a=this.n(this.natural,5,{max:9});return e&&!0===e.plusfour&&(a.push("-"),a=a.concat(this.n(this.natural,4,{max:9}))),a.join("")},l.prototype.ampm=function(){return this.bool()?"am":"pm"},l.prototype.date=function(e){var a,n;if(e&&(e.min||e.max)){var i=void 0!==(e=c(e,{american:!0,string:!1})).min?e.min.getTime():1,r=void 0!==e.max?e.max.getTime():864e13;n=new Date(this.integer({min:i,max:r}))}else{var t=this.month({raw:!0}),o=t.days;e&&e.month&&(o=this.get("months")[(e.month%12+12)%12].days),e=c(e,{year:parseInt(this.year(),10),month:t.numeric-1,day:this.natural({min:1,max:o}),hour:this.hour({twentyfour:!0}),minute:this.minute(),second:this.second(),millisecond:this.millisecond(),american:!0,string:!1}),n=new Date(e.year,e.month,e.day,e.hour,e.minute,e.second,e.millisecond)}return a=e.american?n.getMonth()+1+"/"+n.getDate()+"/"+n.getFullYear():n.getDate()+"/"+(n.getMonth()+1)+"/"+n.getFullYear(),e.string?a:n},l.prototype.hammertime=function(e){return this.date(e).getTime()},l.prototype.hour=function(e){return m((e=c(e,{min:e&&e.twentyfour?0:1,max:e&&e.twentyfour?23:12})).min<0,"Chance: Min cannot be less than 0."),m(e.twentyfour&&e.max>23,"Chance: Max cannot be greater than 23 for twentyfour option."),m(!e.twentyfour&&e.max>12,"Chance: Max cannot be greater than 12."),m(e.min>e.max,"Chance: Min cannot be greater than Max."),this.natural({min:e.min,max:e.max})},l.prototype.millisecond=function(){return this.natural({max:999})},l.prototype.minute=l.prototype.second=function(e){return m((e=c(e,{min:0,max:59})).min<0,"Chance: Min cannot be less than 0."),m(e.max>59,"Chance: Max cannot be greater than 59."),m(e.min>e.max,"Chance: Min cannot be greater than Max."),this.natural({min:e.min,max:e.max})},l.prototype.month=function(e){m((e=c(e,{min:1,max:12})).min<1,"Chance: Min cannot be less than 1."),m(e.max>12,"Chance: Max cannot be greater than 12."),m(e.min>e.max,"Chance: Min cannot be greater than Max.");var a=this.pick(this.months().slice(e.min-1,e.max));return e.raw?a:a.name},l.prototype.months=function(){return this.get("months")},l.prototype.second=function(){return this.natural({max:59})},l.prototype.timestamp=function(){return this.natural({min:1,max:parseInt((new Date).getTime()/1e3,10)})},l.prototype.weekday=function(e){var a=["Monday","Tuesday","Wednesday","Thursday","Friday"];return(e=c(e,{weekday_only:!1})).weekday_only||(a.push("Saturday"),a.push("Sunday")),this.pickone(a)},l.prototype.year=function(e){return(e=c(e,{min:(new Date).getFullYear()})).max=void 0!==e.max?e.max:e.min+100,this.natural(e).toString()},l.prototype.cc=function(e){var a,n,i;return n=(a=(e=c(e)).type?this.cc_type({name:e.type,raw:!0}):this.cc_type({raw:!0})).prefix.split(""),i=a.length-a.prefix.length-1,(n=n.concat(this.n(this.integer,i,{min:0,max:9}))).push(this.luhn_calculate(n.join(""))),n.join("")},l.prototype.cc_types=function(){return this.get("cc_types")},l.prototype.cc_type=function(e){e=c(e);var a=this.cc_types(),n=null;if(e.name){for(var i=0;i<a.length;i++)if(a[i].name===e.name||a[i].short_name===e.name){n=a[i];break}if(null===n)throw new RangeError("Chance: Credit card type '"+e.name+"' is not supported")}else n=this.pick(a);return e.raw?n:n.name},l.prototype.currency_types=function(){return this.get("currency_types")},l.prototype.currency=function(){return this.pick(this.currency_types())},l.prototype.timezones=function(){return this.get("timezones")},l.prototype.timezone=function(){return this.pick(this.timezones())},l.prototype.currency_pair=function(e){var a=this.unique(this.currency,2,{comparator:function(e,a){return e.reduce((function(e,n){return e||n.code===a.code}),!1)}});return e?a[0].code+"/"+a[1].code:a},l.prototype.dollar=function(e){e=c(e,{max:1e4,min:0});var a=this.floating({min:e.min,max:e.max,fixed:2}).toString(),n=a.split(".")[1];return void 0===n?a+=".00":n.length<2&&(a+="0"),a<0?"-$"+a.replace("-",""):"$"+a},l.prototype.euro=function(e){return Number(this.dollar(e).replace("$","")).toLocaleString()+"???"},l.prototype.exp=function(e){e=c(e);var a={};return a.year=this.exp_year(),a.year===(new Date).getFullYear().toString()?a.month=this.exp_month({future:!0}):a.month=this.exp_month(),e.raw?a:a.month+"/"+a.year},l.prototype.exp_month=function(e){e=c(e);var a,n,i=(new Date).getMonth()+1;if(e.future&&12!==i)do{a=this.month({raw:!0}).numeric,n=parseInt(a,10)}while(n<=i);else a=this.month({raw:!0}).numeric;return a},l.prototype.exp_year=function(){var e=(new Date).getMonth()+1,a=(new Date).getFullYear();return this.year({min:12===e?a+1:a,max:a+10})},l.prototype.vat=function(e){switch((e=c(e,{country:"it"})).country.toLowerCase()){case"it":return this.it_vat()}},l.prototype.iban=function(){var e="ABCDEFGHIJKLMNOPQRSTUVWXYZ";return this.string({length:2,pool:e})+this.pad(this.integer({min:0,max:99}),2)+this.string({length:4,pool:"ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"})+this.pad(this.natural(),this.natural({min:6,max:26}))},l.prototype.it_vat=function(){var e=this.natural({min:1,max:18e5});return(e=this.pad(e,7)+this.pad(this.pick(this.provinces({country:"it"})).code,3))+this.luhn_calculate(e)},l.prototype.cf=function(e){var a=(e=e||{}).gender?e.gender:this.gender(),n=e.first?e.first:this.first({gender:a,nationality:"it"}),i=e.last?e.last:this.last({nationality:"it"}),r=e.birthday?e.birthday:this.birthday(),t=e.city?e.city:this.pickone(["A","B","C","D","E","F","G","H","I","L","M","Z"])+this.pad(this.natural({max:999}),3),o=[],s=function(e,a){var n,i=[];return e.length<3?i=e.split("").concat("XXX".split("")).splice(0,3):((n=e.toUpperCase().split("").map((function(e){return-1!=="BCDFGHJKLMNPRSTVWZ".indexOf(e)?e:void 0})).join("")).length>3&&(n=a?n.substr(0,3):n[0]+n.substr(2,2)),n.length<3&&(i=n,n=e.toUpperCase().split("").map((function(e){return-1!=="AEIOU".indexOf(e)?e:void 0})).join("").substr(0,3-i.length)),i+=n),i};return o=o.concat(s(i,!0),s(n),function(e,a,n){return e.getFullYear().toString().substr(2)+["A","B","C","D","E","H","L","M","P","R","S","T"][e.getMonth()]+n.pad(e.getDate()+("female"===a.toLowerCase()?40:0),2)}(r,a,this),t.toUpperCase().split("")).join(""),(o+=function(e){for(var a="0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ",n="ABCDEFGHIJABCDEFGHIJKLMNOPQRSTUVWXYZ",i="ABCDEFGHIJKLMNOPQRSTUVWXYZ",r=0,t=0;t<15;t++)r+=t%2!=0?i.indexOf(n[a.indexOf(e[t])]):"BAKPLCQDREVOSFTGUHMINJWZYX".indexOf(n[a.indexOf(e[t])]);return i[r%26]}(o.toUpperCase())).toUpperCase()},l.prototype.pl_pesel=function(){for(var e=this.natural({min:1,max:9999999999}),a=this.pad(e,10).split(""),n=0;n<a.length;n++)a[n]=parseInt(a[n]);var i=(1*a[0]+3*a[1]+7*a[2]+9*a[3]+1*a[4]+3*a[5]+7*a[6]+9*a[7]+1*a[8]+3*a[9])%10;return 0!==i&&(i=10-i),a.join("")+i},l.prototype.pl_nip=function(){for(var e=this.natural({min:1,max:999999999}),a=this.pad(e,9).split(""),n=0;n<a.length;n++)a[n]=parseInt(a[n]);var i=(6*a[0]+5*a[1]+7*a[2]+2*a[3]+3*a[4]+4*a[5]+5*a[6]+6*a[7]+7*a[8])%11;return 10===i?this.pl_nip():a.join("")+i},l.prototype.pl_regon=function(){for(var e=this.natural({min:1,max:99999999}),a=this.pad(e,8).split(""),n=0;n<a.length;n++)a[n]=parseInt(a[n]);var i=(8*a[0]+9*a[1]+2*a[2]+3*a[3]+4*a[4]+5*a[5]+6*a[6]+7*a[7])%11;return 10===i&&(i=0),a.join("")+i},l.prototype.note=function(e){e=c(e,{notes:"flatKey"});var a={naturals:["C","D","E","F","G","A","B"],flats:["D???","E???","G???","A???","B???"],sharps:["C???","D???","F???","G???","A???"]};return a.all=a.naturals.concat(a.flats.concat(a.sharps)),a.flatKey=a.naturals.concat(a.flats),a.sharpKey=a.naturals.concat(a.sharps),this.pickone(a[e.notes])},l.prototype.midi_note=function(e){return e=c(e,{min:0,max:127}),this.integer({min:e.min,max:e.max})},l.prototype.chord_quality=function(e){var a=["maj","min","aug","dim"];return(e=c(e,{jazz:!0})).jazz&&(a=["maj7","min7","7","sus","dim","??"]),this.pickone(a)},l.prototype.chord=function(e){return e=c(e),this.note(e)+this.chord_quality(e)},l.prototype.tempo=function(e){return e=c(e,{min:40,max:320}),this.integer({min:e.min,max:e.max})},l.prototype.coin=function(){return this.bool()?"heads":"tails"},l.prototype.d4=b({min:1,max:4}),l.prototype.d6=b({min:1,max:6}),l.prototype.d8=b({min:1,max:8}),l.prototype.d10=b({min:1,max:10}),l.prototype.d12=b({min:1,max:12}),l.prototype.d20=b({min:1,max:20}),l.prototype.d30=b({min:1,max:30}),l.prototype.d100=b({min:1,max:100}),l.prototype.rpg=function(e,a){if(a=c(a),e){var n=e.toLowerCase().split("d"),i=[];if(2!==n.length||!parseInt(n[0],10)||!parseInt(n[1],10))throw new Error("Chance: Invalid format provided. Please provide #d# where the first # is the number of dice to roll, the second # is the max of each die");for(var r=n[0];r>0;r--)i[r-1]=this.natural({min:1,max:n[1]});return void 0!==a.sum&&a.sum?i.reduce((function(e,a){return e+a})):i}throw new RangeError("Chance: A type of die roll must be included")},l.prototype.guid=function(e){e=c(e,{version:5});var a="abcdef1234567890";return this.string({pool:a,length:8})+"-"+this.string({pool:a,length:4})+"-"+e.version+this.string({pool:a,length:3})+"-"+this.string({pool:"ab89",length:1})+this.string({pool:a,length:3})+"-"+this.string({pool:a,length:12})},l.prototype.hash=function(e){var a="upper"===(e=c(e,{length:40,casing:"lower"})).casing?t.toUpperCase():t;return this.string({pool:a,length:e.length})},l.prototype.luhn_check=function(e){var a=e.toString();return+a.substring(a.length-1)===this.luhn_calculate(+a.substring(0,a.length-1))},l.prototype.luhn_calculate=function(e){for(var a,n=e.toString().split("").reverse(),i=0,r=0,t=n.length;t>r;++r)a=+n[r],r%2==0&&(a*=2)>9&&(a-=9),i+=a;return 9*i%10},l.prototype.md5=function(e){var a={str:"",key:null,raw:!1};if(e)if("string"==typeof e)a.str=e,e={};else{if("object"!=typeof e)return null;if("Array"===e.constructor)return null}else a.str=this.string(),e={};if(!(a=c(e,a)).str)throw new Error("A parameter is required to return an md5 hash.");return this.bimd5.md5(a.str,a.key,a.raw)},l.prototype.file=function(e){var a,n=e||{},i=Object.keys(this.get("fileExtension"));if(a=this.word({length:n.length}),n.extension)return a+"."+n.extension;if(n.extensions){if(Array.isArray(n.extensions))return a+"."+this.pickone(n.extensions);if(n.extensions.constructor===Object){var r=n.extensions,t=Object.keys(r);return a+"."+this.pickone(r[this.pickone(t)])}throw new Error("Chance: Extensions must be an Array or Object")}if(n.fileType){var o=n.fileType;if(-1!==i.indexOf(o))return a+"."+this.pickone(this.get("fileExtension")[o]);throw new RangeError("Chance: Expect file type value to be 'raster', 'vector', '3d' or 'document'")}return a+"."+this.pickone(this.get("fileExtension")[this.pickone(i)])};var g={firstNames:{male:{en:["James","John","Robert","Michael","William","David","Richard","Joseph","Charles","Thomas","Christopher","Daniel","Matthew","George","Donald","Anthony","Paul","Mark","Edward","Steven","Kenneth","Andrew","Brian","Joshua","Kevin","Ronald","Timothy","Jason","Jeffrey","Frank","Gary","Ryan","Nicholas","Eric","Stephen","Jacob","Larry","Jonathan","Scott","Raymond","Justin","Brandon","Gregory","Samuel","Benjamin","Patrick","Jack","Henry","Walter","Dennis","Jerry","Alexander","Peter","Tyler","Douglas","Harold","Aaron","Jose","Adam","Arthur","Zachary","Carl","Nathan","Albert","Kyle","Lawrence","Joe","Willie","Gerald","Roger","Keith","Jeremy","Terry","Harry","Ralph","Sean","Jesse","Roy","Louis","Billy","Austin","Bruce","Eugene","Christian","Bryan","Wayne","Russell","Howard","Fred","Ethan","Jordan","Philip","Alan","Juan","Randy","Vincent","Bobby","Dylan","Johnny","Phillip","Victor","Clarence","Ernest","Martin","Craig","Stanley","Shawn","Travis","Bradley","Leonard","Earl","Gabriel","Jimmy","Francis","Todd","Noah","Danny","Dale","Cody","Carlos","Allen","Frederick","Logan","Curtis","Alex","Joel","Luis","Norman","Marvin","Glenn","Tony","Nathaniel","Rodney","Melvin","Alfred","Steve","Cameron","Chad","Edwin","Caleb","Evan","Antonio","Lee","Herbert","Jeffery","Isaac","Derek","Ricky","Marcus","Theodore","Elijah","Luke","Jesus","Eddie","Troy","Mike","Dustin","Ray","Adrian","Bernard","Leroy","Angel","Randall","Wesley","Ian","Jared","Mason","Hunter","Calvin","Oscar","Clifford","Jay","Shane","Ronnie","Barry","Lucas","Corey","Manuel","Leo","Tommy","Warren","Jackson","Isaiah","Connor","Don","Dean","Jon","Julian","Miguel","Bill","Lloyd","Charlie","Mitchell","Leon","Jerome","Darrell","Jeremiah","Alvin","Brett","Seth","Floyd","Jim","Blake","Micheal","Gordon","Trevor","Lewis","Erik","Edgar","Vernon","Devin","Gavin","Jayden","Chris","Clyde","Tom","Derrick","Mario","Brent","Marc","Herman","Chase","Dominic","Ricardo","Franklin","Maurice","Max","Aiden","Owen","Lester","Gilbert","Elmer","Gene","Francisco","Glen","Cory","Garrett","Clayton","Sam","Jorge","Chester","Alejandro","Jeff","Harvey","Milton","Cole","Ivan","Andre","Duane","Landon"],it:["Adolfo","Alberto","Aldo","Alessandro","Alessio","Alfredo","Alvaro","Andrea","Angelo","Angiolo","Antonino","Antonio","Attilio","Benito","Bernardo","Bruno","Carlo","Cesare","Christian","Claudio","Corrado","Cosimo","Cristian","Cristiano","Daniele","Dario","David","Davide","Diego","Dino","Domenico","Duccio","Edoardo","Elia","Elio","Emanuele","Emiliano","Emilio","Enrico","Enzo","Ettore","Fabio","Fabrizio","Federico","Ferdinando","Fernando","Filippo","Francesco","Franco","Gabriele","Giacomo","Giampaolo","Giampiero","Giancarlo","Gianfranco","Gianluca","Gianmarco","Gianni","Gino","Giorgio","Giovanni","Giuliano","Giulio","Giuseppe","Graziano","Gregorio","Guido","Iacopo","Jacopo","Lapo","Leonardo","Lorenzo","Luca","Luciano","Luigi","Manuel","Marcello","Marco","Marino","Mario","Massimiliano","Massimo","Matteo","Mattia","Maurizio","Mauro","Michele","Mirko","Mohamed","Nello","Neri","Niccol??","Nicola","Osvaldo","Otello","Paolo","Pier Luigi","Piero","Pietro","Raffaele","Remo","Renato","Renzo","Riccardo","Roberto","Rolando","Romano","Salvatore","Samuele","Sandro","Sergio","Silvano","Simone","Stefano","Thomas","Tommaso","Ubaldo","Ugo","Umberto","Valerio","Valter","Vasco","Vincenzo","Vittorio"],nl:["Aaron","Abel","Adam","Adriaan","Albert","Alexander","Ali","Arjen","Arno","Bart","Bas","Bastiaan","Benjamin","Bob","Boris","Bram","Brent","Cas","Casper","Chris","Christiaan","Cornelis","Daan","Daley","Damian","Dani","Daniel","Dani??l","David","Dean","Dirk","Dylan","Egbert","Elijah","Erik","Erwin","Evert","Ezra","Fabian","Fedde","Finn","Florian","Floris","Frank","Frans","Frederik","Freek","Geert","Gerard","Gerben","Gerrit","Gijs","Guus","Hans","Hendrik","Henk","Herman","Hidde","Hugo","Jaap","Jan Jaap","Jan-Willem","Jack","Jacob","Jan","Jason","Jasper","Jayden","Jelle","Jelte","Jens","Jeroen","Jesse","Jim","Job","Joep","Johannes","John","Jonathan","Joris","Joshua","Jo??l","Julian","Kees","Kevin","Koen","Lars","Laurens","Leendert","Lennard","Lodewijk","Luc","Luca","Lucas","Lukas","Luuk","Maarten","Marcus","Martijn","Martin","Matthijs","Maurits","Max","Mees","Melle","Mick","Mika","Milan","Mohamed","Mohammed","Morris","Muhammed","Nathan","Nick","Nico","Niek","Niels","Noah","Noud","Olivier","Oscar","Owen","Paul","Pepijn","Peter","Pieter","Pim","Quinten","Reinier","Rens","Robin","Ruben","Sam","Samuel","Sander","Sebastiaan","Sem","Sep","Sepp","Siem","Simon","Stan","Stef","Steven","Stijn","Sven","Teun","Thijmen","Thijs","Thomas","Tijn","Tim","Timo","Tobias","Tom","Victor","Vince","Willem","Wim","Wouter","Yusuf"],fr:["Aaron","Abdon","Abel","Ab??lard","Abelin","Abondance","Abraham","Absalon","Acace","Achaire","Achille","Adalard","Adalbald","Adalb??ron","Adalbert","Adalric","Adam","Adegrin","Adel","Adelin","Andelin","Adelphe","Adam","Ad??odat","Adh??mar","Adjutor","Adolphe","Adonis","Adon","Adrien","Agapet","Agathange","Agathon","Agilbert","Ag??nor","Agnan","Aignan","Agrippin","Aimable","Aim??","Alain","Alban","Albin","Aubin","Alb??ric","Albert","Albertet","Alcibiade","Alcide","Alc??e","Alcime","Aldonce","Aldric","Ald??ric","Aleaume","Alexandre","Alexis","Alix","Alliaume","Aleaume","Almine","Almire","Alo??s","Alph??e","Alphonse","Alpinien","Alver??de","Amalric","Amaury","Amandin","Amant","Ambroise","Am??d??e","Am??lien","Amiel","Amour","Ana??l","Anastase","Anatole","Ancelin","And??ol","Andoche","Andr??","Andoche","Ange","Angelin","Angilbe","Anglebert","Angoustan","Anicet","Anne","Annibal","Ansbert","Anselme","Anthelme","Antheaume","Anthime","Antide","Antoine","Antonius","Antonin","Apollinaire","Apollon","Aquilin","Arcade","Archambaud","Archambeau","Archange","Archibald","Arian","Ariel","Ariste","Aristide","Armand","Armel","Armin","Arnould","Arnaud","Arolde","Ars??ne","Arsino??","Arthaud","Arth??me","Arthur","Ascelin","Athanase","Aubry","Audebert","Audouin","Audran","Audric","Auguste","Augustin","Aur??le","Aur??lien","Aurian","Auxence","Axel","Aymard","Aymeric","Aymon","Aymond","Balthazar","Baptiste","Barnab??","Barth??lemy","Bartim??e","Basile","Bastien","Baudouin","B??nigne","Benjamin","Beno??t","B??renger","B??rard","Bernard","Bertrand","Blaise","Bon","Boniface","Bouchard","Brice","Brieuc","Bruno","Brunon","Calixte","Calliste","Cam??lien","Camille","Camillien","Candide","Caribert","Carloman","Cassandre","Cassien","C??dric","C??leste","C??lestin","C??lien","C??saire","C??sar","Charles","Charlemagne","Childebert","Chilp??ric","Chr??tien","Christian","Christodule","Christophe","Chrysostome","Clarence","Claude","Claudien","Cl??andre","Cl??ment","Clotaire","C??me","Constance","Constant","Constantin","Corentin","Cyprien","Cyriaque","Cyrille","Cyril","Damien","Daniel","David","Delphin","Denis","D??sir??","Didier","Dieudonn??","Dimitri","Dominique","Dorian","Doroth??e","Edgard","Edmond","??douard","??leuth??re","??lie","??lis??e","??meric","??mile","??milien","Emmanuel","Enguerrand","??piphane","??ric","Esprit","Ernest","??tienne","Eubert","Eudes","Eudoxe","Eug??ne","Eus??be","Eustache","??variste","??vrard","Fabien","Fabrice","Falba","F??licit??","F??lix","Ferdinand","Fiacre","Fid??le","Firmin","Flavien","Flodoard","Florent","Florentin","Florestan","Florian","Fortun??","Foulques","Francisque","Fran??ois","Fran??ais","Franciscus","Francs","Fr??d??ric","Fulbert","Fulcran","Fulgence","Gabin","Gabriel","Ga??l","Garnier","Gaston","Gaspard","Gatien","Gaud","Gautier","G??d??on","Geoffroy","Georges","G??raud","G??rard","Gerbert","Germain","Gervais","Ghislain","Gilbert","Gilles","Girart","Gislebert","Gondebaud","Gonthier","Gontran","Gonzague","Gr??goire","Gu??rin","Gui","Guillaume","Gustave","Guy","Guyot","Hardouin","Hector","H??delin","H??lier","Henri","Herbert","Herluin","Herv??","Hilaire","Hildebert","Hincmar","Hippolyte","Honor??","Hubert","Hugues","Innocent","Isabeau","Isidore","Jacques","Japhet","Jason","Jean","Jeannel","Jeannot","J??r??mie","J??r??me","Joachim","Joanny","Job","Jocelyn","Jo??l","Johan","Jonas","Jonathan","Joseph","Josse","Josselin","Jourdain","Jude","Judica??l","Jules","Julien","Juste","Justin","Lambert","Landry","Laurent","Lazare","L??andre","L??on","L??onard","L??opold","Leu","Loup","Leufroy","Lib??re","Li??tald","Lionel","Lo??c","Longin","Lorrain","Lorraine","Lothaire","Louis","Loup","Luc","Lucas","Lucien","Ludolphe","Ludovic","Macaire","Malo","Mamert","Manass??","Marc","Marceau","Marcel","Marcelin","Marius","Marseille","Martial","Martin","Mathurin","Matthias","Mathias","Matthieu","Maugis","Maurice","Mauricet","Maxence","Maxime","Maximilien","Mayeul","M??d??ric","Melchior","Mence","Merlin","M??rov??e","Micha??l","Michel","Mo??se","Morgan","Nathan","Nathana??l","Narcisse","N??h??mie","Nestor","Nestor","Nic??phore","Nicolas","No??","No??l","Norbert","Normand","Normands","Octave","Odilon","Odon","Oger","Olivier","Oury","Pac??me","Pal??mon","Parfait","Pascal","Paterne","Patrice","Paul","P??pin","Perceval","Phil??mon","Philibert","Philippe","Philoth??e","Pie","Pierre","Pierrick","Prosper","Quentin","Raoul","Rapha??l","Raymond","R??gis","R??jean","R??mi","Renaud","Ren??","Reybaud","Richard","Robert","Roch","Rodolphe","Rodrigue","Roger","Roland","Romain","Romuald","Rom??o","Rome","Ronan","Roselin","Salomon","Samuel","Savin","Savinien","Scholastique","S??bastien","S??raphin","Serge","S??verin","Sidoine","Sigebert","Sigismond","Silv??re","Simon","Sim??on","Sixte","Stanislas","St??phane","Stephan","Sylvain","Sylvestre","Tancr??de","Tanguy","Taurin","Th??odore","Th??odose","Th??ophile","Th??ophraste","Thibault","Thibert","Thierry","Thomas","Timol??on","Timoth??e","Titien","Tonnin","Toussaint","Trajan","Tristan","Turold","Tim","Ulysse","Urbain","Valentin","Val??re","Val??ry","Venance","Venant","Venceslas","Vianney","Victor","Victorien","Victorin","Vigile","Vincent","Vital","Vitalien","Vivien","Waleran","Wandrille","Xavier","X??nophon","Yves","Zacharie","Zach??","Z??phirin"]},female:{en:["Mary","Emma","Elizabeth","Minnie","Margaret","Ida","Alice","Bertha","Sarah","Annie","Clara","Ella","Florence","Cora","Martha","Laura","Nellie","Grace","Carrie","Maude","Mabel","Bessie","Jennie","Gertrude","Julia","Hattie","Edith","Mattie","Rose","Catherine","Lillian","Ada","Lillie","Helen","Jessie","Louise","Ethel","Lula","Myrtle","Eva","Frances","Lena","Lucy","Edna","Maggie","Pearl","Daisy","Fannie","Josephine","Dora","Rosa","Katherine","Agnes","Marie","Nora","May","Mamie","Blanche","Stella","Ellen","Nancy","Effie","Sallie","Nettie","Della","Lizzie","Flora","Susie","Maud","Mae","Etta","Harriet","Sadie","Caroline","Katie","Lydia","Elsie","Kate","Susan","Mollie","Alma","Addie","Georgia","Eliza","Lulu","Nannie","Lottie","Amanda","Belle","Charlotte","Rebecca","Ruth","Viola","Olive","Amelia","Hannah","Jane","Virginia","Emily","Matilda","Irene","Kathryn","Esther","Willie","Henrietta","Ollie","Amy","Rachel","Sara","Estella","Theresa","Augusta","Ora","Pauline","Josie","Lola","Sophia","Leona","Anne","Mildred","Ann","Beulah","Callie","Lou","Delia","Eleanor","Barbara","Iva","Louisa","Maria","Mayme","Evelyn","Estelle","Nina","Betty","Marion","Bettie","Dorothy","Luella","Inez","Lela","Rosie","Allie","Millie","Janie","Cornelia","Victoria","Ruby","Winifred","Alta","Celia","Christine","Beatrice","Birdie","Harriett","Mable","Myra","Sophie","Tillie","Isabel","Sylvia","Carolyn","Isabelle","Leila","Sally","Ina","Essie","Bertie","Nell","Alberta","Katharine","Lora","Rena","Mina","Rhoda","Mathilda","Abbie","Eula","Dollie","Hettie","Eunice","Fanny","Ola","Lenora","Adelaide","Christina","Lelia","Nelle","Sue","Johanna","Lilly","Lucinda","Minerva","Lettie","Roxie","Cynthia","Helena","Hilda","Hulda","Bernice","Genevieve","Jean","Cordelia","Marian","Francis","Jeanette","Adeline","Gussie","Leah","Lois","Lura","Mittie","Hallie","Isabella","Olga","Phoebe","Teresa","Hester","Lida","Lina","Winnie","Claudia","Marguerite","Vera","Cecelia","Bess","Emilie","Rosetta","Verna","Myrtie","Cecilia","Elva","Olivia","Ophelia","Georgie","Elnora","Violet","Adele","Lily","Linnie","Loretta","Madge","Polly","Virgie","Eugenia","Lucile","Lucille","Mabelle","Rosalie"],it:["Ada","Adriana","Alessandra","Alessia","Alice","Angela","Anna","Anna Maria","Annalisa","Annita","Annunziata","Antonella","Arianna","Asia","Assunta","Aurora","Barbara","Beatrice","Benedetta","Bianca","Bruna","Camilla","Carla","Carlotta","Carmela","Carolina","Caterina","Catia","Cecilia","Chiara","Cinzia","Clara","Claudia","Costanza","Cristina","Daniela","Debora","Diletta","Dina","Donatella","Elena","Eleonora","Elisa","Elisabetta","Emanuela","Emma","Eva","Federica","Fernanda","Fiorella","Fiorenza","Flora","Franca","Francesca","Gabriella","Gaia","Gemma","Giada","Gianna","Gina","Ginevra","Giorgia","Giovanna","Giulia","Giuliana","Giuseppa","Giuseppina","Grazia","Graziella","Greta","Ida","Ilaria","Ines","Iolanda","Irene","Irma","Isabella","Jessica","Laura","Lea","Letizia","Licia","Lidia","Liliana","Lina","Linda","Lisa","Livia","Loretta","Luana","Lucia","Luciana","Lucrezia","Luisa","Manuela","Mara","Marcella","Margherita","Maria","Maria Cristina","Maria Grazia","Maria Luisa","Maria Pia","Maria Teresa","Marina","Marisa","Marta","Martina","Marzia","Matilde","Melissa","Michela","Milena","Mirella","Monica","Natalina","Nella","Nicoletta","Noemi","Olga","Paola","Patrizia","Piera","Pierina","Raffaella","Rebecca","Renata","Rina","Rita","Roberta","Rosa","Rosanna","Rossana","Rossella","Sabrina","Sandra","Sara","Serena","Silvana","Silvia","Simona","Simonetta","Sofia","Sonia","Stefania","Susanna","Teresa","Tina","Tiziana","Tosca","Valentina","Valeria","Vanda","Vanessa","Vanna","Vera","Veronica","Vilma","Viola","Virginia","Vittoria"],nl:["Ada","Arianne","Afke","Amanda","Amber","Amy","Aniek","Anita","Anja","Anna","Anne","Annelies","Annemarie","Annette","Anouk","Astrid","Aukje","Barbara","Bianca","Carla","Carlijn","Carolien","Chantal","Charlotte","Claudia","Dani??lle","Debora","Diane","Dora","Eline","Elise","Ella","Ellen","Emma","Esmee","Evelien","Esther","Erica","Eva","Femke","Fleur","Floor","Froukje","Gea","Gerda","Hanna","Hanneke","Heleen","Hilde","Ilona","Ina","Inge","Ingrid","Iris","Isabel","Isabelle","Janneke","Jasmijn","Jeanine","Jennifer","Jessica","Johanna","Joke","Julia","Julie","Karen","Karin","Katja","Kim","Lara","Laura","Lena","Lianne","Lieke","Lilian","Linda","Lisa","Lisanne","Lotte","Louise","Maaike","Manon","Marga","Maria","Marissa","Marit","Marjolein","Martine","Marleen","Melissa","Merel","Miranda","Michelle","Mirjam","Mirthe","Naomi","Natalie","Nienke","Nina","Noortje","Olivia","Patricia","Paula","Paulien","Ramona","Ria","Rianne","Roos","Rosanne","Ruth","Sabrina","Sandra","Sanne","Sara","Saskia","Silvia","Sofia","Sophie","Sonja","Suzanne","Tamara","Tess","Tessa","Tineke","Valerie","Vanessa","Veerle","Vera","Victoria","Wendy","Willeke","Yvonne","Zo??"],fr:["Abdon","Abel","Abiga??lle","Abiga??l","Acacius","Acanthe","Adalbert","Adalsinde","Adegrine","Ad??la??de","Ad??le","Ad??lie","Adeline","Adeltrude","Adolphe","Adonis","Adrast??e","Adrehilde","Adrienne","Agathe","Agilbert","Agla??","Aignan","Agnefl??te","Agn??s","Agrippine","Aim??","Alaine","Ala??s","Albane","Alb??rade","Alberte","Alcide","Alcine","Alcyone","Aldegonde","Aleth","Alexandrine","Alexine","Alice","Ali??nor","Aliette","Aline","Alix","Aliz??","Alo??se","Aloyse","Alphonsine","Alth??e","Amaliane","Amalth??e","Amande","Amandine","Amant","Amarande","Amaranthe","Amaryllis","Ambre","Ambroisie","Am??lie","Am??thyste","Aminte","Ana??l","Ana??s","Anastasie","Anatole","Ancelin","Andr??e","An??mone","Angadr??me","Ang??le","Angeline","Ang??lique","Angilbert","Anicet","Annabelle","Anne","Annette","Annick","Annie","Annonciade","Ansbert","Anstrudie","Anthelme","Antigone","Antoinette","Antonine","Aph??lie","Apolline","Apollonie","Aquiline","Arabelle","Arcadie","Archange","Argine","Ariane","Aricie","Ariel","Arielle","Arlette","Armance","Armande","Armandine","Armelle","Armide","Armelle","Armin","Arnaud","Ars??ne","Arsino??","Art??mis","Arthur","Ascelin","Ascension","Assomption","Astart??","Ast??rie","Astr??e","Astrid","Athalie","Athanasie","Athina","Aube","Albert","Aude","Audrey","Augustine","Aure","Aur??lie","Aur??lien","Aur??le","Aurore","Auxence","Aveline","Abiga??lle","Avoye","Axelle","Aymard","Azal??e","Ad??le","Adeline","Barbe","Basilisse","Bathilde","B??atrice","B??atrix","B??n??dicte","B??reng??re","Bernadette","Berthe","Bertille","Beuve","Blanche","Blanc","Blandine","Brigitte","Brune","Brunehilde","Callista","Camille","Capucine","Carine","Caroline","Cassandre","Catherine","C??cile","C??leste","C??lestine","C??line","Chantal","Charl??ne","Charline","Charlotte","Chlo??","Christelle","Christiane","Christine","Claire","Clara","Claude","Claudine","Clarisse","Cl??mence","Cl??mentine","Cl??o","Clio","Clotilde","Coline","Conception","Constance","Coralie","Coraline","Corentine","Corinne","Cyrielle","Daniel","Daniel","Daphn??","D??bora","Delphine","Denise","Diane","Dieudonn??","Dominique","Doriane","Doroth??e","Douce","??dith","Edm??e","??l??onore","??liane","??lia","??liette","??lisabeth","??lise","Ella","??lodie","??lo??se","Elsa","??meline","??m??rance","??m??rentienne","??m??rencie","??milie","Emma","Emmanuelle","Emmelie","Ernestine","Esther","Estelle","Eudoxie","Eug??nie","Eulalie","Euphrasie","Eus??bie","??vang??line","Eva","??ve","??velyne","Fanny","Fantine","Faustine","F??licie","Fernande","Flavie","Fleur","Flore","Florence","Florie","Fortun??","France","Francia","Fran??oise","Francine","Gabrielle","Ga??lle","Garance","Genevi??ve","Georgette","Gerberge","Germaine","Gertrude","Gis??le","Gueni??vre","Guilhemine","Guillemette","Gustave","Gwenael","H??l??ne","H??lo??se","Henriette","Hermine","Hermione","Hippolyte","Honorine","Hortense","Huguette","Ines","Ir??ne","Irina","Iris","Isabeau","Isabelle","Iseult","Isolde","Ism??rie","Jacinthe","Jacqueline","Jade","Janine","Jeanne","Jocelyne","Jo??lle","Jos??phine","Judith","Julia","Julie","Jules","Juliette","Justine","Katy","Kathy","Katie","Laura","Laure","Laureline","Laurence","Laurene","Lauriane","Laurianne","Laurine","L??a","L??na","L??onie","L??on","L??ontine","Lorraine","Lucie","Lucienne","Lucille","Ludivine","Lydie","Lydie","Megane","Madeleine","Magali","Maguelone","Mallaury","Manon","Marceline","Margot","Marguerite","Marianne","Marie","Myriam","Marie","Marine","Marion","Marl??ne","Marthe","Martine","Mathilde","Maud","Maureen","Mauricette","Maxime","M??lanie","Melissa","M??lissandre","M??lisande","M??lodie","Michel","Micheline","Mireille","Miriam","Mo??se","Monique","Morgane","Muriel","Myl??ne","Nad??ge","Nadine","Nathalie","Nicole","Nicolette","Nine","No??l","No??mie","Oc??ane","Odette","Odile","Olive","Olivia","Olympe","Ombline","Ombeline","Oph??lie","Oriande","Oriane","Ozanne","Pascale","Pascaline","Paule","Paulette","Pauline","Priscille","Prisca","Prisque","P??cine","P??lagie","P??n??lope","Perrine","P??tronille","Philippine","Philom??ne","Philoth??e","Primerose","Prudence","Pulch??rie","Quentine","Qui??ta","Quintia","Quintilla","Rachel","Rapha??lle","Raymonde","Rebecca","R??gine","R??jeanne","Ren??","Rita","Rita","Rolande","Romane","Rosalie","Rose","Roseline","Sabine","Salom??","Sandra","Sandrine","Sarah","S??gol??ne","S??verine","Sibylle","Simone","Sixt","Solange","Soline","Sol??ne","Sophie","St??phanie","Suzanne","Sylvain","Sylvie","Tatiana","Tha??s","Th??odora","Th??r??se","Tiphaine","Ursule","Valentine","Val??rie","V??ronique","Victoire","Victorine","Vinciane","Violette","Virginie","Viviane","Xavi??re","Yolande","Ysaline","Yvette","Yvonne","Z??lie","Zita","Zo??"]}},lastNames:{en:["Smith","Johnson","Williams","Jones","Brown","Davis","Miller","Wilson","Moore","Taylor","Anderson","Thomas","Jackson","White","Harris","Martin","Thompson","Garcia","Martinez","Robinson","Clark","Rodriguez","Lewis","Lee","Walker","Hall","Allen","Young","Hernandez","King","Wright","Lopez","Hill","Scott","Green","Adams","Baker","Gonzalez","Nelson","Carter","Mitchell","Perez","Roberts","Turner","Phillips","Campbell","Parker","Evans","Edwards","Collins","Stewart","Sanchez","Morris","Rogers","Reed","Cook","Morgan","Bell","Murphy","Bailey","Rivera","Cooper","Richardson","Cox","Howard","Ward","Torres","Peterson","Gray","Ramirez","James","Watson","Brooks","Kelly","Sanders","Price","Bennett","Wood","Barnes","Ross","Henderson","Coleman","Jenkins","Perry","Powell","Long","Patterson","Hughes","Flores","Washington","Butler","Simmons","Foster","Gonzales","Bryant","Alexander","Russell","Griffin","Diaz","Hayes","Myers","Ford","Hamilton","Graham","Sullivan","Wallace","Woods","Cole","West","Jordan","Owens","Reynolds","Fisher","Ellis","Harrison","Gibson","McDonald","Cruz","Marshall","Ortiz","Gomez","Murray","Freeman","Wells","Webb","Simpson","Stevens","Tucker","Porter","Hunter","Hicks","Crawford","Henry","Boyd","Mason","Morales","Kennedy","Warren","Dixon","Ramos","Reyes","Burns","Gordon","Shaw","Holmes","Rice","Robertson","Hunt","Black","Daniels","Palmer","Mills","Nichols","Grant","Knight","Ferguson","Rose","Stone","Hawkins","Dunn","Perkins","Hudson","Spencer","Gardner","Stephens","Payne","Pierce","Berry","Matthews","Arnold","Wagner","Willis","Ray","Watkins","Olson","Carroll","Duncan","Snyder","Hart","Cunningham","Bradley","Lane","Andrews","Ruiz","Harper","Fox","Riley","Armstrong","Carpenter","Weaver","Greene","Lawrence","Elliott","Chavez","Sims","Austin","Peters","Kelley","Franklin","Lawson","Fields","Gutierrez","Ryan","Schmidt","Carr","Vasquez","Castillo","Wheeler","Chapman","Oliver","Montgomery","Richards","Williamson","Johnston","Banks","Meyer","Bishop","McCoy","Howell","Alvarez","Morrison","Hansen","Fernandez","Garza","Harvey","Little","Burton","Stanley","Nguyen","George","Jacobs","Reid","Kim","Fuller","Lynch","Dean","Gilbert","Garrett","Romero","Welch","Larson","Frazier","Burke","Hanson","Day","Mendoza","Moreno","Bowman","Medina","Fowler","Brewer","Hoffman","Carlson","Silva","Pearson","Holland","Douglas","Fleming","Jensen","Vargas","Byrd","Davidson","Hopkins","May","Terry","Herrera","Wade","Soto","Walters","Curtis","Neal","Caldwell","Lowe","Jennings","Barnett","Graves","Jimenez","Horton","Shelton","Barrett","Obrien","Castro","Sutton","Gregory","McKinney","Lucas","Miles","Craig","Rodriquez","Chambers","Holt","Lambert","Fletcher","Watts","Bates","Hale","Rhodes","Pena","Beck","Newman","Haynes","McDaniel","Mendez","Bush","Vaughn","Parks","Dawson","Santiago","Norris","Hardy","Love","Steele","Curry","Powers","Schultz","Barker","Guzman","Page","Munoz","Ball","Keller","Chandler","Weber","Leonard","Walsh","Lyons","Ramsey","Wolfe","Schneider","Mullins","Benson","Sharp","Bowen","Daniel","Barber","Cummings","Hines","Baldwin","Griffith","Valdez","Hubbard","Salazar","Reeves","Warner","Stevenson","Burgess","Santos","Tate","Cross","Garner","Mann","Mack","Moss","Thornton","Dennis","McGee","Farmer","Delgado","Aguilar","Vega","Glover","Manning","Cohen","Harmon","Rodgers","Robbins","Newton","Todd","Blair","Higgins","Ingram","Reese","Cannon","Strickland","Townsend","Potter","Goodwin","Walton","Rowe","Hampton","Ortega","Patton","Swanson","Joseph","Francis","Goodman","Maldonado","Yates","Becker","Erickson","Hodges","Rios","Conner","Adkins","Webster","Norman","Malone","Hammond","Flowers","Cobb","Moody","Quinn","Blake","Maxwell","Pope","Floyd","Osborne","Paul","McCarthy","Guerrero","Lindsey","Estrada","Sandoval","Gibbs","Tyler","Gross","Fitzgerald","Stokes","Doyle","Sherman","Saunders","Wise","Colon","Gill","Alvarado","Greer","Padilla","Simon","Waters","Nunez","Ballard","Schwartz","McBride","Houston","Christensen","Klein","Pratt","Briggs","Parsons","McLaughlin","Zimmerman","French","Buchanan","Moran","Copeland","Roy","Pittman","Brady","McCormick","Holloway","Brock","Poole","Frank","Logan","Owen","Bass","Marsh","Drake","Wong","Jefferson","Park","Morton","Abbott","Sparks","Patrick","Norton","Huff","Clayton","Massey","Lloyd","Figueroa","Carson","Bowers","Roberson","Barton","Tran","Lamb","Harrington","Casey","Boone","Cortez","Clarke","Mathis","Singleton","Wilkins","Cain","Bryan","Underwood","Hogan","McKenzie","Collier","Luna","Phelps","McGuire","Allison","Bridges","Wilkerson","Nash","Summers","Atkins"],it:["Acciai","Aglietti","Agostini","Agresti","Ahmed","Aiazzi","Albanese","Alberti","Alessi","Alfani","Alinari","Alterini","Amato","Ammannati","Ancillotti","Andrei","Andreini","Andreoni","Angeli","Anichini","Antonelli","Antonini","Arena","Ariani","Arnetoli","Arrighi","Baccani","Baccetti","Bacci","Bacherini","Badii","Baggiani","Baglioni","Bagni","Bagnoli","Baldassini","Baldi","Baldini","Ballerini","Balli","Ballini","Balloni","Bambi","Banchi","Bandinelli","Bandini","Bani","Barbetti","Barbieri","Barchielli","Bardazzi","Bardelli","Bardi","Barducci","Bargellini","Bargiacchi","Barni","Baroncelli","Baroncini","Barone","Baroni","Baronti","Bartalesi","Bartoletti","Bartoli","Bartolini","Bartoloni","Bartolozzi","Basagni","Basile","Bassi","Batacchi","Battaglia","Battaglini","Bausi","Becagli","Becattini","Becchi","Becucci","Bellandi","Bellesi","Belli","Bellini","Bellucci","Bencini","Benedetti","Benelli","Beni","Benini","Bensi","Benucci","Benvenuti","Berlincioni","Bernacchioni","Bernardi","Bernardini","Berni","Bernini","Bertelli","Berti","Bertini","Bessi","Betti","Bettini","Biagi","Biagini","Biagioni","Biagiotti","Biancalani","Bianchi","Bianchini","Bianco","Biffoli","Bigazzi","Bigi","Biliotti","Billi","Binazzi","Bindi","Bini","Biondi","Bizzarri","Bocci","Bogani","Bolognesi","Bonaiuti","Bonanni","Bonciani","Boncinelli","Bondi","Bonechi","Bongini","Boni","Bonini","Borchi","Boretti","Borghi","Borghini","Borgioli","Borri","Borselli","Boschi","Bottai","Bracci","Braccini","Brandi","Braschi","Bravi","Brazzini","Breschi","Brilli","Brizzi","Brogelli","Brogi","Brogioni","Brunelli","Brunetti","Bruni","Bruno","Brunori","Bruschi","Bucci","Bucciarelli","Buccioni","Bucelli","Bulli","Burberi","Burchi","Burgassi","Burroni","Bussotti","Buti","Caciolli","Caiani","Calabrese","Calamai","Calamandrei","Caldini","Calo'","Calonaci","Calosi","Calvelli","Cambi","Camiciottoli","Cammelli","Cammilli","Campolmi","Cantini","Capanni","Capecchi","Caponi","Cappelletti","Cappelli","Cappellini","Cappugi","Capretti","Caputo","Carbone","Carboni","Cardini","Carlesi","Carletti","Carli","Caroti","Carotti","Carrai","Carraresi","Carta","Caruso","Casalini","Casati","Caselli","Casini","Castagnoli","Castellani","Castelli","Castellucci","Catalano","Catarzi","Catelani","Cavaciocchi","Cavallaro","Cavallini","Cavicchi","Cavini","Ceccarelli","Ceccatelli","Ceccherelli","Ceccherini","Cecchi","Cecchini","Cecconi","Cei","Cellai","Celli","Cellini","Cencetti","Ceni","Cenni","Cerbai","Cesari","Ceseri","Checcacci","Checchi","Checcucci","Cheli","Chellini","Chen","Cheng","Cherici","Cherubini","Chiaramonti","Chiarantini","Chiarelli","Chiari","Chiarini","Chiarugi","Chiavacci","Chiesi","Chimenti","Chini","Chirici","Chiti","Ciabatti","Ciampi","Cianchi","Cianfanelli","Cianferoni","Ciani","Ciapetti","Ciappi","Ciardi","Ciatti","Cicali","Ciccone","Cinelli","Cini","Ciobanu","Ciolli","Cioni","Cipriani","Cirillo","Cirri","Ciucchi","Ciuffi","Ciulli","Ciullini","Clemente","Cocchi","Cognome","Coli","Collini","Colombo","Colzi","Comparini","Conforti","Consigli","Conte","Conti","Contini","Coppini","Coppola","Corsi","Corsini","Corti","Cortini","Cosi","Costa","Costantini","Costantino","Cozzi","Cresci","Crescioli","Cresti","Crini","Curradi","D'Agostino","D'Alessandro","D'Amico","D'Angelo","Daddi","Dainelli","Dallai","Danti","Davitti","De Angelis","De Luca","De Marco","De Rosa","De Santis","De Simone","De Vita","Degl'Innocenti","Degli Innocenti","Dei","Del Lungo","Del Re","Di Marco","Di Stefano","Dini","Diop","Dobre","Dolfi","Donati","Dondoli","Dong","Donnini","Ducci","Dumitru","Ermini","Esposito","Evangelisti","Fabbri","Fabbrini","Fabbrizzi","Fabbroni","Fabbrucci","Fabiani","Facchini","Faggi","Fagioli","Failli","Faini","Falciani","Falcini","Falcone","Fallani","Falorni","Falsini","Falugiani","Fancelli","Fanelli","Fanetti","Fanfani","Fani","Fantappie'","Fantechi","Fanti","Fantini","Fantoni","Farina","Fattori","Favilli","Fedi","Fei","Ferrante","Ferrara","Ferrari","Ferraro","Ferretti","Ferri","Ferrini","Ferroni","Fiaschi","Fibbi","Fiesoli","Filippi","Filippini","Fini","Fioravanti","Fiore","Fiorentini","Fiorini","Fissi","Focardi","Foggi","Fontana","Fontanelli","Fontani","Forconi","Formigli","Forte","Forti","Fortini","Fossati","Fossi","Francalanci","Franceschi","Franceschini","Franchi","Franchini","Franci","Francini","Francioni","Franco","Frassineti","Frati","Fratini","Frilli","Frizzi","Frosali","Frosini","Frullini","Fusco","Fusi","Gabbrielli","Gabellini","Gagliardi","Galanti","Galardi","Galeotti","Galletti","Galli","Gallo","Gallori","Gambacciani","Gargani","Garofalo","Garuglieri","Gashi","Gasperini","Gatti","Gelli","Gensini","Gentile","Gentili","Geri","Gerini","Gheri","Ghini","Giachetti","Giachi","Giacomelli","Gianassi","Giani","Giannelli","Giannetti","Gianni","Giannini","Giannoni","Giannotti","Giannozzi","Gigli","Giordano","Giorgetti","Giorgi","Giovacchini","Giovannelli","Giovannetti","Giovannini","Giovannoni","Giuliani","Giunti","Giuntini","Giusti","Gonnelli","Goretti","Gori","Gradi","Gramigni","Grassi","Grasso","Graziani","Grazzini","Greco","Grifoni","Grillo","Grimaldi","Grossi","Gualtieri","Guarducci","Guarino","Guarnieri","Guasti","Guerra","Guerri","Guerrini","Guidi","Guidotti","He","Hoxha","Hu","Huang","Iandelli","Ignesti","Innocenti","Jin","La Rosa","Lai","Landi","Landini","Lanini","Lapi","Lapini","Lari","Lascialfari","Lastrucci","Latini","Lazzeri","Lazzerini","Lelli","Lenzi","Leonardi","Leoncini","Leone","Leoni","Lepri","Li","Liao","Lin","Linari","Lippi","Lisi","Livi","Lombardi","Lombardini","Lombardo","Longo","Lopez","Lorenzi","Lorenzini","Lorini","Lotti","Lu","Lucchesi","Lucherini","Lunghi","Lupi","Madiai","Maestrini","Maffei","Maggi","Maggini","Magherini","Magini","Magnani","Magnelli","Magni","Magnolfi","Magrini","Malavolti","Malevolti","Manca","Mancini","Manetti","Manfredi","Mangani","Mannelli","Manni","Mannini","Mannucci","Manuelli","Manzini","Marcelli","Marchese","Marchetti","Marchi","Marchiani","Marchionni","Marconi","Marcucci","Margheri","Mari","Mariani","Marilli","Marinai","Marinari","Marinelli","Marini","Marino","Mariotti","Marsili","Martelli","Martinelli","Martini","Martino","Marzi","Masi","Masini","Masoni","Massai","Materassi","Mattei","Matteini","Matteucci","Matteuzzi","Mattioli","Mattolini","Matucci","Mauro","Mazzanti","Mazzei","Mazzetti","Mazzi","Mazzini","Mazzocchi","Mazzoli","Mazzoni","Mazzuoli","Meacci","Mecocci","Meini","Melani","Mele","Meli","Mengoni","Menichetti","Meoni","Merlini","Messeri","Messina","Meucci","Miccinesi","Miceli","Micheli","Michelini","Michelozzi","Migliori","Migliorini","Milani","Miniati","Misuri","Monaco","Montagnani","Montagni","Montanari","Montelatici","Monti","Montigiani","Montini","Morandi","Morandini","Morelli","Moretti","Morganti","Mori","Morini","Moroni","Morozzi","Mugnai","Mugnaini","Mustafa","Naldi","Naldini","Nannelli","Nanni","Nannini","Nannucci","Nardi","Nardini","Nardoni","Natali","Ndiaye","Nencetti","Nencini","Nencioni","Neri","Nesi","Nesti","Niccolai","Niccoli","Niccolini","Nigi","Nistri","Nocentini","Noferini","Novelli","Nucci","Nuti","Nutini","Oliva","Olivieri","Olmi","Orlandi","Orlandini","Orlando","Orsini","Ortolani","Ottanelli","Pacciani","Pace","Paci","Pacini","Pagani","Pagano","Paggetti","Pagliai","Pagni","Pagnini","Paladini","Palagi","Palchetti","Palloni","Palmieri","Palumbo","Pampaloni","Pancani","Pandolfi","Pandolfini","Panerai","Panichi","Paoletti","Paoli","Paolini","Papi","Papini","Papucci","Parenti","Parigi","Parisi","Parri","Parrini","Pasquini","Passeri","Pecchioli","Pecorini","Pellegrini","Pepi","Perini","Perrone","Peruzzi","Pesci","Pestelli","Petri","Petrini","Petrucci","Pettini","Pezzati","Pezzatini","Piani","Piazza","Piazzesi","Piazzini","Piccardi","Picchi","Piccini","Piccioli","Pieraccini","Pieraccioni","Pieralli","Pierattini","Pieri","Pierini","Pieroni","Pietrini","Pini","Pinna","Pinto","Pinzani","Pinzauti","Piras","Pisani","Pistolesi","Poggesi","Poggi","Poggiali","Poggiolini","Poli","Pollastri","Porciani","Pozzi","Pratellesi","Pratesi","Prosperi","Pruneti","Pucci","Puccini","Puccioni","Pugi","Pugliese","Puliti","Querci","Quercioli","Raddi","Radu","Raffaelli","Ragazzini","Ranfagni","Ranieri","Rastrelli","Raugei","Raveggi","Renai","Renzi","Rettori","Ricci","Ricciardi","Ridi","Ridolfi","Rigacci","Righi","Righini","Rinaldi","Risaliti","Ristori","Rizzo","Rocchi","Rocchini","Rogai","Romagnoli","Romanelli","Romani","Romano","Romei","Romeo","Romiti","Romoli","Romolini","Rontini","Rosati","Roselli","Rosi","Rossetti","Rossi","Rossini","Rovai","Ruggeri","Ruggiero","Russo","Sabatini","Saccardi","Sacchetti","Sacchi","Sacco","Salerno","Salimbeni","Salucci","Salvadori","Salvestrini","Salvi","Salvini","Sanesi","Sani","Sanna","Santi","Santini","Santoni","Santoro","Santucci","Sardi","Sarri","Sarti","Sassi","Sbolci","Scali","Scarpelli","Scarselli","Scopetani","Secci","Selvi","Senatori","Senesi","Serafini","Sereni","Serra","Sestini","Sguanci","Sieni","Signorini","Silvestri","Simoncini","Simonetti","Simoni","Singh","Sodi","Soldi","Somigli","Sorbi","Sorelli","Sorrentino","Sottili","Spina","Spinelli","Staccioli","Staderini","Stefanelli","Stefani","Stefanini","Stella","Susini","Tacchi","Tacconi","Taddei","Tagliaferri","Tamburini","Tanganelli","Tani","Tanini","Tapinassi","Tarchi","Tarchiani","Targioni","Tassi","Tassini","Tempesti","Terzani","Tesi","Testa","Testi","Tilli","Tinti","Tirinnanzi","Toccafondi","Tofanari","Tofani","Tognaccini","Tonelli","Tonini","Torelli","Torrini","Tosi","Toti","Tozzi","Trambusti","Trapani","Tucci","Turchi","Ugolini","Ulivi","Valente","Valenti","Valentini","Vangelisti","Vanni","Vannini","Vannoni","Vannozzi","Vannucchi","Vannucci","Ventura","Venturi","Venturini","Vestri","Vettori","Vichi","Viciani","Vieri","Vigiani","Vignoli","Vignolini","Vignozzi","Villani","Vinci","Visani","Vitale","Vitali","Viti","Viviani","Vivoli","Volpe","Volpi","Wang","Wu","Xu","Yang","Ye","Zagli","Zani","Zanieri","Zanobini","Zecchi","Zetti","Zhang","Zheng","Zhou","Zhu","Zingoni","Zini","Zoppi"],nl:["Albers","Alblas","Appelman","Baars","Baas","Bakker","Blank","Bleeker","Blok","Blom","Boer","Boers","Boldewijn","Boon","Boot","Bos","Bosch","Bosma","Bosman","Bouma","Bouman","Bouwman","Brands","Brouwer","Burger","Buijs","Buitenhuis","Ceder","Cohen","Dekker","Dekkers","Dijkman","Dijkstra","Driessen","Drost","Engel","Evers","Faber","Franke","Gerritsen","Goedhart","Goossens","Groen","Groenenberg","Groot","Haan","Hart","Heemskerk","Hendriks","Hermans","Hoekstra","Hofman","Hopman","Huisman","Jacobs","Jansen","Janssen","Jonker","Jaspers","Keijzer","Klaassen","Klein","Koek","Koenders","Kok","Kool","Koopman","Koopmans","Koning","Koster","Kramer","Kroon","Kuijpers","Kuiper","Kuipers","Kurt","Koster","Kwakman","Los","Lubbers","Maas","Markus","Martens","Meijer","Mol","Molenaar","Mulder","Nieuwenhuis","Peeters","Peters","Pengel","Pieters","Pool","Post","Postma","Prins","Pronk","Reijnders","Rietveld","Roest","Roos","Sanders","Schaap","Scheffer","Schenk","Schilder","Schipper","Schmidt","Scholten","Schouten","Schut","Schutte","Schuurman","Simons","Smeets","Smit","Smits","Snel","Swinkels","Tas","Terpstra","Timmermans","Tol","Tromp","Troost","Valk","Veenstra","Veldkamp","Verbeek","Verheul","Verhoeven","Vermeer","Vermeulen","Verweij","Vink","Visser","Voorn","Vos","Wagenaar","Wiersema","Willems","Willemsen","Witteveen","Wolff","Wolters","Zijlstra","Zwart","de Beer","de Boer","de Bruijn","de Bruin","de Graaf","de Groot","de Haan","de Haas","de Jager","de Jong","de Jonge","de Koning","de Lange","de Leeuw","de Ridder","de Rooij","de Ruiter","de Vos","de Vries","de Waal","de Wit","de Zwart","van Beek","van Boven","van Dam","van Dijk","van Dongen","van Doorn","van Egmond","van Eijk","van Es","van Gelder","van Gelderen","van Houten","van Hulst","van Kempen","van Kesteren","van Leeuwen","van Loon","van Mill","van Noord","van Ommen","van Ommeren","van Oosten","van Oostveen","van Rijn","van Schaik","van Veen","van Vliet","van Wijk","van Wijngaarden","van den Poel","van de Pol","van den Ploeg","van de Ven","van den Berg","van den Bosch","van den Brink","van den Broek","van den Heuvel","van der Heijden","van der Horst","van der Hulst","van der Kroon","van der Laan","van der Linden","van der Meer","van der Meij","van der Meulen","van der Molen","van der Sluis","van der Spek","van der Veen","van der Velde","van der Velden","van der Vliet","van der Wal"],uk:["Smith","Jones","Williams","Taylor","Brown","Davies","Evans","Wilson","Thomas","Johnson","Roberts","Robinson","Thompson","Wright","Walker","White","Edwards","Hughes","Green","Hall","Lewis","Harris","Clarke","Patel","Jackson","Wood","Turner","Martin","Cooper","Hill","Ward","Morris","Moore","Clark","Lee","King","Baker","Harrison","Morgan","Allen","James","Scott","Phillips","Watson","Davis","Parker","Price","Bennett","Young","Griffiths","Mitchell","Kelly","Cook","Carter","Richardson","Bailey","Collins","Bell","Shaw","Murphy","Miller","Cox","Richards","Khan","Marshall","Anderson","Simpson","Ellis","Adams","Singh","Begum","Wilkinson","Foster","Chapman","Powell","Webb","Rogers","Gray","Mason","Ali","Hunt","Hussain","Campbell","Matthews","Owen","Palmer","Holmes","Mills","Barnes","Knight","Lloyd","Butler","Russell","Barker","Fisher","Stevens","Jenkins","Murray","Dixon","Harvey","Graham","Pearson","Ahmed","Fletcher","Walsh","Kaur","Gibson","Howard","Andrews","Stewart","Elliott","Reynolds","Saunders","Payne","Fox","Ford","Pearce","Day","Brooks","West","Lawrence","Cole","Atkinson","Bradley","Spencer","Gill","Dawson","Ball","Burton","O'brien","Watts","Rose","Booth","Perry","Ryan","Grant","Wells","Armstrong","Francis","Rees","Hayes","Hart","Hudson","Newman","Barrett","Webster","Hunter","Gregory","Carr","Lowe","Page","Marsh","Riley","Dunn","Woods","Parsons","Berry","Stone","Reid","Holland","Hawkins","Harding","Porter","Robertson","Newton","Oliver","Reed","Kennedy","Williamson","Bird","Gardner","Shah","Dean","Lane","Cooke","Bates","Henderson","Parry","Burgess","Bishop","Walton","Burns","Nicholson","Shepherd","Ross","Cross","Long","Freeman","Warren","Nicholls","Hamilton","Byrne","Sutton","Mcdonald","Yates","Hodgson","Robson","Curtis","Hopkins","O'connor","Harper","Coleman","Watkins","Moss","Mccarthy","Chambers","O'neill","Griffin","Sharp","Hardy","Wheeler","Potter","Osborne","Johnston","Gordon","Doyle","Wallace","George","Jordan","Hutchinson","Rowe","Burke","May","Pritchard","Gilbert","Willis","Higgins","Read","Miles","Stevenson","Stephenson","Hammond","Arnold","Buckley","Walters","Hewitt","Barber","Nelson","Slater","Austin","Sullivan","Whitehead","Mann","Frost","Lambert","Stephens","Blake","Akhtar","Lynch","Goodwin","Barton","Woodward","Thomson","Cunningham","Quinn","Barnett","Baxter","Bibi","Clayton","Nash","Greenwood","Jennings","Holt","Kemp","Poole","Gallagher","Bond","Stokes","Tucker","Davidson","Fowler","Heath","Norman","Middleton","Lawson","Banks","French","Stanley","Jarvis","Gibbs","Ferguson","Hayward","Carroll","Douglas","Dickinson","Todd","Barlow","Peters","Lucas","Knowles","Hartley","Miah","Simmons","Morton","Alexander","Field","Morrison","Norris","Townsend","Preston","Hancock","Thornton","Baldwin","Burrows","Briggs","Parkinson","Reeves","Macdonald","Lamb","Black","Abbott","Sanders","Thorpe","Holden","Tomlinson","Perkins","Ashton","Rhodes","Fuller","Howe","Bryant","Vaughan","Dale","Davey","Weston","Bartlett","Whittaker","Davison","Kent","Skinner","Birch","Morley","Daniels","Glover","Howell","Cartwright","Pugh","Humphreys","Goddard","Brennan","Wall","Kirby","Bowen","Savage","Bull","Wong","Dobson","Smart","Wilkins","Kirk","Fraser","Duffy","Hicks","Patterson","Bradshaw","Little","Archer","Warner","Waters","O'sullivan","Farrell","Brookes","Atkins","Kay","Dodd","Bentley","Flynn","John","Schofield","Short","Haynes","Wade","Butcher","Henry","Sanderson","Crawford","Sheppard","Bolton","Coates","Giles","Gould","Houghton","Gibbons","Pratt","Manning","Law","Hooper","Noble","Dyer","Rahman","Clements","Moran","Sykes","Chan","Doherty","Connolly","Joyce","Franklin","Hobbs","Coles","Herbert","Steele","Kerr","Leach","Winter","Owens","Duncan","Naylor","Fleming","Horton","Finch","Fitzgerald","Randall","Carpenter","Marsden","Browne","Garner","Pickering","Hale","Dennis","Vincent","Chadwick","Chandler","Sharpe","Nolan","Lyons","Hurst","Collier","Peacock","Howarth","Faulkner","Rice","Pollard","Welch","Norton","Gough","Sinclair","Blackburn","Bryan","Conway","Power","Cameron","Daly","Allan","Hanson","Gardiner","Boyle","Myers","Turnbull","Wallis","Mahmood","Sims","Swift","Iqbal","Pope","Brady","Chamberlain","Rowley","Tyler","Farmer","Metcalfe","Hilton","Godfrey","Holloway","Parkin","Bray","Talbot","Donnelly","Nixon","Charlton","Benson","Whitehouse","Barry","Hope","Lord","North","Storey","Connor","Potts","Bevan","Hargreaves","Mclean","Mistry","Bruce","Howells","Hyde","Parkes","Wyatt","Fry","Lees","O'donnell","Craig","Forster","Mckenzie","Humphries","Mellor","Carey","Ingram","Summers","Leonard"],de:["M??ller","Schmidt","Schneider","Fischer","Weber","Meyer","Wagner","Becker","Schulz","Hoffmann","Sch??fer","Koch","Bauer","Richter","Klein","Wolf","Schr??der","Neumann","Schwarz","Zimmermann","Braun","Kr??ger","Hofmann","Hartmann","Lange","Schmitt","Werner","Schmitz","Krause","Meier","Lehmann","Schmid","Schulze","Maier","K??hler","Herrmann","K??nig","Walter","Mayer","Huber","Kaiser","Fuchs","Peters","Lang","Scholz","M??ller","Wei??","Jung","Hahn","Schubert","Vogel","Friedrich","Keller","G??nther","Frank","Berger","Winkler","Roth","Beck","Lorenz","Baumann","Franke","Albrecht","Schuster","Simon","Ludwig","B??hm","Winter","Kraus","Martin","Schumacher","Kr??mer","Vogt","Stein","J??ger","Otto","Sommer","Gro??","Seidel","Heinrich","Brandt","Haas","Schreiber","Graf","Schulte","Dietrich","Ziegler","Kuhn","K??hn","Pohl","Engel","Horn","Busch","Bergmann","Thomas","Voigt","Sauer","Arnold","Wolff","Pfeiffer"],jp:["Sato","Suzuki","Takahashi","Tanaka","Watanabe","Ito","Yamamoto","Nakamura","Kobayashi","Kato","Yoshida","Yamada","Sasaki","Yamaguchi","Saito","Matsumoto","Inoue","Kimura","Hayashi","Shimizu","Yamazaki","Mori","Abe","Ikeda","Hashimoto","Yamashita","Ishikawa","Nakajima","Maeda","Fujita","Ogawa","Goto","Okada","Hasegawa","Murakami","Kondo","Ishii","Saito","Sakamoto","Endo","Aoki","Fujii","Nishimura","Fukuda","Ota","Miura","Fujiwara","Okamoto","Matsuda","Nakagawa","Nakano","Harada","Ono","Tamura","Takeuchi","Kaneko","Wada","Nakayama","Ishida","Ueda","Morita","Hara","Shibata","Sakai","Kudo","Yokoyama","Miyazaki","Miyamoto","Uchida","Takagi","Ando","Taniguchi","Ohno","Maruyama","Imai","Takada","Fujimoto","Takeda","Murata","Ueno","Sugiyama","Masuda","Sugawara","Hirano","Kojima","Otsuka","Chiba","Kubo","Matsui","Iwasaki","Sakurai","Kinoshita","Noguchi","Matsuo","Nomura","Kikuchi","Sano","Onishi","Sugimoto","Arai"],es:["Garcia","Fernandez","Lopez","Martinez","Gonzalez","Rodriguez","Sanchez","Perez","Martin","Gomez","Ruiz","Diaz","Hernandez","Alvarez","Jimenez","Moreno","Munoz","Alonso","Romero","Navarro","Gutierrez","Torres","Dominguez","Gil","Vazquez","Blanco","Serrano","Ramos","Castro","Suarez","Sanz","Rubio","Ortega","Molina","Delgado","Ortiz","Morales","Ramirez","Marin","Iglesias","Santos","Castillo","Garrido","Calvo","Pena","Cruz","Cano","Nunez","Prieto","Diez","Lozano","Vidal","Pascual","Ferrer","Medina","Vega","Leon","Herrero","Vicente","Mendez","Guerrero","Fuentes","Campos","Nieto","Cortes","Caballero","Ibanez","Lorenzo","Pastor","Gimenez","Saez","Soler","Marquez","Carrasco","Herrera","Montero","Arias","Crespo","Flores","Andres","Aguilar","Hidalgo","Cabrera","Mora","Duran","Velasco","Rey","Pardo","Roman","Vila","Bravo","Merino","Moya","Soto","Izquierdo","Reyes","Redondo","Marcos","Carmona","Menendez"],fr:["Martin","Bernard","Thomas","Petit","Robert","Richard","Durand","Dubois","Moreau","Laurent","Simon","Michel","Lef??vre","Leroy","Roux","David","Bertrand","Morel","Fournier","Girard","Bonnet","Dupont","Lambert","Fontaine","Rousseau","Vincent","M??ller","Lef??vre","Faure","Andr??","Mercier","Blanc","Gu??rin","Boyer","Garnier","Chevalier","Fran??ois","Legrand","Gauthier","Garcia","Perrin","Robin","Cl??ment","Morin","Nicolas","Henry","Roussel","Matthieu","Gautier","Masson","Marchand","Duval","Denis","Dumont","Marie","Lemaire","No??l","Meyer","Dufour","Meunier","Brun","Blanchard","Giraud","Joly","Rivi??re","Lucas","Brunet","Gaillard","Barbier","Arnaud","Mart??nez","G??rard","Roche","Renard","Schmitt","Roy","Leroux","Colin","Vidal","Caron","Picard","Roger","Fabre","Aubert","Lemoine","Renaud","Dumas","Lacroix","Olivier","Philippe","Bourgeois","Pierre","Beno??t","Rey","Leclerc","Payet","Rolland","Leclercq","Guillaume","Lecomte","L??pez","Jean","Dupuy","Guillot","Hubert","Berger","Carpentier","S??nchez","Dupuis","Moulin","Louis","Deschamps","Huet","Vasseur","Perez","Boucher","Fleury","Royer","Klein","Jacquet","Adam","Paris","Poirier","Marty","Aubry","Guyot","Carr??","Charles","Renault","Charpentier","M??nard","Maillard","Baron","Bertin","Bailly","Herv??","Schneider","Fern??ndez","Le GallGall","Collet","L??ger","Bouvier","Julien","Pr??vost","Millet","Perrot","Daniel","Le RouxRoux","Cousin","Germain","Breton","Besson","Langlois","R??mi","Le GoffGoff","Pelletier","L??v??que","Perrier","Leblanc","Barr??","Lebrun","Marchal","Weber","Mallet","Hamon","Boulanger","Jacob","Monnier","Michaud","Rodr??guez","Guichard","Gillet","??tienne","Grondin","Poulain","Tessier","Chevallier","Collin","Chauvin","Da SilvaSilva","Bouchet","Gay","Lema??tre","B??nard","Mar??chal","Humbert","Reynaud","Antoine","Hoarau","Perret","Barth??lemy","Cordier","Pichon","Lejeune","Gilbert","Lamy","Delaunay","Pasquier","Carlier","LaporteLaporte"]},postcodeAreas:[{code:"AB"},{code:"AL"},{code:"B"},{code:"BA"},{code:"BB"},{code:"BD"},{code:"BH"},{code:"BL"},{code:"BN"},{code:"BR"},{code:"BS"},{code:"BT"},{code:"CA"},{code:"CB"},{code:"CF"},{code:"CH"},{code:"CM"},{code:"CO"},{code:"CR"},{code:"CT"},{code:"CV"},{code:"CW"},{code:"DA"},{code:"DD"},{code:"DE"},{code:"DG"},{code:"DH"},{code:"DL"},{code:"DN"},{code:"DT"},{code:"DY"},{code:"E"},{code:"EC"},{code:"EH"},{code:"EN"},{code:"EX"},{code:"FK"},{code:"FY"},{code:"G"},{code:"GL"},{code:"GU"},{code:"GY"},{code:"HA"},{code:"HD"},{code:"HG"},{code:"HP"},{code:"HR"},{code:"HS"},{code:"HU"},{code:"HX"},{code:"IG"},{code:"IM"},{code:"IP"},{code:"IV"},{code:"JE"},{code:"KA"},{code:"KT"},{code:"KW"},{code:"KY"},{code:"L"},{code:"LA"},{code:"LD"},{code:"LE"},{code:"LL"},{code:"LN"},{code:"LS"},{code:"LU"},{code:"M"},{code:"ME"},{code:"MK"},{code:"ML"},{code:"N"},{code:"NE"},{code:"NG"},{code:"NN"},{code:"NP"},{code:"NR"},{code:"NW"},{code:"OL"},{code:"OX"},{code:"PA"},{code:"PE"},{code:"PH"},{code:"PL"},{code:"PO"},{code:"PR"},{code:"RG"},{code:"RH"},{code:"RM"},{code:"S"},{code:"SA"},{code:"SE"},{code:"SG"},{code:"SK"},{code:"SL"},{code:"SM"},{code:"SN"},{code:"SO"},{code:"SP"},{code:"SR"},{code:"SS"},{code:"ST"},{code:"SW"},{code:"SY"},{code:"TA"},{code:"TD"},{code:"TF"},{code:"TN"},{code:"TQ"},{code:"TR"},{code:"TS"},{code:"TW"},{code:"UB"},{code:"W"},{code:"WA"},{code:"WC"},{code:"WD"},{code:"WF"},{code:"WN"},{code:"WR"},{code:"WS"},{code:"WV"},{code:"YO"},{code:"ZE"}],countries:[{name:"Afghanistan",abbreviation:"AF"},{name:"??land Islands",abbreviation:"AX"},{name:"Albania",abbreviation:"AL"},{name:"Algeria",abbreviation:"DZ"},{name:"American Samoa",abbreviation:"AS"},{name:"Andorra",abbreviation:"AD"},{name:"Angola",abbreviation:"AO"},{name:"Anguilla",abbreviation:"AI"},{name:"Antarctica",abbreviation:"AQ"},{name:"Antigua & Barbuda",abbreviation:"AG"},{name:"Argentina",abbreviation:"AR"},{name:"Armenia",abbreviation:"AM"},{name:"Aruba",abbreviation:"AW"},{name:"Ascension Island",abbreviation:"AC"},{name:"Australia",abbreviation:"AU"},{name:"Austria",abbreviation:"AT"},{name:"Azerbaijan",abbreviation:"AZ"},{name:"Bahamas",abbreviation:"BS"},{name:"Bahrain",abbreviation:"BH"},{name:"Bangladesh",abbreviation:"BD"},{name:"Barbados",abbreviation:"BB"},{name:"Belarus",abbreviation:"BY"},{name:"Belgium",abbreviation:"BE"},{name:"Belize",abbreviation:"BZ"},{name:"Benin",abbreviation:"BJ"},{name:"Bermuda",abbreviation:"BM"},{name:"Bhutan",abbreviation:"BT"},{name:"Bolivia",abbreviation:"BO"},{name:"Bosnia & Herzegovina",abbreviation:"BA"},{name:"Botswana",abbreviation:"BW"},{name:"Brazil",abbreviation:"BR"},{name:"British Indian Ocean Territory",abbreviation:"IO"},{name:"British Virgin Islands",abbreviation:"VG"},{name:"Brunei",abbreviation:"BN"},{name:"Bulgaria",abbreviation:"BG"},{name:"Burkina Faso",abbreviation:"BF"},{name:"Burundi",abbreviation:"BI"},{name:"Cambodia",abbreviation:"KH"},{name:"Cameroon",abbreviation:"CM"},{name:"Canada",abbreviation:"CA"},{name:"Canary Islands",abbreviation:"IC"},{name:"Cape Verde",abbreviation:"CV"},{name:"Caribbean Netherlands",abbreviation:"BQ"},{name:"Cayman Islands",abbreviation:"KY"},{name:"Central African Republic",abbreviation:"CF"},{name:"Ceuta & Melilla",abbreviation:"EA"},{name:"Chad",abbreviation:"TD"},{name:"Chile",abbreviation:"CL"},{name:"China",abbreviation:"CN"},{name:"Christmas Island",abbreviation:"CX"},{name:"Cocos (Keeling) Islands",abbreviation:"CC"},{name:"Colombia",abbreviation:"CO"},{name:"Comoros",abbreviation:"KM"},{name:"Congo - Brazzaville",abbreviation:"CG"},{name:"Congo - Kinshasa",abbreviation:"CD"},{name:"Cook Islands",abbreviation:"CK"},{name:"Costa Rica",abbreviation:"CR"},{name:"C??te d'Ivoire",abbreviation:"CI"},{name:"Croatia",abbreviation:"HR"},{name:"Cuba",abbreviation:"CU"},{name:"Cura??ao",abbreviation:"CW"},{name:"Cyprus",abbreviation:"CY"},{name:"Czech Republic",abbreviation:"CZ"},{name:"Denmark",abbreviation:"DK"},{name:"Diego Garcia",abbreviation:"DG"},{name:"Djibouti",abbreviation:"DJ"},{name:"Dominica",abbreviation:"DM"},{name:"Dominican Republic",abbreviation:"DO"},{name:"Ecuador",abbreviation:"EC"},{name:"Egypt",abbreviation:"EG"},{name:"El Salvador",abbreviation:"SV"},{name:"Equatorial Guinea",abbreviation:"GQ"},{name:"Eritrea",abbreviation:"ER"},{name:"Estonia",abbreviation:"EE"},{name:"Ethiopia",abbreviation:"ET"},{name:"Falkland Islands",abbreviation:"FK"},{name:"Faroe Islands",abbreviation:"FO"},{name:"Fiji",abbreviation:"FJ"},{name:"Finland",abbreviation:"FI"},{name:"France",abbreviation:"FR"},{name:"French Guiana",abbreviation:"GF"},{name:"French Polynesia",abbreviation:"PF"},{name:"French Southern Territories",abbreviation:"TF"},{name:"Gabon",abbreviation:"GA"},{name:"Gambia",abbreviation:"GM"},{name:"Georgia",abbreviation:"GE"},{name:"Germany",abbreviation:"DE"},{name:"Ghana",abbreviation:"GH"},{name:"Gibraltar",abbreviation:"GI"},{name:"Greece",abbreviation:"GR"},{name:"Greenland",abbreviation:"GL"},{name:"Grenada",abbreviation:"GD"},{name:"Guadeloupe",abbreviation:"GP"},{name:"Guam",abbreviation:"GU"},{name:"Guatemala",abbreviation:"GT"},{name:"Guernsey",abbreviation:"GG"},{name:"Guinea",abbreviation:"GN"},{name:"Guinea-Bissau",abbreviation:"GW"},{name:"Guyana",abbreviation:"GY"},{name:"Haiti",abbreviation:"HT"},{name:"Honduras",abbreviation:"HN"},{name:"Hong Kong SAR China",abbreviation:"HK"},{name:"Hungary",abbreviation:"HU"},{name:"Iceland",abbreviation:"IS"},{name:"India",abbreviation:"IN"},{name:"Indonesia",abbreviation:"ID"},{name:"Iran",abbreviation:"IR"},{name:"Iraq",abbreviation:"IQ"},{name:"Ireland",abbreviation:"IE"},{name:"Isle of Man",abbreviation:"IM"},{name:"Israel",abbreviation:"IL"},{name:"Italy",abbreviation:"IT"},{name:"Jamaica",abbreviation:"JM"},{name:"Japan",abbreviation:"JP"},{name:"Jersey",abbreviation:"JE"},{name:"Jordan",abbreviation:"JO"},{name:"Kazakhstan",abbreviation:"KZ"},{name:"Kenya",abbreviation:"KE"},{name:"Kiribati",abbreviation:"KI"},{name:"Kosovo",abbreviation:"XK"},{name:"Kuwait",abbreviation:"KW"},{name:"Kyrgyzstan",abbreviation:"KG"},{name:"Laos",abbreviation:"LA"},{name:"Latvia",abbreviation:"LV"},{name:"Lebanon",abbreviation:"LB"},{name:"Lesotho",abbreviation:"LS"},{name:"Liberia",abbreviation:"LR"},{name:"Libya",abbreviation:"LY"},{name:"Liechtenstein",abbreviation:"LI"},{name:"Lithuania",abbreviation:"LT"},{name:"Luxembourg",abbreviation:"LU"},{name:"Macau SAR China",abbreviation:"MO"},{name:"Macedonia",abbreviation:"MK"},{name:"Madagascar",abbreviation:"MG"},{name:"Malawi",abbreviation:"MW"},{name:"Malaysia",abbreviation:"MY"},{name:"Maldives",abbreviation:"MV"},{name:"Mali",abbreviation:"ML"},{name:"Malta",abbreviation:"MT"},{name:"Marshall Islands",abbreviation:"MH"},{name:"Martinique",abbreviation:"MQ"},{name:"Mauritania",abbreviation:"MR"},{name:"Mauritius",abbreviation:"MU"},{name:"Mayotte",abbreviation:"YT"},{name:"Mexico",abbreviation:"MX"},{name:"Micronesia",abbreviation:"FM"},{name:"Moldova",abbreviation:"MD"},{name:"Monaco",abbreviation:"MC"},{name:"Mongolia",abbreviation:"MN"},{name:"Montenegro",abbreviation:"ME"},{name:"Montserrat",abbreviation:"MS"},{name:"Morocco",abbreviation:"MA"},{name:"Mozambique",abbreviation:"MZ"},{name:"Myanmar (Burma)",abbreviation:"MM"},{name:"Namibia",abbreviation:"NA"},{name:"Nauru",abbreviation:"NR"},{name:"Nepal",abbreviation:"NP"},{name:"Netherlands",abbreviation:"NL"},{name:"New Caledonia",abbreviation:"NC"},{name:"New Zealand",abbreviation:"NZ"},{name:"Nicaragua",abbreviation:"NI"},{name:"Niger",abbreviation:"NE"},{name:"Nigeria",abbreviation:"NG"},{name:"Niue",abbreviation:"NU"},{name:"Norfolk Island",abbreviation:"NF"},{name:"North Korea",abbreviation:"KP"},{name:"Northern Mariana Islands",abbreviation:"MP"},{name:"Norway",abbreviation:"NO"},{name:"Oman",abbreviation:"OM"},{name:"Pakistan",abbreviation:"PK"},{name:"Palau",abbreviation:"PW"},{name:"Palestinian Territories",abbreviation:"PS"},{name:"Panama",abbreviation:"PA"},{name:"Papua New Guinea",abbreviation:"PG"},{name:"Paraguay",abbreviation:"PY"},{name:"Peru",abbreviation:"PE"},{name:"Philippines",abbreviation:"PH"},{name:"Pitcairn Islands",abbreviation:"PN"},{name:"Poland",abbreviation:"PL"},{name:"Portugal",abbreviation:"PT"},{name:"Puerto Rico",abbreviation:"PR"},{name:"Qatar",abbreviation:"QA"},{name:"R??union",abbreviation:"RE"},{name:"Romania",abbreviation:"RO"},{name:"Russia",abbreviation:"RU"},{name:"Rwanda",abbreviation:"RW"},{name:"Samoa",abbreviation:"WS"},{name:"San Marino",abbreviation:"SM"},{name:"S??o Tom?? and Pr??ncipe",abbreviation:"ST"},{name:"Saudi Arabia",abbreviation:"SA"},{name:"Senegal",abbreviation:"SN"},{name:"Serbia",abbreviation:"RS"},{name:"Seychelles",abbreviation:"SC"},{name:"Sierra Leone",abbreviation:"SL"},{name:"Singapore",abbreviation:"SG"},{name:"Sint Maarten",abbreviation:"SX"},{name:"Slovakia",abbreviation:"SK"},{name:"Slovenia",abbreviation:"SI"},{name:"Solomon Islands",abbreviation:"SB"},{name:"Somalia",abbreviation:"SO"},{name:"South Africa",abbreviation:"ZA"},{name:"South Georgia & South Sandwich Islands",abbreviation:"GS"},{name:"South Korea",abbreviation:"KR"},{name:"South Sudan",abbreviation:"SS"},{name:"Spain",abbreviation:"ES"},{name:"Sri Lanka",abbreviation:"LK"},{name:"St. Barth??lemy",abbreviation:"BL"},{name:"St. Helena",abbreviation:"SH"},{name:"St. Kitts & Nevis",abbreviation:"KN"},{name:"St. Lucia",abbreviation:"LC"},{name:"St. Martin",abbreviation:"MF"},{name:"St. Pierre & Miquelon",abbreviation:"PM"},{name:"St. Vincent & Grenadines",abbreviation:"VC"},{name:"Sudan",abbreviation:"SD"},{name:"Suriname",abbreviation:"SR"},{name:"Svalbard & Jan Mayen",abbreviation:"SJ"},{name:"Swaziland",abbreviation:"SZ"},{name:"Sweden",abbreviation:"SE"},{name:"Switzerland",abbreviation:"CH"},{name:"Syria",abbreviation:"SY"},{name:"Taiwan",abbreviation:"TW"},{name:"Tajikistan",abbreviation:"TJ"},{name:"Tanzania",abbreviation:"TZ"},{name:"Thailand",abbreviation:"TH"},{name:"Timor-Leste",abbreviation:"TL"},{name:"Togo",abbreviation:"TG"},{name:"Tokelau",abbreviation:"TK"},{name:"Tonga",abbreviation:"TO"},{name:"Trinidad & Tobago",abbreviation:"TT"},{name:"Tristan da Cunha",abbreviation:"TA"},{name:"Tunisia",abbreviation:"TN"},{name:"Turkey",abbreviation:"TR"},{name:"Turkmenistan",abbreviation:"TM"},{name:"Turks & Caicos Islands",abbreviation:"TC"},{name:"Tuvalu",abbreviation:"TV"},{name:"U.S. Outlying Islands",abbreviation:"UM"},{name:"U.S. Virgin Islands",abbreviation:"VI"},{name:"Uganda",abbreviation:"UG"},{name:"Ukraine",abbreviation:"UA"},{name:"United Arab Emirates",abbreviation:"AE"},{name:"United Kingdom",abbreviation:"GB"},{name:"United States",abbreviation:"US"},{name:"Uruguay",abbreviation:"UY"},{name:"Uzbekistan",abbreviation:"UZ"},{name:"Vanuatu",abbreviation:"VU"},{name:"Vatican City",abbreviation:"VA"},{name:"Venezuela",abbreviation:"VE"},{name:"Vietnam",abbreviation:"VN"},{name:"Wallis & Futuna",abbreviation:"WF"},{name:"Western Sahara",abbreviation:"EH"},{name:"Yemen",abbreviation:"YE"},{name:"Zambia",abbreviation:"ZM"},{name:"Zimbabwe",abbreviation:"ZW"}],counties:{uk:[{name:"Bath and North East Somerset"},{name:"Aberdeenshire"},{name:"Anglesey"},{name:"Angus"},{name:"Bedford"},{name:"Blackburn with Darwen"},{name:"Blackpool"},{name:"Bournemouth"},{name:"Bracknell Forest"},{name:"Brighton & Hove"},{name:"Bristol"},{name:"Buckinghamshire"},{name:"Cambridgeshire"},{name:"Carmarthenshire"},{name:"Central Bedfordshire"},{name:"Ceredigion"},{name:"Cheshire East"},{name:"Cheshire West and Chester"},{name:"Clackmannanshire"},{name:"Conwy"},{name:"Cornwall"},{name:"County Antrim"},{name:"County Armagh"},{name:"County Down"},{name:"County Durham"},{name:"County Fermanagh"},{name:"County Londonderry"},{name:"County Tyrone"},{name:"Cumbria"},{name:"Darlington"},{name:"Denbighshire"},{name:"Derby"},{name:"Derbyshire"},{name:"Devon"},{name:"Dorset"},{name:"Dumfries and Galloway"},{name:"Dundee"},{name:"East Lothian"},{name:"East Riding of Yorkshire"},{name:"East Sussex"},{name:"Edinburgh?"},{name:"Essex"},{name:"Falkirk"},{name:"Fife"},{name:"Flintshire"},{name:"Gloucestershire"},{name:"Greater London"},{name:"Greater Manchester"},{name:"Gwent"},{name:"Gwynedd"},{name:"Halton"},{name:"Hampshire"},{name:"Hartlepool"},{name:"Herefordshire"},{name:"Hertfordshire"},{name:"Highlands"},{name:"Hull"},{name:"Isle of Wight"},{name:"Isles of Scilly"},{name:"Kent"},{name:"Lancashire"},{name:"Leicester"},{name:"Leicestershire"},{name:"Lincolnshire"},{name:"Lothian"},{name:"Luton"},{name:"Medway"},{name:"Merseyside"},{name:"Mid Glamorgan"},{name:"Middlesbrough"},{name:"Milton Keynes"},{name:"Monmouthshire"},{name:"Moray"},{name:"Norfolk"},{name:"North East Lincolnshire"},{name:"North Lincolnshire"},{name:"North Somerset"},{name:"North Yorkshire"},{name:"Northamptonshire"},{name:"Northumberland"},{name:"Nottingham"},{name:"Nottinghamshire"},{name:"Oxfordshire"},{name:"Pembrokeshire"},{name:"Perth and Kinross"},{name:"Peterborough"},{name:"Plymouth"},{name:"Poole"},{name:"Portsmouth"},{name:"Powys"},{name:"Reading"},{name:"Redcar and Cleveland"},{name:"Rutland"},{name:"Scottish Borders"},{name:"Shropshire"},{name:"Slough"},{name:"Somerset"},{name:"South Glamorgan"},{name:"South Gloucestershire"},{name:"South Yorkshire"},{name:"Southampton"},{name:"Southend-on-Sea"},{name:"Staffordshire"},{name:"Stirlingshire"},{name:"Stockton-on-Tees"},{name:"Stoke-on-Trent"},{name:"Strathclyde"},{name:"Suffolk"},{name:"Surrey"},{name:"Swindon"},{name:"Telford and Wrekin"},{name:"Thurrock"},{name:"Torbay"},{name:"Tyne and Wear"},{name:"Warrington"},{name:"Warwickshire"},{name:"West Berkshire"},{name:"West Glamorgan"},{name:"West Lothian"},{name:"West Midlands"},{name:"West Sussex"},{name:"West Yorkshire"},{name:"Western Isles"},{name:"Wiltshire"},{name:"Windsor and Maidenhead"},{name:"Wokingham"},{name:"Worcestershire"},{name:"Wrexham"},{name:"York"}]},provinces:{ca:[{name:"Alberta",abbreviation:"AB"},{name:"British Columbia",abbreviation:"BC"},{name:"Manitoba",abbreviation:"MB"},{name:"New Brunswick",abbreviation:"NB"},{name:"Newfoundland and Labrador",abbreviation:"NL"},{name:"Nova Scotia",abbreviation:"NS"},{name:"Ontario",abbreviation:"ON"},{name:"Prince Edward Island",abbreviation:"PE"},{name:"Quebec",abbreviation:"QC"},{name:"Saskatchewan",abbreviation:"SK"},{name:"Northwest Territories",abbreviation:"NT"},{name:"Nunavut",abbreviation:"NU"},{name:"Yukon",abbreviation:"YT"}],it:[{name:"Agrigento",abbreviation:"AG",code:84},{name:"Alessandria",abbreviation:"AL",code:6},{name:"Ancona",abbreviation:"AN",code:42},{name:"Aosta",abbreviation:"AO",code:7},{name:"L'Aquila",abbreviation:"AQ",code:66},{name:"Arezzo",abbreviation:"AR",code:51},{name:"Ascoli-Piceno",abbreviation:"AP",code:44},{name:"Asti",abbreviation:"AT",code:5},{name:"Avellino",abbreviation:"AV",code:64},{name:"Bari",abbreviation:"BA",code:72},{name:"Barletta-Andria-Trani",abbreviation:"BT",code:72},{name:"Belluno",abbreviation:"BL",code:25},{name:"Benevento",abbreviation:"BN",code:62},{name:"Bergamo",abbreviation:"BG",code:16},{name:"Biella",abbreviation:"BI",code:96},{name:"Bologna",abbreviation:"BO",code:37},{name:"Bolzano",abbreviation:"BZ",code:21},{name:"Brescia",abbreviation:"BS",code:17},{name:"Brindisi",abbreviation:"BR",code:74},{name:"Cagliari",abbreviation:"CA",code:92},{name:"Caltanissetta",abbreviation:"CL",code:85},{name:"Campobasso",abbreviation:"CB",code:70},{name:"Carbonia Iglesias",abbreviation:"CI",code:70},{name:"Caserta",abbreviation:"CE",code:61},{name:"Catania",abbreviation:"CT",code:87},{name:"Catanzaro",abbreviation:"CZ",code:79},{name:"Chieti",abbreviation:"CH",code:69},{name:"Como",abbreviation:"CO",code:13},{name:"Cosenza",abbreviation:"CS",code:78},{name:"Cremona",abbreviation:"CR",code:19},{name:"Crotone",abbreviation:"KR",code:101},{name:"Cuneo",abbreviation:"CN",code:4},{name:"Enna",abbreviation:"EN",code:86},{name:"Fermo",abbreviation:"FM",code:86},{name:"Ferrara",abbreviation:"FE",code:38},{name:"Firenze",abbreviation:"FI",code:48},{name:"Foggia",abbreviation:"FG",code:71},{name:"Forli-Cesena",abbreviation:"FC",code:71},{name:"Frosinone",abbreviation:"FR",code:60},{name:"Genova",abbreviation:"GE",code:10},{name:"Gorizia",abbreviation:"GO",code:31},{name:"Grosseto",abbreviation:"GR",code:53},{name:"Imperia",abbreviation:"IM",code:8},{name:"Isernia",abbreviation:"IS",code:94},{name:"La-Spezia",abbreviation:"SP",code:66},{name:"Latina",abbreviation:"LT",code:59},{name:"Lecce",abbreviation:"LE",code:75},{name:"Lecco",abbreviation:"LC",code:97},{name:"Livorno",abbreviation:"LI",code:49},{name:"Lodi",abbreviation:"LO",code:98},{name:"Lucca",abbreviation:"LU",code:46},{name:"Macerata",abbreviation:"MC",code:43},{name:"Mantova",abbreviation:"MN",code:20},{name:"Massa-Carrara",abbreviation:"MS",code:45},{name:"Matera",abbreviation:"MT",code:77},{name:"Medio Campidano",abbreviation:"VS",code:77},{name:"Messina",abbreviation:"ME",code:83},{name:"Milano",abbreviation:"MI",code:15},{name:"Modena",abbreviation:"MO",code:36},{name:"Monza-Brianza",abbreviation:"MB",code:36},{name:"Napoli",abbreviation:"NA",code:63},{name:"Novara",abbreviation:"NO",code:3},{name:"Nuoro",abbreviation:"NU",code:91},{name:"Ogliastra",abbreviation:"OG",code:91},{name:"Olbia Tempio",abbreviation:"OT",code:91},{name:"Oristano",abbreviation:"OR",code:95},{name:"Padova",abbreviation:"PD",code:28},{name:"Palermo",abbreviation:"PA",code:82},{name:"Parma",abbreviation:"PR",code:34},{name:"Pavia",abbreviation:"PV",code:18},{name:"Perugia",abbreviation:"PG",code:54},{name:"Pesaro-Urbino",abbreviation:"PU",code:41},{name:"Pescara",abbreviation:"PE",code:68},{name:"Piacenza",abbreviation:"PC",code:33},{name:"Pisa",abbreviation:"PI",code:50},{name:"Pistoia",abbreviation:"PT",code:47},{name:"Pordenone",abbreviation:"PN",code:93},{name:"Potenza",abbreviation:"PZ",code:76},{name:"Prato",abbreviation:"PO",code:100},{name:"Ragusa",abbreviation:"RG",code:88},{name:"Ravenna",abbreviation:"RA",code:39},{name:"Reggio-Calabria",abbreviation:"RC",code:35},{name:"Reggio-Emilia",abbreviation:"RE",code:35},{name:"Rieti",abbreviation:"RI",code:57},{name:"Rimini",abbreviation:"RN",code:99},{name:"Roma",abbreviation:"Roma",code:58},{name:"Rovigo",abbreviation:"RO",code:29},{name:"Salerno",abbreviation:"SA",code:65},{name:"Sassari",abbreviation:"SS",code:90},{name:"Savona",abbreviation:"SV",code:9},{name:"Siena",abbreviation:"SI",code:52},{name:"Siracusa",abbreviation:"SR",code:89},{name:"Sondrio",abbreviation:"SO",code:14},{name:"Taranto",abbreviation:"TA",code:73},{name:"Teramo",abbreviation:"TE",code:67},{name:"Terni",abbreviation:"TR",code:55},{name:"Torino",abbreviation:"TO",code:1},{name:"Trapani",abbreviation:"TP",code:81},{name:"Trento",abbreviation:"TN",code:22},{name:"Treviso",abbreviation:"TV",code:26},{name:"Trieste",abbreviation:"TS",code:32},{name:"Udine",abbreviation:"UD",code:30},{name:"Varese",abbreviation:"VA",code:12},{name:"Venezia",abbreviation:"VE",code:27},{name:"Verbania",abbreviation:"VB",code:27},{name:"Vercelli",abbreviation:"VC",code:2},{name:"Verona",abbreviation:"VR",code:23},{name:"Vibo-Valentia",abbreviation:"VV",code:102},{name:"Vicenza",abbreviation:"VI",code:24},{name:"Viterbo",abbreviation:"VT",code:56}]},nationalities:[{name:"Afghan"},{name:"Albanian"},{name:"Algerian"},{name:"American"},{name:"Andorran"},{name:"Angolan"},{name:"Antiguans"},{name:"Argentinean"},{name:"Armenian"},{name:"Australian"},{name:"Austrian"},{name:"Azerbaijani"},{name:"Bahami"},{name:"Bahraini"},{name:"Bangladeshi"},{name:"Barbadian"},{name:"Barbudans"},{name:"Batswana"},{name:"Belarusian"},{name:"Belgian"},{name:"Belizean"},{name:"Beninese"},{name:"Bhutanese"},{name:"Bolivian"},{name:"Bosnian"},{name:"Brazilian"},{name:"British"},{name:"Bruneian"},{name:"Bulgarian"},{name:"Burkinabe"},{name:"Burmese"},{name:"Burundian"},{name:"Cambodian"},{name:"Cameroonian"},{name:"Canadian"},{name:"Cape Verdean"},{name:"Central African"},{name:"Chadian"},{name:"Chilean"},{name:"Chinese"},{name:"Colombian"},{name:"Comoran"},{name:"Congolese"},{name:"Costa Rican"},{name:"Croatian"},{name:"Cuban"},{name:"Cypriot"},{name:"Czech"},{name:"Danish"},{name:"Djibouti"},{name:"Dominican"},{name:"Dutch"},{name:"East Timorese"},{name:"Ecuadorean"},{name:"Egyptian"},{name:"Emirian"},{name:"Equatorial Guinean"},{name:"Eritrean"},{name:"Estonian"},{name:"Ethiopian"},{name:"Fijian"},{name:"Filipino"},{name:"Finnish"},{name:"French"},{name:"Gabonese"},{name:"Gambian"},{name:"Georgian"},{name:"German"},{name:"Ghanaian"},{name:"Greek"},{name:"Grenadian"},{name:"Guatemalan"},{name:"Guinea-Bissauan"},{name:"Guinean"},{name:"Guyanese"},{name:"Haitian"},{name:"Herzegovinian"},{name:"Honduran"},{name:"Hungarian"},{name:"I-Kiribati"},{name:"Icelander"},{name:"Indian"},{name:"Indonesian"},{name:"Iranian"},{name:"Iraqi"},{name:"Irish"},{name:"Israeli"},{name:"Italian"},{name:"Ivorian"},{name:"Jamaican"},{name:"Japanese"},{name:"Jordanian"},{name:"Kazakhstani"},{name:"Kenyan"},{name:"Kittian and Nevisian"},{name:"Kuwaiti"},{name:"Kyrgyz"},{name:"Laotian"},{name:"Latvian"},{name:"Lebanese"},{name:"Liberian"},{name:"Libyan"},{name:"Liechtensteiner"},{name:"Lithuanian"},{name:"Luxembourger"},{name:"Macedonian"},{name:"Malagasy"},{name:"Malawian"},{name:"Malaysian"},{name:"Maldivan"},{name:"Malian"},{name:"Maltese"},{name:"Marshallese"},{name:"Mauritanian"},{name:"Mauritian"},{name:"Mexican"},{name:"Micronesian"},{name:"Moldovan"},{name:"Monacan"},{name:"Mongolian"},{name:"Moroccan"},{name:"Mosotho"},{name:"Motswana"},{name:"Mozambican"},{name:"Namibian"},{name:"Nauruan"},{name:"Nepalese"},{name:"New Zealander"},{name:"Nicaraguan"},{name:"Nigerian"},{name:"Nigerien"},{name:"North Korean"},{name:"Northern Irish"},{name:"Norwegian"},{name:"Omani"},{name:"Pakistani"},{name:"Palauan"},{name:"Panamanian"},{name:"Papua New Guinean"},{name:"Paraguayan"},{name:"Peruvian"},{name:"Polish"},{name:"Portuguese"},{name:"Qatari"},{name:"Romani"},{name:"Russian"},{name:"Rwandan"},{name:"Saint Lucian"},{name:"Salvadoran"},{name:"Samoan"},{name:"San Marinese"},{name:"Sao Tomean"},{name:"Saudi"},{name:"Scottish"},{name:"Senegalese"},{name:"Serbian"},{name:"Seychellois"},{name:"Sierra Leonean"},{name:"Singaporean"},{name:"Slovakian"},{name:"Slovenian"},{name:"Solomon Islander"},{name:"Somali"},{name:"South African"},{name:"South Korean"},{name:"Spanish"},{name:"Sri Lankan"},{name:"Sudanese"},{name:"Surinamer"},{name:"Swazi"},{name:"Swedish"},{name:"Swiss"},{name:"Syrian"},{name:"Taiwanese"},{name:"Tajik"},{name:"Tanzanian"},{name:"Thai"},{name:"Togolese"},{name:"Tongan"},{name:"Trinidadian or Tobagonian"},{name:"Tunisian"},{name:"Turkish"},{name:"Tuvaluan"},{name:"Ugandan"},{name:"Ukrainian"},{name:"Uruguaya"},{name:"Uzbekistani"},{name:"Venezuela"},{name:"Vietnamese"},{name:"Wels"},{name:"Yemenit"},{name:"Zambia"},{name:"Zimbabwe"}],locale_languages:["aa","ab","ae","af","ak","am","an","ar","as","av","ay","az","ba","be","bg","bh","bi","bm","bn","bo","br","bs","ca","ce","ch","co","cr","cs","cu","cv","cy","da","de","dv","dz","ee","el","en","eo","es","et","eu","fa","ff","fi","fj","fo","fr","fy","ga","gd","gl","gn","gu","gv","ha","he","hi","ho","hr","ht","hu","hy","hz","ia","id","ie","ig","ii","ik","io","is","it","iu","ja","jv","ka","kg","ki","kj","kk","kl","km","kn","ko","kr","ks","ku","kv","kw","ky","la","lb","lg","li","ln","lo","lt","lu","lv","mg","mh","mi","mk","ml","mn","mr","ms","mt","my","na","nb","nd","ne","ng","nl","nn","no","nr","nv","ny","oc","oj","om","or","os","pa","pi","pl","ps","pt","qu","rm","rn","ro","ru","rw","sa","sc","sd","se","sg","si","sk","sl","sm","sn","so","sq","sr","ss","st","su","sv","sw","ta","te","tg","th","ti","tk","tl","tn","to","tr","ts","tt","tw","ty","ug","uk","ur","uz","ve","vi","vo","wa","wo","xh","yi","yo","za","zh","zu"],locale_regions:["agq-CM","asa-TZ","ast-ES","bas-CM","bem-ZM","bez-TZ","brx-IN","cgg-UG","chr-US","dav-KE","dje-NE","dsb-DE","dua-CM","dyo-SN","ebu-KE","ewo-CM","fil-PH","fur-IT","gsw-CH","gsw-FR","gsw-LI","guz-KE","haw-US","hsb-DE","jgo-CM","jmc-TZ","kab-DZ","kam-KE","kde-TZ","kea-CV","khq-ML","kkj-CM","kln-KE","kok-IN","ksb-TZ","ksf-CM","ksh-DE","lag-TZ","lkt-US","luo-KE","luy-KE","mas-KE","mas-TZ","mer-KE","mfe-MU","mgh-MZ","mgo-CM","mua-CM","naq-NA","nmg-CM","nnh-CM","nus-SD","nyn-UG","rof-TZ","rwk-TZ","sah-RU","saq-KE","sbp-TZ","seh-MZ","ses-ML","shi-Latn","shi-Latn-MA","shi-Tfng","shi-Tfng-MA","smn-FI","teo-KE","teo-UG","twq-NE","tzm-Latn","tzm-Latn-MA","vai-Latn","vai-Latn-LR","vai-Vaii","vai-Vaii-LR","vun-TZ","wae-CH","xog-UG","yav-CM","zgh-MA","af-NA","af-ZA","ak-GH","am-ET","ar-001","ar-AE","ar-BH","ar-DJ","ar-DZ","ar-EG","ar-EH","ar-ER","ar-IL","ar-IQ","ar-JO","ar-KM","ar-KW","ar-LB","ar-LY","ar-MA","ar-MR","ar-OM","ar-PS","ar-QA","ar-SA","ar-SD","ar-SO","ar-SS","ar-SY","ar-TD","ar-TN","ar-YE","as-IN","az-Cyrl","az-Cyrl-AZ","az-Latn","az-Latn-AZ","be-BY","bg-BG","bm-Latn","bm-Latn-ML","bn-BD","bn-IN","bo-CN","bo-IN","br-FR","bs-Cyrl","bs-Cyrl-BA","bs-Latn","bs-Latn-BA","ca-AD","ca-ES","ca-ES-VALENCIA","ca-FR","ca-IT","cs-CZ","cy-GB","da-DK","da-GL","de-AT","de-BE","de-CH","de-DE","de-LI","de-LU","dz-BT","ee-GH","ee-TG","el-CY","el-GR","en-001","en-150","en-AG","en-AI","en-AS","en-AU","en-BB","en-BE","en-BM","en-BS","en-BW","en-BZ","en-CA","en-CC","en-CK","en-CM","en-CX","en-DG","en-DM","en-ER","en-FJ","en-FK","en-FM","en-GB","en-GD","en-GG","en-GH","en-GI","en-GM","en-GU","en-GY","en-HK","en-IE","en-IM","en-IN","en-IO","en-JE","en-JM","en-KE","en-KI","en-KN","en-KY","en-LC","en-LR","en-LS","en-MG","en-MH","en-MO","en-MP","en-MS","en-MT","en-MU","en-MW","en-MY","en-NA","en-NF","en-NG","en-NR","en-NU","en-NZ","en-PG","en-PH","en-PK","en-PN","en-PR","en-PW","en-RW","en-SB","en-SC","en-SD","en-SG","en-SH","en-SL","en-SS","en-SX","en-SZ","en-TC","en-TK","en-TO","en-TT","en-TV","en-TZ","en-UG","en-UM","en-US","en-US-POSIX","en-VC","en-VG","en-VI","en-VU","en-WS","en-ZA","en-ZM","en-ZW","eo-001","es-419","es-AR","es-BO","es-CL","es-CO","es-CR","es-CU","es-DO","es-EA","es-EC","es-ES","es-GQ","es-GT","es-HN","es-IC","es-MX","es-NI","es-PA","es-PE","es-PH","es-PR","es-PY","es-SV","es-US","es-UY","es-VE","et-EE","eu-ES","fa-AF","fa-IR","ff-CM","ff-GN","ff-MR","ff-SN","fi-FI","fo-FO","fr-BE","fr-BF","fr-BI","fr-BJ","fr-BL","fr-CA","fr-CD","fr-CF","fr-CG","fr-CH","fr-CI","fr-CM","fr-DJ","fr-DZ","fr-FR","fr-GA","fr-GF","fr-GN","fr-GP","fr-GQ","fr-HT","fr-KM","fr-LU","fr-MA","fr-MC","fr-MF","fr-MG","fr-ML","fr-MQ","fr-MR","fr-MU","fr-NC","fr-NE","fr-PF","fr-PM","fr-RE","fr-RW","fr-SC","fr-SN","fr-SY","fr-TD","fr-TG","fr-TN","fr-VU","fr-WF","fr-YT","fy-NL","ga-IE","gd-GB","gl-ES","gu-IN","gv-IM","ha-Latn","ha-Latn-GH","ha-Latn-NE","ha-Latn-NG","he-IL","hi-IN","hr-BA","hr-HR","hu-HU","hy-AM","id-ID","ig-NG","ii-CN","is-IS","it-CH","it-IT","it-SM","ja-JP","ka-GE","ki-KE","kk-Cyrl","kk-Cyrl-KZ","kl-GL","km-KH","kn-IN","ko-KP","ko-KR","ks-Arab","ks-Arab-IN","kw-GB","ky-Cyrl","ky-Cyrl-KG","lb-LU","lg-UG","ln-AO","ln-CD","ln-CF","ln-CG","lo-LA","lt-LT","lu-CD","lv-LV","mg-MG","mk-MK","ml-IN","mn-Cyrl","mn-Cyrl-MN","mr-IN","ms-Latn","ms-Latn-BN","ms-Latn-MY","ms-Latn-SG","mt-MT","my-MM","nb-NO","nb-SJ","nd-ZW","ne-IN","ne-NP","nl-AW","nl-BE","nl-BQ","nl-CW","nl-NL","nl-SR","nl-SX","nn-NO","om-ET","om-KE","or-IN","os-GE","os-RU","pa-Arab","pa-Arab-PK","pa-Guru","pa-Guru-IN","pl-PL","ps-AF","pt-AO","pt-BR","pt-CV","pt-GW","pt-MO","pt-MZ","pt-PT","pt-ST","pt-TL","qu-BO","qu-EC","qu-PE","rm-CH","rn-BI","ro-MD","ro-RO","ru-BY","ru-KG","ru-KZ","ru-MD","ru-RU","ru-UA","rw-RW","se-FI","se-NO","se-SE","sg-CF","si-LK","sk-SK","sl-SI","sn-ZW","so-DJ","so-ET","so-KE","so-SO","sq-AL","sq-MK","sq-XK","sr-Cyrl","sr-Cyrl-BA","sr-Cyrl-ME","sr-Cyrl-RS","sr-Cyrl-XK","sr-Latn","sr-Latn-BA","sr-Latn-ME","sr-Latn-RS","sr-Latn-XK","sv-AX","sv-FI","sv-SE","sw-CD","sw-KE","sw-TZ","sw-UG","ta-IN","ta-LK","ta-MY","ta-SG","te-IN","th-TH","ti-ER","ti-ET","to-TO","tr-CY","tr-TR","ug-Arab","ug-Arab-CN","uk-UA","ur-IN","ur-PK","uz-Arab","uz-Arab-AF","uz-Cyrl","uz-Cyrl-UZ","uz-Latn","uz-Latn-UZ","vi-VN","yi-001","yo-BJ","yo-NG","zh-Hans","zh-Hans-CN","zh-Hans-HK","zh-Hans-MO","zh-Hans-SG","zh-Hant","zh-Hant-HK","zh-Hant-MO","zh-Hant-TW","zu-ZA"],us_states_and_dc:[{name:"Alabama",abbreviation:"AL"},{name:"Alaska",abbreviation:"AK"},{name:"Arizona",abbreviation:"AZ"},{name:"Arkansas",abbreviation:"AR"},{name:"California",abbreviation:"CA"},{name:"Colorado",abbreviation:"CO"},{name:"Connecticut",abbreviation:"CT"},{name:"Delaware",abbreviation:"DE"},{name:"District of Columbia",abbreviation:"DC"},{name:"Florida",abbreviation:"FL"},{name:"Georgia",abbreviation:"GA"},{name:"Hawaii",abbreviation:"HI"},{name:"Idaho",abbreviation:"ID"},{name:"Illinois",abbreviation:"IL"},{name:"Indiana",abbreviation:"IN"},{name:"Iowa",abbreviation:"IA"},{name:"Kansas",abbreviation:"KS"},{name:"Kentucky",abbreviation:"KY"},{name:"Louisiana",abbreviation:"LA"},{name:"Maine",abbreviation:"ME"},{name:"Maryland",abbreviation:"MD"},{name:"Massachusetts",abbreviation:"MA"},{name:"Michigan",abbreviation:"MI"},{name:"Minnesota",abbreviation:"MN"},{name:"Mississippi",abbreviation:"MS"},{name:"Missouri",abbreviation:"MO"},{name:"Montana",abbreviation:"MT"},{name:"Nebraska",abbreviation:"NE"},{name:"Nevada",abbreviation:"NV"},{name:"New Hampshire",abbreviation:"NH"},{name:"New Jersey",abbreviation:"NJ"},{name:"New Mexico",abbreviation:"NM"},{name:"New York",abbreviation:"NY"},{name:"North Carolina",abbreviation:"NC"},{name:"North Dakota",abbreviation:"ND"},{name:"Ohio",abbreviation:"OH"},{name:"Oklahoma",abbreviation:"OK"},{name:"Oregon",abbreviation:"OR"},{name:"Pennsylvania",abbreviation:"PA"},{name:"Rhode Island",abbreviation:"RI"},{name:"South Carolina",abbreviation:"SC"},{name:"South Dakota",abbreviation:"SD"},{name:"Tennessee",abbreviation:"TN"},{name:"Texas",abbreviation:"TX"},{name:"Utah",abbreviation:"UT"},{name:"Vermont",abbreviation:"VT"},{name:"Virginia",abbreviation:"VA"},{name:"Washington",abbreviation:"WA"},{name:"West Virginia",abbreviation:"WV"},{name:"Wisconsin",abbreviation:"WI"},{name:"Wyoming",abbreviation:"WY"}],territories:[{name:"American Samoa",abbreviation:"AS"},{name:"Federated States of Micronesia",abbreviation:"FM"},{name:"Guam",abbreviation:"GU"},{name:"Marshall Islands",abbreviation:"MH"},{name:"Northern Mariana Islands",abbreviation:"MP"},{name:"Puerto Rico",abbreviation:"PR"},{name:"Virgin Islands, U.S.",abbreviation:"VI"}],armed_forces:[{name:"Armed Forces Europe",abbreviation:"AE"},{name:"Armed Forces Pacific",abbreviation:"AP"},{name:"Armed Forces the Americas",abbreviation:"AA"}],country_regions:{it:[{name:"Valle d'Aosta",abbreviation:"VDA"},{name:"Piemonte",abbreviation:"PIE"},{name:"Lombardia",abbreviation:"LOM"},{name:"Veneto",abbreviation:"VEN"},{name:"Trentino Alto Adige",abbreviation:"TAA"},{name:"Friuli Venezia Giulia",abbreviation:"FVG"},{name:"Liguria",abbreviation:"LIG"},{name:"Emilia Romagna",abbreviation:"EMR"},{name:"Toscana",abbreviation:"TOS"},{name:"Umbria",abbreviation:"UMB"},{name:"Marche",abbreviation:"MAR"},{name:"Abruzzo",abbreviation:"ABR"},{name:"Lazio",abbreviation:"LAZ"},{name:"Campania",abbreviation:"CAM"},{name:"Puglia",abbreviation:"PUG"},{name:"Basilicata",abbreviation:"BAS"},{name:"Molise",abbreviation:"MOL"},{name:"Calabria",abbreviation:"CAL"},{name:"Sicilia",abbreviation:"SIC"},{name:"Sardegna",abbreviation:"SAR"}],mx:[{name:"Aguascalientes",abbreviation:"AGU"},{name:"Baja California",abbreviation:"BCN"},{name:"Baja California Sur",abbreviation:"BCS"},{name:"Campeche",abbreviation:"CAM"},{name:"Chiapas",abbreviation:"CHP"},{name:"Chihuahua",abbreviation:"CHH"},{name:"Ciudad de M??xico",abbreviation:"DIF"},{name:"Coahuila",abbreviation:"COA"},{name:"Colima",abbreviation:"COL"},{name:"Durango",abbreviation:"DUR"},{name:"Guanajuato",abbreviation:"GUA"},{name:"Guerrero",abbreviation:"GRO"},{name:"Hidalgo",abbreviation:"HID"},{name:"Jalisco",abbreviation:"JAL"},{name:"M??xico",abbreviation:"MEX"},{name:"Michoac??n",abbreviation:"MIC"},{name:"Morelos",abbreviation:"MOR"},{name:"Nayarit",abbreviation:"NAY"},{name:"Nuevo Le??n",abbreviation:"NLE"},{name:"Oaxaca",abbreviation:"OAX"},{name:"Puebla",abbreviation:"PUE"},{name:"Quer??taro",abbreviation:"QUE"},{name:"Quintana Roo",abbreviation:"ROO"},{name:"San Luis Potos??",abbreviation:"SLP"},{name:"Sinaloa",abbreviation:"SIN"},{name:"Sonora",abbreviation:"SON"},{name:"Tabasco",abbreviation:"TAB"},{name:"Tamaulipas",abbreviation:"TAM"},{name:"Tlaxcala",abbreviation:"TLA"},{name:"Veracruz",abbreviation:"VER"},{name:"Yucat??n",abbreviation:"YUC"},{name:"Zacatecas",abbreviation:"ZAC"}]},street_suffixes:{us:[{name:"Avenue",abbreviation:"Ave"},{name:"Boulevard",abbreviation:"Blvd"},{name:"Center",abbreviation:"Ctr"},{name:"Circle",abbreviation:"Cir"},{name:"Court",abbreviation:"Ct"},{name:"Drive",abbreviation:"Dr"},{name:"Extension",abbreviation:"Ext"},{name:"Glen",abbreviation:"Gln"},{name:"Grove",abbreviation:"Grv"},{name:"Heights",abbreviation:"Hts"},{name:"Highway",abbreviation:"Hwy"},{name:"Junction",abbreviation:"Jct"},{name:"Key",abbreviation:"Key"},{name:"Lane",abbreviation:"Ln"},{name:"Loop",abbreviation:"Loop"},{name:"Manor",abbreviation:"Mnr"},{name:"Mill",abbreviation:"Mill"},{name:"Park",abbreviation:"Park"},{name:"Parkway",abbreviation:"Pkwy"},{name:"Pass",abbreviation:"Pass"},{name:"Path",abbreviation:"Path"},{name:"Pike",abbreviation:"Pike"},{name:"Place",abbreviation:"Pl"},{name:"Plaza",abbreviation:"Plz"},{name:"Point",abbreviation:"Pt"},{name:"Ridge",abbreviation:"Rdg"},{name:"River",abbreviation:"Riv"},{name:"Road",abbreviation:"Rd"},{name:"Square",abbreviation:"Sq"},{name:"Street",abbreviation:"St"},{name:"Terrace",abbreviation:"Ter"},{name:"Trail",abbreviation:"Trl"},{name:"Turnpike",abbreviation:"Tpke"},{name:"View",abbreviation:"Vw"},{name:"Way",abbreviation:"Way"}],it:[{name:"Accesso",abbreviation:"Acc."},{name:"Alzaia",abbreviation:"Alz."},{name:"Arco",abbreviation:"Arco"},{name:"Archivolto",abbreviation:"Acv."},{name:"Arena",abbreviation:"Arena"},{name:"Argine",abbreviation:"Argine"},{name:"Bacino",abbreviation:"Bacino"},{name:"Banchi",abbreviation:"Banchi"},{name:"Banchina",abbreviation:"Ban."},{name:"Bastioni",abbreviation:"Bas."},{name:"Belvedere",abbreviation:"Belv."},{name:"Borgata",abbreviation:"B.ta"},{name:"Borgo",abbreviation:"B.go"},{name:"Calata",abbreviation:"Cal."},{name:"Calle",abbreviation:"Calle"},{name:"Campiello",abbreviation:"Cam."},{name:"Campo",abbreviation:"Cam."},{name:"Canale",abbreviation:"Can."},{name:"Carraia",abbreviation:"Carr."},{name:"Cascina",abbreviation:"Cascina"},{name:"Case sparse",abbreviation:"c.s."},{name:"Cavalcavia",abbreviation:"Cv."},{name:"Circonvallazione",abbreviation:"Cv."},{name:"Complanare",abbreviation:"C.re"},{name:"Contrada",abbreviation:"C.da"},{name:"Corso",abbreviation:"C.so"},{name:"Corte",abbreviation:"C.te"},{name:"Cortile",abbreviation:"C.le"},{name:"Diramazione",abbreviation:"Dir."},{name:"Fondaco",abbreviation:"F.co"},{name:"Fondamenta",abbreviation:"F.ta"},{name:"Fondo",abbreviation:"F.do"},{name:"Frazione",abbreviation:"Fr."},{name:"Isola",abbreviation:"Is."},{name:"Largo",abbreviation:"L.go"},{name:"Litoranea",abbreviation:"Lit."},{name:"Lungolago",abbreviation:"L.go lago"},{name:"Lungo Po",abbreviation:"l.go Po"},{name:"Molo",abbreviation:"Molo"},{name:"Mura",abbreviation:"Mura"},{name:"Passaggio privato",abbreviation:"pass. priv."},{name:"Passeggiata",abbreviation:"Pass."},{name:"Piazza",abbreviation:"P.zza"},{name:"Piazzale",abbreviation:"P.le"},{name:"Ponte",abbreviation:"P.te"},{name:"Portico",abbreviation:"P.co"},{name:"Rampa",abbreviation:"Rampa"},{name:"Regione",abbreviation:"Reg."},{name:"Rione",abbreviation:"R.ne"},{name:"Rio",abbreviation:"Rio"},{name:"Ripa",abbreviation:"Ripa"},{name:"Riva",abbreviation:"Riva"},{name:"Rond??",abbreviation:"Rond??"},{name:"Rotonda",abbreviation:"Rot."},{name:"Sagrato",abbreviation:"Sagr."},{name:"Salita",abbreviation:"Sal."},{name:"Scalinata",abbreviation:"Scal."},{name:"Scalone",abbreviation:"Scal."},{name:"Slargo",abbreviation:"Sl."},{name:"Sottoportico",abbreviation:"Sott."},{name:"Strada",abbreviation:"Str."},{name:"Stradale",abbreviation:"Str.le"},{name:"Strettoia",abbreviation:"Strett."},{name:"Traversa",abbreviation:"Trav."},{name:"Via",abbreviation:"V."},{name:"Viale",abbreviation:"V.le"},{name:"Vicinale",abbreviation:"Vic.le"},{name:"Vicolo",abbreviation:"Vic."}],uk:[{name:"Avenue",abbreviation:"Ave"},{name:"Close",abbreviation:"Cl"},{name:"Court",abbreviation:"Ct"},{name:"Crescent",abbreviation:"Cr"},{name:"Drive",abbreviation:"Dr"},{name:"Garden",abbreviation:"Gdn"},{name:"Gardens",abbreviation:"Gdns"},{name:"Green",abbreviation:"Gn"},{name:"Grove",abbreviation:"Gr"},{name:"Lane",abbreviation:"Ln"},{name:"Mount",abbreviation:"Mt"},{name:"Place",abbreviation:"Pl"},{name:"Park",abbreviation:"Pk"},{name:"Ridge",abbreviation:"Rdg"},{name:"Road",abbreviation:"Rd"},{name:"Square",abbreviation:"Sq"},{name:"Street",abbreviation:"St"},{name:"Terrace",abbreviation:"Ter"},{name:"Valley",abbreviation:"Val"}]},months:[{name:"January",short_name:"Jan",numeric:"01",days:31},{name:"February",short_name:"Feb",numeric:"02",days:28},{name:"March",short_name:"Mar",numeric:"03",days:31},{name:"April",short_name:"Apr",numeric:"04",days:30},{name:"May",short_name:"May",numeric:"05",days:31},{name:"June",short_name:"Jun",numeric:"06",days:30},{name:"July",short_name:"Jul",numeric:"07",days:31},{name:"August",short_name:"Aug",numeric:"08",days:31},{name:"September",short_name:"Sep",numeric:"09",days:30},{name:"October",short_name:"Oct",numeric:"10",days:31},{name:"November",short_name:"Nov",numeric:"11",days:30},{name:"December",short_name:"Dec",numeric:"12",days:31}],cc_types:[{name:"American Express",short_name:"amex",prefix:"34",length:15},{name:"Bankcard",short_name:"bankcard",prefix:"5610",length:16},{name:"China UnionPay",short_name:"chinaunion",prefix:"62",length:16},{name:"Diners Club Carte Blanche",short_name:"dccarte",prefix:"300",length:14},{name:"Diners Club enRoute",short_name:"dcenroute",prefix:"2014",length:15},{name:"Diners Club International",short_name:"dcintl",prefix:"36",length:14},{name:"Diners Club United States & Canada",short_name:"dcusc",prefix:"54",length:16},{name:"Discover Card",short_name:"discover",prefix:"6011",length:16},{name:"InstaPayment",short_name:"instapay",prefix:"637",length:16},{name:"JCB",short_name:"jcb",prefix:"3528",length:16},{name:"Laser",short_name:"laser",prefix:"6304",length:16},{name:"Maestro",short_name:"maestro",prefix:"5018",length:16},{name:"Mastercard",short_name:"mc",prefix:"51",length:16},{name:"Solo",short_name:"solo",prefix:"6334",length:16},{name:"Switch",short_name:"switch",prefix:"4903",length:16},{name:"Visa",short_name:"visa",prefix:"4",length:16},{name:"Visa Electron",short_name:"electron",prefix:"4026",length:16}],currency_types:[{code:"AED",name:"United Arab Emirates Dirham"},{code:"AFN",name:"Afghanistan Afghani"},{code:"ALL",name:"Albania Lek"},{code:"AMD",name:"Armenia Dram"},{code:"ANG",name:"Netherlands Antilles Guilder"},{code:"AOA",name:"Angola Kwanza"},{code:"ARS",name:"Argentina Peso"},{code:"AUD",name:"Australia Dollar"},{code:"AWG",name:"Aruba Guilder"},{code:"AZN",name:"Azerbaijan New Manat"},{code:"BAM",name:"Bosnia and Herzegovina Convertible Marka"},{code:"BBD",name:"Barbados Dollar"},{code:"BDT",name:"Bangladesh Taka"},{code:"BGN",name:"Bulgaria Lev"},{code:"BHD",name:"Bahrain Dinar"},{code:"BIF",name:"Burundi Franc"},{code:"BMD",name:"Bermuda Dollar"},{code:"BND",name:"Brunei Darussalam Dollar"},{code:"BOB",name:"Bolivia Boliviano"},{code:"BRL",name:"Brazil Real"},{code:"BSD",name:"Bahamas Dollar"},{code:"BTN",name:"Bhutan Ngultrum"},{code:"BWP",name:"Botswana Pula"},{code:"BYR",name:"Belarus Ruble"},{code:"BZD",name:"Belize Dollar"},{code:"CAD",name:"Canada Dollar"},{code:"CDF",name:"Congo/Kinshasa Franc"},{code:"CHF",name:"Switzerland Franc"},{code:"CLP",name:"Chile Peso"},{code:"CNY",name:"China Yuan Renminbi"},{code:"COP",name:"Colombia Peso"},{code:"CRC",name:"Costa Rica Colon"},{code:"CUC",name:"Cuba Convertible Peso"},{code:"CUP",name:"Cuba Peso"},{code:"CVE",name:"Cape Verde Escudo"},{code:"CZK",name:"Czech Republic Koruna"},{code:"DJF",name:"Djibouti Franc"},{code:"DKK",name:"Denmark Krone"},{code:"DOP",name:"Dominican Republic Peso"},{code:"DZD",name:"Algeria Dinar"},{code:"EGP",name:"Egypt Pound"},{code:"ERN",name:"Eritrea Nakfa"},{code:"ETB",name:"Ethiopia Birr"},{code:"EUR",name:"Euro Member Countries"},{code:"FJD",name:"Fiji Dollar"},{code:"FKP",name:"Falkland Islands (Malvinas) Pound"},{code:"GBP",name:"United Kingdom Pound"},{code:"GEL",name:"Georgia Lari"},{code:"GGP",name:"Guernsey Pound"},{code:"GHS",name:"Ghana Cedi"},{code:"GIP",name:"Gibraltar Pound"},{code:"GMD",name:"Gambia Dalasi"},{code:"GNF",name:"Guinea Franc"},{code:"GTQ",name:"Guatemala Quetzal"},{code:"GYD",name:"Guyana Dollar"},{code:"HKD",name:"Hong Kong Dollar"},{code:"HNL",name:"Honduras Lempira"},{code:"HRK",name:"Croatia Kuna"},{code:"HTG",name:"Haiti Gourde"},{code:"HUF",name:"Hungary Forint"},{code:"IDR",name:"Indonesia Rupiah"},{code:"ILS",name:"Israel Shekel"},{code:"IMP",name:"Isle of Man Pound"},{code:"INR",name:"India Rupee"},{code:"IQD",name:"Iraq Dinar"},{code:"IRR",name:"Iran Rial"},{code:"ISK",name:"Iceland Krona"},{code:"JEP",name:"Jersey Pound"},{code:"JMD",name:"Jamaica Dollar"},{code:"JOD",name:"Jordan Dinar"},{code:"JPY",name:"Japan Yen"},{code:"KES",name:"Kenya Shilling"},{code:"KGS",name:"Kyrgyzstan Som"},{code:"KHR",name:"Cambodia Riel"},{code:"KMF",name:"Comoros Franc"},{code:"KPW",name:"Korea (North) Won"},{code:"KRW",name:"Korea (South) Won"},{code:"KWD",name:"Kuwait Dinar"},{code:"KYD",name:"Cayman Islands Dollar"},{code:"KZT",name:"Kazakhstan Tenge"},{code:"LAK",name:"Laos Kip"},{code:"LBP",name:"Lebanon Pound"},{code:"LKR",name:"Sri Lanka Rupee"},{code:"LRD",name:"Liberia Dollar"},{code:"LSL",name:"Lesotho Loti"},{code:"LTL",name:"Lithuania Litas"},{code:"LYD",name:"Libya Dinar"},{code:"MAD",name:"Morocco Dirham"},{code:"MDL",name:"Moldova Leu"},{code:"MGA",name:"Madagascar Ariary"},{code:"MKD",name:"Macedonia Denar"},{code:"MMK",name:"Myanmar (Burma) Kyat"},{code:"MNT",name:"Mongolia Tughrik"},{code:"MOP",name:"Macau Pataca"},{code:"MRO",name:"Mauritania Ouguiya"},{code:"MUR",name:"Mauritius Rupee"},{code:"MVR",name:"Maldives (Maldive Islands) Rufiyaa"},{code:"MWK",name:"Malawi Kwacha"},{code:"MXN",name:"Mexico Peso"},{code:"MYR",name:"Malaysia Ringgit"},{code:"MZN",name:"Mozambique Metical"},{code:"NAD",name:"Namibia Dollar"},{code:"NGN",name:"Nigeria Naira"},{code:"NIO",name:"Nicaragua Cordoba"},{code:"NOK",name:"Norway Krone"},{code:"NPR",name:"Nepal Rupee"},{code:"NZD",name:"New Zealand Dollar"},{code:"OMR",name:"Oman Rial"},{code:"PAB",name:"Panama Balboa"},{code:"PEN",name:"Peru Nuevo Sol"},{code:"PGK",name:"Papua New Guinea Kina"},{code:"PHP",name:"Philippines Peso"},{code:"PKR",name:"Pakistan Rupee"},{code:"PLN",name:"Poland Zloty"},{code:"PYG",name:"Paraguay Guarani"},{code:"QAR",name:"Qatar Riyal"},{code:"RON",name:"Romania New Leu"},{code:"RSD",name:"Serbia Dinar"},{code:"RUB",name:"Russia Ruble"},{code:"RWF",name:"Rwanda Franc"},{code:"SAR",name:"Saudi Arabia Riyal"},{code:"SBD",name:"Solomon Islands Dollar"},{code:"SCR",name:"Seychelles Rupee"},{code:"SDG",name:"Sudan Pound"},{code:"SEK",name:"Sweden Krona"},{code:"SGD",name:"Singapore Dollar"},{code:"SHP",name:"Saint Helena Pound"},{code:"SLL",name:"Sierra Leone Leone"},{code:"SOS",name:"Somalia Shilling"},{code:"SPL",name:"Seborga Luigino"},{code:"SRD",name:"Suriname Dollar"},{code:"STD",name:"S??o Tom?? and Pr??ncipe Dobra"},{code:"SVC",name:"El Salvador Colon"},{code:"SYP",name:"Syria Pound"},{code:"SZL",name:"Swaziland Lilangeni"},{code:"THB",name:"Thailand Baht"},{code:"TJS",name:"Tajikistan Somoni"},{code:"TMT",name:"Turkmenistan Manat"},{code:"TND",name:"Tunisia Dinar"},{code:"TOP",name:"Tonga Pa'anga"},{code:"TRY",name:"Turkey Lira"},{code:"TTD",name:"Trinidad and Tobago Dollar"},{code:"TVD",name:"Tuvalu Dollar"},{code:"TWD",name:"Taiwan New Dollar"},{code:"TZS",name:"Tanzania Shilling"},{code:"UAH",name:"Ukraine Hryvnia"},{code:"UGX",name:"Uganda Shilling"},{code:"USD",name:"United States Dollar"},{code:"UYU",name:"Uruguay Peso"},{code:"UZS",name:"Uzbekistan Som"},{code:"VEF",name:"Venezuela Bolivar"},{code:"VND",name:"Viet Nam Dong"},{code:"VUV",name:"Vanuatu Vatu"},{code:"WST",name:"Samoa Tala"},{code:"XAF",name:"Communaut?? Financi??re Africaine (BEAC) CFA Franc BEAC"},{code:"XCD",name:"East Caribbean Dollar"},{code:"XDR",name:"International Monetary Fund (IMF) Special Drawing Rights"},{code:"XOF",name:"Communaut?? Financi??re Africaine (BCEAO) Franc"},{code:"XPF",name:"Comptoirs Fran??ais du Pacifique (CFP) Franc"},{code:"YER",name:"Yemen Rial"},{code:"ZAR",name:"South Africa Rand"},{code:"ZMW",name:"Zambia Kwacha"},{code:"ZWD",name:"Zimbabwe Dollar"}],colorNames:["AliceBlue","Black","Navy","DarkBlue","MediumBlue","Blue","DarkGreen","Green","Teal","DarkCyan","DeepSkyBlue","DarkTurquoise","MediumSpringGreen","Lime","SpringGreen","Aqua","Cyan","MidnightBlue","DodgerBlue","LightSeaGreen","ForestGreen","SeaGreen","DarkSlateGray","LimeGreen","MediumSeaGreen","Turquoise","RoyalBlue","SteelBlue","DarkSlateBlue","MediumTurquoise","Indigo","DarkOliveGreen","CadetBlue","CornflowerBlue","RebeccaPurple","MediumAquaMarine","DimGray","SlateBlue","OliveDrab","SlateGray","LightSlateGray","MediumSlateBlue","LawnGreen","Chartreuse","Aquamarine","Maroon","Purple","Olive","Gray","SkyBlue","LightSkyBlue","BlueViolet","DarkRed","DarkMagenta","SaddleBrown","Ivory","White","DarkSeaGreen","LightGreen","MediumPurple","DarkViolet","PaleGreen","DarkOrchid","YellowGreen","Sienna","Brown","DarkGray","LightBlue","GreenYellow","PaleTurquoise","LightSteelBlue","PowderBlue","FireBrick","DarkGoldenRod","MediumOrchid","RosyBrown","DarkKhaki","Silver","MediumVioletRed","IndianRed","Peru","Chocolate","Tan","LightGray","Thistle","Orchid","GoldenRod","PaleVioletRed","Crimson","Gainsboro","Plum","BurlyWood","LightCyan","Lavender","DarkSalmon","Violet","PaleGoldenRod","LightCoral","Khaki","AliceBlue","HoneyDew","Azure","SandyBrown","Wheat","Beige","WhiteSmoke","MintCream","GhostWhite","Salmon","AntiqueWhite","Linen","LightGoldenRodYellow","OldLace","Red","Fuchsia","Magenta","DeepPink","OrangeRed","Tomato","HotPink","Coral","DarkOrange","LightSalmon","Orange","LightPink","Pink","Gold","PeachPuff","NavajoWhite","Moccasin","Bisque","MistyRose","BlanchedAlmond","PapayaWhip","LavenderBlush","SeaShell","Cornsilk","LemonChiffon","FloralWhite","Snow","Yellow","LightYellow"],company:["3Com Corp","3M Company","A.G. Edwards Inc.","Abbott Laboratories","Abercrombie & Fitch Co.","ABM Industries Incorporated","Ace Hardware Corporation","ACT Manufacturing Inc.","Acterna Corp.","Adams Resources & Energy, Inc.","ADC Telecommunications, Inc.","Adelphia Communications Corporation","Administaff, Inc.","Adobe Systems Incorporated","Adolph Coors Company","Advance Auto Parts, Inc.","Advanced Micro Devices, Inc.","AdvancePCS, Inc.","Advantica Restaurant Group, Inc.","The AES Corporation","Aetna Inc.","Affiliated Computer Services, Inc.","AFLAC Incorporated","AGCO Corporation","Agilent Technologies, Inc.","Agway Inc.","Apartment Investment and Management Company","Air Products and Chemicals, Inc.","Airborne, Inc.","Airgas, Inc.","AK Steel Holding Corporation","Alaska Air Group, Inc.","Alberto-Culver Company","Albertson's, Inc.","Alcoa Inc.","Alleghany Corporation","Allegheny Energy, Inc.","Allegheny Technologies Incorporated","Allergan, Inc.","ALLETE, Inc.","Alliant Energy Corporation","Allied Waste Industries, Inc.","Allmerica Financial Corporation","The Allstate Corporation","ALLTEL Corporation","The Alpine Group, Inc.","Amazon.com, Inc.","AMC Entertainment Inc.","American Power Conversion Corporation","Amerada Hess Corporation","AMERCO","Ameren Corporation","America West Holdings Corporation","American Axle & Manufacturing Holdings, Inc.","American Eagle Outfitters, Inc.","American Electric Power Company, Inc.","American Express Company","American Financial Group, Inc.","American Greetings Corporation","American International Group, Inc.","American Standard Companies Inc.","American Water Works Company, Inc.","AmerisourceBergen Corporation","Ames Department Stores, Inc.","Amgen Inc.","Amkor Technology, Inc.","AMR Corporation","AmSouth Bancorp.","Amtran, Inc.","Anadarko Petroleum Corporation","Analog Devices, Inc.","Anheuser-Busch Companies, Inc.","Anixter International Inc.","AnnTaylor Inc.","Anthem, Inc.","AOL Time Warner Inc.","Aon Corporation","Apache Corporation","Apple Computer, Inc.","Applera Corporation","Applied Industrial Technologies, Inc.","Applied Materials, Inc.","Aquila, Inc.","ARAMARK Corporation","Arch Coal, Inc.","Archer Daniels Midland Company","Arkansas Best Corporation","Armstrong Holdings, Inc.","Arrow Electronics, Inc.","ArvinMeritor, Inc.","Ashland Inc.","Astoria Financial Corporation","AT&T Corp.","Atmel Corporation","Atmos Energy Corporation","Audiovox Corporation","Autoliv, Inc.","Automatic Data Processing, Inc.","AutoNation, Inc.","AutoZone, Inc.","Avaya Inc.","Avery Dennison Corporation","Avista Corporation","Avnet, Inc.","Avon Products, Inc.","Baker Hughes Incorporated","Ball Corporation","Bank of America Corporation","The Bank of New York Company, Inc.","Bank One Corporation","Banknorth Group, Inc.","Banta Corporation","Barnes & Noble, Inc.","Bausch & Lomb Incorporated","Baxter International Inc.","BB&T Corporation","The Bear Stearns Companies Inc.","Beazer Homes USA, Inc.","Beckman Coulter, Inc.","Becton, Dickinson and Company","Bed Bath & Beyond Inc.","Belk, Inc.","Bell Microproducts Inc.","BellSouth Corporation","Belo Corp.","Bemis Company, Inc.","Benchmark Electronics, Inc.","Berkshire Hathaway Inc.","Best Buy Co., Inc.","Bethlehem Steel Corporation","Beverly Enterprises, Inc.","Big Lots, Inc.","BJ Services Company","BJ's Wholesale Club, Inc.","The Black & Decker Corporation","Black Hills Corporation","BMC Software, Inc.","The Boeing Company","Boise Cascade Corporation","Borders Group, Inc.","BorgWarner Inc.","Boston Scientific Corporation","Bowater Incorporated","Briggs & Stratton Corporation","Brightpoint, Inc.","Brinker International, Inc.","Bristol-Myers Squibb Company","Broadwing, Inc.","Brown Shoe Company, Inc.","Brown-Forman Corporation","Brunswick Corporation","Budget Group, Inc.","Burlington Coat Factory Warehouse Corporation","Burlington Industries, Inc.","Burlington Northern Santa Fe Corporation","Burlington Resources Inc.","C. H. Robinson Worldwide Inc.","Cablevision Systems Corp","Cabot Corp","Cadence Design Systems, Inc.","Calpine Corp.","Campbell Soup Co.","Capital One Financial Corp.","Cardinal Health Inc.","Caremark Rx Inc.","Carlisle Cos. Inc.","Carpenter Technology Corp.","Casey's General Stores Inc.","Caterpillar Inc.","CBRL Group Inc.","CDI Corp.","CDW Computer Centers Inc.","CellStar Corp.","Cendant Corp","Cenex Harvest States Cooperatives","Centex Corp.","CenturyTel Inc.","Ceridian Corp.","CH2M Hill Cos. Ltd.","Champion Enterprises Inc.","Charles Schwab Corp.","Charming Shoppes Inc.","Charter Communications Inc.","Charter One Financial Inc.","ChevronTexaco Corp.","Chiquita Brands International Inc.","Chubb Corp","Ciena Corp.","Cigna Corp","Cincinnati Financial Corp.","Cinergy Corp.","Cintas Corp.","Circuit City Stores Inc.","Cisco Systems Inc.","Citigroup, Inc","Citizens Communications Co.","CKE Restaurants Inc.","Clear Channel Communications Inc.","The Clorox Co.","CMGI Inc.","CMS Energy Corp.","CNF Inc.","Coca-Cola Co.","Coca-Cola Enterprises Inc.","Colgate-Palmolive Co.","Collins & Aikman Corp.","Comcast Corp.","Comdisco Inc.","Comerica Inc.","Comfort Systems USA Inc.","Commercial Metals Co.","Community Health Systems Inc.","Compass Bancshares Inc","Computer Associates International Inc.","Computer Sciences Corp.","Compuware Corp.","Comverse Technology Inc.","ConAgra Foods Inc.","Concord EFS Inc.","Conectiv, Inc","Conoco Inc","Conseco Inc.","Consolidated Freightways Corp.","Consolidated Edison Inc.","Constellation Brands Inc.","Constellation Emergy Group Inc.","Continental Airlines Inc.","Convergys Corp.","Cooper Cameron Corp.","Cooper Industries Ltd.","Cooper Tire & Rubber Co.","Corn Products International Inc.","Corning Inc.","Costco Wholesale Corp.","Countrywide Credit Industries Inc.","Coventry Health Care Inc.","Cox Communications Inc.","Crane Co.","Crompton Corp.","Crown Cork & Seal Co. Inc.","CSK Auto Corp.","CSX Corp.","Cummins Inc.","CVS Corp.","Cytec Industries Inc.","D&K Healthcare Resources, Inc.","D.R. Horton Inc.","Dana Corporation","Danaher Corporation","Darden Restaurants Inc.","DaVita Inc.","Dean Foods Company","Deere & Company","Del Monte Foods Co","Dell Computer Corporation","Delphi Corp.","Delta Air Lines Inc.","Deluxe Corporation","Devon Energy Corporation","Di Giorgio Corporation","Dial Corporation","Diebold Incorporated","Dillard's Inc.","DIMON Incorporated","Dole Food Company, Inc.","Dollar General Corporation","Dollar Tree Stores, Inc.","Dominion Resources, Inc.","Domino's Pizza LLC","Dover Corporation, Inc.","Dow Chemical Company","Dow Jones & Company, Inc.","DPL Inc.","DQE Inc.","Dreyer's Grand Ice Cream, Inc.","DST Systems, Inc.","DTE Energy Co.","E.I. Du Pont de Nemours and Company","Duke Energy Corp","Dun & Bradstreet Inc.","DURA Automotive Systems Inc.","DynCorp","Dynegy Inc.","E*Trade Group, Inc.","E.W. Scripps Company","Earthlink, Inc.","Eastman Chemical Company","Eastman Kodak Company","Eaton Corporation","Echostar Communications Corporation","Ecolab Inc.","Edison International","EGL Inc.","El Paso Corporation","Electronic Arts Inc.","Electronic Data Systems Corp.","Eli Lilly and Company","EMC Corporation","Emcor Group Inc.","Emerson Electric Co.","Encompass Services Corporation","Energizer Holdings Inc.","Energy East Corporation","Engelhard Corporation","Enron Corp.","Entergy Corporation","Enterprise Products Partners L.P.","EOG Resources, Inc.","Equifax Inc.","Equitable Resources Inc.","Equity Office Properties Trust","Equity Residential Properties Trust","Estee Lauder Companies Inc.","Exelon Corporation","Exide Technologies","Expeditors International of Washington Inc.","Express Scripts Inc.","ExxonMobil Corporation","Fairchild Semiconductor International Inc.","Family Dollar Stores Inc.","Farmland Industries Inc.","Federal Mogul Corp.","Federated Department Stores Inc.","Federal Express Corp.","Felcor Lodging Trust Inc.","Ferro Corp.","Fidelity National Financial Inc.","Fifth Third Bancorp","First American Financial Corp.","First Data Corp.","First National of Nebraska Inc.","First Tennessee National Corp.","FirstEnergy Corp.","Fiserv Inc.","Fisher Scientific International Inc.","FleetBoston Financial Co.","Fleetwood Enterprises Inc.","Fleming Companies Inc.","Flowers Foods Inc.","Flowserv Corp","Fluor Corp","FMC Corp","Foamex International Inc","Foot Locker Inc","Footstar Inc.","Ford Motor Co","Forest Laboratories Inc.","Fortune Brands Inc.","Foster Wheeler Ltd.","FPL Group Inc.","Franklin Resources Inc.","Freeport McMoran Copper & Gold Inc.","Frontier Oil Corp","Furniture Brands International Inc.","Gannett Co., Inc.","Gap Inc.","Gateway Inc.","GATX Corporation","Gemstar-TV Guide International Inc.","GenCorp Inc.","General Cable Corporation","General Dynamics Corporation","General Electric Company","General Mills Inc","General Motors Corporation","Genesis Health Ventures Inc.","Gentek Inc.","Gentiva Health Services Inc.","Genuine Parts Company","Genuity Inc.","Genzyme Corporation","Georgia Gulf Corporation","Georgia-Pacific Corporation","Gillette Company","Gold Kist Inc.","Golden State Bancorp Inc.","Golden West Financial Corporation","Goldman Sachs Group Inc.","Goodrich Corporation","The Goodyear Tire & Rubber Company","Granite Construction Incorporated","Graybar Electric Company Inc.","Great Lakes Chemical Corporation","Great Plains Energy Inc.","GreenPoint Financial Corp.","Greif Bros. Corporation","Grey Global Group Inc.","Group 1 Automotive Inc.","Guidant Corporation","H&R Block Inc.","H.B. Fuller Company","H.J. Heinz Company","Halliburton Co.","Harley-Davidson Inc.","Harman International Industries Inc.","Harrah's Entertainment Inc.","Harris Corp.","Harsco Corp.","Hartford Financial Services Group Inc.","Hasbro Inc.","Hawaiian Electric Industries Inc.","HCA Inc.","Health Management Associates Inc.","Health Net Inc.","Healthsouth Corp","Henry Schein Inc.","Hercules Inc.","Herman Miller Inc.","Hershey Foods Corp.","Hewlett-Packard Company","Hibernia Corp.","Hillenbrand Industries Inc.","Hilton Hotels Corp.","Hollywood Entertainment Corp.","Home Depot Inc.","Hon Industries Inc.","Honeywell International Inc.","Hormel Foods Corp.","Host Marriott Corp.","Household International Corp.","Hovnanian Enterprises Inc.","Hub Group Inc.","Hubbell Inc.","Hughes Supply Inc.","Humana Inc.","Huntington Bancshares Inc.","Idacorp Inc.","IDT Corporation","IKON Office Solutions Inc.","Illinois Tool Works Inc.","IMC Global Inc.","Imperial Sugar Company","IMS Health Inc.","Ingles Market Inc","Ingram Micro Inc.","Insight Enterprises Inc.","Integrated Electrical Services Inc.","Intel Corporation","International Paper Co.","Interpublic Group of Companies Inc.","Interstate Bakeries Corporation","International Business Machines Corp.","International Flavors & Fragrances Inc.","International Multifoods Corporation","Intuit Inc.","IT Group Inc.","ITT Industries Inc.","Ivax Corp.","J.B. Hunt Transport Services Inc.","J.C. Penny Co.","J.P. Morgan Chase & Co.","Jabil Circuit Inc.","Jack In The Box Inc.","Jacobs Engineering Group Inc.","JDS Uniphase Corp.","Jefferson-Pilot Co.","John Hancock Financial Services Inc.","Johnson & Johnson","Johnson Controls Inc.","Jones Apparel Group Inc.","KB Home","Kellogg Company","Kellwood Company","Kelly Services Inc.","Kemet Corp.","Kennametal Inc.","Kerr-McGee Corporation","KeyCorp","KeySpan Corp.","Kimball International Inc.","Kimberly-Clark Corporation","Kindred Healthcare Inc.","KLA-Tencor Corporation","K-Mart Corp.","Knight-Ridder Inc.","Kohl's Corp.","KPMG Consulting Inc.","Kroger Co.","L-3 Communications Holdings Inc.","Laboratory Corporation of America Holdings","Lam Research Corporation","LandAmerica Financial Group Inc.","Lands' End Inc.","Landstar System Inc.","La-Z-Boy Inc.","Lear Corporation","Legg Mason Inc.","Leggett & Platt Inc.","Lehman Brothers Holdings Inc.","Lennar Corporation","Lennox International Inc.","Level 3 Communications Inc.","Levi Strauss & Co.","Lexmark International Inc.","Limited Inc.","Lincoln National Corporation","Linens 'n Things Inc.","Lithia Motors Inc.","Liz Claiborne Inc.","Lockheed Martin Corporation","Loews Corporation","Longs Drug Stores Corporation","Louisiana-Pacific Corporation","Lowe's Companies Inc.","LSI Logic Corporation","The LTV Corporation","The Lubrizol Corporation","Lucent Technologies Inc.","Lyondell Chemical Company","M & T Bank Corporation","Magellan Health Services Inc.","Mail-Well Inc.","Mandalay Resort Group","Manor Care Inc.","Manpower Inc.","Marathon Oil Corporation","Mariner Health Care Inc.","Markel Corporation","Marriott International Inc.","Marsh & McLennan Companies Inc.","Marsh Supermarkets Inc.","Marshall & Ilsley Corporation","Martin Marietta Materials Inc.","Masco Corporation","Massey Energy Company","MasTec Inc.","Mattel Inc.","Maxim Integrated Products Inc.","Maxtor Corporation","Maxxam Inc.","The May Department Stores Company","Maytag Corporation","MBNA Corporation","McCormick & Company Incorporated","McDonald's Corporation","The McGraw-Hill Companies Inc.","McKesson Corporation","McLeodUSA Incorporated","M.D.C. Holdings Inc.","MDU Resources Group Inc.","MeadWestvaco Corporation","Medtronic Inc.","Mellon Financial Corporation","The Men's Wearhouse Inc.","Merck & Co., Inc.","Mercury General Corporation","Merrill Lynch & Co. Inc.","Metaldyne Corporation","Metals USA Inc.","MetLife Inc.","Metris Companies Inc","MGIC Investment Corporation","MGM Mirage","Michaels Stores Inc.","Micron Technology Inc.","Microsoft Corporation","Milacron Inc.","Millennium Chemicals Inc.","Mirant Corporation","Mohawk Industries Inc.","Molex Incorporated","The MONY Group Inc.","Morgan Stanley Dean Witter & Co.","Motorola Inc.","MPS Group Inc.","Murphy Oil Corporation","Nabors Industries Inc","Nacco Industries Inc","Nash Finch Company","National City Corp.","National Commerce Financial Corporation","National Fuel Gas Company","National Oilwell Inc","National Rural Utilities Cooperative Finance Corporation","National Semiconductor Corporation","National Service Industries Inc","Navistar International Corporation","NCR Corporation","The Neiman Marcus Group Inc.","New Jersey Resources Corporation","New York Times Company","Newell Rubbermaid Inc","Newmont Mining Corporation","Nextel Communications Inc","Nicor Inc","Nike Inc","NiSource Inc","Noble Energy Inc","Nordstrom Inc","Norfolk Southern Corporation","Nortek Inc","North Fork Bancorporation Inc","Northeast Utilities System","Northern Trust Corporation","Northrop Grumman Corporation","NorthWestern Corporation","Novellus Systems Inc","NSTAR","NTL Incorporated","Nucor Corp","Nvidia Corp","NVR Inc","Northwest Airlines Corp","Occidental Petroleum Corp","Ocean Energy Inc","Office Depot Inc.","OfficeMax Inc","OGE Energy Corp","Oglethorpe Power Corp.","Ohio Casualty Corp.","Old Republic International Corp.","Olin Corp.","OM Group Inc","Omnicare Inc","Omnicom Group","On Semiconductor Corp","ONEOK Inc","Oracle Corp","Oshkosh Truck Corp","Outback Steakhouse Inc.","Owens & Minor Inc.","Owens Corning","Owens-Illinois Inc","Oxford Health Plans Inc","Paccar Inc","PacifiCare Health Systems Inc","Packaging Corp. of America","Pactiv Corp","Pall Corp","Pantry Inc","Park Place Entertainment Corp","Parker Hannifin Corp.","Pathmark Stores Inc.","Paychex Inc","Payless Shoesource Inc","Penn Traffic Co.","Pennzoil-Quaker State Company","Pentair Inc","Peoples Energy Corp.","PeopleSoft Inc","Pep Boys Manny, Moe & Jack","Potomac Electric Power Co.","Pepsi Bottling Group Inc.","PepsiAmericas Inc.","PepsiCo Inc.","Performance Food Group Co.","Perini Corp","PerkinElmer Inc","Perot Systems Corp","Petco Animal Supplies Inc.","Peter Kiewit Sons', Inc.","PETsMART Inc","Pfizer Inc","Pacific Gas & Electric Corp.","Pharmacia Corp","Phar Mor Inc.","Phelps Dodge Corp.","Philip Morris Companies Inc.","Phillips Petroleum Co","Phillips Van Heusen Corp.","Phoenix Companies Inc","Pier 1 Imports Inc.","Pilgrim's Pride Corporation","Pinnacle West Capital Corp","Pioneer-Standard Electronics Inc.","Pitney Bowes Inc.","Pittston Brinks Group","Plains All American Pipeline LP","PNC Financial Services Group Inc.","PNM Resources Inc","Polaris Industries Inc.","Polo Ralph Lauren Corp","PolyOne Corp","Popular Inc","Potlatch Corp","PPG Industries Inc","PPL Corp","Praxair Inc","Precision Castparts Corp","Premcor Inc.","Pride International Inc","Primedia Inc","Principal Financial Group Inc.","Procter & Gamble Co.","Pro-Fac Cooperative Inc.","Progress Energy Inc","Progressive Corporation","Protective Life Corp","Provident Financial Group","Providian Financial Corp.","Prudential Financial Inc.","PSS World Medical Inc","Public Service Enterprise Group Inc.","Publix Super Markets Inc.","Puget Energy Inc.","Pulte Homes Inc","Qualcomm Inc","Quanta Services Inc.","Quantum Corp","Quest Diagnostics Inc.","Questar Corp","Quintiles Transnational","Qwest Communications Intl Inc","R.J. Reynolds Tobacco Company","R.R. Donnelley & Sons Company","Radio Shack Corporation","Raymond James Financial Inc.","Raytheon Company","Reader's Digest Association Inc.","Reebok International Ltd.","Regions Financial Corp.","Regis Corporation","Reliance Steel & Aluminum Co.","Reliant Energy Inc.","Rent A Center Inc","Republic Services Inc","Revlon Inc","RGS Energy Group Inc","Rite Aid Corp","Riverwood Holding Inc.","RoadwayCorp","Robert Half International Inc.","Rock-Tenn Co","Rockwell Automation Inc","Rockwell Collins Inc","Rohm & Haas Co.","Ross Stores Inc","RPM Inc.","Ruddick Corp","Ryder System Inc","Ryerson Tull Inc","Ryland Group Inc.","Sabre Holdings Corp","Safeco Corp","Safeguard Scientifics Inc.","Safeway Inc","Saks Inc","Sanmina-SCI Inc","Sara Lee Corp","SBC Communications Inc","Scana Corp.","Schering-Plough Corp","Scholastic Corp","SCI Systems Onc.","Science Applications Intl. Inc.","Scientific-Atlanta Inc","Scotts Company","Seaboard Corp","Sealed Air Corp","Sears Roebuck & Co","Sempra Energy","Sequa Corp","Service Corp. International","ServiceMaster Co","Shaw Group Inc","Sherwin-Williams Company","Shopko Stores Inc","Siebel Systems Inc","Sierra Health Services Inc","Sierra Pacific Resources","Silgan Holdings Inc.","Silicon Graphics Inc","Simon Property Group Inc","SLM Corporation","Smith International Inc","Smithfield Foods Inc","Smurfit-Stone Container Corp","Snap-On Inc","Solectron Corp","Solutia Inc","Sonic Automotive Inc.","Sonoco Products Co.","Southern Company","Southern Union Company","SouthTrust Corp.","Southwest Airlines Co","Southwest Gas Corp","Sovereign Bancorp Inc.","Spartan Stores Inc","Spherion Corp","Sports Authority Inc","Sprint Corp.","SPX Corp","St. Jude Medical Inc","St. Paul Cos.","Staff Leasing Inc.","StanCorp Financial Group Inc","Standard Pacific Corp.","Stanley Works","Staples Inc","Starbucks Corp","Starwood Hotels & Resorts Worldwide Inc","State Street Corp.","Stater Bros. Holdings Inc.","Steelcase Inc","Stein Mart Inc","Stewart & Stevenson Services Inc","Stewart Information Services Corp","Stilwell Financial Inc","Storage Technology Corporation","Stryker Corp","Sun Healthcare Group Inc.","Sun Microsystems Inc.","SunGard Data Systems Inc.","Sunoco Inc.","SunTrust Banks Inc","Supervalu Inc","Swift Transportation, Co., Inc","Symbol Technologies Inc","Synovus Financial Corp.","Sysco Corp","Systemax Inc.","Target Corp.","Tech Data Corporation","TECO Energy Inc","Tecumseh Products Company","Tektronix Inc","Teleflex Incorporated","Telephone & Data Systems Inc","Tellabs Inc.","Temple-Inland Inc","Tenet Healthcare Corporation","Tenneco Automotive Inc.","Teradyne Inc","Terex Corp","Tesoro Petroleum Corp.","Texas Industries Inc.","Texas Instruments Incorporated","Textron Inc","Thermo Electron Corporation","Thomas & Betts Corporation","Tiffany & Co","Timken Company","TJX Companies Inc","TMP Worldwide Inc","Toll Brothers Inc","Torchmark Corporation","Toro Company","Tower Automotive Inc.","Toys 'R' Us Inc","Trans World Entertainment Corp.","TransMontaigne Inc","Transocean Inc","TravelCenters of America Inc.","Triad Hospitals Inc","Tribune Company","Trigon Healthcare Inc.","Trinity Industries Inc","Trump Hotels & Casino Resorts Inc.","TruServ Corporation","TRW Inc","TXU Corp","Tyson Foods Inc","U.S. Bancorp","U.S. Industries Inc.","UAL Corporation","UGI Corporation","Unified Western Grocers Inc","Union Pacific Corporation","Union Planters Corp","Unisource Energy Corp","Unisys Corporation","United Auto Group Inc","United Defense Industries Inc.","United Parcel Service Inc","United Rentals Inc","United Stationers Inc","United Technologies Corporation","UnitedHealth Group Incorporated","Unitrin Inc","Universal Corporation","Universal Forest Products Inc","Universal Health Services Inc","Unocal Corporation","Unova Inc","UnumProvident Corporation","URS Corporation","US Airways Group Inc","US Oncology Inc","USA Interactive","USFreighways Corporation","USG Corporation","UST Inc","Valero Energy Corporation","Valspar Corporation","Value City Department Stores Inc","Varco International Inc","Vectren Corporation","Veritas Software Corporation","Verizon Communications Inc","VF Corporation","Viacom Inc","Viad Corp","Viasystems Group Inc","Vishay Intertechnology Inc","Visteon Corporation","Volt Information Sciences Inc","Vulcan Materials Company","W.R. Berkley Corporation","W.R. Grace & Co","W.W. Grainger Inc","Wachovia Corporation","Wakenhut Corporation","Walgreen Co","Wallace Computer Services Inc","Wal-Mart Stores Inc","Walt Disney Co","Walter Industries Inc","Washington Mutual Inc","Washington Post Co.","Waste Management Inc","Watsco Inc","Weatherford International Inc","Weis Markets Inc.","Wellpoint Health Networks Inc","Wells Fargo & Company","Wendy's International Inc","Werner Enterprises Inc","WESCO International Inc","Western Digital Inc","Western Gas Resources Inc","WestPoint Stevens Inc","Weyerhauser Company","WGL Holdings Inc","Whirlpool Corporation","Whole Foods Market Inc","Willamette Industries Inc.","Williams Companies Inc","Williams Sonoma Inc","Winn Dixie Stores Inc","Wisconsin Energy Corporation","Wm Wrigley Jr Company","World Fuel Services Corporation","WorldCom Inc","Worthington Industries Inc","WPS Resources Corporation","Wyeth","Wyndham International Inc","Xcel Energy Inc","Xerox Corp","Xilinx Inc","XO Communications Inc","Yellow Corporation","York International Corp","Yum Brands Inc.","Zale Corporation","Zions Bancorporation"],fileExtension:{raster:["bmp","gif","gpl","ico","jpeg","psd","png","psp","raw","tiff"],vector:["3dv","amf","awg","ai","cgm","cdr","cmx","dxf","e2d","egt","eps","fs","odg","svg","xar"],"3d":["3dmf","3dm","3mf","3ds","an8","aoi","blend","cal3d","cob","ctm","iob","jas","max","mb","mdx","obj","x","x3d"],document:["doc","docx","dot","html","xml","odt","odm","ott","csv","rtf","tex","xhtml","xps"]},timezones:[{name:"Dateline Standard Time",abbr:"DST",offset:-12,isdst:!1,text:"(UTC-12:00) International Date Line West",utc:["Etc/GMT+12"]},{name:"UTC-11",abbr:"U",offset:-11,isdst:!1,text:"(UTC-11:00) Coordinated Universal Time-11",utc:["Etc/GMT+11","Pacific/Midway","Pacific/Niue","Pacific/Pago_Pago"]},{name:"Hawaiian Standard Time",abbr:"HST",offset:-10,isdst:!1,text:"(UTC-10:00) Hawaii",utc:["Etc/GMT+10","Pacific/Honolulu","Pacific/Johnston","Pacific/Rarotonga","Pacific/Tahiti"]},{name:"Alaskan Standard Time",abbr:"AKDT",offset:-8,isdst:!0,text:"(UTC-09:00) Alaska",utc:["America/Anchorage","America/Juneau","America/Nome","America/Sitka","America/Yakutat"]},{name:"Pacific Standard Time (Mexico)",abbr:"PDT",offset:-7,isdst:!0,text:"(UTC-08:00) Baja California",utc:["America/Santa_Isabel"]},{name:"Pacific Standard Time",abbr:"PDT",offset:-7,isdst:!0,text:"(UTC-08:00) Pacific Time (US & Canada)",utc:["America/Dawson","America/Los_Angeles","America/Tijuana","America/Vancouver","America/Whitehorse","PST8PDT"]},{name:"US Mountain Standard Time",abbr:"UMST",offset:-7,isdst:!1,text:"(UTC-07:00) Arizona",utc:["America/Creston","America/Dawson_Creek","America/Hermosillo","America/Phoenix","Etc/GMT+7"]},{name:"Mountain Standard Time (Mexico)",abbr:"MDT",offset:-6,isdst:!0,text:"(UTC-07:00) Chihuahua, La Paz, Mazatlan",utc:["America/Chihuahua","America/Mazatlan"]},{name:"Mountain Standard Time",abbr:"MDT",offset:-6,isdst:!0,text:"(UTC-07:00) Mountain Time (US & Canada)",utc:["America/Boise","America/Cambridge_Bay","America/Denver","America/Edmonton","America/Inuvik","America/Ojinaga","America/Yellowknife","MST7MDT"]},{name:"Central America Standard Time",abbr:"CAST",offset:-6,isdst:!1,text:"(UTC-06:00) Central America",utc:["America/Belize","America/Costa_Rica","America/El_Salvador","America/Guatemala","America/Managua","America/Tegucigalpa","Etc/GMT+6","Pacific/Galapagos"]},{name:"Central Standard Time",abbr:"CDT",offset:-5,isdst:!0,text:"(UTC-06:00) Central Time (US & Canada)",utc:["America/Chicago","America/Indiana/Knox","America/Indiana/Tell_City","America/Matamoros","America/Menominee","America/North_Dakota/Beulah","America/North_Dakota/Center","America/North_Dakota/New_Salem","America/Rainy_River","America/Rankin_Inlet","America/Resolute","America/Winnipeg","CST6CDT"]},{name:"Central Standard Time (Mexico)",abbr:"CDT",offset:-5,isdst:!0,text:"(UTC-06:00) Guadalajara, Mexico City, Monterrey",utc:["America/Bahia_Banderas","America/Cancun","America/Merida","America/Mexico_City","America/Monterrey"]},{name:"Canada Central Standard Time",abbr:"CCST",offset:-6,isdst:!1,text:"(UTC-06:00) Saskatchewan",utc:["America/Regina","America/Swift_Current"]},{name:"SA Pacific Standard Time",abbr:"SPST",offset:-5,isdst:!1,text:"(UTC-05:00) Bogota, Lima, Quito",utc:["America/Bogota","America/Cayman","America/Coral_Harbour","America/Eirunepe","America/Guayaquil","America/Jamaica","America/Lima","America/Panama","America/Rio_Branco","Etc/GMT+5"]},{name:"Eastern Standard Time",abbr:"EDT",offset:-4,isdst:!0,text:"(UTC-05:00) Eastern Time (US & Canada)",utc:["America/Detroit","America/Havana","America/Indiana/Petersburg","America/Indiana/Vincennes","America/Indiana/Winamac","America/Iqaluit","America/Kentucky/Monticello","America/Louisville","America/Montreal","America/Nassau","America/New_York","America/Nipigon","America/Pangnirtung","America/Port-au-Prince","America/Thunder_Bay","America/Toronto","EST5EDT"]},{name:"US Eastern Standard Time",abbr:"UEDT",offset:-4,isdst:!0,text:"(UTC-05:00) Indiana (East)",utc:["America/Indiana/Marengo","America/Indiana/Vevay","America/Indianapolis"]},{name:"Venezuela Standard Time",abbr:"VST",offset:-4.5,isdst:!1,text:"(UTC-04:30) Caracas",utc:["America/Caracas"]},{name:"Paraguay Standard Time",abbr:"PST",offset:-4,isdst:!1,text:"(UTC-04:00) Asuncion",utc:["America/Asuncion"]},{name:"Atlantic Standard Time",abbr:"ADT",offset:-3,isdst:!0,text:"(UTC-04:00) Atlantic Time (Canada)",utc:["America/Glace_Bay","America/Goose_Bay","America/Halifax","America/Moncton","America/Thule","Atlantic/Bermuda"]},{name:"Central Brazilian Standard Time",abbr:"CBST",offset:-4,isdst:!1,text:"(UTC-04:00) Cuiaba",utc:["America/Campo_Grande","America/Cuiaba"]},{name:"SA Western Standard Time",abbr:"SWST",offset:-4,isdst:!1,text:"(UTC-04:00) Georgetown, La Paz, Manaus, San Juan",utc:["America/Anguilla","America/Antigua","America/Aruba","America/Barbados","America/Blanc-Sablon","America/Boa_Vista","America/Curacao","America/Dominica","America/Grand_Turk","America/Grenada","America/Guadeloupe","America/Guyana","America/Kralendijk","America/La_Paz","America/Lower_Princes","America/Manaus","America/Marigot","America/Martinique","America/Montserrat","America/Port_of_Spain","America/Porto_Velho","America/Puerto_Rico","America/Santo_Domingo","America/St_Barthelemy","America/St_Kitts","America/St_Lucia","America/St_Thomas","America/St_Vincent","America/Tortola","Etc/GMT+4"]},{name:"Pacific SA Standard Time",abbr:"PSST",offset:-4,isdst:!1,text:"(UTC-04:00) Santiago",utc:["America/Santiago","Antarctica/Palmer"]},{name:"Newfoundland Standard Time",abbr:"NDT",offset:-2.5,isdst:!0,text:"(UTC-03:30) Newfoundland",utc:["America/St_Johns"]},{name:"E. South America Standard Time",abbr:"ESAST",offset:-3,isdst:!1,text:"(UTC-03:00) Brasilia",utc:["America/Sao_Paulo"]},{name:"Argentina Standard Time",abbr:"AST",offset:-3,isdst:!1,text:"(UTC-03:00) Buenos Aires",utc:["America/Argentina/La_Rioja","America/Argentina/Rio_Gallegos","America/Argentina/Salta","America/Argentina/San_Juan","America/Argentina/San_Luis","America/Argentina/Tucuman","America/Argentina/Ushuaia","America/Buenos_Aires","America/Catamarca","America/Cordoba","America/Jujuy","America/Mendoza"]},{name:"SA Eastern Standard Time",abbr:"SEST",offset:-3,isdst:!1,text:"(UTC-03:00) Cayenne, Fortaleza",utc:["America/Araguaina","America/Belem","America/Cayenne","America/Fortaleza","America/Maceio","America/Paramaribo","America/Recife","America/Santarem","Antarctica/Rothera","Atlantic/Stanley","Etc/GMT+3"]},{name:"Greenland Standard Time",abbr:"GDT",offset:-2,isdst:!0,text:"(UTC-03:00) Greenland",utc:["America/Godthab"]},{name:"Montevideo Standard Time",abbr:"MST",offset:-3,isdst:!1,text:"(UTC-03:00) Montevideo",utc:["America/Montevideo"]},{name:"Bahia Standard Time",abbr:"BST",offset:-3,isdst:!1,text:"(UTC-03:00) Salvador",utc:["America/Bahia"]},{name:"UTC-02",abbr:"U",offset:-2,isdst:!1,text:"(UTC-02:00) Coordinated Universal Time-02",utc:["America/Noronha","Atlantic/South_Georgia","Etc/GMT+2"]},{name:"Mid-Atlantic Standard Time",abbr:"MDT",offset:-1,isdst:!0,text:"(UTC-02:00) Mid-Atlantic - Old"},{name:"Azores Standard Time",abbr:"ADT",offset:0,isdst:!0,text:"(UTC-01:00) Azores",utc:["America/Scoresbysund","Atlantic/Azores"]},{name:"Cape Verde Standard Time",abbr:"CVST",offset:-1,isdst:!1,text:"(UTC-01:00) Cape Verde Is.",utc:["Atlantic/Cape_Verde","Etc/GMT+1"]},{name:"Morocco Standard Time",abbr:"MDT",offset:1,isdst:!0,text:"(UTC) Casablanca",utc:["Africa/Casablanca","Africa/El_Aaiun"]},{name:"UTC",abbr:"CUT",offset:0,isdst:!1,text:"(UTC) Coordinated Universal Time",utc:["America/Danmarkshavn","Etc/GMT"]},{name:"GMT Standard Time",abbr:"GDT",offset:1,isdst:!0,text:"(UTC) Dublin, Edinburgh, Lisbon, London",utc:["Atlantic/Canary","Atlantic/Faeroe","Atlantic/Madeira","Europe/Dublin","Europe/Guernsey","Europe/Isle_of_Man","Europe/Jersey","Europe/Lisbon","Europe/London"]},{name:"Greenwich Standard Time",abbr:"GST",offset:0,isdst:!1,text:"(UTC) Monrovia, Reykjavik",utc:["Africa/Abidjan","Africa/Accra","Africa/Bamako","Africa/Banjul","Africa/Bissau","Africa/Conakry","Africa/Dakar","Africa/Freetown","Africa/Lome","Africa/Monrovia","Africa/Nouakchott","Africa/Ouagadougou","Africa/Sao_Tome","Atlantic/Reykjavik","Atlantic/St_Helena"]},{name:"W. Europe Standard Time",abbr:"WEDT",offset:2,isdst:!0,text:"(UTC+01:00) Amsterdam, Berlin, Bern, Rome, Stockholm, Vienna",utc:["Arctic/Longyearbyen","Europe/Amsterdam","Europe/Andorra","Europe/Berlin","Europe/Busingen","Europe/Gibraltar","Europe/Luxembourg","Europe/Malta","Europe/Monaco","Europe/Oslo","Europe/Rome","Europe/San_Marino","Europe/Stockholm","Europe/Vaduz","Europe/Vatican","Europe/Vienna","Europe/Zurich"]},{name:"Central Europe Standard Time",abbr:"CEDT",offset:2,isdst:!0,text:"(UTC+01:00) Belgrade, Bratislava, Budapest, Ljubljana, Prague",utc:["Europe/Belgrade","Europe/Bratislava","Europe/Budapest","Europe/Ljubljana","Europe/Podgorica","Europe/Prague","Europe/Tirane"]},{name:"Romance Standard Time",abbr:"RDT",offset:2,isdst:!0,text:"(UTC+01:00) Brussels, Copenhagen, Madrid, Paris",utc:["Africa/Ceuta","Europe/Brussels","Europe/Copenhagen","Europe/Madrid","Europe/Paris"]},{name:"Central European Standard Time",abbr:"CEDT",offset:2,isdst:!0,text:"(UTC+01:00) Sarajevo, Skopje, Warsaw, Zagreb",utc:["Europe/Sarajevo","Europe/Skopje","Europe/Warsaw","Europe/Zagreb"]},{name:"W. Central Africa Standard Time",abbr:"WCAST",offset:1,isdst:!1,text:"(UTC+01:00) West Central Africa",utc:["Africa/Algiers","Africa/Bangui","Africa/Brazzaville","Africa/Douala","Africa/Kinshasa","Africa/Lagos","Africa/Libreville","Africa/Luanda","Africa/Malabo","Africa/Ndjamena","Africa/Niamey","Africa/Porto-Novo","Africa/Tunis","Etc/GMT-1"]},{name:"Namibia Standard Time",abbr:"NST",offset:1,isdst:!1,text:"(UTC+01:00) Windhoek",utc:["Africa/Windhoek"]},{name:"GTB Standard Time",abbr:"GDT",offset:3,isdst:!0,text:"(UTC+02:00) Athens, Bucharest",utc:["Asia/Nicosia","Europe/Athens","Europe/Bucharest","Europe/Chisinau"]},{name:"Middle East Standard Time",abbr:"MEDT",offset:3,isdst:!0,text:"(UTC+02:00) Beirut",utc:["Asia/Beirut"]},{name:"Egypt Standard Time",abbr:"EST",offset:2,isdst:!1,text:"(UTC+02:00) Cairo",utc:["Africa/Cairo"]},{name:"Syria Standard Time",abbr:"SDT",offset:3,isdst:!0,text:"(UTC+02:00) Damascus",utc:["Asia/Damascus"]},{name:"E. Europe Standard Time",abbr:"EEDT",offset:3,isdst:!0,text:"(UTC+02:00) E. Europe"},{name:"South Africa Standard Time",abbr:"SAST",offset:2,isdst:!1,text:"(UTC+02:00) Harare, Pretoria",utc:["Africa/Blantyre","Africa/Bujumbura","Africa/Gaborone","Africa/Harare","Africa/Johannesburg","Africa/Kigali","Africa/Lubumbashi","Africa/Lusaka","Africa/Maputo","Africa/Maseru","Africa/Mbabane","Etc/GMT-2"]},{name:"FLE Standard Time",abbr:"FDT",offset:3,isdst:!0,text:"(UTC+02:00) Helsinki, Kyiv, Riga, Sofia, Tallinn, Vilnius",utc:["Europe/Helsinki","Europe/Kiev","Europe/Mariehamn","Europe/Riga","Europe/Sofia","Europe/Tallinn","Europe/Uzhgorod","Europe/Vilnius","Europe/Zaporozhye"]},{name:"Turkey Standard Time",abbr:"TDT",offset:3,isdst:!0,text:"(UTC+02:00) Istanbul",utc:["Europe/Istanbul"]},{name:"Israel Standard Time",abbr:"JDT",offset:3,isdst:!0,text:"(UTC+02:00) Jerusalem",utc:["Asia/Jerusalem"]},{name:"Libya Standard Time",abbr:"LST",offset:2,isdst:!1,text:"(UTC+02:00) Tripoli",utc:["Africa/Tripoli"]},{name:"Jordan Standard Time",abbr:"JST",offset:3,isdst:!1,text:"(UTC+03:00) Amman",utc:["Asia/Amman"]},{name:"Arabic Standard Time",abbr:"AST",offset:3,isdst:!1,text:"(UTC+03:00) Baghdad",utc:["Asia/Baghdad"]},{name:"Kaliningrad Standard Time",abbr:"KST",offset:3,isdst:!1,text:"(UTC+03:00) Kaliningrad, Minsk",utc:["Europe/Kaliningrad","Europe/Minsk"]},{name:"Arab Standard Time",abbr:"AST",offset:3,isdst:!1,text:"(UTC+03:00) Kuwait, Riyadh",utc:["Asia/Aden","Asia/Bahrain","Asia/Kuwait","Asia/Qatar","Asia/Riyadh"]},{name:"E. Africa Standard Time",abbr:"EAST",offset:3,isdst:!1,text:"(UTC+03:00) Nairobi",utc:["Africa/Addis_Ababa","Africa/Asmera","Africa/Dar_es_Salaam","Africa/Djibouti","Africa/Juba","Africa/Kampala","Africa/Khartoum","Africa/Mogadishu","Africa/Nairobi","Antarctica/Syowa","Etc/GMT-3","Indian/Antananarivo","Indian/Comoro","Indian/Mayotte"]},{name:"Iran Standard Time",abbr:"IDT",offset:4.5,isdst:!0,text:"(UTC+03:30) Tehran",utc:["Asia/Tehran"]},{name:"Arabian Standard Time",abbr:"AST",offset:4,isdst:!1,text:"(UTC+04:00) Abu Dhabi, Muscat",utc:["Asia/Dubai","Asia/Muscat","Etc/GMT-4"]},{name:"Azerbaijan Standard Time",abbr:"ADT",offset:5,isdst:!0,text:"(UTC+04:00) Baku",utc:["Asia/Baku"]},{name:"Russian Standard Time",abbr:"RST",offset:4,isdst:!1,text:"(UTC+04:00) Moscow, St. Petersburg, Volgograd",utc:["Europe/Moscow","Europe/Samara","Europe/Simferopol","Europe/Volgograd"]},{name:"Mauritius Standard Time",abbr:"MST",offset:4,isdst:!1,text:"(UTC+04:00) Port Louis",utc:["Indian/Mahe","Indian/Mauritius","Indian/Reunion"]},{name:"Georgian Standard Time",abbr:"GST",offset:4,isdst:!1,text:"(UTC+04:00) Tbilisi",utc:["Asia/Tbilisi"]},{name:"Caucasus Standard Time",abbr:"CST",offset:4,isdst:!1,text:"(UTC+04:00) Yerevan",utc:["Asia/Yerevan"]},{name:"Afghanistan Standard Time",abbr:"AST",offset:4.5,isdst:!1,text:"(UTC+04:30) Kabul",utc:["Asia/Kabul"]},{name:"West Asia Standard Time",abbr:"WAST",offset:5,isdst:!1,text:"(UTC+05:00) Ashgabat, Tashkent",utc:["Antarctica/Mawson","Asia/Aqtau","Asia/Aqtobe","Asia/Ashgabat","Asia/Dushanbe","Asia/Oral","Asia/Samarkand","Asia/Tashkent","Etc/GMT-5","Indian/Kerguelen","Indian/Maldives"]},{name:"Pakistan Standard Time",abbr:"PST",offset:5,isdst:!1,text:"(UTC+05:00) Islamabad, Karachi",utc:["Asia/Karachi"]},{name:"India Standard Time",abbr:"IST",offset:5.5,isdst:!1,text:"(UTC+05:30) Chennai, Kolkata, Mumbai, New Delhi",utc:["Asia/Calcutta"]},{name:"Sri Lanka Standard Time",abbr:"SLST",offset:5.5,isdst:!1,text:"(UTC+05:30) Sri Jayawardenepura",utc:["Asia/Colombo"]},{name:"Nepal Standard Time",abbr:"NST",offset:5.75,isdst:!1,text:"(UTC+05:45) Kathmandu",utc:["Asia/Katmandu"]},{name:"Central Asia Standard Time",abbr:"CAST",offset:6,isdst:!1,text:"(UTC+06:00) Astana",utc:["Antarctica/Vostok","Asia/Almaty","Asia/Bishkek","Asia/Qyzylorda","Asia/Urumqi","Etc/GMT-6","Indian/Chagos"]},{name:"Bangladesh Standard Time",abbr:"BST",offset:6,isdst:!1,text:"(UTC+06:00) Dhaka",utc:["Asia/Dhaka","Asia/Thimphu"]},{name:"Ekaterinburg Standard Time",abbr:"EST",offset:6,isdst:!1,text:"(UTC+06:00) Ekaterinburg",utc:["Asia/Yekaterinburg"]},{name:"Myanmar Standard Time",abbr:"MST",offset:6.5,isdst:!1,text:"(UTC+06:30) Yangon (Rangoon)",utc:["Asia/Rangoon","Indian/Cocos"]},{name:"SE Asia Standard Time",abbr:"SAST",offset:7,isdst:!1,text:"(UTC+07:00) Bangkok, Hanoi, Jakarta",utc:["Antarctica/Davis","Asia/Bangkok","Asia/Hovd","Asia/Jakarta","Asia/Phnom_Penh","Asia/Pontianak","Asia/Saigon","Asia/Vientiane","Etc/GMT-7","Indian/Christmas"]},{name:"N. Central Asia Standard Time",abbr:"NCAST",offset:7,isdst:!1,text:"(UTC+07:00) Novosibirsk",utc:["Asia/Novokuznetsk","Asia/Novosibirsk","Asia/Omsk"]},{name:"China Standard Time",abbr:"CST",offset:8,isdst:!1,text:"(UTC+08:00) Beijing, Chongqing, Hong Kong, Urumqi",utc:["Asia/Hong_Kong","Asia/Macau","Asia/Shanghai"]},{name:"North Asia Standard Time",abbr:"NAST",offset:8,isdst:!1,text:"(UTC+08:00) Krasnoyarsk",utc:["Asia/Krasnoyarsk"]},{name:"Singapore Standard Time",abbr:"MPST",offset:8,isdst:!1,text:"(UTC+08:00) Kuala Lumpur, Singapore",utc:["Asia/Brunei","Asia/Kuala_Lumpur","Asia/Kuching","Asia/Makassar","Asia/Manila","Asia/Singapore","Etc/GMT-8"]},{name:"W. Australia Standard Time",abbr:"WAST",offset:8,isdst:!1,text:"(UTC+08:00) Perth",utc:["Antarctica/Casey","Australia/Perth"]},{name:"Taipei Standard Time",abbr:"TST",offset:8,isdst:!1,text:"(UTC+08:00) Taipei",utc:["Asia/Taipei"]},{name:"Ulaanbaatar Standard Time",abbr:"UST",offset:8,isdst:!1,text:"(UTC+08:00) Ulaanbaatar",utc:["Asia/Choibalsan","Asia/Ulaanbaatar"]},{name:"North Asia East Standard Time",abbr:"NAEST",offset:9,isdst:!1,text:"(UTC+09:00) Irkutsk",utc:["Asia/Irkutsk"]},{name:"Tokyo Standard Time",abbr:"TST",offset:9,isdst:!1,text:"(UTC+09:00) Osaka, Sapporo, Tokyo",utc:["Asia/Dili","Asia/Jayapura","Asia/Tokyo","Etc/GMT-9","Pacific/Palau"]},{name:"Korea Standard Time",abbr:"KST",offset:9,isdst:!1,text:"(UTC+09:00) Seoul",utc:["Asia/Pyongyang","Asia/Seoul"]},{name:"Cen. Australia Standard Time",abbr:"CAST",offset:9.5,isdst:!1,text:"(UTC+09:30) Adelaide",utc:["Australia/Adelaide","Australia/Broken_Hill"]},{name:"AUS Central Standard Time",abbr:"ACST",offset:9.5,isdst:!1,text:"(UTC+09:30) Darwin",utc:["Australia/Darwin"]},{name:"E. Australia Standard Time",abbr:"EAST",offset:10,isdst:!1,text:"(UTC+10:00) Brisbane",utc:["Australia/Brisbane","Australia/Lindeman"]},{name:"AUS Eastern Standard Time",abbr:"AEST",offset:10,isdst:!1,text:"(UTC+10:00) Canberra, Melbourne, Sydney",utc:["Australia/Melbourne","Australia/Sydney"]},{name:"West Pacific Standard Time",abbr:"WPST",offset:10,isdst:!1,text:"(UTC+10:00) Guam, Port Moresby",utc:["Antarctica/DumontDUrville","Etc/GMT-10","Pacific/Guam","Pacific/Port_Moresby","Pacific/Saipan","Pacific/Truk"]},{name:"Tasmania Standard Time",abbr:"TST",offset:10,isdst:!1,text:"(UTC+10:00) Hobart",utc:["Australia/Currie","Australia/Hobart"]},{name:"Yakutsk Standard Time",abbr:"YST",offset:10,isdst:!1,text:"(UTC+10:00) Yakutsk",utc:["Asia/Chita","Asia/Khandyga","Asia/Yakutsk"]},{name:"Central Pacific Standard Time",abbr:"CPST",offset:11,isdst:!1,text:"(UTC+11:00) Solomon Is., New Caledonia",utc:["Antarctica/Macquarie","Etc/GMT-11","Pacific/Efate","Pacific/Guadalcanal","Pacific/Kosrae","Pacific/Noumea","Pacific/Ponape"]},{name:"Vladivostok Standard Time",abbr:"VST",offset:11,isdst:!1,text:"(UTC+11:00) Vladivostok",utc:["Asia/Sakhalin","Asia/Ust-Nera","Asia/Vladivostok"]},{name:"New Zealand Standard Time",abbr:"NZST",offset:12,isdst:!1,text:"(UTC+12:00) Auckland, Wellington",utc:["Antarctica/McMurdo","Pacific/Auckland"]},{name:"UTC+12",abbr:"U",offset:12,isdst:!1,text:"(UTC+12:00) Coordinated Universal Time+12",utc:["Etc/GMT-12","Pacific/Funafuti","Pacific/Kwajalein","Pacific/Majuro","Pacific/Nauru","Pacific/Tarawa","Pacific/Wake","Pacific/Wallis"]},{name:"Fiji Standard Time",abbr:"FST",offset:12,isdst:!1,text:"(UTC+12:00) Fiji",utc:["Pacific/Fiji"]},{name:"Magadan Standard Time",abbr:"MST",offset:12,isdst:!1,text:"(UTC+12:00) Magadan",utc:["Asia/Anadyr","Asia/Kamchatka","Asia/Magadan","Asia/Srednekolymsk"]},{name:"Kamchatka Standard Time",abbr:"KDT",offset:13,isdst:!0,text:"(UTC+12:00) Petropavlovsk-Kamchatsky - Old"},{name:"Tonga Standard Time",abbr:"TST",offset:13,isdst:!1,text:"(UTC+13:00) Nuku'alofa",utc:["Etc/GMT-13","Pacific/Enderbury","Pacific/Fakaofo","Pacific/Tongatapu"]},{name:"Samoa Standard Time",abbr:"SST",offset:13,isdst:!1,text:"(UTC+13:00) Samoa",utc:["Pacific/Apia"]}],profession:["Airline Pilot","Academic Team","Accountant","Account Executive","Actor","Actuary","Acquisition Analyst","Administrative Asst.","Administrative Analyst","Administrator","Advertising Director","Aerospace Engineer","Agent","Agricultural Inspector","Agricultural Scientist","Air Traffic Controller","Animal Trainer","Anthropologist","Appraiser","Architect","Art Director","Artist","Astronomer","Athletic Coach","Auditor","Author","Baker","Banker","Bankruptcy Attorney","Benefits Manager","Biologist","Bio-feedback Specialist","Biomedical Engineer","Biotechnical Researcher","Broadcaster","Broker","Building Manager","Building Contractor","Building Inspector","Business Analyst","Business Planner","Business Manager","Buyer","Call Center Manager","Career Counselor","Cash Manager","Ceramic Engineer","Chief Executive Officer","Chief Operation Officer","Chef","Chemical Engineer","Chemist","Child Care Manager","Chief Medical Officer","Chiropractor","Cinematographer","City Housing Manager","City Manager","Civil Engineer","Claims Manager","Clinical Research Assistant","Collections Manager","Compliance Manager","Comptroller","Computer Manager","Commercial Artist","Communications Affairs Director","Communications Director","Communications Engineer","Compensation Analyst","Computer Programmer","Computer Ops. Manager","Computer Engineer","Computer Operator","Computer Graphics Specialist","Construction Engineer","Construction Manager","Consultant","Consumer Relations Manager","Contract Administrator","Copyright Attorney","Copywriter","Corporate Planner","Corrections Officer","Cosmetologist","Credit Analyst","Cruise Director","Chief Information Officer","Chief Technology Officer","Customer Service Manager","Cryptologist","Dancer","Data Security Manager","Database Manager","Day Care Instructor","Dentist","Designer","Design Engineer","Desktop Publisher","Developer","Development Officer","Diamond Merchant","Dietitian","Direct Marketer","Director","Distribution Manager","Diversity Manager","Economist","EEO Compliance Manager","Editor","Education Adminator","Electrical Engineer","Electro Optical Engineer","Electronics Engineer","Embassy Management","Employment Agent","Engineer Technician","Entrepreneur","Environmental Analyst","Environmental Attorney","Environmental Engineer","Environmental Specialist","Escrow Officer","Estimator","Executive Assistant","Executive Director","Executive Recruiter","Facilities Manager","Family Counselor","Fashion Events Manager","Fashion Merchandiser","Fast Food Manager","Film Producer","Film Production Assistant","Financial Analyst","Financial Planner","Financier","Fine Artist","Wildlife Specialist","Fitness Consultant","Flight Attendant","Flight Engineer","Floral Designer","Food & Beverage Director","Food Service Manager","Forestry Technician","Franchise Management","Franchise Sales","Fraud Investigator","Freelance Writer","Fund Raiser","General Manager","Geologist","General Counsel","Geriatric Specialist","Gerontologist","Glamour Photographer","Golf Club Manager","Gourmet Chef","Graphic Designer","Grounds Keeper","Hazardous Waste Manager","Health Care Manager","Health Therapist","Health Service Administrator","Hearing Officer","Home Economist","Horticulturist","Hospital Administrator","Hotel Manager","Human Resources Manager","Importer","Industrial Designer","Industrial Engineer","Information Director","Inside Sales","Insurance Adjuster","Interior Decorator","Internal Controls Director","International Acct.","International Courier","International Lawyer","Interpreter","Investigator","Investment Banker","Investment Manager","IT Architect","IT Project Manager","IT Systems Analyst","Jeweler","Joint Venture Manager","Journalist","Labor Negotiator","Labor Organizer","Labor Relations Manager","Lab Services Director","Lab Technician","Land Developer","Landscape Architect","Law Enforcement Officer","Lawyer","Lead Software Engineer","Lead Software Test Engineer","Leasing Manager","Legal Secretary","Library Manager","Litigation Attorney","Loan Officer","Lobbyist","Logistics Manager","Maintenance Manager","Management Consultant","Managed Care Director","Managing Partner","Manufacturing Director","Manpower Planner","Marine Biologist","Market Res. Analyst","Marketing Director","Materials Manager","Mathematician","Membership Chairman","Mechanic","Mechanical Engineer","Media Buyer","Medical Investor","Medical Secretary","Medical Technician","Mental Health Counselor","Merchandiser","Metallurgical Engineering","Meteorologist","Microbiologist","MIS Manager","Motion Picture Director","Multimedia Director","Musician","Network Administrator","Network Specialist","Network Operator","New Product Manager","Novelist","Nuclear Engineer","Nuclear Specialist","Nutritionist","Nursing Administrator","Occupational Therapist","Oceanographer","Office Manager","Operations Manager","Operations Research Director","Optical Technician","Optometrist","Organizational Development Manager","Outplacement Specialist","Paralegal","Park Ranger","Patent Attorney","Payroll Specialist","Personnel Specialist","Petroleum Engineer","Pharmacist","Photographer","Physical Therapist","Physician","Physician Assistant","Physicist","Planning Director","Podiatrist","Political Analyst","Political Scientist","Politician","Portfolio Manager","Preschool Management","Preschool Teacher","Principal","Private Banker","Private Investigator","Probation Officer","Process Engineer","Producer","Product Manager","Product Engineer","Production Engineer","Production Planner","Professional Athlete","Professional Coach","Professor","Project Engineer","Project Manager","Program Manager","Property Manager","Public Administrator","Public Safety Director","PR Specialist","Publisher","Purchasing Agent","Publishing Director","Quality Assurance Specialist","Quality Control Engineer","Quality Control Inspector","Radiology Manager","Railroad Engineer","Real Estate Broker","Recreational Director","Recruiter","Redevelopment Specialist","Regulatory Affairs Manager","Registered Nurse","Rehabilitation Counselor","Relocation Manager","Reporter","Research Specialist","Restaurant Manager","Retail Store Manager","Risk Analyst","Safety Engineer","Sales Engineer","Sales Trainer","Sales Promotion Manager","Sales Representative","Sales Manager","Service Manager","Sanitation Engineer","Scientific Programmer","Scientific Writer","Securities Analyst","Security Consultant","Security Director","Seminar Presenter","Ship's Officer","Singer","Social Director","Social Program Planner","Social Research","Social Scientist","Social Worker","Sociologist","Software Developer","Software Engineer","Software Test Engineer","Soil Scientist","Special Events Manager","Special Education Teacher","Special Projects Director","Speech Pathologist","Speech Writer","Sports Event Manager","Statistician","Store Manager","Strategic Alliance Director","Strategic Planning Director","Stress Reduction Specialist","Stockbroker","Surveyor","Structural Engineer","Superintendent","Supply Chain Director","System Engineer","Systems Analyst","Systems Programmer","System Administrator","Tax Specialist","Teacher","Technical Support Specialist","Technical Illustrator","Technical Writer","Technology Director","Telecom Analyst","Telemarketer","Theatrical Director","Title Examiner","Tour Escort","Tour Guide Director","Traffic Manager","Trainer Translator","Transportation Manager","Travel Agent","Treasurer","TV Programmer","Underwriter","Union Representative","University Administrator","University Dean","Urban Planner","Veterinarian","Vendor Relations Director","Viticulturist","Warehouse Manager"],animals:{ocean:["Acantharea","Anemone","Angelfish King","Ahi Tuna","Albacore","American Oyster","Anchovy","Armored Snail","Arctic Char","Atlantic Bluefin Tuna","Atlantic Cod","Atlantic Goliath Grouper","Atlantic Trumpetfish","Atlantic Wolffish","Baleen Whale","Banded Butterflyfish","Banded Coral Shrimp","Banded Sea Krait","Barnacle","Barndoor Skate","Barracuda","Basking Shark","Bass","Beluga Whale","Bluebanded Goby","Bluehead Wrasse","Bluefish","Bluestreak Cleaner-Wrasse","Blue Marlin","Blue Shark","Blue Spiny Lobster","Blue Tang","Blue Whale","Broadclub Cuttlefish","Bull Shark","Chambered Nautilus","Chilean Basket Star","Chilean Jack Mackerel","Chinook Salmon","Christmas Tree Worm","Clam","Clown Anemonefish","Clown Triggerfish","Cod","Coelacanth","Cockscomb Cup Coral","Common Fangtooth","Conch","Cookiecutter Shark","Copepod","Coral","Corydoras","Cownose Ray","Crab","Crown-of-Thorns Starfish","Cushion Star","Cuttlefish","California Sea Otters","Dolphin","Dolphinfish","Dory","Devil Fish","Dugong","Dumbo Octopus","Dungeness Crab","Eccentric Sand Dollar","Edible Sea Cucumber","Eel","Elephant Seal","Elkhorn Coral","Emperor Shrimp","Estuarine Crocodile","Fathead Sculpin","Fiddler Crab","Fin Whale","Flameback","Flamingo Tongue Snail","Flashlight Fish","Flatback Turtle","Flatfish","Flying Fish","Flounder","Fluke","French Angelfish","Frilled Shark","Fugu (also called Pufferfish)","Gar","Geoduck","Giant Barrel Sponge","Giant Caribbean Sea Anemone","Giant Clam","Giant Isopod","Giant Kingfish","Giant Oarfish","Giant Pacific Octopus","Giant Pyrosome","Giant Sea Star","Giant Squid","Glowing Sucker Octopus","Giant Tube Worm","Goblin Shark","Goosefish","Great White Shark","Greenland Shark","Grey Atlantic Seal","Grouper","Grunion","Guineafowl Puffer","Haddock","Hake","Halibut","Hammerhead Shark","Hapuka","Harbor Porpoise","Harbor Seal","Hatchetfish","Hawaiian Monk Seal","Hawksbill Turtle","Hector's Dolphin","Hermit Crab","Herring","Hoki","Horn Shark","Horseshoe Crab","Humpback Anglerfish","Humpback Whale","Icefish","Imperator Angelfish","Irukandji Jellyfish","Isopod","Ivory Bush Coral","Japanese Spider Crab","Jellyfish","John Dory","Juan Fernandez Fur Seal","Killer Whale","Kiwa Hirsuta","Krill","Lagoon Triggerfish","Lamprey","Leafy Seadragon","Leopard Seal","Limpet","Ling","Lionfish","Lions Mane Jellyfish","Lobe Coral","Lobster","Loggerhead Turtle","Longnose Sawshark","Longsnout Seahorse","Lophelia Coral","Marrus Orthocanna","Manatee","Manta Ray","Marlin","Megamouth Shark","Mexican Lookdown","Mimic Octopus","Moon Jelly","Mollusk","Monkfish","Moray Eel","Mullet","Mussel","Megaladon","Napoleon Wrasse","Nassau Grouper","Narwhal","Nautilus","Needlefish","Northern Seahorse","North Atlantic Right Whale","Northern Red Snapper","Norway Lobster","Nudibranch","Nurse Shark","Oarfish","Ocean Sunfish","Oceanic Whitetip Shark","Octopus","Olive Sea Snake","Orange Roughy","Ostracod","Otter","Oyster","Pacific Angelshark","Pacific Blackdragon","Pacific Halibut","Pacific Sardine","Pacific Sea Nettle Jellyfish","Pacific White Sided Dolphin","Pantropical Spotted Dolphin","Patagonian Toothfish","Peacock Mantis Shrimp","Pelagic Thresher Shark","Penguin","Peruvian Anchoveta","Pilchard","Pink Salmon","Pinniped","Plankton","Porpoise","Polar Bear","Portuguese Man o' War","Pycnogonid Sea Spider","Quahog","Queen Angelfish","Queen Conch","Queen Parrotfish","Queensland Grouper","Ragfish","Ratfish","Rattail Fish","Ray","Red Drum","Red King Crab","Ringed Seal","Risso's Dolphin","Ross Seals","Sablefish","Salmon","Sand Dollar","Sandbar Shark","Sawfish","Sarcastic Fringehead","Scalloped Hammerhead Shark","Seahorse","Sea Cucumber","Sea Lion","Sea Urchin","Seal","Shark","Shortfin Mako Shark","Shovelnose Guitarfish","Shrimp","Silverside Fish","Skipjack Tuna","Slender Snipe Eel","Smalltooth Sawfish","Smelts","Sockeye Salmon","Southern Stingray","Sponge","Spotted Porcupinefish","Spotted Dolphin","Spotted Eagle Ray","Spotted Moray","Squid","Squidworm","Starfish","Stickleback","Stonefish","Stoplight Loosejaw","Sturgeon","Swordfish","Tan Bristlemouth","Tasseled Wobbegong","Terrible Claw Lobster","Threespot Damselfish","Tiger Prawn","Tiger Shark","Tilefish","Toadfish","Tropical Two-Wing Flyfish","Tuna","Umbrella Squid","Velvet Crab","Venus Flytrap Sea Anemone","Vigtorniella Worm","Viperfish","Vampire Squid","Vaquita","Wahoo","Walrus","West Indian Manatee","Whale","Whale Shark","Whiptail Gulper","White-Beaked Dolphin","White-Ring Garden Eel","White Shrimp","Wobbegong","Wrasse","Wreckfish","Xiphosura","Yellowtail Damselfish","Yelloweye Rockfish","Yellow Cup Black Coral","Yellow Tube Sponge","Yellowfin Tuna","Zebrashark","Zooplankton"],desert:["Aardwolf","Addax","African Wild Ass","Ant","Antelope","Armadillo","Baboon","Badger","Bat","Bearded Dragon","Beetle","Bird","Black-footed Cat","Boa","Brown Bear","Bustard","Butterfly","Camel","Caracal","Caracara","Caterpillar","Centipede","Cheetah","Chipmunk","Chuckwalla","Climbing Mouse","Coati","Cobra","Cotton Rat","Cougar","Courser","Crane Fly","Crow","Dassie Rat","Dove","Dunnart","Eagle","Echidna","Elephant","Emu","Falcon","Fly","Fox","Frogmouth","Gecko","Geoffroy's Cat","Gerbil","Grasshopper","Guanaco","Gundi","Hamster","Hawk","Hedgehog","Hyena","Hyrax","Jackal","Kangaroo","Kangaroo Rat","Kestrel","Kowari","Kultarr","Leopard","Lion","Macaw","Meerkat","Mouse","Oryx","Ostrich","Owl","Pronghorn","Python","Rabbit","Raccoon","Rattlesnake","Rhinoceros","Sand Cat","Spectacled Bear","Spiny Mouse","Starling","Stick Bug","Tarantula","Tit","Toad","Tortoise","Tyrant Flycatcher","Viper","Vulture","Waxwing","Xerus","Zebra"],grassland:["Aardvark","Aardwolf","Accentor","African Buffalo","African Wild Dog","Alpaca","Anaconda","Ant","Anteater","Antelope","Armadillo","Baboon","Badger","Bandicoot","Barbet","Bat","Bee","Bee-eater","Beetle","Bird","Bison","Black-footed Cat","Black-footed Ferret","Bluebird","Boa","Bowerbird","Brown Bear","Bush Dog","Bushshrike","Bustard","Butterfly","Buzzard","Caracal","Caracara","Cardinal","Caterpillar","Cheetah","Chipmunk","Civet","Climbing Mouse","Clouded Leopard","Coati","Cobra","Cockatoo","Cockroach","Common Genet","Cotton Rat","Cougar","Courser","Coyote","Crane","Crane Fly","Cricket","Crow","Culpeo","Death Adder","Deer","Deer Mouse","Dingo","Dinosaur","Dove","Drongo","Duck","Duiker","Dunnart","Eagle","Echidna","Elephant","Elk","Emu","Falcon","Finch","Flea","Fly","Flying Frog","Fox","Frog","Frogmouth","Garter Snake","Gazelle","Gecko","Geoffroy's Cat","Gerbil","Giant Tortoise","Giraffe","Grasshopper","Grison","Groundhog","Grouse","Guanaco","Guinea Pig","Hamster","Harrier","Hartebeest","Hawk","Hedgehog","Helmetshrike","Hippopotamus","Hornbill","Hyena","Hyrax","Impala","Jackal","Jaguar","Jaguarundi","Kangaroo","Kangaroo Rat","Kestrel","Kultarr","Ladybug","Leopard","Lion","Macaw","Meerkat","Mouse","Newt","Oryx","Ostrich","Owl","Pangolin","Pheasant","Prairie Dog","Pronghorn","Przewalski's Horse","Python","Quoll","Rabbit","Raven","Rhinoceros","Shelduck","Sloth Bear","Spectacled Bear","Squirrel","Starling","Stick Bug","Tamandua","Tasmanian Devil","Thornbill","Thrush","Toad","Tortoise"],forest:["Agouti","Anaconda","Anoa","Ant","Anteater","Antelope","Armadillo","Asian Black Bear","Aye-aye","Babirusa","Baboon","Badger","Bandicoot","Banteng","Barbet","Basilisk","Bat","Bearded Dragon","Bee","Bee-eater","Beetle","Bettong","Binturong","Bird-of-paradise","Bongo","Bowerbird","Bulbul","Bush Dog","Bushbaby","Bushshrike","Butterfly","Buzzard","Caecilian","Cardinal","Cassowary","Caterpillar","Centipede","Chameleon","Chimpanzee","Cicada","Civet","Clouded Leopard","Coati","Cobra","Cockatoo","Cockroach","Colugo","Cotinga","Cotton Rat","Cougar","Crane Fly","Cricket","Crocodile","Crow","Cuckoo","Cuscus","Death Adder","Deer","Dhole","Dingo","Dinosaur","Drongo","Duck","Duiker","Eagle","Echidna","Elephant","Finch","Flat-headed Cat","Flea","Flowerpecker","Fly","Flying Frog","Fossa","Frog","Frogmouth","Gaur","Gecko","Gorilla","Grison","Hawaiian Honeycreeper","Hawk","Hedgehog","Helmetshrike","Hornbill","Hyrax","Iguana","Jackal","Jaguar","Jaguarundi","Kestrel","Ladybug","Lemur","Leopard","Lion","Macaw","Mandrill","Margay","Monkey","Mouse","Mouse Deer","Newt","Okapi","Old World Flycatcher","Orangutan","Owl","Pangolin","Peafowl","Pheasant","Possum","Python","Quokka","Rabbit","Raccoon","Red Panda","Red River Hog","Rhinoceros","Sloth Bear","Spectacled Bear","Squirrel","Starling","Stick Bug","Sun Bear","Tamandua","Tamarin","Tapir","Tarantula","Thrush","Tiger","Tit","Toad","Tortoise","Toucan","Trogon","Trumpeter","Turaco","Turtle","Tyrant Flycatcher","Viper","Vulture","Wallaby","Warbler","Wasp","Waxwing","Weaver","Weaver-finch","Whistler","White-eye","Whydah","Woodswallow","Worm","Wren","Xenops","Yellowjacket","Accentor","African Buffalo","American Black Bear","Anole","Bird","Bison","Boa","Brown Bear","Chipmunk","Common Genet","Copperhead","Coyote","Deer Mouse","Dormouse","Elk","Emu","Fisher","Fox","Garter Snake","Giant Panda","Giant Tortoise","Groundhog","Grouse","Guanaco","Himalayan Tahr","Kangaroo","Koala","Numbat","Quoll","Raccoon dog","Tasmanian Devil","Thornbill","Turkey","Vole","Weasel","Wildcat","Wolf","Wombat","Woodchuck","Woodpecker"],farm:["Alpaca","Buffalo","Banteng","Cow","Cat","Chicken","Carp","Camel","Donkey","Dog","Duck","Emu","Goat","Gayal","Guinea","Goose","Horse","Honey","Llama","Pig","Pigeon","Rhea","Rabbit","Sheep","Silkworm","Turkey","Yak","Zebu"],pet:["Bearded Dragon","Birds","Burro","Cats","Chameleons","Chickens","Chinchillas","Chinese Water Dragon","Cows","Dogs","Donkey","Ducks","Ferrets","Fish","Geckos","Geese","Gerbils","Goats","Guinea Fowl","Guinea Pigs","Hamsters","Hedgehogs","Horses","Iguanas","Llamas","Lizards","Mice","Mule","Peafowl","Pigs and Hogs","Pigeons","Ponies","Pot Bellied Pig","Rabbits","Rats","Sheep","Skinks","Snakes","Stick Insects","Sugar Gliders","Tarantula","Turkeys","Turtles"],zoo:["Aardvark","African Wild Dog","Aldabra Tortoise","American Alligator","American Bison","Amur Tiger","Anaconda","Andean Condor","Asian Elephant","Baby Doll Sheep","Bald Eagle","Barred Owl","Blue Iguana","Boer Goat","California Sea Lion","Caribbean Flamingo","Chinchilla","Collared Lemur","Coquerel's Sifaka","Cuban Amazon Parrot","Ebony Langur","Fennec Fox","Fossa","Gelada","Giant Anteater","Giraffe","Gorilla","Grizzly Bear","Henkel's Leaf-tailed Gecko","Indian Gharial","Indian Rhinoceros","King Cobra","King Vulture","Komodo Dragon","Linne's Two-toed Sloth","Lion","Little Penguin","Madagascar Tree Boa","Magellanic Penguin","Malayan Tapir","Malayan Tiger","Matschies Tree Kangaroo","Mini Donkey","Monarch Butterfly","Nile crocodile","North American Porcupine","Nubian Ibex","Okapi","Poison Dart Frog","Polar Bear","Pygmy Marmoset","Radiated Tortoise","Red Panda","Red Ruffed Lemur","Ring-tailed Lemur","Ring-tailed Mongoose","Rock Hyrax","Small Clawed Asian Otter","Snow Leopard","Snowy Owl","Southern White-faced Owl","Southern White Rhinocerous","Squirrel Monkey","Tufted Puffin","White Cheeked Gibbon","White-throated Bee Eater","Zebra"]},primes:[2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97,101,103,107,109,113,127,131,137,139,149,151,157,163,167,173,179,181,191,193,197,199,211,223,227,229,233,239,241,251,257,263,269,271,277,281,283,293,307,311,313,317,331,337,347,349,353,359,367,373,379,383,389,397,401,409,419,421,431,433,439,443,449,457,461,463,467,479,487,491,499,503,509,521,523,541,547,557,563,569,571,577,587,593,599,601,607,613,617,619,631,641,643,647,653,659,661,673,677,683,691,701,709,719,727,733,739,743,751,757,761,769,773,787,797,809,811,821,823,827,829,839,853,857,859,863,877,881,883,887,907,911,919,929,937,941,947,953,967,971,977,983,991,997,1009,1013,1019,1021,1031,1033,1039,1049,1051,1061,1063,1069,1087,1091,1093,1097,1103,1109,1117,1123,1129,1151,1153,1163,1171,1181,1187,1193,1201,1213,1217,1223,1229,1231,1237,1249,1259,1277,1279,1283,1289,1291,1297,1301,1303,1307,1319,1321,1327,1361,1367,1373,1381,1399,1409,1423,1427,1429,1433,1439,1447,1451,1453,1459,1471,1481,1483,1487,1489,1493,1499,1511,1523,1531,1543,1549,1553,1559,1567,1571,1579,1583,1597,1601,1607,1609,1613,1619,1621,1627,1637,1657,1663,1667,1669,1693,1697,1699,1709,1721,1723,1733,1741,1747,1753,1759,1777,1783,1787,1789,1801,1811,1823,1831,1847,1861,1867,1871,1873,1877,1879,1889,1901,1907,1913,1931,1933,1949,1951,1973,1979,1987,1993,1997,1999,2003,2011,2017,2027,2029,2039,2053,2063,2069,2081,2083,2087,2089,2099,2111,2113,2129,2131,2137,2141,2143,2153,2161,2179,2203,2207,2213,2221,2237,2239,2243,2251,2267,2269,2273,2281,2287,2293,2297,2309,2311,2333,2339,2341,2347,2351,2357,2371,2377,2381,2383,2389,2393,2399,2411,2417,2423,2437,2441,2447,2459,2467,2473,2477,2503,2521,2531,2539,2543,2549,2551,2557,2579,2591,2593,2609,2617,2621,2633,2647,2657,2659,2663,2671,2677,2683,2687,2689,2693,2699,2707,2711,2713,2719,2729,2731,2741,2749,2753,2767,2777,2789,2791,2797,2801,2803,2819,2833,2837,2843,2851,2857,2861,2879,2887,2897,2903,2909,2917,2927,2939,2953,2957,2963,2969,2971,2999,3001,3011,3019,3023,3037,3041,3049,3061,3067,3079,3083,3089,3109,3119,3121,3137,3163,3167,3169,3181,3187,3191,3203,3209,3217,3221,3229,3251,3253,3257,3259,3271,3299,3301,3307,3313,3319,3323,3329,3331,3343,3347,3359,3361,3371,3373,3389,3391,3407,3413,3433,3449,3457,3461,3463,3467,3469,3491,3499,3511,3517,3527,3529,3533,3539,3541,3547,3557,3559,3571,3581,3583,3593,3607,3613,3617,3623,3631,3637,3643,3659,3671,3673,3677,3691,3697,3701,3709,3719,3727,3733,3739,3761,3767,3769,3779,3793,3797,3803,3821,3823,3833,3847,3851,3853,3863,3877,3881,3889,3907,3911,3917,3919,3923,3929,3931,3943,3947,3967,3989,4001,4003,4007,4013,4019,4021,4027,4049,4051,4057,4073,4079,4091,4093,4099,4111,4127,4129,4133,4139,4153,4157,4159,4177,4201,4211,4217,4219,4229,4231,4241,4243,4253,4259,4261,4271,4273,4283,4289,4297,4327,4337,4339,4349,4357,4363,4373,4391,4397,4409,4421,4423,4441,4447,4451,4457,4463,4481,4483,4493,4507,4513,4517,4519,4523,4547,4549,4561,4567,4583,4591,4597,4603,4621,4637,4639,4643,4649,4651,4657,4663,4673,4679,4691,4703,4721,4723,4729,4733,4751,4759,4783,4787,4789,4793,4799,4801,4813,4817,4831,4861,4871,4877,4889,4903,4909,4919,4931,4933,4937,4943,4951,4957,4967,4969,4973,4987,4993,4999,5003,5009,5011,5021,5023,5039,5051,5059,5077,5081,5087,5099,5101,5107,5113,5119,5147,5153,5167,5171,5179,5189,5197,5209,5227,5231,5233,5237,5261,5273,5279,5281,5297,5303,5309,5323,5333,5347,5351,5381,5387,5393,5399,5407,5413,5417,5419,5431,5437,5441,5443,5449,5471,5477,5479,5483,5501,5503,5507,5519,5521,5527,5531,5557,5563,5569,5573,5581,5591,5623,5639,5641,5647,5651,5653,5657,5659,5669,5683,5689,5693,5701,5711,5717,5737,5741,5743,5749,5779,5783,5791,5801,5807,5813,5821,5827,5839,5843,5849,5851,5857,5861,5867,5869,5879,5881,5897,5903,5923,5927,5939,5953,5981,5987,6007,6011,6029,6037,6043,6047,6053,6067,6073,6079,6089,6091,6101,6113,6121,6131,6133,6143,6151,6163,6173,6197,6199,6203,6211,6217,6221,6229,6247,6257,6263,6269,6271,6277,6287,6299,6301,6311,6317,6323,6329,6337,6343,6353,6359,6361,6367,6373,6379,6389,6397,6421,6427,6449,6451,6469,6473,6481,6491,6521,6529,6547,6551,6553,6563,6569,6571,6577,6581,6599,6607,6619,6637,6653,6659,6661,6673,6679,6689,6691,6701,6703,6709,6719,6733,6737,6761,6763,6779,6781,6791,6793,6803,6823,6827,6829,6833,6841,6857,6863,6869,6871,6883,6899,6907,6911,6917,6947,6949,6959,6961,6967,6971,6977,6983,6991,6997,7001,7013,7019,7027,7039,7043,7057,7069,7079,7103,7109,7121,7127,7129,7151,7159,7177,7187,7193,7207,7211,7213,7219,7229,7237,7243,7247,7253,7283,7297,7307,7309,7321,7331,7333,7349,7351,7369,7393,7411,7417,7433,7451,7457,7459,7477,7481,7487,7489,7499,7507,7517,7523,7529,7537,7541,7547,7549,7559,7561,7573,7577,7583,7589,7591,7603,7607,7621,7639,7643,7649,7669,7673,7681,7687,7691,7699,7703,7717,7723,7727,7741,7753,7757,7759,7789,7793,7817,7823,7829,7841,7853,7867,7873,7877,7879,7883,7901,7907,7919,7927,7933,7937,7949,7951,7963,7993,8009,8011,8017,8039,8053,8059,8069,8081,8087,8089,8093,8101,8111,8117,8123,8147,8161,8167,8171,8179,8191,8209,8219,8221,8231,8233,8237,8243,8263,8269,8273,8287,8291,8293,8297,8311,8317,8329,8353,8363,8369,8377,8387,8389,8419,8423,8429,8431,8443,8447,8461,8467,8501,8513,8521,8527,8537,8539,8543,8563,8573,8581,8597,8599,8609,8623,8627,8629,8641,8647,8663,8669,8677,8681,8689,8693,8699,8707,8713,8719,8731,8737,8741,8747,8753,8761,8779,8783,8803,8807,8819,8821,8831,8837,8839,8849,8861,8863,8867,8887,8893,8923,8929,8933,8941,8951,8963,8969,8971,8999,9001,9007,9011,9013,9029,9041,9043,9049,9059,9067,9091,9103,9109,9127,9133,9137,9151,9157,9161,9173,9181,9187,9199,9203,9209,9221,9227,9239,9241,9257,9277,9281,9283,9293,9311,9319,9323,9337,9341,9343,9349,9371,9377,9391,9397,9403,9413,9419,9421,9431,9433,9437,9439,9461,9463,9467,9473,9479,9491,9497,9511,9521,9533,9539,9547,9551,9587,9601,9613,9619,9623,9629,9631,9643,9649,9661,9677,9679,9689,9697,9719,9721,9733,9739,9743,9749,9767,9769,9781,9787,9791,9803,9811,9817,9829,9833,9839,9851,9857,9859,9871,9883,9887,9901,9907,9923,9929,9931,9941,9949,9967,9973,10007],emotions:["love","joy","surprise","anger","sadness","fear"]},C=Object.prototype.hasOwnProperty,f=Object.keys||function(e){var a=[];for(var n in e)C.call(e,n)&&a.push(n);return a};function y(e,a){var n=Array.isArray(e),i=a||(n?new Array(e.length):{});return n?function(e,a){for(var n=0,i=e.length;n<i;n++)a[n]=e[n]}(e,i):function(e,a){for(var n,i=f(e),r=0,t=i.length;r<t;r++)a[n=i[r]]=e[n]||a[n]}(e,i),i}l.prototype.get=function(e){return y(g[e])},l.prototype.mac_address=function(e){(e=c(e)).separator||(e.separator=e.networkVersion?".":":");return e.networkVersion?this.n(this.string,3,{pool:"ABCDEF1234567890",length:4}).join(e.separator):this.n(this.string,6,{pool:"ABCDEF1234567890",length:2}).join(e.separator)},l.prototype.normal=function(e){if(m((e=c(e,{mean:0,dev:1,pool:[]})).pool.constructor!==Array,"Chance: The pool option must be a valid array."),m("number"!=typeof e.mean,"Chance: Mean (mean) must be a number"),m("number"!=typeof e.dev,"Chance: Standard deviation (dev) must be a number"),e.pool.length>0)return this.normal_pool(e);var a,n,i,r=e.mean,t=e.dev;do{a=(n=2*this.random()-1)*n+(i=2*this.random()-1)*i}while(a>=1);return t*(n*Math.sqrt(-2*Math.log(a)/a))+r},l.prototype.normal_pool=function(e){var a=0;do{var n=Math.round(this.normal({mean:e.mean,dev:e.dev}));if(n<e.pool.length&&n>=0)return e.pool[n];a++}while(a<100);throw new RangeError("Chance: Your pool is too small for the given mean and standard deviation. Please adjust.")},l.prototype.radio=function(e){var a="";switch((e=c(e,{side:"?"})).side.toLowerCase()){case"east":case"e":a="W";break;case"west":case"w":a="K";break;default:a=this.character({pool:"KW"})}return a+this.character({alpha:!0,casing:"upper"})+this.character({alpha:!0,casing:"upper"})+this.character({alpha:!0,casing:"upper"})},l.prototype.set=function(e,a){"string"==typeof e?g[e]=a:g=y(e,g)},l.prototype.tv=function(e){return this.radio(e)},l.prototype.cnpj=function(){var e=this.n(this.natural,8,{max:9}),a=2+6*e[7]+7*e[6]+8*e[5]+9*e[4]+2*e[3]+3*e[2]+4*e[1]+5*e[0];(a=11-a%11)>=10&&(a=0);var n=2*a+3+7*e[7]+8*e[6]+9*e[5]+2*e[4]+3*e[3]+4*e[2]+5*e[1]+6*e[0];return(n=11-n%11)>=10&&(n=0),""+e[0]+e[1]+"."+e[2]+e[3]+e[4]+"."+e[5]+e[6]+e[7]+"/0001-"+a+n},l.prototype.emotion=function(){return this.pick(this.get("emotions"))},l.prototype.mersenne_twister=function(e){return new v(e)},l.prototype.blueimp_md5=function(){return new A};var v=function(e){void 0===e&&(e=Math.floor(Math.random()*Math.pow(10,13))),this.N=624,this.M=397,this.MATRIX_A=2567483615,this.UPPER_MASK=2147483648,this.LOWER_MASK=2147483647,this.mt=new Array(this.N),this.mti=this.N+1,this.init_genrand(e)};v.prototype.init_genrand=function(e){for(this.mt[0]=e>>>0,this.mti=1;this.mti<this.N;this.mti++)e=this.mt[this.mti-1]^this.mt[this.mti-1]>>>30,this.mt[this.mti]=(1812433253*((4294901760&e)>>>16)<<16)+1812433253*(65535&e)+this.mti,this.mt[this.mti]>>>=0},v.prototype.init_by_array=function(e,a){var n,i,r=1,t=0;for(this.init_genrand(19650218),n=this.N>a?this.N:a;n;n--)i=this.mt[r-1]^this.mt[r-1]>>>30,this.mt[r]=(this.mt[r]^(1664525*((4294901760&i)>>>16)<<16)+1664525*(65535&i))+e[t]+t,this.mt[r]>>>=0,t++,++r>=this.N&&(this.mt[0]=this.mt[this.N-1],r=1),t>=a&&(t=0);for(n=this.N-1;n;n--)i=this.mt[r-1]^this.mt[r-1]>>>30,this.mt[r]=(this.mt[r]^(1566083941*((4294901760&i)>>>16)<<16)+1566083941*(65535&i))-r,this.mt[r]>>>=0,++r>=this.N&&(this.mt[0]=this.mt[this.N-1],r=1);this.mt[0]=2147483648},v.prototype.genrand_int32=function(){var e,a=new Array(0,this.MATRIX_A);if(this.mti>=this.N){var n;for(this.mti===this.N+1&&this.init_genrand(5489),n=0;n<this.N-this.M;n++)e=this.mt[n]&this.UPPER_MASK|this.mt[n+1]&this.LOWER_MASK,this.mt[n]=this.mt[n+this.M]^e>>>1^a[1&e];for(;n<this.N-1;n++)e=this.mt[n]&this.UPPER_MASK|this.mt[n+1]&this.LOWER_MASK,this.mt[n]=this.mt[n+(this.M-this.N)]^e>>>1^a[1&e];e=this.mt[this.N-1]&this.UPPER_MASK|this.mt[0]&this.LOWER_MASK,this.mt[this.N-1]=this.mt[this.M-1]^e>>>1^a[1&e],this.mti=0}return e=this.mt[this.mti++],e^=e>>>11,e^=e<<7&2636928640,e^=e<<15&4022730752,(e^=e>>>18)>>>0},v.prototype.genrand_int31=function(){return this.genrand_int32()>>>1},v.prototype.genrand_real1=function(){return this.genrand_int32()*(1/4294967295)},v.prototype.random=function(){return this.genrand_int32()*(1/4294967296)},v.prototype.genrand_real3=function(){return(this.genrand_int32()+.5)*(1/4294967296)},v.prototype.genrand_res53=function(){return(67108864*(this.genrand_int32()>>>5)+(this.genrand_int32()>>>6))*(1/9007199254740992)};var A=function(){};A.prototype.VERSION="1.0.1",A.prototype.safe_add=function(e,a){var n=(65535&e)+(65535&a);return(e>>16)+(a>>16)+(n>>16)<<16|65535&n},A.prototype.bit_roll=function(e,a){return e<<a|e>>>32-a},A.prototype.md5_cmn=function(e,a,n,i,r,t){return this.safe_add(this.bit_roll(this.safe_add(this.safe_add(a,e),this.safe_add(i,t)),r),n)},A.prototype.md5_ff=function(e,a,n,i,r,t,o){return this.md5_cmn(a&n|~a&i,e,a,r,t,o)},A.prototype.md5_gg=function(e,a,n,i,r,t,o){return this.md5_cmn(a&i|n&~i,e,a,r,t,o)},A.prototype.md5_hh=function(e,a,n,i,r,t,o){return this.md5_cmn(a^n^i,e,a,r,t,o)},A.prototype.md5_ii=function(e,a,n,i,r,t,o){return this.md5_cmn(n^(a|~i),e,a,r,t,o)},A.prototype.binl_md5=function(e,a){e[a>>5]|=128<<a%32,e[14+(a+64>>>9<<4)]=a;var n,i,r,t,o,s=1732584193,l=-271733879,c=-1732584194,m=271733878;for(n=0;n<e.length;n+=16)i=s,r=l,t=c,o=m,s=this.md5_ff(s,l,c,m,e[n],7,-680876936),m=this.md5_ff(m,s,l,c,e[n+1],12,-389564586),c=this.md5_ff(c,m,s,l,e[n+2],17,606105819),l=this.md5_ff(l,c,m,s,e[n+3],22,-1044525330),s=this.md5_ff(s,l,c,m,e[n+4],7,-176418897),m=this.md5_ff(m,s,l,c,e[n+5],12,1200080426),c=this.md5_ff(c,m,s,l,e[n+6],17,-1473231341),l=this.md5_ff(l,c,m,s,e[n+7],22,-45705983),s=this.md5_ff(s,l,c,m,e[n+8],7,1770035416),m=this.md5_ff(m,s,l,c,e[n+9],12,-1958414417),c=this.md5_ff(c,m,s,l,e[n+10],17,-42063),l=this.md5_ff(l,c,m,s,e[n+11],22,-1990404162),s=this.md5_ff(s,l,c,m,e[n+12],7,1804603682),m=this.md5_ff(m,s,l,c,e[n+13],12,-40341101),c=this.md5_ff(c,m,s,l,e[n+14],17,-1502002290),l=this.md5_ff(l,c,m,s,e[n+15],22,1236535329),s=this.md5_gg(s,l,c,m,e[n+1],5,-165796510),m=this.md5_gg(m,s,l,c,e[n+6],9,-1069501632),c=this.md5_gg(c,m,s,l,e[n+11],14,643717713),l=this.md5_gg(l,c,m,s,e[n],20,-373897302),s=this.md5_gg(s,l,c,m,e[n+5],5,-701558691),m=this.md5_gg(m,s,l,c,e[n+10],9,38016083),c=this.md5_gg(c,m,s,l,e[n+15],14,-660478335),l=this.md5_gg(l,c,m,s,e[n+4],20,-405537848),s=this.md5_gg(s,l,c,m,e[n+9],5,568446438),m=this.md5_gg(m,s,l,c,e[n+14],9,-1019803690),c=this.md5_gg(c,m,s,l,e[n+3],14,-187363961),l=this.md5_gg(l,c,m,s,e[n+8],20,1163531501),s=this.md5_gg(s,l,c,m,e[n+13],5,-1444681467),m=this.md5_gg(m,s,l,c,e[n+2],9,-51403784),c=this.md5_gg(c,m,s,l,e[n+7],14,1735328473),l=this.md5_gg(l,c,m,s,e[n+12],20,-1926607734),s=this.md5_hh(s,l,c,m,e[n+5],4,-378558),m=this.md5_hh(m,s,l,c,e[n+8],11,-2022574463),c=this.md5_hh(c,m,s,l,e[n+11],16,1839030562),l=this.md5_hh(l,c,m,s,e[n+14],23,-35309556),s=this.md5_hh(s,l,c,m,e[n+1],4,-1530992060),m=this.md5_hh(m,s,l,c,e[n+4],11,1272893353),c=this.md5_hh(c,m,s,l,e[n+7],16,-155497632),l=this.md5_hh(l,c,m,s,e[n+10],23,-1094730640),s=this.md5_hh(s,l,c,m,e[n+13],4,681279174),m=this.md5_hh(m,s,l,c,e[n],11,-358537222),c=this.md5_hh(c,m,s,l,e[n+3],16,-722521979),l=this.md5_hh(l,c,m,s,e[n+6],23,76029189),s=this.md5_hh(s,l,c,m,e[n+9],4,-640364487),m=this.md5_hh(m,s,l,c,e[n+12],11,-421815835),c=this.md5_hh(c,m,s,l,e[n+15],16,530742520),l=this.md5_hh(l,c,m,s,e[n+2],23,-995338651),s=this.md5_ii(s,l,c,m,e[n],6,-198630844),m=this.md5_ii(m,s,l,c,e[n+7],10,1126891415),c=this.md5_ii(c,m,s,l,e[n+14],15,-1416354905),l=this.md5_ii(l,c,m,s,e[n+5],21,-57434055),s=this.md5_ii(s,l,c,m,e[n+12],6,1700485571),m=this.md5_ii(m,s,l,c,e[n+3],10,-1894986606),c=this.md5_ii(c,m,s,l,e[n+10],15,-1051523),l=this.md5_ii(l,c,m,s,e[n+1],21,-2054922799),s=this.md5_ii(s,l,c,m,e[n+8],6,1873313359),m=this.md5_ii(m,s,l,c,e[n+15],10,-30611744),c=this.md5_ii(c,m,s,l,e[n+6],15,-1560198380),l=this.md5_ii(l,c,m,s,e[n+13],21,1309151649),s=this.md5_ii(s,l,c,m,e[n+4],6,-145523070),m=this.md5_ii(m,s,l,c,e[n+11],10,-1120210379),c=this.md5_ii(c,m,s,l,e[n+2],15,718787259),l=this.md5_ii(l,c,m,s,e[n+9],21,-343485551),s=this.safe_add(s,i),l=this.safe_add(l,r),c=this.safe_add(c,t),m=this.safe_add(m,o);return[s,l,c,m]},A.prototype.binl2rstr=function(e){var a,n="";for(a=0;a<32*e.length;a+=8)n+=String.fromCharCode(e[a>>5]>>>a%32&255);return n},A.prototype.rstr2binl=function(e){var a,n=[];for(n[(e.length>>2)-1]=void 0,a=0;a<n.length;a+=1)n[a]=0;for(a=0;a<8*e.length;a+=8)n[a>>5]|=(255&e.charCodeAt(a/8))<<a%32;return n},A.prototype.rstr_md5=function(e){return this.binl2rstr(this.binl_md5(this.rstr2binl(e),8*e.length))},A.prototype.rstr_hmac_md5=function(e,a){var n,i,r=this.rstr2binl(e),t=[],o=[];for(t[15]=o[15]=void 0,r.length>16&&(r=this.binl_md5(r,8*e.length)),n=0;n<16;n+=1)t[n]=909522486^r[n],o[n]=1549556828^r[n];return i=this.binl_md5(t.concat(this.rstr2binl(a)),512+8*a.length),this.binl2rstr(this.binl_md5(o.concat(i),640))},A.prototype.rstr2hex=function(e){var a,n,i="";for(n=0;n<e.length;n+=1)a=e.charCodeAt(n),i+="0123456789abcdef".charAt(a>>>4&15)+"0123456789abcdef".charAt(15&a);return i},A.prototype.str2rstr_utf8=function(e){return unescape(encodeURIComponent(e))},A.prototype.raw_md5=function(e){return this.rstr_md5(this.str2rstr_utf8(e))},A.prototype.hex_md5=function(e){return this.rstr2hex(this.raw_md5(e))},A.prototype.raw_hmac_md5=function(e,a){return this.rstr_hmac_md5(this.str2rstr_utf8(e),this.str2rstr_utf8(a))},A.prototype.hex_hmac_md5=function(e,a){return this.rstr2hex(this.raw_hmac_md5(e,a))},A.prototype.md5=function(e,a,n){return a?n?this.raw_hmac_md5(a,e):this.hex_hmac_md5(a,e):n?this.raw_md5(e):this.hex_md5(e)},e.exports&&(a=e.exports=l),a.Chance=l,"undefined"!=typeof importScripts&&(chance=new l,self.Chance=l),"object"==typeof window&&"object"==typeof window.document&&(window.Chance=l,window.chance=new l)}()}));Aa.Chance;const Sa=(e,a)=>({clickTypes:["click","click","click","click","click","click","dblclick","dblclick","mousedown","mouseup","mouseover","mouseover","mouseover","mousemove","mouseout"],positionSelector:()=>[e.natural({max:Math.max(0,document.documentElement.clientWidth-1)}),e.natural({max:Math.max(0,document.documentElement.clientHeight-1)})],showAction:(e,n)=>{const i=a.document,r=i.body,t=i.createElement("div");t.style.zIndex=2e3,t.style.border="3px solid red",t.style["border-radius"]="50%",t.style.borderRadius="50%",t.style.width="40px",t.style.height="40px",t.style["box-sizing"]="border-box",t.style.position="absolute",t.style.webkitTransition="opacity 1s ease-out",t.style.mozTransition="opacity 1s ease-out",t.style.transition="opacity 1s ease-out",t.style.left=e-20+"px",t.style.top=n-20+"px";const o=r.appendChild(t);setTimeout(()=>{r.removeChild(o)},1e3),setTimeout(()=>{o.style.opacity=0},50)},canClick:()=>!0,maxNbTries:10,log:!1});var Ma=e=>({logger:a,randomizer:n,window:i})=>{const r={...Sa(n,i),...e};return()=>{let e,t,o,s,l=0;do{if(e=r.positionSelector(),t=e[0],o=e[1],s=document.elementFromPoint(t,o),l++,l>r.maxNbTries)return}while(!s||!r.canClick(s));const c=document.createEvent("MouseEvents"),m=n.pick(r.clickTypes);c.initMouseEvent(m,!0,!0,i,0,0,0,t,o,!1,!1,!1,!1,0,null),s.dispatchEvent(c),"function"==typeof r.showAction&&r.showAction(t,o,m),a&&r.log&&a.log("gremlin","clicker   ",m,"at",t,o)}};const Ta=(e,a)=>{const n=a.document,i=n.body;return{touchTypes:["tap","tap","tap","doubletap","gesture","gesture","gesture","multitouch","multitouch"],positionSelector:()=>[e.natural({max:Math.max(0,n.documentElement.clientWidth-1)}),e.natural({max:Math.max(0,n.documentElement.clientHeight-1)})],showAction:e=>{const a=n.createDocumentFragment();e.forEach(e=>{const r=n.createElement("div");r.style.zIndex=2e3,r.style.background="red",r.style["border-radius"]="50%",r.style.borderRadius="50%",r.style.width="20px",r.style.height="20px",r.style.position="absolute",r.style.webkitTransition="opacity .5s ease-out",r.style.mozTransition="opacity .5s ease-out",r.style.transition="opacity .5s ease-out",r.style.left=e.x-10+"px",r.style.top=e.y-10+"px";const t=a.appendChild(r);setTimeout(()=>{i.removeChild(t)},500),setTimeout(()=>{t.style.opacity=0},50)}),n.body.appendChild(a)},canTouch:()=>!0,maxNbTries:10,maxTouches:2,log:!1}};var Ba=e=>({logger:a,randomizer:n,window:i})=>{const r=i.document,t={...Ta(n,i),...e},o=(e,a,n,i)=>{const r=e[0],t=e[1],o=[];if(1===a)return[{x:r,y:t}];n=n||100,i=null!==i?i*Math.PI/180:0;const s=2*Math.PI/a;for(let e=0;e<a;e++){let a=s*e+i;o.push({x:r+n*Math.cos(a),y:t+n*Math.sin(a)})}return o},s=(e,a,n)=>{const i=[],o=r.createEvent("Event");o.initEvent("touch"+n,!0,!0),e.forEach((e,n)=>{const r=Math.round(e.x),t=Math.round(e.y);i.push({pageX:r,pageY:t,clientX:r,clientY:t,screenX:r,screenY:t,target:a,identifier:n})}),o.touches="end"===n?[]:i,o.targetTouches="end"===n?[]:i,o.changedTouches=i,a.dispatchEvent(o),"function"==typeof t.showAction&&t.showAction(e)},l=(e,a,n,i,r)=>{const t=Math.ceil(i.duration/10);let l=1;const c=()=>{let m=i.radius;1!==i.scale&&(m=i.radius-i.radius*(1-i.scale)*(1/t*l));const u=a[0]+i.distanceX/t*l,d=a[1]+i.distanceY/t*l,h="number"==typeof i.rotation?i.rotation/t*l:null,p=o([u,d],n.length,m,h),b=l===t;if(1===l)s(p,e,"start");else{if(b)return s(p,e,"end"),r(p);s(p,e,"move")}setTimeout(c,10),l++};c()},c={tap(e,a,i){const r=o(e,1),t={duration:n.integer({min:20,max:700})};s(r,a,"start"),setTimeout(()=>{s(r,a,"end"),i(r,t)},t.duration)},doubletap(e,a,n){c.tap(e,a,()=>{setTimeout(()=>{c.tap(e,a,n)},30)})},gesture(e,a,i){const r={distanceX:n.integer({min:-100,max:200}),distanceY:n.integer({min:-100,max:200}),duration:n.integer({min:20,max:500})},t=o(e,1,r.radius);l(a,e,t,r,e=>{i(e,r)})},multitouch(e,a,i){const r=n.integer({min:2,max:t.maxTouches}),s={scale:n.floating({min:0,max:2}),rotation:n.natural({min:0,max:100}),radius:n.integer({min:50,max:200}),distanceX:n.integer({min:-20,max:20}),distanceY:n.integer({min:-20,max:20}),duration:n.integer({min:100,max:1500})},c=o(e,r,s.radius);l(a,e,c,s,e=>{i(e,s)})}};return()=>{let e,i,o,s,l=0;do{if(e=t.positionSelector(),i=e[0],o=e[1],s=r.elementFromPoint(i,o),l++,l>t.maxNbTries)return}while(!s||!t.canTouch(s));const m=n.pick(t.touchTypes);c[m](e,s,(e,n)=>{"function"==typeof t.showAction&&t.showAction(e),a&&t.log&&a.log("gremlin","toucher",m,"at",i,o,n)})}};const Ia=(e,a)=>{const n=a.document,i=(e,a,n)=>{const i=e.value;e.value=a,Object.getOwnPropertyDescriptor(n,"value").set.call(e,a);const r=new Event("input",{bubbles:!0});r.simulated=!0;let t=e._valueTracker;t&&t.setValue(i),e.dispatchEvent(r)},r=n=>{const r=e.character(),t=n.value+r;return i(n,t,a.HTMLInputElement.prototype),r};return{elementMapTypes:{textarea:n=>{const r=e.character(),t=n.value+r;return i(n,t,a.HTMLTextAreaElement.prototype),r},'input[type="text"]':r,'input[type="password"]':r,'input[type="number"]':n=>{const r=e.character({pool:"0123456789"}),t=n.value+r;return i(n,t,a.HTMLInputElement.prototype),r},select:a=>{const n=a.querySelectorAll("option");if(0===n.length)return;const i=e.pick(n);return n.forEach(e=>{e.selected=e.value===i.value}),i.value},'input[type="radio"]':e=>{const i=n.createEvent("MouseEvents");return i.initMouseEvent("click",!0,!0,a,0,0,0,0,0,!1,!1,!1,!1,0,null),e.dispatchEvent(i),e.value},'input[type="checkbox"]':e=>{const i=n.createEvent("MouseEvents");return i.initMouseEvent("click",!0,!0,a,0,0,0,0,0,!1,!1,!1,!1,0,null),e.dispatchEvent(i),e.value},'input[type="email"]':n=>{const r=e.email();return i(n,r,a.HTMLInputElement.prototype),r},"input:not([type])":r},showAction:e=>{void 0===e.attributes["data-old-border"]&&(e.attributes["data-old-border"]=e.style.border);const a=e.attributes["data-old-border"];e.style.border="1px solid red",setTimeout(()=>{e.style.border=a},500)},canFillElement:()=>!0,maxNbTries:10,log:!1}};var ka=e=>({logger:a,randomizer:n,window:i})=>{const r=i.document,t={...Ia(n,i),...e};return()=>{const e=Object.keys(t.elementMapTypes);let i,o=0;do{const a=r.querySelectorAll(e.join(","));if(0===a.length)return;if(i=n.pick(a),o++,o>t.maxNbTries)return}while(!i||!t.canFillElement(i));const s=Object.keys(t.elementMapTypes).find(e=>i.matches(e)),l=t.elementMapTypes[s](i);"function"==typeof t.showAction&&t.showAction(i),a&&t.log&&a.log("gremlin","formFiller","input",l,"in",i)}};const Pa=(e,a)=>{const n=a.document,i=n.documentElement,r=n.body;return{positionSelector:()=>{const a=Math.max(r.scrollWidth,r.offsetWidth,i.scrollWidth,i.offsetWidth,i.clientWidth),n=Math.max(r.scrollHeight,r.offsetHeight,i.scrollHeight,i.offsetHeight,i.clientHeight);return[e.natural({max:a-i.clientWidth}),e.natural({max:n-i.clientHeight})]},showAction:(e,a)=>{const t=n.createElement("div");t.style.zIndex=2e3,t.style.border="3px solid red",t.style.width=i.clientWidth-25+"px",t.style.height=i.clientHeight-25+"px",t.style.position="absolute",t.style.webkitTransition="opacity 1s ease-out",t.style.mozTransition="opacity 1s ease-out",t.style.transition="opacity 1s ease-out",t.style.left=e+10+"px",t.style.top=a+10+"px",t.style["pointer-events"]="none";const o=r.appendChild(t);setTimeout(()=>{r.removeChild(o)},1e3),setTimeout(()=>{o.style.opacity=0},50)},log:!1}};var Ga=e=>({logger:a,randomizer:n,window:i})=>{const r={...Pa(n,i),...e};return()=>{const e=r.positionSelector(),n=e[0],t=e[1];i.scrollTo(n,t),"function"==typeof r.showAction&&r.showAction(n,t),a&&r.log&&a.log("gremlin","scroller  ","scroll to",n,t)}};const Ea=(e,a)=>{const n=a.document,i=n.body;return{eventTypes:["keypress","keyup","keydown"],showAction:(e,a,r,t)=>{const o=n.createElement("div");o.style.zIndex=2e3,o.style.border="3px solid orange",o.style["border-radius"]="50%",o.style.borderRadius="50%",o.style.width="40px",o.style.height="40px",o.style["box-sizing"]="border-box",o.style.position="absolute",o.style.webkitTransition="opacity 1s ease-out",o.style.mozTransition="opacity 1s ease-out",o.style.transition="opacity 1s ease-out",o.style.left=a+"px",o.style.top=r+"px",o.style.textAlign="center",o.style.paddingTop="7px",o.innerHTML=String.fromCharCode(t);const s=i.appendChild(o);setTimeout(()=>{i.removeChild(s)},1e3),setTimeout(()=>{s.style.opacity=0},50)},keyGenerator:()=>e.natural({min:3,max:254}),targetElement:(e,a)=>n.elementFromPoint(e,a),log:!1}};var La=e=>({logger:a,randomizer:n,window:i})=>{const r=i.document,t=r.documentElement,o={...Ea(n,i),...e};return()=>{const e=r.createEventObject?r.createEventObject():r.createEvent("Events"),i=n.pick(o.eventTypes),s=o.keyGenerator(),l=n.natural({max:Math.max(0,t.clientWidth-1)}),c=n.natural({max:Math.max(0,t.clientHeight-1)}),m=o.targetElement(l,c);e.initEvent&&e.initEvent(i,!0,!0),e.keyCode=s,e.which=s,e.keyCodeVal=s,m.dispatchEvent?m.dispatchEvent(e):m.fireEvent("on"+i,e),"function"==typeof o.showAction&&o.showAction(m,l,c,s),o.log&&a&&a.log("gremlin","typer type",String.fromCharCode(s),"at",l,c)}};const wa=e=>({watchEvents:["alert","confirm","prompt"],confirmResponse:()=>e.bool(),promptResponse:()=>e.sentence()});var Da=e=>({logger:a,randomizer:n,window:i})=>{const r={...wa(n),...e},t=i.alert,o=i.confirm,s=i.prompt,l=()=>{a&&(r.watchEvents.includes("alert")&&(i.alert=e=>{a.warn("mogwai ","alert ",e,"alert")}),r.watchEvents.includes("confirm")&&(i.confirm=e=>{r.confirmResponse(),a.warn("mogwai ","alert ",e,"confirm")}),r.watchEvents.includes("prompt")&&(i.prompt=e=>{r.promptResponse(),a.warn("mogwai ","alert ",e,"prompt")}))};return l.cleanUp=()=>(i.alert=t,i.confirm=o,i.prompt=s,l),l};var Ra=e=>({logger:a,window:n})=>{const i={delay:500,levelSelector:e=>e<10?"error":e<20?"warn":"log",...e};let r,t=-1/0;const o=e=>{e-t>i.delay&&(s(),t=e),r&&n.requestAnimationFrame(o)},s=()=>{let e;const r=n=>{const r=n-e<16?60:1e3/(n-e),t=i.levelSelector(r);a&&a[t]("mogwai ","fps       ",r)};n.requestAnimationFrame(a=>{e=a,n.requestAnimationFrame(r)})},l=()=>{r=!0,n.requestAnimationFrame(o)};return l.cleanUp=()=>(r=!1,l),l};const xa={maxErrors:10};var Fa=e=>({logger:a,stop:n,window:i})=>{const r={...xa,...e};let t,o;const s=()=>{let e=0;const s=()=>{if(e++,e===r.maxErrors){if(n(),!a)return;i.setTimeout(()=>{a.warn("mogwai ","gizmo     ","stopped test execution after ",r.maxErrors,"errors")},4)}};t=i.onerror,i.onerror=(...e)=>(s(),!!t&&t(...e)),o=console.error,console.error=(...e)=>{s(),o(...e)}};return s.cleanUp=()=>(i.onerror=t,console.error=o.bind(console),s),s},Na=(e,a)=>e.reduce((e,n)=>e.then(()=>n(...a)),Promise.resolve()),Ha=e=>new Promise(a=>setTimeout(a,e)),za=e=>a=>{const n={distribution:[],delay:10,nb:1e3,...e};let i=!1;const r=async e=>{const{nb:a,delay:r}=n,s=[...e],l=0===n.distribution.length?t(s):n.distribution;if(0===a)return Promise.resolve();for(let e=0;e<a;e++){const e=o(s,l);if(await Ha(r),i)return Promise.resolve();await Na([e],[])}return Promise.resolve()},t=e=>{const a=e.length;if(0===a)return[];const n=[],i=1/a;for(let e=0;e<a;e++)n.push(i);return n},o=(e,n)=>{let i=0;const r=a.floating({min:0,max:1});for(let a=0,t=e.length;a<t;a++)if(i+=n[a],r<=i)return e[a];return()=>{}};return r.stop=()=>{i=!0},r};const Wa={species:[Ma(),ka(),Ba(),Ga(),La()],mogwais:[Ra(),Da(),Fa()],strategies:[za()],logger:console,randomizer:new Aa,window:window},Oa={clicker:Ma,toucher:Ba,formFiller:ka,scroller:Ga,typer:La},_a=Object.values(Oa).map(e=>e()),Ka={alert:Da,fps:Ra,gizmo:Fa},Ua=Object.values(Ka).map(e=>e()),Va={distribution:za,bySpecies:e=>()=>{const a={delay:10,nb:100,...e};let n=!1;const i=async e=>{const{nb:i,delay:r}=a,t=[...e];for(let e in t){const a=t[e];for(let e=0;e<i;e++){if(await Ha(r),n)return Promise.resolve();await Na([a],[])}}return Promise.resolve()};return i.stop=()=>{n=!0},i},allTogether:e=>()=>{const a={delay:10,nb:100,...e};let n=!1;const i=async e=>{const{nb:i,delay:r}=a;for(let a=0;a<i;a++){if(await Ha(r),n)return Promise.resolve();await Na(e,[])}return Promise.resolve()};return i.stop=()=>{n=!0},i}};e.Chance=Aa,e.allMogwais=Ua,e.allSpecies=_a,e.createHorde=e=>{const a={...Wa,...e},{logger:n,randomizer:i,window:r}=a,t={logger:n,randomizer:i,window:r},o=a.species.map(e=>e(t)),s=a.strategies.map(e=>e(i)),l=()=>s.forEach(e=>e.stop()),c={...t,stop:l},m=a.mogwais.map(e=>e(c));return{unleash:async()=>{const e=[...m],a=m.map(e=>e.cleanUp).filter(e=>"function"==typeof e);await Na(e,[]);const n=s.map(e=>e(o));await Promise.all(n),await Na(a,[])},stop:l}},e.mogwais=Ka,e.species=Oa,e.strategies=Va,Object.defineProperty(e,"__esModule",{value:!0})}));


}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer)
},{"buffer":13}],15:[function(require,module,exports){
/*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> */
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = (e * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = (m * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = ((value * c) - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

},{}],16:[function(require,module,exports){
"use strict";Object.defineProperty(exports,"__esModule",{value:true});Object.defineProperty(exports,"localize",{enumerable:true,get:function get(){return _localize.default}});exports.default=void 0;var _localize=_interopRequireDefault(require("./localize.js"));function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj}}var pseudoLocalization=function(){var opts={blacklistedNodeNames:["STYLE"]};var observer=null;var observerConfig={characterData:true,childList:true,subtree:true};var textNodesUnder=function textNodesUnder(element){var walker=document.createTreeWalker(element,NodeFilter.SHOW_TEXT,function(node){var isAllWhitespace=!/[^\s]/.test(node.nodeValue);if(isAllWhitespace)return NodeFilter.FILTER_REJECT;var isBlacklistedNode=opts.blacklistedNodeNames.includes(node.parentElement.nodeName);if(isBlacklistedNode)return NodeFilter.FILTER_REJECT;return NodeFilter.FILTER_ACCEPT});var currNode;var textNodes=[];while(currNode=walker.nextNode()){textNodes.push(currNode)}return textNodes};var isNonEmptyString=function isNonEmptyString(str){return str&&typeof str==="string"};var pseudoLocalize=function pseudoLocalize(element){var textNodesUnderElement=textNodesUnder(element);var _iteratorNormalCompletion=true;var _didIteratorError=false;var _iteratorError=undefined;try{for(var _iterator=textNodesUnderElement[Symbol.iterator](),_step;!(_iteratorNormalCompletion=(_step=_iterator.next()).done);_iteratorNormalCompletion=true){var textNode=_step.value;var nodeValue=textNode.nodeValue;if(isNonEmptyString(nodeValue)){textNode.nodeValue=(0,_localize.default)(nodeValue,opts)}}}catch(err){_didIteratorError=true;_iteratorError=err}finally{try{if(!_iteratorNormalCompletion&&_iterator.return!=null){_iterator.return()}}finally{if(_didIteratorError){throw _iteratorError}}}};var domMutationCallback=function domMutationCallback(mutationsList){var _iteratorNormalCompletion2=true;var _didIteratorError2=false;var _iteratorError2=undefined;try{for(var _iterator2=mutationsList[Symbol.iterator](),_step2;!(_iteratorNormalCompletion2=(_step2=_iterator2.next()).done);_iteratorNormalCompletion2=true){var mutation=_step2.value;if(mutation.type==="childList"&&mutation.addedNodes.length>0){observer.disconnect();mutation.addedNodes.forEach(pseudoLocalize);observer.observe(document.body,observerConfig)}else if(mutation.type==="characterData"){var nodeValue=mutation.target.nodeValue;var isBlacklistedNode=opts.blacklistedNodeNames.includes(mutation.target.parentElement.nodeName);if(isNonEmptyString(nodeValue)&&!isBlacklistedNode){observer.disconnect();mutation.target.nodeValue=(0,_localize.default)(nodeValue,opts);observer.observe(document.body,observerConfig)}}}}catch(err){_didIteratorError2=true;_iteratorError2=err}finally{try{if(!_iteratorNormalCompletion2&&_iterator2.return!=null){_iterator2.return()}}finally{if(_didIteratorError2){throw _iteratorError2}}}};var start=function start(){var _ref=arguments.length>0&&arguments[0]!==undefined?arguments[0]:{},_ref$strategy=_ref.strategy,strategy=_ref$strategy===void 0?"accented":_ref$strategy,_ref$blacklistedNodeN=_ref.blacklistedNodeNames,blacklistedNodeNames=_ref$blacklistedNodeN===void 0?opts.blacklistedNodeNames:_ref$blacklistedNodeN;opts.blacklistedNodeNames=blacklistedNodeNames;opts.strategy=strategy;pseudoLocalize(document.body);observer=new MutationObserver(domMutationCallback);observer.observe(document.body,observerConfig)};var stop=function stop(){observer&&observer.disconnect()};return{start:start,stop:stop,localize:_localize.default}}();var _default=pseudoLocalization;exports.default=_default;

},{"./localize.js":17}],17:[function(require,module,exports){
"use strict";Object.defineProperty(exports,"__esModule",{value:true});exports.default=void 0;var ACCENTED_MAP={a:"\u0227",A:"\u0226",b:"\u0180",B:"\u0181",c:"\u0188",C:"\u0187",d:"\u1E13",D:"\u1E12",e:"\u1E17",E:"\u1E16",f:"\u0192",F:"\u0191",g:"\u0260",G:"\u0193",h:"\u0127",H:"\u0126",i:"\u012B",I:"\u012A",j:"\u0135",J:"\u0134",k:"\u0137",K:"\u0136",l:"\u0140",L:"\u013F",m:"\u1E3F",M:"\u1E3E",n:"\u019E",N:"\u0220",o:"\u01FF",O:"\u01FE",p:"\u01A5",P:"\u01A4",q:"\u024B",Q:"\u024A",r:"\u0159",R:"\u0158",s:"\u015F",S:"\u015E",t:"\u0167",T:"\u0166",v:"\u1E7D",V:"\u1E7C",u:"\u016D",U:"\u016C",w:"\u1E87",W:"\u1E86",x:"\u1E8B",X:"\u1E8A",y:"\u1E8F",Y:"\u1E8E",z:"\u1E91",Z:"\u1E90"};var BIDI_MAP={a:"\u0250",A:"\u2200",b:"q",B:"\u0510",c:"\u0254",C:"\u2183",d:"p",D:"\u15E1",e:"\u01DD",E:"\u018E",f:"\u025F",F:"\u2132",g:"\u0183",G:"\u2141",h:"\u0265",H:"H",i:"\u0131",I:"I",j:"\u027E",J:"\u017F",k:"\u029E",K:"\u04FC",l:"\u0285",L:"\u2142",m:"\u026F",M:"W",n:"u",N:"N",o:"o",O:"O",p:"d",P:"\u0500",q:"b",Q:"\xD2",r:"\u0279",R:"\u1D1A",s:"s",S:"S",t:"\u0287",T:"\u22A5",u:"n",U:"\u2229",v:"\u028C",V:"\u0245",w:"\u028D",W:"M",x:"x",X:"X",y:"\u028E",Y:"\u2144",z:"z",Z:"Z"};var strategies={accented:{prefix:"",postfix:"",map:ACCENTED_MAP,elongate:true},bidi:{prefix:"\u202E",postfix:"\u202C",map:BIDI_MAP,elongate:false}};var pseudoLocalizeString=function pseudoLocalizeString(string){var _ref=arguments.length>1&&arguments[1]!==undefined?arguments[1]:{},_ref$strategy=_ref.strategy,strategy=_ref$strategy===void 0?"accented":_ref$strategy;var opts=strategies[strategy];var pseudoLocalizedText="";var _iteratorNormalCompletion=true;var _didIteratorError=false;var _iteratorError=undefined;try{for(var _iterator=string[Symbol.iterator](),_step;!(_iteratorNormalCompletion=(_step=_iterator.next()).done);_iteratorNormalCompletion=true){var character=_step.value;if(opts.map[character]){var cl=character.toLowerCase();if(opts.elongate&&(cl==="a"||cl==="e"||cl==="o"||cl==="u")){pseudoLocalizedText+=opts.map[character]+opts.map[character]}else pseudoLocalizedText+=opts.map[character]}else pseudoLocalizedText+=character}}catch(err){_didIteratorError=true;_iteratorError=err}finally{try{if(!_iteratorNormalCompletion&&_iterator.return!=null){_iterator.return()}}finally{if(_didIteratorError){throw _iteratorError}}}if(pseudoLocalizedText.startsWith(opts.prefix)&&pseudoLocalizedText.endsWith(opts.postfix)){return pseudoLocalizedText}return opts.prefix+pseudoLocalizedText+opts.postfix};var _default=pseudoLocalizeString;exports.default=_default;

},{}]},{},[11])(11)
});
