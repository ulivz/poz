import {isString, isPlainObject, isFunction, isUndefined} from '../utils/datatypes'
import POAError from './POAError.js'

export function mergePOADestConfig(destConfig, userDestConfig) {

  if (isString(userDestConfig)) {
    destConfig.target = userDestConfig
    return;
  }

  if (isFunction(userDestConfig)) {
    userDestConfig = userDestConfig()
  } else if (!isPlainObject(userDestConfig)) {
    throw new POAError('Expect "dest" to be a string, function or a plain object')
  }

  Object.keys(destConfig).forEach(key => {
    destConfig[key] = userDestConfig[key]
  });

  if (!isFunction(destConfig.render)) {
    throw new POAError('Expect "dest.render" to be a function')
  }
}
