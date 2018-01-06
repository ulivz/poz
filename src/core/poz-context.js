export default class POZContext {
  set(key, val) {
    this[key] = val
    return this
  }

  assign(kVs) {
    Object.keys(kVs).forEach(_key => {
      this.set(_key, kVs[_key])
    })
    return this
  }

  get(key) {
    return this[key]
  }
}
