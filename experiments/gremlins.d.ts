export interface Gremlins {
  start(options?: { numberOfWaves?: number }): void
  stop(): void
  getStatus(): { running: boolean; options: { numberOfWaves: number } }
}

declare const gremlins: Gremlins

export default gremlins
