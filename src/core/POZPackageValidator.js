import _ from 'chalk'
import {exists, isDirectory} from '../utils/fs'
import {isFunction, isPlainObject} from '../utils/datatypes'
import {resolve} from '../utils/path'
import env from './POZENV'

// Color - Error A
const _E_A = msg => _.bold(_.redBright(msg))
// Color - Error A Static
const _E_A_S = _E_A('%s')

// Color - Error B
const _E_B = msg => _.bold(_.yellowBright(msg))
// Color - Error B Static
const _E_A_B = _E_A('%s')

const POZ_PACKAGE_ERROR = {

  NOT_FOUND: `<${_E_A_S} not exist.`,

  MUST_BE_DIRECTORY: `Expect ${_E_A_S} is a directory.`,

  MISSING_INDEX_FILE: `Cannot resolve ${_E_A_S}, \nFor using POZ, the root directory of your POZ package must contain a file named ${_E_A('poz.js')}`,

  MISSING_TEMPLATE_DIRECTORY: `Cannot resolve ${_E_A_S}, \nFor using POZ, A POZ template package should contains a ${_E_A('template')} directory which used to store the template files.`,

  UNEXPECTED_INDEX_FILE: `${_E_A("poz.js")} must export a plain object or function`
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
  errorString = _E_B('POZ Error') + ': ' + errorString
  return {
    message: errorString,
    code: key
  }
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
  const POZPackageIndexFile = resolve(pkgPath, env.POZ_PACKAGE_INDEX_FILE_NAME)
  let POZPackageConfig

  if (!exists(POZPackageIndexFile)) {
    errorList.push(getError('MISSING_INDEX_FILE', POZPackageIndexFile))

  } else {

    // 4. Check if 'poz.js' exports a plain object or function
    try {
      POZPackageConfig = require(POZPackageIndexFile)
      if (!isPlainObject(POZPackageConfig)) {
        if (!isFunction(POZPackageConfig)) {
          errorList.push(getError('UNEXPECTED_INDEX_FILE'))
        } else {
          POZPackageConfig = POZPackageConfig(...userArgs)
        }
      } else {
        if (JSON.stringify(POZPackageConfig) === '{}') {
          errorList.push(getError('UNEXPECTED_INDEX_FILE'))
        }
      }
    } catch (error) {
      if (error.name === 'TypeError') {
        errorList.push(getError('UNEXPECTED_INDEX_FILE'))
      } else {
        throw error
      }
    }
  }

  // 5. Check if the 'template' directory exists
  const POZTemplateDirectory = resolve(pkgPath, env.POZ_TEMPLATE_DIRECTORY_NAME)
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
