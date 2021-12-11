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
