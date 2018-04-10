import alphax from 'alphax'
import { relative } from 'path'
import { getNormalizedConfig } from './normalize-config'
import { LIFE_CYCLE } from './presets'
import { RENDER_FAILURE, RENDER_SUCCESS } from './event-names'
import { isDev, isTest } from './env'
import * as env from './env'
import * as presets from './presets'
import event from './event'
import Context from './context.js'
import { validatePackage } from './package-validator'
import utils, { logger as log, prompts, datatypes, consolelog, assert, getGitUser } from '../utils/index'

const { promptsRunner, mockPromptsRunner, promptsTransformer } = prompts
const { isFunction } = datatypes

class POZ {
  constructor(src, { write = true } = {}) {
    this.src = src
    this.templateDir = null
    this.write = write
    this.userConfig = null
    this.normalizedConfig = null
    this.user = {}
    this.status = null
    this.app = null
    this.error = null
    this.cwd = process.cwd()
    this.context = Context()
    if (arguments[1] === false) {
      this.write = false
    }
    this.validatePackage()
  }

  validatePackage() {
    const {
      error,
      templateDir,
      userConfig
    } = validatePackage(this.src, {
      exportArguements: [this.context, utils]
    })
    this.error = error
    this.templateDir = templateDir
    this.userConfig = userConfig
  }

  initializeContext() {
    this.user = getGitUser()
    this.context.assign({
      cwd: this.cwd,
      env: env,
      dirname: this.cwd.slice(this.cwd.lastIndexOf('/') + 1),
      gituser: this.user.name,
      gitemail: this.user.email,
      src: this.src
    })
  }

  bindHookListener() {
    for (const hookname of LIFE_CYCLE) {
      const handler = this.userConfig[hookname]
      if (!handler) {
        continue
      }
      if (isFunction(handler)) {
        event.on(hookname, (...args) => {
          consolelog(isTest, `Running ${log.cyan(hookname)} ...`)
          this.status = hookname
          handler(...args)
        })
      } else {
        consolelog(isTest, `Expect ${log.cyan(hookname)} to be a function`)
      }
    }
  }

  handleRenderSuccess(file) {
    let filePath = relative(this.src, file.path)
    log.success(`render ${log.cyan(filePath)}`)
  }

  handleRenderFailure(error, file) {
    let filePath = relative(this.src, file.path)
    log.error(`render ${log.cyan(filePath)}`)
    log.echo(error)
  }

  disposeUserConfig() {
    this.normalizedConfig = getNormalizedConfig(this.userConfig, this.context)
    this.context.set('config', this.normalizedConfig)
  }

  prompt() {
    event.emit('onPromptStart')
    let { prompts } = this.userConfig
    const promptsMetadata = isFunction(prompts) ? prompts() : prompts
    prompts = promptsTransformer(promptsMetadata)
    const envPromptsRunner = isTest
      ? mockPromptsRunner
      : promptsRunner
    return envPromptsRunner(prompts)
  }

  dest() {
    this.app = alphax()
    const { rename, filters, render, outDir } = this.normalizedConfig
    this.app.src(this.templateDir + '/**', {
      baseDir: this.templateDir,
      rename,
      filters,
      transform: render
    })
    return this.app.dest(outDir || '.', { write: this.write })
      .then(() => this.app.fileMap())
      .catch(error => {
        assert(isTest, error)
      })
  }

  launch() {
    event.on(RENDER_FAILURE, this.handleRenderFailure.bind(this))
    event.on(RENDER_SUCCESS, this.handleRenderFailure.bind(this))

    this.error.throwIfError()
    this.initializeContext()
    this.bindHookListener()

    event.emit('onStart')
    return this.prompt()

      .then(answers => {
        this.context.assign(answers)
        event.emit('onPromptEnd')
        this.disposeUserConfig()
        event.emit('onDestStart')
        return this.dest()
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
}

export default (...args) => new POZ(...args)
