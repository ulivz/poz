const { logLocalPkgs } = require('./utils')

module.exports = function (cli, POZ) {
  const { logger } = POZ.utils

  return {
    command: {
      name: 'package',
      opts: {
        desc: 'Manage your cached POZ packages',
      },
      handler: function (input, flags) {
        let pm = new POZ.PackageManager()
        console.log()
        logLocalPkgs(logger.table, pm.PMConfig.pkgMap)
      },
    },
    options: [
      {
        name: 'add',
        opts: {
          alias: '-a',
          desc: 'Add a POZ package to local cacehd directory',
          type: 'boolean'
        }
      },
      {
        name: 'delete',
        opts: {
          alias: '-d',
          desc: 'Delete a local package',
          type: 'boolean'
        }
      }
    ]
  }

}
