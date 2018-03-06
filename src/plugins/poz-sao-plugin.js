import { PLUGIN_API, exec } from '../core/plugin-utils'

const PRESET_VERIABLES = {
  ':folderName:': '$dirname',
  ':gitUser:': '$gituser',
  ':gitEmail:': '$gitemail'
}

function normalizePrompt(prompt, context) {
  prompt = Object.assign({}, prompt)
  const defaultRealName = PRESET_VERIABLES[prompt.default]
  if (defaultRealName) {
    prompt.default = context[defaultRealName]
  }
  return prompt
}

export default function pozSaoPlugin(config, context) {
  function prompts() {
    const _prompts = config.prompts
    const newPrompts = {}
    Object.keys(_prompts).forEach(promptKey => {
      const prompt = _prompts[promptKey]
      newPrompts[promptKey] = normalizePrompt(prompt, context)
    })
  }

  function rename() {
    const { move } = config
    return move
  }

  // SAO uses filters, and POZ uses filter
  function filter() {
    const { filters } = config
    const newFilters = {}
    Object.keys(filters).forEach(key => {
      newFilters[key] = exec(context, filters[key])
    })
    return newFilters
  }

  function render(template, context) {
    return template
  }

  return {
    [PLUGIN_API.TEMPLATE_DIRECTORY_NAME]: 'template',
    [PLUGIN_API.PACKAGE_INDEX_FILE_NAME]: 'sao.js',
    prompts,
    rename,
    filter,
    render
  }
}
