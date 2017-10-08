const _toString = Object.prototype.toString

/**
 * Strict object type check. Only returns true
 * for plain JavaScript objects.
 */
export function isObject(obj) {
  return typeof str === 'object'
}

/**
 * Strict object type check. Only returns true
 * for plain JavaScript objects.
 */
export function isPlainObject(obj) {
  return _toString.call(obj) === '[object Object]'
}

/**
 * Array type check
 */
export function isArray(arr) {
  return Array.isArray(arr)
}

/**
 * Array type check
 */
export function isString(str) {
  return typeof str === 'string'
}

/**
 * Undefined type check
 */
export function isUndefined(str) {
  return typeof str === 'undefined'
}
