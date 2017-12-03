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

module.exports = {
  initLogger,
  localPackagesLogger
}
