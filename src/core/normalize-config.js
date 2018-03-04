import event from './event'
import { RENDER_FAILURE, RENDER_SUCCESS } from './event-names'
import { isString, isPlainObject, isFunction, isNullOrUndefined } from '../utils/datatypes'

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

export function getNormalizedConfig(initConfig, userConfig = {}, context) {
  let { render, outDir, rename, filter } = userConfig

  if (!render) render = initConfig.render
  if (!outDir) outDir = initConfig.outDir
  if (!rename) rename = initConfig.rename
  if (!filter) filter = initConfig.filter

  if (isFunction(outDir)) outDir = outDir()
  if (isFunction(rename)) rename = rename()
  if (isFunction(filter)) filter = filter()

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

  if (!isNullOrUndefined(filter) && !isPlainObject(filter)) {
    throw new Error(
      'Expect "filter" to be a plain object or a function that returns plain object.'
    )
  }

  render = curryTransformer(render, context)

  return Object.assign({}, initConfig, {
    render,
    outDir,
    rename,
    filter
  })
}
