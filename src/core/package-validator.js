import { exists, isDirectory } from '../utils/fs'
import { isFunction, isPlainObject } from '../utils/datatypes'
import { resolve } from '../utils/path'
import { PACKAGE_INDEX_FILE_NAME, TEMPLATE_DIRECTORY_NAME } from './poz-presets'
import debug from './POZDebugger'
import { getPackageValidateError } from '../error/POZError'

export default function POZPackageValidator(packagePath, userArgs) {
  debug.trace('POZPackageValidator')

  let errors = []

  // 1. Check if the package path exists
  if (!exists(packagePath)) {
    errors.push(getPackageValidateError('NOT_FOUND', packagePath))
    // 2. If the package path exists, Check if the package path is a directory
  } else if (!isDirectory(packagePath)) {
    errors.push(getPackageValidateError('MUST_BE_DIRECTORY', packagePath))
  }

  // 3. Check if 'poz.js' exists
  const POZPackageIndexFile = resolve(packagePath, PACKAGE_INDEX_FILE_NAME)
  let userConfig

  if (!exists(POZPackageIndexFile)) {
    errors.push(getPackageValidateError('MISSING_INDEX_FILE', POZPackageIndexFile))

  } else {

    // 4. Check if 'poz.js' exports a plain object or function
    try {
      userConfig = require(POZPackageIndexFile)
      if (!isPlainObject(userConfig)) {
        if (!isFunction(userConfig)) {
          errors.push(getPackageValidateError('UNEXPECTED_INDEX_FILE'))
        } else if (userArgs && userArgs.length) {
          userConfig = userConfig(...userArgs)
        }
      } else {
        if (JSON.stringify(userConfig) === '{}') {
          errors.push(getPackageValidateError('UNEXPECTED_INDEX_FILE'))
        }
      }
    } catch (error) {
      if (error.name === 'TypeError') {
        errors.push(getPackageValidateError('UNEXPECTED_INDEX_FILE'))
      } else {
        throw error
      }
    }
  }

  // 5. Check if the 'template' directory exists
  const POZTemplateDirectory = resolve(packagePath, TEMPLATE_DIRECTORY_NAME)
  // when 'userConfig.dest' = false, skip this check.
  if (userConfig && userConfig.dest !== false && !exists(POZTemplateDirectory)) {
    errors.push(getPackageValidateError('MISSING_TEMPLATE_DIRECTORY', POZTemplateDirectory))
  }

  return {
    errors,
    POZPackageIndexFile,
    POZTemplateDirectory,
    userConfig
  }
}
