'use strict';

let _

function initLogger(logger) {
  _ = logger
}

/**
 * Flattern local packages, used to log
 * @param packages {Array[POZPackage]}
 * @returns {Array}
 */
function getPkgMapLogData(packages) {
  let data = []
  Object.keys(packages).forEach((packageName, idx) => {
    const pkg = packages[packageName]
    if (pkg.hide) {
      return;
    }
    let row = []
    row.push(packageName)
    row.push(pkg.origin)
    row.push(pkg.cachePath)
    data.push(row)
  })
  return data
}

/**
 * Log local packages
 * @param pkgMap
 */
function localPackagesLogger(pkgMap) {
  let tabledata = getPkgMapLogData(pkgMap)
  if (!tabledata.length) {
    return
  }
  // console.log()
  console.log('  ' + _.bold('local packages'.toUpperCase()))
  console.log()
  _.table(tabledata)
  console.log()
}

/**
 * errorList logger
 * @param errorList
 */
function errorListLogger(packageName, errorList) {
  _.error(`Validate package ${_.packageNameStyle(packageName)} failed, see the error message below:`)
  for (let error of errorList) {
    _.wrap()
    _.echo(_.boldRed('*') + ' ' + error.message)
  }
  _.wrap()
  _.info(`You can use ${_.packageNameStyle('poz package -delete=' + packageName)} to remove this package`)
}

/**
 * Log local packages validate result
 */
function localPackagesValidateResultLogger(packageValidationResultList) {
  for (let packageValidation of packageValidationResultList) {
    let { packageName, errorList } = packageValidation
    if (errorList.length) {
      errorListLogger(packageName, errorList)
    } else {
      _.success(`package ${_.packageNameStyle(packageName)} is a valid POZ package.`)
    }
  }
}

module.exports = {
  initLogger,
  errorListLogger,
  localPackagesLogger,
  localPackagesValidateResultLogger
}
