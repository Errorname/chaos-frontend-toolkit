const data = {
  requestDelaying: {
    category: 'network',
    enabled: false,
    maxDelay: {
      default: 15000,
      min: 0,
      step: 1000,
    },
    probabilityOfDelay: {
      default: 0.5,
      min: 0,
      step: 0.01,
      max: 1,
    },
  },
  requestFailing: {
    category: 'network',
    enabled: false,
    probabilityOfFail: {
      default: 0.05,
      min: 0,
      step: 0.01,
      max: 1,
    },
  },
  requestDenylist: {
    category: 'network',
    enabled: false,
    list: [],
  },
  pseudoLocalization: {
    category: 'localization',
    enabled: false,
    strategy: {
      default: 'accented',
    },
  },
  timerThrottling: {
    category: 'timers',
    enabled: false,
    maxDeviationDelay: {
      default: 500,
      min: 0,
      step: 100,
    },
    probabilityOfDelay: {
      default: 0.5,
      min: 0,
      step: 0.01,
      max: 1,
    },
  },
  historySwitch: {
    category: 'history',
    enabled: false,
    interval: {
      default: 60,
      min: 0,
      step: 1,
    },
    probabilityOfSwitch: {
      default: 0.1,
      min: 0,
      step: 0.01,
    },
  },
  doubleClicks: {
    category: 'inputs',
    enabled: false,
    delay: {
      default: 100,
      min: 0,
      step: 10,
    },
  },
  gremlins: {
    category: 'inputs',
    enabled: false,
    numberOfWaves: {
      default: 100,
      min: 0,
      step: 10,
    },
  },
  blackAndWhite: {
    category: 'accessibility',
    enabled: false,
  },
}

const reactiveBinds = {}

const store = {
  get: (path) => {
    if (path === undefined) {
      return data
    }

    const [name, key, subkey] = path.split('.')
    return subkey ? data[name][key][subkey] : key ? data[name][key] : data[name]
  },

  set: (path, value, expAlreadyStopped = false) => {
    const [name, key, subkey] = path.split('.')
    if (subkey) {
      data[name][key][subkey] = value
    } else {
      data[name][key] = value
    }

    if (reactiveBinds[path]) {
      reactiveBinds[path].forEach((fn) => fn(value, expAlreadyStopped))
    }
  },

  bind: (path, callback) => {
    if (!reactiveBinds[path]) {
      reactiveBinds[path] = []
    }

    reactiveBinds[path].push(callback)
  },
}
