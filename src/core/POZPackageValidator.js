import {exists, isDirectory} from '../utils/fs'
import {isFunction, isPlainObject} from '../utils/datatypes'
import {resolve} from '../utils/path'

const POZ_PACKAGE_ERROR = {
  NOT_FOUND: '%s not exist. %s',
  MUST_BE_DIRECTORY: "Expect %s is a directory.",
  MISSING_INDEX_FILE: 'Cannot resolve %s, For using POZ, the root directory of your POZ package must contain a file named "poz.js".',
  MISSING_TEMPLATE_DIRECTORY: 'Cannot resolve %s ,For using POZ, A POZ template package should contains a "template" directory which used to store the template files.',
  UNEXPECTED_INDEX_FILE: '"poz.js" must export a plain object or function'
}

function getError(key, ...args) {
  let error = POZ_PACKAGE_ERROR[key]
  if (!error) {
    throw Error(`Unknown poz error key: ${key}`)
  }
  let errorParts = error.split('%s')
  let errorString = ''
  for (var i = 0, l = errorParts.length; i < l; i++) {
    let part = errorParts[i]
    errorString = errorString + part + (args.shift() || '')
  }
  return errorString
}

export default function POZPackageValidator(pkgPath, userArgs) {
  let errorList = []

  // 1. Check if the package path exists
  if (!exists(pkgPath)) {
    errorList.push(getError('NOT_FOUND', pkgPath))
    // 2. If the package path exists, Check if the package path is a directory
  } else if (!isDirectory(pkgPath)) {
    errorList.push(getError('MUST_BE_DIRECTORY', pkgPath))
  }

  // 3. Check if 'poz.js' exists
  const POZPackageIndexFile = resolve(pkgPath, 'poz.js')
  if (!exists(POZPackageIndexFile)) {
    errorList.push(getError('MISSING_INDEX_FILE', POZPackageIndexFile))
  }

  // 4. Check if 'poz.js' exports a plain object or function
  let POZPackageConfig
  try {
    POZPackageConfig = require(POZPackageIndexFile)
    if (!isPlainObject(POZPackageConfig)) {
      if (!isFunction(POZPackageConfig)) {
        errorList.push(getError('UNEXPECTED_INDEX_FILE'))
      } else {
        POZPackageConfig = POZPackageConfig(...userArgs)
      }
    }
  } catch (error) {
    if (error.name === 'TypeError') {
      errorList.push(getError('UNEXPECTED_INDEX_FILE'))
    } else {
      throw error
    }
  }

  // 5. Check if the 'template' directory exists
  const POZTemplateDirectory = resolve(pkgPath, 'template')
  if (!exists(POZTemplateDirectory)) {
    errorList.push(getError('MISSING_TEMPLATE_DIRECTORY', POZTemplateDirectory))
  }

  return {
    errorList,
    POZPackageIndexFile,
    POZTemplateDirectory,
    POZPackageConfig
  }
}
