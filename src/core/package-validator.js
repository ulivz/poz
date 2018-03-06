import { exists, isDirectory } from '../utils/fs'
import { isFunction, isPlainObject } from '../utils/datatypes'
import { resolve } from '../utils/path'
import { PACKAGE_INDEX_FILE_NAME, TEMPLATE_DIRECTORY_NAME } from './presets'
import { getPackageValidateError } from '../error/error'

export default function PackageValidator(packagePath, userArgs) {

  const errors = []

  // 1. Check if the package path exists
  if (!exists(packagePath)) {
    errors.push(getPackageValidateError('NOT_FOUND', packagePath))
    // 2. If the package path exists, Check if the package path is a directory
  } else if (!isDirectory(packagePath)) {
    errors.push(getPackageValidateError('MUST_BE_DIRECTORY', packagePath))
  }

  // 3. Check if 'poz.js' exists
  const packageIndexFile = resolve(packagePath, PACKAGE_INDEX_FILE_NAME)
  let userConfig

  if (!exists(packageIndexFile)) {
    errors.push(getPackageValidateError('MISSING_INDEX_FILE', packageIndexFile))

  } else {

    // 4. Check if 'poz.js' exports a plain object or function
    try {
      userConfig = require(packageIndexFile)
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
        console.log(error)
      } else {
        throw error
      }
    }
  }

  // 5. Check if the 'template' directory exists
  const packageTemplateDir = resolve(packagePath, TEMPLATE_DIRECTORY_NAME)
  // when 'userConfig.dest' = false, skip this check.
  if (userConfig && userConfig.dest !== false && !exists(packageTemplateDir)) {
    errors.push(getPackageValidateError('MISSING_TEMPLATE_DIRECTORY', packageTemplateDir))
  }

  return {
    errors,
    packageIndexFile,
    packageTemplateDir,
    userConfig
  }
}
