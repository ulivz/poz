#!/usr/bin/env node
const cac = require('cac')
const POZ = require('../dist/poz.common.js')

const pozCommand = require('./poz')
const pozStatusCommand = require('./poz-package')

const cli = cac()

/**
 * A simple framework used to split command line files
 * @param commandFn
 */
cli.use = function (commandFn) {
  let { command, options, alias } = commandFn(cli, POZ)

  const oldCommandHandler = command.handler
  const newCommandHandler = (input, flags) => {
    for (let i = 0, l = options.length; i < l; i++) {
      let option = options[i]
      if (flags[option.name]) {
        option.handler(input, flags)
        return;
      }
    }
    oldCommandHandler(input, flags)
  }

  const cacCommand = cli.command(command.name, command.opts, newCommandHandler)

  options.forEach(option => {
    cacCommand.option(option.name, option.opts)
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
