export interface DoubleClicks {
  start(options?: { delay?: number }): void
  stop(): void
  getStatus(): { running: boolean; options: { delay: number } }
}

declare const doubleClicks: DoubleClicks

export default doubleClicks
