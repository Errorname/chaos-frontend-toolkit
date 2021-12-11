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
