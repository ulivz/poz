#!/usr/bin/env node

import cac from 'cac'
import { POZ } from './index'
import pozCommand from './cli/poz'
import pozPackageCommand from './cli/poz-package'
import pozCleanCommand from './cli/poz-clean'

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

