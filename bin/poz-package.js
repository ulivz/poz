'use strict';

const { localPackagesLogger } = require('./utils')

module.exports = function (cli, POZ) {
  const { logger, prompts } = POZ.utils

  function logPkgs() {
    let pm = POZ.PackageManager()
    localPackagesLogger(logger.table, pm.cache.getItem('packagesMap'))
  }

  /**
   * Log local packages validate result
   */
  function localPackagesValidateResultLogger(packageValidationResultList) {
    for (let packageValidation of packageValidationResultList) {
      let { packageName, errorList } = packageValidation
      if (errorList.length) {
        logger.error(`Validate package ${logger.boldMagenta(packageName)} failed, see the error message below:`)
        for (let error of errorList) {
          logger.wrap()
          logger.echo(logger.boldRed('*') + ' ' + error.message)
        }
        logger.wrap()
        logger.info(`You can use ${logger.boldMagenta('poz package -delete=' + packageName)} to remove this package`)
      } else {
        logger.success(`package ${logger.boldMagenta(packageName)} is a valid POZ package.`)
      }
    }
  }

  return {
    alias: 'pkg',

    command: {
      name: 'package',
      opts: {
        desc: 'Manage your cached POZ packages',
      },
      handler: function (input, flags) {
        return logPkgs()
      },
    },

    options: [
      // ***************************************************
      // poz package --list [-l]
      // ***************************************************
      {
        name: 'list',
        opts: {
          alias: 'l',
          desc: 'Show local POZ packages'
        },
        handler(input, flags) {
          return logPkgs()
        }
      },

      // ***************************************************
      // poz package --delete={packageName} [-d]
      // ***************************************************
      {
        name: 'delete',
        opts: {
          alias: 'd',
          desc: 'Remove a specific POZ package'
        },
        handler(input, flags) {
          let packageName = flags.delete

          if (!packageName.length) {
            return logger.error('Please enter the name of the POZ package you want to delete')
          }

          let pm = cli.pm()
          let pkg = pm.cache.getPackageByName(packageName)
          if (!pkg) {
            if (!pm.cache.isPackageDownloded(packageName)) {
              return logger.error(`Cannot delete a nonexistent package: ${logger.magenta(packageName)}`)
            } else {
              pkg = pm.constructorPOZPackage({
                packageName,
                cachePath: pm.cache.getPackagePathByName(packageName)
              })
            }
          }

          return prompts.prompt({
            deleteConfirm: {
              message: `Are you sure you want to delete ${logger.magenta(packageName)}?`,
              type: 'confirm'
            }
          }).then((answers) => {
            if (answers.deleteConfirm) {
              pm.cache.removePackage(pkg)
              logger.success(`Removed ${logger.magenta(packageName)}`)
            } else {
              logger.info(`Cancelled`)
            }
          })
        }
      },

      // ***************************************************
      // poz package --add={packageName} [-a]
      // ***************************************************
      {
        name: 'install',
        opts: {
          alias: 'i',
          desc: 'Add a POZ package to local cacehd directory'
        },
        handler(input, flags) {
          console.log('add')
        }
      },

      // ***************************************************
      // poz package --update={packageName} [-u]
      // ***************************************************
      {
        name: 'update',
        opts: {
          alias: 'u',
          desc: 'Update a specific POZ package or all packages'
        },
        handler(input, flags) {
          console.log('update')
        }
      },

      // ***************************************************
      // poz package --validate={packageName} [-v]
      // ***************************************************
      {
        name: 'validate',
        opts: {
          alias: 'v',
          desc: 'validate all local POZ packages'
        },
        handler(input, flags) {
          let pm = cli.pm()
          let packageValidationResultList = pm.cache.validateAllPackages()
          localPackagesValidateResultLogger(packageValidationResultList)
        }
      },
    ]
  }

}
