/**
 * Camelize a hyphen-delimited string.
 */
const camelizeRE = /-(\w)/g
export function camelize(str) {
  return str.replace(camelizeRE, (_, c) => {
    return c ? c.toUpperCase() : ''
  })
}

/**
 * Hyphenate a camelCase string.
 */
const hyphenateRE = /\B([A-Z])/g
export function hyphenate(str) {
  return str.replace(hyphenateRE, '-$1').toLowerCase()
}

/**
 * Split a camelCase string by specified seperator
 */
export function splitCamelCase(str, sep) {
  return str.replace(hyphenateRE, `${sep || ' '}$1`).toLowerCase()
}


export function capitailize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
