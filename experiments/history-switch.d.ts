export interface HistorySwitch {
  start(options?: { interval?: number; probabilityOfSwitch?: number }): void
  stop(): void
  getStatus(): { running: boolean; options: { interval: number; probabilityOfSwitch: number } }
}

declare const historySwitch: HistorySwitch

export default historySwitch
