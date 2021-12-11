<p align="center"><img src="landing/img/flask.png" width="200"/></p>
<h1 align="center">Chaos Frontend Toolkit</h1>
<p align="center">A set of tools to <b>break your web apps</b> and, in doing so, <b>find ways to improve them</b>.</p>

<p align="center">
  <a href="https://www.npmjs.com/package/prisma-multi-tenant">
    <img alt="License: Apache 2.0" src="https://img.shields.io/npm/v/chaos-frontend-toolkit?style=flat-square">
  </a>
  <a href="https://github.com/Errorname/chaos-frontend-toolkit/blob/master/LICENSE">
    <img alt="License: Apache 2.0" src="https://img.shields.io/github/license/Errorname/chaos-frontend-toolkit?style=flat-square">
  </a>
  <a href="https://twitter.com/Errorname_">
    <img alt="Twitter: Errorname_" src="https://img.shields.io/twitter/follow/Errorname_.svg?style=social" />
  </a>
</p>

**Chaos Frontend Toolkit** is both a **Web Extension** and a **JS library**.

## 🧩 Web Extension

Check out https://chaos-frontend-toolkit.web.app

## 📘 Library

### Using NPM

#### Installation

```sh
npm i chaos-frontend-toolkit
```

#### Usage

```js
import chaosFrontendToolkit from 'chaos-frontend-toolkit'

// Start the experiment either with the main lib or directly using the experiment
chaosFrontendToolkit.start({ pseudoLocalization: true }) // or .stop()
chaosFrontendToolkit.pseudoLocalization.start() // or .stop()

// Or...

import pseudoLocalization from 'chaos-frontend-toolkit/pseudo-localization'

pseudolocalization.start() // or .stop()
```

See [Experiments](#-experiments) to learn more about the usage of each experiment

### Using script tag

#### Installation

```html
<script src="https://raw.githubusercontent.com/Errorname/chaos-frontend-toolkit/main/web-extension/chaos-frontend-toolkit.js"></script>
```

> ⚠️ You should host this file yourself when in production.

#### Usage

```js
// Start the experiment either with the main lib or directly using the experiment
window.chaosFrontendToolkit.start({ pseudoLocalization: true }) // or.stop()
window.chaosFrontendToolkit.pseudoLocalization.start() // or .stop()
```

See [Experiments](#-experiments) to learn more about the usage of each experiment

## 🛠 Experiments

- **Network**
  - [Request delaying](#request-delaying)
  - [Request failing](#request-failing)
  - [Denylist](#denylist)
- **Localization**
  - [Pseudo-localization](#pseudo-localization)
- **Timers**
  - [Timer throttling](#timer-throttling)
- **History**
  - [Random history navigation](#random-history-navigation)
- **Inputs**
  - [Double every clicks](#double-every-clicks)
  - [Gremlins](#gremlins)
- **Accessibility**
  - [Black and white](#black-and-white)

### Request delaying

Randomly delays your http requests for up to X milliseconds.

```js
chaosFrontendToolkit.requestDelaying.start({
  maxDelay: 15000, // Max delay in milliseconds
  probabilityOfDelay: 0.5, // Probability of delay (between 0 and 1)
})
```

### Request failing

Randomly fails your http requests.

```js
chaosFrontendToolkit.requestFailing.start({
  probabilityOfFail: 0.05, // Probability of fail (between 0 and 1)
})
```

### Denylist

Fails every http requests from a regex list.

```js
chaosFrontendToolkit.requestDenylist.start({
  urls: ['cdn.my-app.com'], // You can use regex here
})
```

### Pseudo-localization

Applies [Pseudolocalization](https://en.wikipedia.org/wiki/Pseudolocalization) to every text of your app. (By [Tryggvigy](https://github.com/tryggvigy/pseudo-localization))

```js
chaosFrontendToolkit.pseudoLocalization.start({
  strategy: 'accented', // Either "accented" or "bidi". (Bidi can be used to test RTL languages)
})
```

### Timer throttling

Randomly adds or removes up to X milliseconds to your timeout and intervals.

```js
chaosFrontendToolkit.timerThrottling.start({
  probabilityOfDelay: 0.5, // Max delay deviation in milliseconds
  maxDelayDeviation: 500, // Probability of delay (between 0 and 1)
})
```

### Random history navigation

Randomly navigates backward or forward in the app history every 60 seconds.

```js
chaosFrontendToolkit.historySwitch.start({
  interval: 60, // Interval in seconds between possible navigations
  probabilityOfSwitch: 0.1, // Probability of navigation (between 0 and 1)
})
```

### Double every clicks

Every user's click on your app will be doubled with a second click on the same target.

```js
chaosFrontendToolkit.doubleClicks.start({
  delay: 100, // Delay before second click
})
```

### Gremlins

Simulates random user actions (mouse and keyboard) by unleashing a horde of X gremlins on your app (1 every ~50ms). (By [Marmelab](https://github.com/marmelab/gremlins.js))

```js
chaosFrontendToolkit.gremlins.start({
  numberOfWaves: 100, // Number of gremlins
})
```

### Black and white

Removes all colors from your app.

```js
chaosFrontendToolkit.blackAndWhite.start()
```

## 👤 Author

**Thibaud Courtoison**

- Twitter: [@Errorname\_](https://twitter.com/Errorname_)
- Github: [@Errorname](https://github.com/Errorname)

## 📝 License

Copyright © 2021 [Thibaud Courtoison](https://github.com/Errorname).

This project is [Apache 2.0](https://github.com/Errorname/prisma-multi-tenant/blob/master/LICENSE) licensed.

Flask icon by [Freepik](https://www.freepik.com/)
UI Icons by [Feather](https://github.com/feathericons/feather)
