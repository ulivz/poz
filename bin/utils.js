const chalk = require('chalk')

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
    row.push(pkg.path)
    data.push(row)
  })
  return data
}

/**
 * Log local packages
 * @param pkgMap
 */
function localPackagesLogger(log, pkgMap) {
  let tabledata = getPkgMapLogData(pkgMap)
  if (!tabledata.length) {
    return
  }
  console.log()
  console.log('  ' + chalk.bold('local packages'.toUpperCase()))
  console.log()
  log(tabledata)
  console.log()
}

module.exports = {
  localPackagesLogger
}
