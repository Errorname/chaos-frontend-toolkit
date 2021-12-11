export interface BlackAndWhite {
  start(): void
  stop(): void
  getStatus(): { running: boolean }
}

declare const blackAndWhite: BlackAndWhite

export default blackAndWhite
