#!/usr/bin/env node
const cac = require('cac')
const ora = require('ora')
const POZ = require('../dist/poz.common.js')

const cli = cac()

function defaultHandler(input, flags) {
  let pm = new POZ.PackageManager()
  if (!input.length) {
    // log existing packages
    console.log(pm.pmConfig)
  } else {
    let pkgname = input[0]
    const spinner = ora(`Fetching ${pkgname} ....`).start();
    console.log()

    pm.fetchPkg(pkgname)
      .then((pkg) => {
        spinner.stop()
        const app = new POZ(pkg.path)
        return app.start()
      }).catch(err => {
      throw err
    })
  }
}

// Add a default command
const POZDefaultCommand
  = cli.command('*', { desc: 'Programmable scaffolding generator' }, defaultHandler)

POZDefaultCommand
  .option('delete', {
    alias: '-d',
    desc: 'Delete a downloaded package',
    type: 'boolean'
  })
  .option('local', {
    alias: '-l',
    desc: 'Use a local POZ package',
    type: 'boolean'
  })

// Add a sub command
cli.command('bob', {
  desc: 'Command for bob'
}, () => {
  console.log('This is a command dedicated to bob!')
})

// Bootstrap the CLI app
cli.parse()
