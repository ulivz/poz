import { errorListLogger, localPackagesLogger } from './utils'
import { POZ, Package, PackageManager } from '../index'

const { logger } = POZ.utils

export default function (cli) {
  return {
    command: {
      name: '*',
      opts: {
        desc: 'Programmable scaffolding generator',
      },
      handler: function (input, flags) {

        // Implementation for alias
        if (cli.aliasMap[input[0]]) {
          let argv = process.argv.slice(2)
          argv[0] = cli.aliasMap[input[0]]
          return cli.parse(argv)
        }

        let manager = new PackageManager()
        if (!input.length) {
          cli.showHelp()
          localPackagesLogger(manager.cache.getItem('packagesMap'))

        } else {
          const requestName = input[0]
          const TIMEOUT = 60000
          manager.fetchPkg(requestName, TIMEOUT)
            .then(pkg => {
              if (pkg) {
                const app = new POZ(pkg.cachePath)
                return app.launch()
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
      }
    },
    options: [
      {
        name: 'local',
        opts: {
          alias: '-l',
          desc: 'Use a local poz package',
          type: 'boolean'
        }
      }
    ]
  }
}
