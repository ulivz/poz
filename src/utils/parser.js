import {isFunction, isRegExp} from './datatypes'

/**
 * Simple string parser
 * @param str
 * @param options {object}
 * @property options.reg {regexp} Regualr Expression to match the tag
 * @property options.onMatch {function} called when finding the match part, matching part will be passed in
 * @returns {string} new string
 */
export const simpleStringParser = (str, options) => {
  const reg = options.reg
  const onMatch = options.onMatch
  if (!isRegExp(reg) || !isFunction(onMatch)) {
    return str
  }
  let match, nStr = ''
  let start = 0
  while (match = reg.exec(str)) {
    nStr += str.slice(start, match.index) + onMatch(...match)
    start = reg.lastIndex
  }
  // reg.lastIndex will be reset as 0 when the loop ends
  nStr += str.slice(start, str.length)
  return nStr
}
