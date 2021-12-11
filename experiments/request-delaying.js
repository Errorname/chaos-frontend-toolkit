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
