export interface PseudoLocalization {
  start(options?: { strategy?: 'accented' | 'bidi' }): void
  stop(): void
  getStatus(): { running: boolean; options: { strategy: 'accented' | 'bidi' } }
}

declare const pseudoLocalization: PseudoLocalization

export default pseudoLocalization
