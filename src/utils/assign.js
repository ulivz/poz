'use strict'

// simple mutable assign
export function assign(...args) {
  args = args.filter(i => i)
  const dest = args.shift()
  args.forEach(src => {
    Object.keys(src).forEach(key => {
      dest[key] = src[key]
    })
  })

  return dest
}
