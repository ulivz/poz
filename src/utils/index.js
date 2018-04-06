import { mixin } from './mixin'
import { exec, execSync } from './child_process'
import { getGitUser } from './git'
import { match } from './minimatch'
import { npmInstall, yarnInstall } from './npm'
import { simpleStringParser } from './parser'
import { getPkg } from './pkg'
import { promisify } from './promise'
import { assert, consolelog } from './assert'

import * as string from './string'
import * as prompts from './prompts'
import * as datatypes from './datatypes'

import fs from './fs'
import logger from './logger'

export {
  mixin,
  exec,
  execSync,
  getGitUser,
  match,
  npmInstall,
  yarnInstall,
  simpleStringParser,
  getPkg,
  promisify,
  assert,
  consolelog,
  string,
  prompts,
  datatypes,
  fs,
  logger
}

export default {
  mixin,
  exec,
  execSync,
  getGitUser,
  match,
  npmInstall,
  yarnInstall,
  simpleStringParser,
  getPkg,
  promisify,
  assert,
  consolelog,
  string,
  prompts,
  datatypes,
  fs,
  logger
}

