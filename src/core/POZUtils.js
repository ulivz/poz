import {isString, isPlainObject, isFunction, isUndefined} from '../utils/datatypes'

export function mergePOZDestConfig(destConfig, userDestConfig) {

  if (isString(userDestConfig)) {
    destConfig.target = userDestConfig
    return;
  }

  if (isFunction(userDestConfig)) {
    userDestConfig = userDestConfig()
  } else if (!isPlainObject(userDestConfig)) {
    throw new Error('Expect "dest" to be a string, function or a plain object')
  }

  Object.keys(destConfig).forEach(key => {
    if (!isUndefined(userDestConfig[key])) {
      destConfig[key] = userDestConfig[key]
    }
  });

  if (!isFunction(destConfig.render)) {
    throw new Error('Expect "dest.render" to be a function')
  }
}

export function pkgFinder(pkgMap, requestName) {
  if (pkgMap[requestName]) {
    return pkgMap[requestName]
  }
  for (let pkgName of Object.keys(pkgMap)) {
    let pkg = pkgMap[pkgName]
    if (pkg.requestName === requestName ||
      pkg.name === requestName
    ) {
      return pkg
    }
  }
  return null
}





