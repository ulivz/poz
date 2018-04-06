import _ from '../logger/logger'

/**
 * Flattern cached packagesMap, used to log
 * @param packages {Array[POZPackage]}
 * @returns {Array}
 */
export function getPackagesMapLogData(packagesMap) {
  let packagesMapLogTableData = []
  Object.keys(packagesMap).forEach(packageName => {
    const pozPackage = packagesMap[packageName]
    // TODO remove it since we didn't have 'hide' package
    if (pozPackage.hide) {
      return;
    }
    let packagesMapLogTableDataRow = []
    packagesMapLogTableDataRow.push(packageName)
    packagesMapLogTableDataRow.push(pozPackage.origin)
    packagesMapLogTableDataRow.push(pozPackage.cachePath)
    packagesMapLogTableData.push(packagesMapLogTableDataRow)
  })
  return packagesMapLogTableData
}

/**
 * Log local packages
 * @param pkgMap
 */
export function localPackagesLogger(packagesMap) {
  let packagesMapLogTableData = getPackagesMapLogData(packagesMap)
  if (!packagesMapLogTableData.length) {
    return
  }
  _.echo('  ' + _.bold('local packages'.toUpperCase()))
  _.wrap()
  _.table(packagesMapLogTableData)
  _.wrap()
}

/**
 * errorList logger
 * @param errorList
 */
export function errorListLogger(packageName, errorList) {
  _.error(`package ${_.packageNameStyle(packageName)} is not a valid POZ package, see the error message below:`)
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
export function localPackagesValidateResultLogger(packageValidationResultList) {
  for (let packageValidation of packageValidationResultList) {
    let { packageName, errorList } = packageValidation
    if (errorList.length) {
      errorListLogger(packageName, errorList)
    } else {
      _.success(`package ${_.packageNameStyle(packageName)} is a valid POZ package.`)
    }
  }
}

/**
 * Curry use function for CAC.
 * @param {function(cac)} commandFn
 * @returns {cac}
 */
export function curryUse(CLI) {
  return function use(commandFn) {
    const { command, options } = commandFn(CLI)
    const oldCommandHandler = command.handler
    const newCommandHandler = (input, flags) => {
      for (let i = 0, l = options.length; i < l; i++) {
        let option = options[i]
        if (flags[option.name]) {
          option.handler(input, flags)
          return
        }
      }
      oldCommandHandler(input, flags)
    }
    const cacCommand = CLI.command(command.name, command.opts, newCommandHandler)
    options.forEach(option => cacCommand.option(option.name, option.opts))
    return CLI
  }
}
