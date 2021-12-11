class BlackAndWhite {
  start() {
    if (this.previousFilter) {
      return
    }

    this.previousFilter = document.documentElement.style.filter || ''

    document.documentElement.style.filter = 'grayscale(1) ' + this.previousFilter
  }

  stop() {
    if (this.previousFilter === undefined) {
      return
    }

    document.documentElement.style.filter = this.previousFilter
    this.previousFilter = undefined
  }

  getStatus() {
    return {
      running: this.previousFilter !== undefined,
    }
  }
}

module.exports = new BlackAndWhite()
