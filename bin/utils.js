const chalk = require('chalk')

/**
 * Flattern local packages, used to log
 * @param packages {Array[POZPackage]}
 * @returns {Array}
 */
function flatternPkgs(packages) {
  let data = []
  Object.keys(packages).forEach((packageName, idx) => {
    const pkg = packages[packageName]
    let row = []
    row.push(packageName)
    if (pkg.git) {
      row.push('git')
    } else {
      row.push('npm')
    }
    row.push(pkg.path)
    data.push(row)
  })
  return data
}

/**
 * Log local packages
 * @param packages
 */
function logLocalPkgs(log, packages) {
  console.log('  ' + chalk.bold('local packages'.toUpperCase()))
  console.log()
  log(flatternPkgs(packages))
  console.log()
}

module.exports = {
  logLocalPkgs
}
