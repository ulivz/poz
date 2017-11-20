const { logLocalPkgs } = require('./utils')

module.exports = function (cli, POZ) {
  const { logger } = POZ.utils

  return {
    command: {
      name: '*',
      opts: {
        desc: 'Programmable scaffolding generator',
      },
      handler: function (input, flags) {

        let pm = new POZ.PackageManager()
        if (!input.length) {
          cli.showHelp()
          logLocalPkgs(logger.table, pm.PMConfig.pkgMap)

        } else {
          let pkgname = input[0]
          pm.fetchPkg(pkgname)
            .then(pkg => {
              if (pkg) {
                const app = new POZ(pkg.path)
                return app.start()
              }
            })
        }
      }
    },
    options: [
      {
        name: 'local',
        opts: {
          alias: '-l',
          desc: 'Use a local POZ package',
          type: 'boolean'
        }
      }
    ]
  }
}
