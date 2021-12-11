const defaultOptions = {
  delay: 100,
}

class DoubleClicks {
  options = defaultOptions

  start(options = {}) {
    if (this.secondClick) {
      return
    }

    this.options = {
      ...defaultOptions,
      ...options,
    }

    this.secondClick = (evt) => {
      let { target } = evt

      // If click originates from user
      if (evt.pointerId > 0) {
        this.timeoutId = setTimeout(() => {
          if (!target) {
            return
          }

          while (!target.click && target.parentNode) {
            target = target.parentNode
          }

          target.click()
        }, this.options.delay)
      }
    }

    document.body.addEventListener('click', this.secondClick)
  }

  stop() {
    if (!this.secondClick) {
      return
    }

    document.body.removeEventListener('click', this.secondClick)
    clearTimeout(this.timeoutId)
    this.secondClick = undefined
  }

  getStatus() {
    return {
      running: this.secondClick !== undefined,
      options: this.options,
    }
  }
}

module.exports = new DoubleClicks()
