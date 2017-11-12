import minimatch from 'minimatch'
import {isArray, isString} from './datatypes'

export function isPathMatch(path, pattern) {
  if (isArray(pattern)) {
    return pattern.some(subPattern => minimatch(path, subPattern))
  }
  if (isString(pattern)) {
    return minimatch(path, pattern)
  }
  throw new Error('Expect "pattern" to be string or array')
}
