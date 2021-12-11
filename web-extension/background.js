function loadScript(src) {
  if (document.querySelector(`script[src="${src}"]`)) {
    return
  }

  const script = document.createElement('script')
  script.defer = true
  script.src = src
  ;(document.head || document.documentElement).appendChild(script)
}

/**
 * Receives messages from devtools to interact with the tab.
 */
chrome.runtime.onMessage.addListener((request, sender) => {
  const tabId = request.tabId || sender.tab.id

  // Injects a JS script into the tab.
  if (request.action === 'inject') {
    const src = chrome.runtime.getURL(request.file)

    if (chrome.runtime.getManifest().manifest_version === 3) {
      chrome.scripting.executeScript({
        target: { tabId },
        func: loadScript,
        args: [src],
      })
    } else {
      chrome.tabs.executeScript(tabId, {
        code: `
          (() => {
            if (document.querySelector('script[src="${src}"]')) {
              return
            }

            const script = document.createElement('script');
            script.defer = true;
            script.src = "${src}";
            (document.head || document.documentElement).appendChild(script);
          })()`,
      })
    }
  }
})

/**
 * Communicate with devtools
 */

chrome.runtime.onConnect.addListener(function (devtoolsPort) {
  /**
   * When a page reloads, send event to devtools
   */
  function sendEventToDevtools(tabId, changeInfo) {
    if (changeInfo.status === 'complete') {
      devtoolsPort.postMessage({
        type: 'page-reload',
        tabId,
      })
    }
  }

  chrome.tabs.onUpdated.addListener(sendEventToDevtools)
  devtoolsPort.onDisconnect.addListener(function () {
    chrome.tabs.onUpdated.removeListener(sendEventToDevtools)
  })
})
