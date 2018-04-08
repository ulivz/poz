import fs from '../utils/fs'
import { isFunction, isPlainObject } from '../utils/datatypes'
import { resolve } from 'path'
import { PACKAGE_ENTRY_FILE_NAME, TEMPLATE_DIRECTORY_NAME } from './presets'
import { getPackageValidateError } from './error'

class POZPackageError {
  constructor(packagePath) {
    this.packagePath = packagePath
    this.errors = []
  }

  push(errorName, ...args) {
    this.errors.push(
      getPackageValidateError(errorName, ...args))
  }

  peek() {
    return this.errors[0]
  }

  isEmpty() {
    return this.errors.length === 0
  }
}

export function validatePackage(packagePath, {
  EntryFileName,
  templateDirName,
  exportArguements = []
} = {}) {
  const error = new POZPackageError()
  // 1. Check if the package path exists
  if (!fs.existsSync(packagePath)) {
    error.push('NOT_FOUND', packagePath)

    // 2. If the package path exists, Check if the package path is a directory
  } else if (!fs.isDirectory(packagePath)) {
    error.push('MUST_BE_DIRECTORY', packagePath)
  }

  // 3. Check if entry file exists
  const indexFile = resolve(packagePath, EntryFileName)
  let userConfig

  if (!fs.existsSync(indexFile)) {
    error.push('MISSING_ENTRY_FILE', indexFile)
  } else {

    // 4. Check if entry file exports a plain object or function
    try {
      userConfig = require(indexFile)

      if (isPlainObject(userConfig)) {
        if (JSON.stringify(userConfig) === '{}') {
          error.push('CANNOT_EXPORT_EMPTY_OBJECT', EntryFileName)
        }
      } else if (isFunction(userConfig)) {
        userConfig = userConfig(...exportArguements)
      } else {
        error.push('UNEXPECTED_ENTRY_FILE')
      }
    } catch (error) {
      if (error.name === 'TypeError') {
        error.push('ENTRY_FILE_THROW_ERROR')
        console.log('\n')
        console.log(error)
      } else {
        throw error
      }
    }
  }

  // 5. Check if the 'template' directory exists
  const templateDir = resolve(packagePath, templateDirName)


  if (userConfig && !fs.existsSync(templateDir)) {
    // when 'userConfig.noTemplate' = true, means that this package is an non-template package.
    // So skip this check
    if (!userConfig.noTemplate) {
      error.push('MISSING_TEMPLATE_DIRECTORY', templateDir)
    }
  }

  return {
    error,
    indexFile,
    templateDir,
    userConfig
  }
}

export default function PackageValidator(packagePath, userArgs) {

  const errors = []

  // 1. Check if the package path exists
  if (!fs.existsSync(packagePath)) {
    errors.push(getPackageValidateError('NOT_FOUND', packagePath))
    // 2. If the package path exists, Check if the package path is a directory
  } else if (!fs.isDirectory(packagePath)) {
    errors.push(getPackageValidateError('MUST_BE_DIRECTORY', packagePath))
  }

  // 3. Check if 'poz.js' exists
  const indexFile = resolve(packagePath, PACKAGE_ENTRY_FILE_NAME)
  let userConfig

  if (!fs.existsSync(indexFile)) {
    errors.push(getPackageValidateError('MISSING_ENTRY_FILE', indexFile))

  } else {

    // 4. Check if 'poz.js' exports a plain object or function
    try {
      userConfig = require(indexFile)
      if (!isPlainObject(userConfig)) {
        if (!isFunction(userConfig)) {
          errors.push(getPackageValidateError('UNEXPECTED_ENTRY_FILE'))
        } else if (userArgs && userArgs.length) {
          userConfig = userConfig(...userArgs)
        }
      } else {
        if (JSON.stringify(userConfig) === '{}') {
          errors.push(getPackageValidateError('UNEXPECTED_ENTRY_FILE'))
        }
      }
    } catch (error) {
      if (error.name === 'TypeError') {
        errors.push(getPackageValidateError('UNEXPECTED_ENTRY_FILE'))
        console.log(error)
      } else {
        throw error
      }
    }
  }

  // 5. Check if the 'template' directory exists
  const templateDir = resolve(packagePath, TEMPLATE_DIRECTORY_NAME)
  // when 'userConfig.dest' = false, skip this check.
  if (userConfig && userConfig.dest !== false && !fs.existsSync(templateDir)) {
    errors.push(getPackageValidateError('MISSING_TEMPLATE_DIRECTORY', templateDir))
  }

  return {
    errors,
    indexFile,
    templateDir,
    userConfig
  }
}
