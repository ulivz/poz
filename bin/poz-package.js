const { logLocalPkgs } = require('./utils')

module.exports = function (cli, POZ) {
  const { logger } = POZ.utils

  function log() {
    let pm = POZ.PackageManager()
    logLocalPkgs(logger.table, pm.PMConfig.pkgMap)
  }

  return {
    alias: 'pkg',

    command: {
      name: 'package',
      opts: {
        desc: 'Manage your cached POZ packages',
      },
      handler: function (input, flags) {
        return log()
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
          return log()
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
          console.log('delete')
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
