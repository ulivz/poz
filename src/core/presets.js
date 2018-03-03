import fs from 'fs-extra'
import handlebars2 from 'handlebars2'
import * as string from '../utils/string'
import * as datatypes from '../utils/datatypes'
import * as shell from '../utils/child_process'
import * as prompts from '../utils/prompts'
import _ from '../logger/POZLogger'

export const EXPORTED_UTILS = {
  string,
  logger: _,
  datatypes,
  shell,
  prompts,
  fs,
  render: handlebars2.render
}

export const LIFE_CYCLE = [
  'onStart',
  'onPromptStart',
  'onPromptEnd',
  'onDestStart',
  'onDestEnd',
  'onExit'
]

export const TEMPLATE_DIRECTORY_NAME = 'template'
export const PACKAGE_INDEX_FILE_NAME = 'poz.js'
export const RENDER_ENGINE = handlebars2.render
