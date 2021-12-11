export interface RequestFailing {
  start(options?: { probabilityOfFail?: number }): void
  stop(): void
  getStatus(): {
    running: boolean
    options: { probabilityOfFail: number }
  }
}

declare const requestFailing: RequestFailing

export default requestFailing
