import debug from './POZDebugger'

export default class POZContext {

  set(key, val) {
    debug.trace('POZContext', 'set')
    this[key] = val
    return this
  }

  assign(kVs) {
    debug.trace('POZContext', 'assign')
    Object.keys(kVs).forEach(_key => {
      this.set(_key, kVs[_key])
    })
    return this
  }

  get(key) {
    debug.trace('POZContext', 'get')
    return this[key]
  }
}
