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
