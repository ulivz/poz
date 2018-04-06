import { errorListLogger, localPackagesLogger } from './utils'
import { POZ, PackageManager } from '../index'

export default function (cli) {
  return {
    command: {
      name: '*',
      opts: {
        desc: 'Programmable scaffolding generator',
      },
      handler(input, flags) {
        const pm = new PackageManager()

        if (!input.length) {
          cli.showHelp()
          localPackagesLogger(pm.cache.getItem('packagesMap'))

        } else {
          const requestName = input[0]
          const TIMEOUT = 60000
          pm.fetchPkg(requestName, TIMEOUT)
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
