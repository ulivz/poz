const { logLocalPkgs } = require('./utils')

module.exports = function (cli, POZ) {
  const { logger } = POZ.utils

  return {
    alias: 'pkg',
    command: {
      name: 'package',
      opts: {
        desc: 'Manage your cached POZ packages',
      },
      handler: function (input, flags) {
        let pm = new POZ.PackageManager()
        logLocalPkgs(logger.table, pm.PMConfig.pkgMap)
      },
    },
    options: [
      {
        name: 'list',
        opts: {
          alias: '-l',
          desc: 'Show local POZ packages',
          type: 'boolean'
        }
      },
      {
        name: 'delete',
        opts: {
          alias: '-d',
          desc: 'Remove a specific POZ package',
          type: 'boolean'
        }
      },
      {
        name: 'add',
        opts: {
          alias: '-a',
          desc: 'Add a POZ package to local cacehd directory',
          type: 'boolean'
        }
      },
      {
        name: 'update',
        opts: {
          alias: '-u',
          desc: 'Update a specific POZ package or all packages',
          type: 'boolean'
        }
      },
    ]
  }

}
