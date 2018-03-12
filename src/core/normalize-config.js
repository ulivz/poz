import event from './event'
import { RENDER_FAILURE, RENDER_SUCCESS } from './event-names'
import { isString, isPlainObject, isFunction, isNullOrUndefined } from '../utils/datatypes'

/**
 * A curry function that accpets a pure render function, and
 * return a new function that handle the render status
 *
 * @param {Function} render A pure render function whose first
 * parameter is template string, second parameter is the
 * context, and third parameter is current vinyl file instance
 *
 * @param {Context} context
 * @returns {Function} new transform function
 */
function curryTransformer(render, context) {
  return function (content, file) {
    let renderResult
    try {
      renderResult = render(content, context, file)
      event.emit(RENDER_SUCCESS, file)
    } catch (error) {
      event.emit(RENDER_FAILURE, error, file)
    }
    return renderResult
  }
}

/**
 * Get the default rename config from the context object
 * @param {Context} context
 * @returns {Object} rename config
 */

function getDefaultRenameConfig(context) {
  const rename = {}
  Object.keys(context).forEach(key => rename[`{${key}}`] = context[key])
  return rename
}

/**
 * Merge and handle the initial config and user config
 * @param {Object} initConfig
 * @param {Object} userConfig
 * @param {Context} context
 * @returns {Object} normalized Config
 */

export function getNormalizedConfig(initConfig, userConfig = {}, context) {
  let { render, outDir, rename, filters } = userConfig

  if (!render) render = initConfig.render
  if (!outDir) outDir = initConfig.outDir
  if (!rename) rename = initConfig.rename
  if (!filters) filters = initConfig.filters

  if (isFunction(outDir)) outDir = outDir()
  if (isFunction(rename)) rename = rename()
  if (isFunction(filters)) filters = filters()

  if (!isFunction(render)) {
    throw new Error(
      'Expect "render" to be a function'
    )
  }

  if (!isNullOrUndefined(outDir) && !isString(outDir)) {
    throw new Error(
      'Expect "outDir" to be a string or a function that returns string.'
    )
  }

  if (!isNullOrUndefined(rename) && !isPlainObject(rename)) {
    throw new Error(
      'Expect "rename" to be a plain object or a function that returns plain object.'
    )
  }

  if (!isNullOrUndefined(filters) && !isPlainObject(filters)) {
    throw new Error(
      'Expect "filters" to be a plain object or a function that returns plain object.'
    )
  }

  render = curryTransformer(render, context)
  rename = Object.assign(rename || {}, getDefaultRenameConfig(context))

  return Object.assign({}, initConfig, {
    render,
    outDir,
    rename,
    filters
  })
}
