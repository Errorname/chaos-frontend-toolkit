export interface RequestDenylist {
  start(options?: { list?: string[] }): void
  stop(): void
  getStatus(): {
    running: boolean
    options: { list: string[] }
  }
}

declare const requestDenylist: RequestDenylist

export default requestDenylist
