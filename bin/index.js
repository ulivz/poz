#!/usr/bin/env node
const cac = require('cac')
const POZ = require('../dist/poz.common.js')

const pozCommand = require('./poz')
const pozStatusCommand = require('./poz-package')

const cli = cac()

cli.use = function (commandFn) {
  let { command, options } = commandFn(cli, POZ)
  const _command = cli.command(command.name, command.opts, command.handler)
  options.forEach(option => {
    _command.option(option.name, option.opts)
  })
  return cli
}

cli
  .use(pozCommand)
  .use(pozStatusCommand)
  .parse()
