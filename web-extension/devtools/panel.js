let shown = false
function onPanelShown() {
  if (!shown) {
    shown = true
    injectLib()
    retrieveExperimentsStatus()
  }
}

function onTabRefresh() {
  injectLib()
  reapplyExperimentsStatus()
}

document.addEventListener('DOMContentLoaded', () => {
  handleSectionNavigation()
  registerInputs()
  registerExperiments()
})
