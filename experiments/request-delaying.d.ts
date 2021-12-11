export interface RequestDelaying {
  start(options?: { maxDelay?: number; probabilityOfDelay?: number }): void
  stop(): void
  getStatus(): {
    running: boolean
    options: { maxDelay: number; probabilityOfDelay: number }
  }
}

declare const requestDelaying: RequestDelaying

export default requestDelaying
