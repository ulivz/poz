import {exists, isDirectory} from '../utils/fs'
import {resolve} from '../utils/path'

const POZ_PACKAGE_ERROR = {
  NOT_FOUND: '%s not exist. %s',
  MUST_BE_DIRECTORY: "Expect %s is a directory.",
  MISSING_INDEX_FILE: 'Cannot resolve %s, For using POZ, the root directory of your POZ package must contain a file named "poz.js".',
  MISSING_TEMPLATE_DIRECTORY: 'Cannot resolve %s ,For using POZ, A POZ template package should contains a "template" directory which used to store the template files.'
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

export default function POZPackageValidator(pkgPath) {
  let errorList = []

  if (!exists(pkgPath)) {
    errorList.push(getError('NOT_FOUND', pkgPath))

  } else if (!isDirectory(pkgPath)) {
    errorList.push(getError('MUST_BE_DIRECTORY', pkgPath))
  }

  const POZPackageIndexFile = resolve(pkgPath, 'poz.js')
  if (!exists(POZPackageIndexFile)) {
    errorList.push(getError('MISSING_INDEX_FILE', POZPackageIndexFile))
  }

  const POZTemplateDirectory = resolve(pkgPath, 'template')
  if (!exists(POZTemplateDirectory)) {
    errorList.push(getError('MISSING_TEMPLATE_DIRECTORY', POZTemplateDirectory))
  }

  return {
    errorList,
    POZPackageIndexFile,
    POZTemplateDirectory
  }
}
