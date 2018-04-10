import fs from '../utils/fs'
import { isFunction, isPlainObject } from '../utils/datatypes'
import { resolve } from 'path'
import { PACKAGE_ENTRY_FILE_NAME, TEMPLATE_DIRECTORY_NAME } from './presets'
import { getPackageValidateError } from './error'
import { isDev } from './env'

class POZPackageError {
  constructor(src) {
    this.src = src
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

export default function validatePackage(src, {
  entryFileName = [],
  templateDirName,
  exportArguements = []
} = {}) {
  const error = new POZPackageError()
  // 1. Check if the package path exists
  if (!fs.existsSync(src)) {
    error.push('NOT_FOUND', src)

    // 2. If the package path exists, Check if the package path is a directory
  } else if (!fs.isDirectory(src)) {
    error.push('MUST_BE_DIRECTORY', src)
  }

  // 3. Check if entry file exists
  let entryFile
  let userConfig

  for (const filename of entryFileName) {
    entryFile = resolve(src, filename)
    if (fs.existsSync(entryFile)) {
      try {
        userConfig = require(entryFile)
      } catch (error) {
        if (error.name === 'TypeError') {
          error.push('ENTRY_FILE_THROW_ERROR')
          console.log('\n')
          console.log(error)
        } else {
          throw error
        }
      }
      break
    }
  }

  if (!userConfig) {
    error.push('MISSING_ENTRY_FILE')
  } else {
    if (isPlainObject(userConfig)) {
      if (JSON.stringify(userConfig) === '{}') {
        error.push('CANNOT_EXPORT_EMPTY_OBJECT', entryFileName)
      }
    } else if (isFunction(userConfig)) {
      userConfig = userConfig(...exportArguements)
    } else {
      error.push('UNEXPECTED_ENTRY_FILE')
    }
  }

  // 5. Check if the 'template' directory exists
  const templateDir = resolve(src, templateDirName)

  if (userConfig && !fs.existsSync(templateDir)) {
    // when 'userConfig.noTemplate' = true, means that this package is an non-template package.
    // So skip this check
    if (!userConfig.noTemplate) {
      error.push('MISSING_TEMPLATE_DIRECTORY', templateDir)
    }
  }

  return {
    error,
    entryFile,
    templateDir,
    userConfig
  }
}
