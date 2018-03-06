export const PLUGIN_API = {
  TEMPLATE_DIRECTORY_NAME: 'TEMPLATE_DIRECTORY_NAME',
  PACKAGE_INDEX_FILE_NAME: 'PACKAGE_INDEX_FILE_NAME',
  RENDER_ENGINE: 'RENDER_ENGINE'
}

export function exec(context, statement) {
  let result
  with (context) {
    result = eval(statement)
  }
  return result
}
