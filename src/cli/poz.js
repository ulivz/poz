import { errorListLogger, localPackagesLogger } from './utils'
// import { exec, execSync } from '../utils'
import { POZ, PackageManager } from '../index'
import shelljs from 'shelljs'

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
          const prevCwd = process.cwd()
          pm.fetchPkg(requestName, TIMEOUT)
            .then(pkg => {
              if (pkg) {
                process.chdir(pkg.cachePath)
                shelljs.exec(`yarn`)
                process.chdir(prevCwd)
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
