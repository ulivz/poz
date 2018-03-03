export default function context() {
  const ob = {}

  function set(key, val) {
    ob[key] = val
    return ob
  }

  function assign(kVs) {
    Object.keys(kVs).forEach(_key => {
      set(_key, kVs[_key])
    })
    return ob
  }

  function get(key) {
    return ob[key]
  }

  function getContext() {
    return Object.assign({}, ob)
  }

  return {
    get,
    set,
    assign,
    getContext
  }
}
