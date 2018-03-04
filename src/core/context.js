class Context {
  set(key, val) {
    this[key] = val
    return this
  }

  assign(keyValues) {
    Object.keys(keyValues).forEach(key => {
      this.set(key, keyValues[key])
    })
    return this
  }

  get(key) {
    return this[key]
  }
}

export default () => new Context()
