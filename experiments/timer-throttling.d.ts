export interface TimerThrottling {
  start(options?: { probabilityOfDelay?: number; maxDelayDeviation?: number }): void
  stop(): void
  getStatus(): {
    running: boolean
    options: { probabilityOfDelay: number; maxDelayDeviation: number }
  }
}

declare const timerThrottling: TimerThrottling

export default timerThrottling
