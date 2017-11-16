import minimatch from 'minimatch'
import {isArray, isString} from './datatypes'

export function match(path, pattern) {
  console.log(path)
  console.log(pattern)
  if (isArray(pattern)) {
    return pattern.some(subPattern => minimatch(path, subPattern))
  }
  if (isString(pattern)) {
    return minimatch(path, pattern)
  }
  throw new Error('Expect "pattern" to be string or array')
}
