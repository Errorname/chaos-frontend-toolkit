/**
 * Asks the background page to inject Chaos Frontend Toolkit into the current page.
 */
function injectLib() {
  chrome.runtime.sendMessage({
    tabId: chrome.devtools.inspectedWindow.tabId,
    action: 'inject',
    file: '/chaos-frontend-toolkit.js',
  })
}
