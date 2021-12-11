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
