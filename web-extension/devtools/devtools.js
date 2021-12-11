let panelWindow

/**
 * Add the "Chaos" panel in the devtools.
 */
chrome.devtools.panels.create('Chaos', '/icons/flask.png', '/devtools/panel.html', (newPanel) => {
  newPanel.onShown.addListener((window) => {
    panelWindow = window

    panelWindow.onPanelShown()
  })
})

/**
 * Communicate with background
 */
const backgroundPort = chrome.runtime.connect({ name: 'Chaos Frontend Toolkit Devtools' })
backgroundPort.onMessage.addListener(({ type, tabId }) => {
  if (tabId !== chrome.devtools.inspectedWindow.tabId || !panelWindow) {
    return
  }

  if (type === 'page-reload') {
    panelWindow.onTabRefresh()
  }
})
