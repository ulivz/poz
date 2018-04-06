import alphax from 'alphax'
import log from '../logger/logger'
import * as cfs from '../utils/fs'
import { getGitUser } from '../utils/git'
import { relative } from '../utils/path'
import { assign } from '../utils/assign'
import { consolelog, assert } from './utils.js'
import { getNormalizedConfig } from './normalize-config'
import { isFunction } from '../utils/datatypes'
import { isDev, isTest } from './env'
import { RENDER_ENGINE, LIFE_CYCLE, EXPORTED_UTILS } from './presets'
import { RENDER_FAILURE, RENDER_SUCCESS } from './event-names'
import * as env from './env'
import * as presets from './presets'
import { promptsRunner, mockPromptsRunner, promptsTransformer } from '../utils/prompts'
import event from './event'
import Context from './context.js'
import packageValidator from './package-validator'

class POZRunner {
  constructor(packageSourceDir, {
    write = true
  }) {

  }

  use() {

  }
}

function POZ(packageSourceDir) {

  const cwd = process.cwd()
  const utils = EXPORTED_UTILS
  const context = Context()

  let normalizedConfig
  let user
  let status
  let app

  /**
   * Validate the POZ package, and get the content of config file
   */
  const {
    errors,
    packageTemplateDir,
    userConfig
  } = packageValidator(packageSourceDir, [context, utils])

  /**
   * Throw if error
   */
  function throwIfError() {
    if (errors.length) {
      if (isDev) {
        throw new Error(errors.shift().code)
      }
      throw new Error(errors.shift().message)
    }
  }

  /**
   * Initialize render context
   */
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

  /**
   * Initialize binding the life cycle listener
   */
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

  /**
   * Dispose user config
   */
  function disposeUserConfig() {
    normalizedConfig = getNormalizedConfig(
      {
        outDir: cwd,
        filter: null,
        rename: null,
        render: RENDER_ENGINE
      },
      userConfig,
      context
    )
    context.set('$config', normalizedConfig)
  }

  /**
   * Running prompt according to config
   */
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

  /**
   * Dest files
   */
  function dest() {
    app = alphax()
    const { rename, filter, render, outDir } = normalizedConfig
    app.src(packageTemplateDir + '/**', {
      baseDir: packageTemplateDir,
      rename,
      filter,
      transformFn: render
    })
    return app.dest(outDir || '.')
      .then(() => {
        event.emit('onDestEnd')
      })
      .catch(error => {
        assert(isTest, error)
      })
  }

  /**
   * Runner
   */
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
        return dest()
      })
      .then(() => {
        event.emit('onExit')
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

POZ.utils = EXPORTED_UTILS
assign(POZ.utils.fs, cfs)

export default POZ
