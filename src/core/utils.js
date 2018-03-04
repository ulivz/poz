import { isString, isPlainObject, isFunction, isUndefined } from '../utils/datatypes'

export function assert(condition, msg) {
  if (!condition) throw new Error(`[poz] ${msg}`)
}

export function consolelog(condition, msg) {
  if (condition) console.log(msg)
}
