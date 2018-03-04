#!/usr/bin/env node
const cac = require('cac')
const { POZ } = require('../dist/poz.cjs.js')

const pozCommand = require('./poz')
const pozPackageCommand = require('./poz-package')
const pozCleanCommand = require('./poz-clean')

const utils = require('./utils')
utils.initLogger(POZ.utils.logger)

const cli = cac()

/**
 * A simple framework used to split command line files
 * @param commandFn
 */
cli.use = function (commandFn) {
  let { command, options, alias } = commandFn(cli)

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

const { logger } = POZ.utils

cli.logger = logger

cli
  .use(pozCommand)
  .use(pozPackageCommand)
  .use(pozCleanCommand)
  .parse()

