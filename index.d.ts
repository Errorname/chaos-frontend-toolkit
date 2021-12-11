import { BlackAndWhite } from './experiments/black-and-white'
import { DoubleClicks } from './experiments/double-clicks'
import { Gremlins } from './experiments/gremlins'
import { HistorySwitch } from './experiments/history-switch'
import { PseudoLocalization } from './experiments/pseudo-localization'
import { RequestDelaying } from './experiments/request-delaying'
import { RequestDenylist } from './experiments/request-denylist'
import { RequestFailing } from './experiments/request-failing'
import { TimerThrottling } from './experiments/timer-throttling'

type Experiment =
  | BlackAndWhite
  | DoubleClicks
  | Gremlins
  | HistorySwitch
  | PseudoLocalization
  | RequestDelaying
  | RequestDenylist
  | RequestFailing
  | TimerThrottling

type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never
type OptionsOf<T extends Experiment> = true | Parameters<T['start']>[0]
type StatusOf<T extends Experiment> = ReturnType<T['getStatus']>

interface ChaosFrontendToolkit {
  start(options?: {
    blackAndWhite?: Expand<OptionsOf<BlackAndWhite>>
    doubleClicks?: Expand<OptionsOf<DoubleClicks>>
    gremlins?: Expand<OptionsOf<Gremlins>>
    historySwitch?: Expand<OptionsOf<HistorySwitch>>
    pseudoLocalization?: Expand<OptionsOf<PseudoLocalization>>
    requestDelaying?: Expand<OptionsOf<RequestDelaying>>
    requestDenylist?: Expand<OptionsOf<RequestDenylist>>
    requestFailing?: Expand<OptionsOf<RequestFailing>>
    timerThrottling?: Expand<OptionsOf<TimerThrottling>>
  }): void
  stop(): void
  getStatus(): {
    running: boolean
    experiments: {
      blackAndWhite: StatusOf<BlackAndWhite>
      doubleClicks: StatusOf<DoubleClicks>
      gremlins: StatusOf<Gremlins>
      historySwitch: StatusOf<HistorySwitch>
      pseudoLocalization: StatusOf<PseudoLocalization>
      requestDelaying: StatusOf<RequestDelaying>
      requestDenylist: StatusOf<RequestDenylist>
      requestFailing: StatusOf<RequestFailing>
      timerThrottling: StatusOf<TimerThrottling>
    }
  }

  blackAndWhite: BlackAndWhite
  doubleClicks: DoubleClicks
  gremlins: Gremlins
  historySwitch: HistorySwitch
  pseudoLocalization: PseudoLocalization
  requestDelaying: RequestDelaying
  requestDenylist: RequestDenylist
  requestFailing: RequestFailing
  timerThrottling: TimerThrottling
}

declare const chaosFrontendToolkit: ChaosFrontendToolkit

export default chaosFrontendToolkit
