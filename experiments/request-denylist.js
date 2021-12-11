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
