import fs from '../utils/fs'
import { isFunction, isPlainObject } from '../utils/datatypes'
import { resolve } from 'path'
import { PACKAGE_ENTRY_FILE_NAME, TEMPLATE_DIRECTORY_NAME } from './presets'
import { getPackageValidateError } from './error'
import { isDev } from './env'

class POZPackageError {
  constructor(packagePath) {
    this.packagePath = packagePath
    this.errors = []
  }

  push(errorName, ...args) {
    this.errors.push(
      getPackageValidateError(errorName, ...args))
  }

  currentErrorCode() {
    return this.peek().code
  }

  currentErrorMessage() {
    return this.peek().message
  }

  peek() {
    return this.errors[0]
  }

  notEmpty() {
    return this.errors.length !== 0
  }

  throwIfError() {
    if (this.notEmpty()) {
      if (isDev) {
        throw new Error(this.currentErrorCode())
      }
      throw new Error(this.currentErrorMessage())
    }
  }
}

export function validatePackage(packagePath, {
  entryFileName = PACKAGE_ENTRY_FILE_NAME,
  templateDirName = TEMPLATE_DIRECTORY_NAME,
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
  const indexFile = resolve(packagePath, entryFileName)
  let userConfig

  if (!fs.existsSync(indexFile)) {
    error.push('MISSING_ENTRY_FILE', indexFile)
  } else {

    // 4. Check if entry file exports a plain object or function
    try {
      userConfig = require(indexFile)

      if (isPlainObject(userConfig)) {
        if (JSON.stringify(userConfig) === '{}') {
          error.push('CANNOT_EXPORT_EMPTY_OBJECT', entryFileName)
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
