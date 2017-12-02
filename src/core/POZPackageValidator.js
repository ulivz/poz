import {exists, isDirectory} from '../utils/fs'
import {isFunction, isPlainObject} from '../utils/datatypes'
import {resolve} from '../utils/path'
import env from './POZENV'
import debug from './POZDebugger'
import {getPackageValidateError} from '../error/POZError'

export default function POZPackageValidator(pkgPath, userArgs) {
  debug.trace('POZPackageValidator')

  let errorList = []

  // 1. Check if the package path exists
  if (!exists(pkgPath)) {
    errorList.push(getPackageValidateError('NOT_FOUND', pkgPath))
    // 2. If the package path exists, Check if the package path is a directory
  } else if (!isDirectory(pkgPath)) {
    errorList.push(getPackageValidateError('MUST_BE_DIRECTORY', pkgPath))
  }

  // 3. Check if 'poz.js' exists
  const POZPackageIndexFile = resolve(pkgPath, env.POZ_PACKAGE_INDEX_FILE_NAME)
  let POZPackageConfig

  if (!exists(POZPackageIndexFile)) {
    errorList.push(getPackageValidateError('MISSING_INDEX_FILE', POZPackageIndexFile))

  } else {

    // 4. Check if 'poz.js' exports a plain object or function
    try {
      POZPackageConfig = require(POZPackageIndexFile)
      if (!isPlainObject(POZPackageConfig)) {
        if (!isFunction(POZPackageConfig)) {
          errorList.push(getPackageValidateError('UNEXPECTED_INDEX_FILE'))
        } else {
          POZPackageConfig = POZPackageConfig(...userArgs)
        }
      } else {
        if (JSON.stringify(POZPackageConfig) === '{}') {
          errorList.push(getPackageValidateError('UNEXPECTED_INDEX_FILE'))
        }
      }
    } catch (error) {
      if (error.name === 'TypeError') {
        errorList.push(getPackageValidateError('UNEXPECTED_INDEX_FILE'))
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
