import alphax from 'alphax'
import { relative } from 'path'
import { getNormalizedConfig } from './normalize-config'
import { RENDER_ENGINE, LIFE_CYCLE } from './presets'
import { RENDER_FAILURE, RENDER_SUCCESS } from './event-names'
import { isDev, isTest } from './env'
import * as env from './env'
import * as presets from './presets'
import event from './event'
import Context from './context.js'
import packageValidator from './package-validator'
import { getPackageValidateError } from './error'
import utils, { logger as log, fs, prompts, datatypes, consolelog, assert, getGitUser } from '../utils/index'

const { promptsRunner, mockPromptsRunner, promptsTransformer } = prompts
const { isFunction, isArray, isPlainObject } = datatypes

/**
 * This function was for resolving the package. A relative or absolute path to the target package
 * should be given, then the package's info will be return.
 */
function resolvePackage(packagePath, {
  packageEntryFileName = 'poz.js',
  templateDirName = 'template'
}) {

}

function POZ(packageSourceDir, { write = true } = {}) {

  if (arguments[1] === false) {
    write = false
  }

  const cwd = process.cwd()
  const context = Context()

  let normalizedConfig
  let user
  let status
  let app

  const {
    errors,
    packageTemplateDir,
    userConfig
  } = packageValidator(packageSourceDir, [context, utils])

  function throwIfError() {
    if (errors.length) {
      if (isDev) {
        throw new Error(errors.shift().code)
      }
      throw new Error(errors.shift().message)
    }
  }

  function initializeContext() {
    user = getGitUser()
    context.assign({
      $cwd: cwd,
      $env: env,
      $dirname: cwd.slice(cwd.lastIndexOf('/') + 1),
      $gituser: user.name,
      $gitemail: user.email,
      $sourceDir: packageSourceDir
    })
  }

  function bindHookListener() {
    for (const hookname of LIFE_CYCLE) {
      const handler = userConfig[hookname]
      if (!handler) {
        continue
      }
      if (isFunction(handler)) {
        event.on(hookname, (...args) => {
          consolelog(isTest, `Running ${log.cyan(hookname)} ...`)
          status = hookname
          handler(...args)
        })
      } else {
        consolelog(isTest, `Expect ${log.cyan(hookname)} to be a function`)
      }
    }
  }

  function handleRenderSuccess(file) {
    let filePath = relative(packageTemplateDir, file.path)
    log.success(`render ${log.cyan(filePath)}`)
  }

  function handleRenderFailure(error, file) {
    let filePath = relative(packageTemplateDir, file.path)
    log.error(`render ${log.cyan(filePath)}`)
    log.echo(error)
  }

  function disposeUserConfig() {
    normalizedConfig = getNormalizedConfig(
      {
        outDir: cwd,
        filters: null,
        rename: null,
        render: RENDER_ENGINE
      },
      userConfig,
      context
    )
    context.set('$config', normalizedConfig)
  }

  function prompt() {
    event.emit('onPromptStart')
    let { prompts } = userConfig
    const promptsMetadata = isFunction(prompts) ? prompts() : prompts
    prompts = promptsTransformer(promptsMetadata)
    const envPromptsRunner = isTest
      ? mockPromptsRunner
      : promptsRunner
    return envPromptsRunner(prompts)
  }

  function dest() {
    app = alphax()
    const { rename, filters, render, outDir } = normalizedConfig
    app.src(packageTemplateDir + '/**', {
      baseDir: packageTemplateDir,
      rename,
      filters,
      transform: render
    })
    return app.dest(outDir || '.', { write })
      .then(() => app.fileMap())
      .catch(error => {
        assert(isTest, error)
      })
  }

  function launch() {
    event.on(RENDER_FAILURE, handleRenderFailure)
    event.on(RENDER_SUCCESS, handleRenderSuccess)
    throwIfError()
    initializeContext()
    bindHookListener()
    event.emit('onStart')

    return prompt()
      .then(answers => {
        context.assign(answers)
        event.emit('onPromptEnd')
        disposeUserConfig()
        event.emit('onDestStart')
        return dest()
      })
      .then(files => {
        event.emit('onDestEnd')
        event.emit('onExit')
        return files
      })
      .catch(error => {
        throw error
        event.emit('onExit', error)
      })
  }

  return {
    presets,
    context,
    utils,
    launch,
    errors,
    userConfig
  }
}

export default POZ
