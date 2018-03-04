import { EventEmitter } from 'events'
import alphax from 'alphax'
import log from '../logger/logger'
import * as cfs from '../utils/fs'
import { getGitUser } from '../utils/git'
import { assign } from '../utils/assign'
import { mergePOZDestConfig, consolelog, assert } from './utils.js'
import { isFunction } from '../utils/datatypes'
import { isDev, isTest } from './env'
import { RENDER_ENGINE, LIFE_CYCLE, EXPORTED_UTILS } from './presets'
import * as env from './env'
import * as presets from './presets'
import { promptsRunner, mockPromptsRunner, promptsTransformer } from '../utils/prompts'
import Context from './context.js'
import Package from '../package-manager/package'
import PackageManager from '../package-manager/package-manager'
import packageValidator from './package-validator'

function POZ(packageSourceDir) {

  const cwd = process.cwd()
  const utils = EXPORTED_UTILS
  const context = Context()
  const event = new EventEmitter()

  let destConfig
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
      $$dirname: cwd.slice(cwd.lastIndexOf('/') + 1),
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

  function curryTransformer(render) {
    return function (content) {
      let renderResult
      try {
        renderResult = render(content, context)
      } catch (error) {
      }
      return renderResult
    }
  }

  /**
   * Setup dest config
   */
  function setupDestConfig() {
    // default
    destConfig = {
      target: cwd,
      ignore: null,
      rename: null,
      render: RENDER_ENGINE,
    }
    mergePOZDestConfig(destConfig, userConfig.dest)
    context.set('dest', destConfig)
  }

  /**
   * Running prompt according to config
   */
  function prompt() {
    event.emit('onPromptStart')
    const promptsMetadata = userConfig.prompts()
    const prompts = promptsTransformer(promptsMetadata)
    const envPromptsRunner = isTest
      ? mockPromptsRunner
      : promptsRunner
    return envPromptsRunner(prompts)
  }

  function handleRenderSuccess(file) {
    let filePath = relative(packageTemplateDir, file.path)
    log.success(`render ${log.cyan(filePath)}`)
  }

  function handleRenderFailure(error, file) {
    let filePath = relative(packageTemplateDir, file.path)
    log.error(`render ${log.cyan(filePath)}`)
    log.echo(error)
    targetNode.label = targetNode.label + ' ' + log.gray('[Render Error!]')
  }

  /**
   * Dest files
   */
  function dest() {
    app = alphax()
    const { rename, filter, render } = destConfig
    app.src(packageTemplateDir + '/**', {
      rename,
      filter,
      transformFn: curryTransformer(render)
    })

    return app.dest(destConfig.target || '.')
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
    throwIfError()
    initializeContext()
    bindHookListener()
    event.emit('onStart')

    return prompt()
      .then(answers => {
        context.assign(answers)
        event.emit('onPromptEnd')
        setupDestConfig()
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

POZ.PackageManager = PackageManager
POZ.Package = Package
POZ.utils = EXPORTED_UTILS
assign(POZ.utils.fs, cfs)

export default POZ
