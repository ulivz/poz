import handlebars2 from 'handlebars2'

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
