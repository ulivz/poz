import errorConfig from './config_error.json'

class POZError extends Error {
  constructor(message, code) {
    super(message)
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
    errorString = errorString + part + (args.shift() || '')
  }
  return new POZError(errorString, key)
}

export function getPackageValidateError(key, ...args) {
  return getError('package_validate', key, ...args)
}
