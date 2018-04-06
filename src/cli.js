#!/usr/bin/env node

import cac from 'cac'
import { curryUse } from './cli/utils'
import pozCommand from './cli/poz'
import pozPackageCommand from './cli/poz-package'
import pozCleanCommand from './cli/poz-clean'

const cli = cac()
cli.use = curryUse(cli)

cli
  .use(pozCommand)
  .use(pozPackageCommand)
  .use(pozCleanCommand)
  .parse()

