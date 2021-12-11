function registerExperiments() {
  document.querySelectorAll('main article h3 .switch input').forEach((input) => {
    const [experiment] = input.getAttribute('data-value').split('.')

    store.bind(`${experiment}.enabled`, (experimentEnabled, expAlreadyStopped) => {
      const experimentCategory = store.get(`${experiment}.category`)

      if (experimentEnabled || (!experimentEnabled && !expAlreadyStopped)) {
        toggleExperiment(experiment, experimentEnabled)
      }

      const enabledExperimentsInCategory =
        Object.entries(store.get()).filter(
          ([name, { category, enabled }]) => category === experimentCategory && enabled
        ).length > 0

      toggleNavRunning(experimentCategory, enabledExperimentsInCategory)

      if (experimentEnabled) {
        // Disable buttons, inputs, and selects of the experiment
        document
          .querySelectorAll(
            `[data-value^="${experiment}."] button, [data-value^="${experiment}."] input, select[data-value^="${experiment}."]`
          )
          .forEach((el) => {
            el.disabled = true
          })
      } else {
        // Re-enable buttons, inputs, and selects of the experiment
        document
          .querySelectorAll(
            `[data-value^="${experiment}."] button, [data-value^="${experiment}."] input, select[data-value^="${experiment}."]`
          )
          .forEach((el) => {
            el.disabled = false
          })
      }
    })
  })
}

function toggleExperiment(experiment, start) {
  let code

  if (start) {
    code = `window.chaosFrontendToolkit.${experiment}.start(${JSON.stringify(
      getOptions(experiment)
    )})`
  } else {
    code = 'location.reload()'
  }

  chrome.devtools.inspectedWindow.eval(code)

  // I know, it's not pretty
  if (experiment === 'gremlins' && start) {
    let intervalId = setInterval(() => {
      chrome.devtools.inspectedWindow.eval(
        `window.chaosFrontendToolkit.gremlins.getStatus().running`,
        undefined,
        (isRunning) => {
          if (isRunning === false && intervalId) {
            clearInterval(intervalId)
            store.set('gremlins.enabled', false, true)
          }
        }
      )
    }, 200)
  }
}

function getOptions(experiment) {
  const { category, enabled, ...options } = store.get(experiment)

  return Object.fromEntries(
    Object.entries(options).map(([optName, optValue]) => {
      if (optValue.default !== undefined) {
        return [optName, optValue.value ?? optValue.default]
      }

      return [optName, optValue]
    })
  )
}

function reapplyExperimentsStatus() {
  const enabledExperiments = Object.entries(store.get())
    .filter(([, { enabled }]) => enabled)
    .map(([name, { category, enabled, ...opts }]) => {
      opts = Object.fromEntries(
        Object.entries(opts).map(([optName, optValue]) => {
          if (optValue.default !== undefined) {
            return [optName, optValue.value ?? optValue.default]
          }

          return [optName, optValue]
        })
      )

      return [name, opts]
    })

  const code = enabledExperiments.reduce((acc, [name, opts]) => {
    return acc + `window.chaosFrontendToolkit.${name}.start(${JSON.stringify(opts)});\n`
  }, '')

  chrome.devtools.inspectedWindow.eval(`
    (() => {
      let count = 0;
      function waitForChaosFrontendToolkit() {
        if (window.chaosFrontendToolkit) {
          ${code}
        } else if (count < 1000) {
          count++;
          setTimeout(waitForChaosFrontendToolkit, 10);
        }
      }

      waitForChaosFrontendToolkit();
    })()
  `)
}

function retrieveExperimentsStatus() {
  chrome.devtools.inspectedWindow.eval(
    `window.chaosFrontendToolkit?.getStatus()`,
    (chaosStatus) => {
      // If the lib has not been loaded yet, chaosStatus will be undefined
      if (chaosStatus !== undefined) {
        Object.entries(chaosStatus.experiments).forEach(([name, status]) => {
          if (store.get(`${name}.enabled`) !== status.running) {
            store.set(`${name}.enabled`, status.running)
          }

          if (status.options) {
            Object.entries(status.options).forEach(([optName, optValue]) => {
              if (store.get(`${name}.${optName}.default`)) {
                store.set(`${name}.${optName}.value`, optValue)
              } else {
                store.set(`${name}.${optName}`, optValue)
              }
            })
          }
        })
      }
    }
  )
}
