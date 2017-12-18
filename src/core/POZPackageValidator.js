import { exists, isDirectory } from '../utils/fs'
import { isFunction, isPlainObject } from '../utils/datatypes'
import { resolve } from '../utils/path'
import env from './POZENV'
import debug from './POZDebugger'
import { getPackageValidateError } from '../error/POZError'

export default function POZPackageValidator(packagePath, userArgs) {
  debug.trace('POZPackageValidator')

  let errorList = []

  // 1. Check if the package path exists
  if (!exists(packagePath)) {
    errorList.push(getPackageValidateError('NOT_FOUND', packagePath))
    // 2. If the package path exists, Check if the package path is a directory
  } else if (!isDirectory(packagePath)) {
    errorList.push(getPackageValidateError('MUST_BE_DIRECTORY', packagePath))
  }

  // 3. Check if 'poz.js' exists
  const POZPackageIndexFile = resolve(packagePath, env.POZ_PACKAGE_INDEX_FILE_NAME)
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
        } else if (userArgs && userArgs.length) {
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
  const POZTemplateDirectory = resolve(packagePath, env.POZ_TEMPLATE_DIRECTORY_NAME)
  // when 'POZPackageConfig.dest' = false, skip this check.
  if (POZPackageConfig.dest && !exists(POZTemplateDirectory)) {
    errorList.push(getPackageValidateError('MISSING_TEMPLATE_DIRECTORY', POZTemplateDirectory))
  }

  return {
    errorList,
    POZPackageIndexFile,
    POZTemplateDirectory,
    POZPackageConfig
  }
}
