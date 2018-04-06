import { errorListLogger, localPackagesLogger, localPackagesValidateResultLogger } from './utils'
import { POZ, Package, PackageManager } from '../index'
const { logger, prompts } = POZ.utils

export default function (cli) {

  function logPackages() {
    let manager = new PackageManager()
    localPackagesLogger(manager.cache.getItem('packagesMap'))
  }

  return {
    alias: 'pkg',

    command: {
      name: 'package',
      opts: {
        desc: 'Manage your cached POZ packages',
      },
      handler: function (input, flags) {
        cli.showHelp()
        logPackages()
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
          logPackages()
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
            return logger.redSnow('To delete a package, you must enter a valid package name.')
          }

          let manager = new PackageManager()
          let pkg = manager.cache.getPackageByName(packageName)
          if (!pkg) {
            if (!manager.cache.isPackageDownloded(packageName)) {
              return logger.error(`Cannot delete a nonexistent package: ${logger.packageNameStyle(packageName)}`)
            } else {
              pkg = new Package({
                packageName,
                cachePath: manager.cache.getPackagePathByName(packageName)
              })
            }
          }

          return prompts.prompt({
            deleteConfirm: {
              message: `Are you sure you want to delete ${logger.packageNameStyle(packageName)}?`,
              type: 'confirm'
            }
          }).then((answers) => {
            if (answers.deleteConfirm) {
              manager.cache.removePackage(pkg)
              logger.success(`Removed ${logger.packageNameStyle(packageName)}`)
            } else {
              logger.redSnow(`Cancelled`)
            }
          })
        }
      },

      // ***************************************************
      // poz package --add={packageName} [-a]
      // ***************************************************
      {
        name: 'add',
        opts: {
          alias: 'a',
          desc: 'Add a POZ package to local cacehd directory'
        },
        handler(input, flags) {
          let requestName = flags.add
          if (!requestName.length) {
            return logger.redSnow('Please enter a valid POZ package name you want to install.')
          }

          const TIMEOUT = 60000
          let manager = new POZ.PackageManager()
          manager.fetchPkg(requestName, TIMEOUT)
            .then(pkg => {
              if (pkg) {
                const app = poz(pkg.cachePath)
                return app.launch()
              } else {
                return logger.error(`Find package ${logger.boldMagenta(requestName)} failed.`)
              }
            })
            .catch(error => {
              if (error.length && error[0] instanceof Error) {
                errorListLogger(requestName, error)
              } else {
                console.log(error)
              }
            })
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
      // poz package --test={packageName} [-v]
      // ***************************************************
      {
        name: 'check',
        opts: {
          alias: 'c',
          desc: 'validate all local POZ packages'
        },
        handler(input, flags) {
          let manager = new PackageManager()
          let packageValidationResultList = manager.cache.validateAllPackages()
          localPackagesValidateResultLogger(packageValidationResultList)
        }
      },
    ]
  }
}
