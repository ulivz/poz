import * as errorConfig from './error-config'
import { logger } from '../utils/index'

export default class POZError extends Error {
  constructor(message, code) {
    super(message)
    this.code = code
  }
}

export function getError(key, ...args) {
  let error = errorConfig[key]
  if (!error) {
    throw Error(`Unknown POZ error key: ${key}`)
  }
  let errorParts = error.split('%s')
  let errorString = ''
  for (var i = 0, l = errorParts.length; i < l; i++) {
    let part = errorParts[i]
    errorString = errorString + part + (logger.errorItemStyle(args.shift() || ''))
  }
  return new POZError(errorString, key)
}

export function getPackageValidateError(key, ...args) {
  return getError(key, ...args)
}


