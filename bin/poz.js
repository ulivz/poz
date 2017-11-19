#!/usr/bin/env node

const cac = require('cac')
const ora = require('ora')
const POZ = require('../dist/poz.common.js')

const cli = cac()

// Add a default command
const POZDefaultCommand = cli.command('*', {
  desc: 'Programmable scaffolding generator'
}, (input, flags) => {
  let pm = new POZ.PackageManager()
  pm.initEnv()
  if (!input.length) {
    // log existing packages
    console.log(pm.pmConfig)
  } else {
    let pkgname = input[0]
    const spinner = ora(`Fetching ${pkgname} ....`).start();
    pm.savePkg(pkgname).then((pkg) => {
      spinner.stop()
      spinner.succeed('Successfully fetch POZ package: ' + pkg.packageName)
      console.log(pkg.path)
      let app = new POZ(pkg.path)
      return app.start()
    }).catch(err => {
      console.log(err)
    })
  }
})

POZDefaultCommand.option('age', {
  desc: 'tell me the age'
})

// Add a sub command
cli.command('bob', {
  desc: 'Command for bob'
}, () => {
  console.log('This is a command dedicated to bob!')
})

// Bootstrap the CLI app
cli.parse()
