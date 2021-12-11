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
