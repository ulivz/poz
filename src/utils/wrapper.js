export function statusWrapper(fn, ...args) {
  let out, status, error
  try {
    out = fn(...args)
    status = 200
  } catch (err) {
    error = err
    status = 500
  }

  return { out, status, error }
}
