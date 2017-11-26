#!/usr/bin/env node
const cac = require('cac')
const POZ = require('../dist/poz.common.js')

const pozCommand = require('./poz')
const pozStatusCommand = require('./poz-package')

const cli = cac()

cli.use = function (commandFn) {
  let { command, options, alias } = commandFn(cli, POZ)
  const _command = cli.command(command.name, command.opts, command.handler)
  options.forEach(option => {
    _command.option(option.name, option.opts)
  })
  if (alias) {
    if (!cli.aliasMap) {
      cli.aliasMap = {}
    }
    cli.aliasMap[alias] = command.name
  }
  return cli
}

cli
  .use(pozCommand)
  .use(pozStatusCommand)
  .parse()
