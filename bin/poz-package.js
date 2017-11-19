const { logLocalPkgs } = require('./utils')

module.exports = function (cli, POZ) {
  const { logger } = POZ.utils

  return {
    command: {
      name: 'package',
      opts: {
        desc: 'Show cached POZ packages',
      },
      handler: function (input, flags) {
        let pm = new POZ.PackageManager()
        console.log()
        logLocalPkgs(logger.table, pm.pmConfig.packages)
      },
    },
    options: [
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
