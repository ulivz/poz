import errorConfig from './config_error.json'
import logger from '../logger/POZLogger'

export class POZError extends Error {
  constructor(message, code) {
    super()
    Error.captureStackTrace(this)
    this.message = message
    this.code = code
    this.name = 'POZError'
  }
}

export function getError(type, key, ...args) {
  let error = errorConfig[type][key]
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
  return getError('package_validate', key, ...args)
}
