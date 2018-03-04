import { EventEmitter } from 'events'
import archy from 'archy'
import log from '../logger/POZLogger'
import * as cfs from '../utils/fs'
import * as presets from './presets'
import { getGitUser } from '../utils/git'
import { assign } from '../utils/assign'
import { mergePOZDestConfig } from './utils.js'
import { isPlainObject, isFunction } from '../utils/datatypes'
import { POZError } from '../error/poz-error'
import Context from './context.js'
import POZPackage from '../package-manager/package'
import POZPackageManager from '../package-manager/package-manager'
import packageValidator from './package-validator'
import env from './env.js'
import { promptsRunner, mockPromptsRunner, promptsTransformer } from '../utils/prompts'
import { EXPORTED_UTILS } from './presets'
import alphax from 'alphax'

function POZ(POZPackageDirectory) {

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
    POZTemplateDirectory,
    userConfig
  } = packageValidator(POZPackageDirectory, [context, utils])

  /**
   * Throw if error
   */
  function throwIfError() {
    if (errors.length) {
      if (env.isTest) {
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
      $sourceDir: POZPackageDirectory
    })
  }

  /**
   * Initialize binding the life cycle listener
   */
  function bindHookListener() {
    for (let hookname of presets.LIFE_CYCLE) {
      let handler = userConfig[hookname]
      if (!handler) {
        continue
      }
      if (isFunction(handler)) {
        event.on(hookname, (...args) => {
          log.testonly(`Running ${log.cyan(hookname)} ...`)
          status = hookname
          handler(...args)
        })
      } else {
        log.testonly(`Expected ${log.cyan(hookname)} to be a function`)
      }
    }
  }

  function curryTransformer(render) {
    return function transform(content) {
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
      render: presets.RENDER_ENGINE,
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
    const envPromptsRunner = env.isTest
      ? mockPromptsRunner
      : promptsRunner
    return envPromptsRunner(prompts)
  }

  function handleRenderSuccess(file) {
    let filePath = relative(POZTemplateDirectory, file.path)
    log.success(`render ${log.cyan(filePath)}`)
  }

  function handleRenderFailure(error, file) {
    let filePath = relative(POZTemplateDirectory, file.path)
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
    app.src(POZTemplateDirectory + '/**', {
      rename,
      filter,
      transformFn: curryTransformer(render)
    })

    return app.dest(destConfig.target || '.')
      .then(() => {
        event.emit('onDestEnd')
      })
      .catch(error => {
        console.log(error)
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

POZ.PackageManager = POZPackageManager
POZ.POZPackage = POZPackage
POZ.POZError = POZError
POZ.utils = EXPORTED_UTILS
assign(POZ.utils.fs, cfs)

export default POZ
