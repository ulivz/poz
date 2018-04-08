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
import { validatePackage } from './package-validator'
import utils, { logger as log, fs, prompts, datatypes, consolelog, assert, getGitUser } from '../utils/index'

const { promptsRunner, mockPromptsRunner, promptsTransformer } = prompts
const { isFunction, isArray, isPlainObject } = datatypes


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
    error,
    templateDir,
    userConfig
  } = validatePackage(packageSourceDir, {
    exportArguements: [context, utils]
  })

  function throwIfError() {
    if (error.notEmpty()) {
      if (isDev) {
        throw new Error(error.currentErrorCode())
      }
      throw new Error(error.currentErrorMessage())
    }
  }

  function initializeContext() {
    user = getGitUser()
    context.assign({
      cwd: cwd,
      env: env,
      dirname: cwd.slice(cwd.lastIndexOf('/') + 1),
      gituser: user.name,
      gitemail: user.email,
      dirpath: packageSourceDir
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
    let filePath = relative(templateDir, file.path)
    log.success(`render ${log.cyan(filePath)}`)
  }

  function handleRenderFailure(error, file) {
    let filePath = relative(templateDir, file.path)
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
    context.set('config', normalizedConfig)
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
    console.log(normalizedConfig)
    app.src(templateDir + '/**', {
      baseDir: templateDir,
      rename,
      filters,
      transform: render
    })
    return app.dest(outDir || '.', { write })
      .then(() => {

        console.log(app)
        return app.fileMap()
      })
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
    error,
    userConfig
  }
}

export default POZ
