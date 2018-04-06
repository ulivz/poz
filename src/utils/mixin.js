'use strict'

/**
 * simple mutable mixin
 * @param {Object[]} args
 * @returns {*}
 */
export function mixin(...args) {
  args = args.filter(i => i)
  const dest = args.shift()
  args.forEach(src => {
    Object.keys(src).forEach(key => {
      dest[key] = src[key]
    })
  })

  return dest
}
