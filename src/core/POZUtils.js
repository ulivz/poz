import {isString, isPlainObject, isFunction, isUndefined} from '../utils/datatypes'

export function mergePOZDestConfig(dest, override = {}) {

  if (isString(override)) {
    dest.target = override
    return;
  }

  if (isFunction(override)) {
    override = override()
  } else if (!isPlainObject(override)) {
    throw new Error('Expect "dest" to be a string, function or a plain object')
  }

  Object.keys(dest).forEach(key => {
    if (!isUndefined(override[key])) {
      dest[key] = override[key]
    }
  });

  if (!isFunction(dest.render)) {
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





