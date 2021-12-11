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
