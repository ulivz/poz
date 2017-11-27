'use strict';

const { localPackagesLogger } = require('./utils')

module.exports = function (cli, POZ) {
  const { logger, prompts } = POZ.utils

  function logPkgs() {
    let pm = POZ.PackageManager()
    localPackagesLogger(logger.table, pm.PMConfig.pkgMap)
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
            logger.error('Please enter the name of the POZ package you want to delete')
          }

          let pm = cli.pm()
          let pkg = pm.getPkgByName(packageName)
          if (!pkg) {
            return logger.error(`Cannot delete a nonexistent package: ${logger.magenta(packageName)}`)
          }

          return prompts.prompt({
            deleteConfirm: {
              message: `Are you sure you want to delete ${logger.magenta(packageName)}?`,
              type: 'confirm'
            }
          }).then((answers) => {
            if (answers.deleteConfirm) {
              let pm = cli.pm()

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
    ]
  }

}
