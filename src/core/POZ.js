import {EventEmitter} from 'events'
import archy from 'archy'
import fs from 'fs-extra'
import handlebars2 from 'handlebars2'
import * as string from '../utils/string'
import * as datatypes from '../utils/datatypes'
import * as shell from '../utils/child_process'
import * as prompts from '../utils/prompts'
import _ from '../logger/POZLogger'
import * as cfs from '../utils/fs'
import {getGitUser} from '../utils/git'
import {assign} from '../utils/assign'
import {mergePOZDestConfig} from './POZUtils.js'
import {POZError} from '../error/POZError'
import {isPlainObject, isFunction} from '../utils/datatypes'
import POZContext from './POZContext.js'
import POZPackage from '../package-manager/POZPackage'
import POZDirectory from '../file-system/POZDirectory'
import POZPackageManager from '../package-manager/POZPackageManager'
import POZPackageValidator from './POZPackageValidator'
import env from './POZENV.js'
import debug from './POZDebugger'
import {promptsRunner, mockPromptsRunner, promptsTransformer} from '../utils/prompts'

class POZ extends EventEmitter {

  constructor(POZPackageDirectory) {
    debug.trace('POZ', 'constructor')
    super()

    if (!(this instanceof POZ)) {
      return new POZ(POZPackageDirectory)
    }

    const properties = {
      env: env,
      cwd: null,
      utils: null,
      context: new POZContext(),
      POZPackageDirectory: null,
      POZPackageConfig: null,
      POZTemplateDirectory: null,
      POZDestDirectoryTree: null,
      destConfig: null,
    }

    Object.assign(this, properties)
    this.utils = this.constructor.utils
    this.initContext(POZPackageDirectory)
    this.initLifeCycle()
  }

  initContext(POZPackageDirectory) {
    debug.trace('POZ', 'initContext')

    const {
      errorList,
      POZTemplateDirectory,
      POZPackageConfig
    } = POZPackageValidator(POZPackageDirectory, [this.context, this])

    if (errorList.length) {
      if (this.env.isTest) {
        throw new Error(errorList.shift().code)
      }
      throw new Error(errorList.shift().message)
    }

    this.POZPackageDirectory = POZPackageDirectory
    this.POZTemplateDirectory = POZTemplateDirectory
    this.POZPackageConfig = POZPackageConfig

    const user = getGitUser()
    const cwd = process.cwd()

    this.cwd = cwd
    this.context.assign({
      $cwd: cwd,
      $env: this.env.POZ_ENV,
      $dirname: cwd.slice(cwd.lastIndexOf('/') + 1),
      $gituser: user.name,
      $gitemail: user.email,
      $POZPackageDirectory: POZPackageDirectory,
      $POZTemplateDirectory: POZTemplateDirectory
    })
  }

  handleRenderSuccess(file) {
    debug.trace('POZ', 'handleRenderSuccess')

    let filePath = relative(this.POZTemplateDirectory, file.path)
    _.success(`render ${_.cyan(filePath)}`)
  }

  handleRenderFailure(error, file) {
    debug.trace('POZ', 'handleRenderFailure')

    let filePath = relative(this.POZTemplateDirectory, file.path)
    _.error(`render ${_.cyan(filePath)}`)
    _.echo(error)
    const targetNode = this.POZTemplateDirectoryTree.searchByAbsolutePath(file.path)
    targetNode.label = targetNode.label + ' ' + _.gray('[Render Error!]')
  }

  printTree() {
    debug.trace('POZ', 'printTree')

    _.echo()
    setTimeout(() => {
      this.POZDestDirectoryTree.traverse()
        .then(() => {
          _.echo(`${_.yellow(archy(this.POZDestDirectoryTree))}`)
        })
    }, 10)
  }

  initLifeCycle() {
    debug.trace('POZ', 'initLifeCycle')

    for (let hook of this.env.POZ_LIFE_CYCLE) {
      let hookHandler = this.POZPackageConfig[hook]
      if (hookHandler) {
        if (isFunction(hookHandler)) {
          this.on(hook, (...args) => {
            this.status = hook
            hookHandler(...args)
          })
        } else {
          if (this.env.isDev) {
            _.warn(`${_.cyan(hook)} must be a function, skipped!`)
          }
        }
      }
    }
  }

  prompt() {
    debug.trace('POZ', 'initLifeCycle')

    this.emit('onPromptStart')
    const promptsMetadata = this.POZPackageConfig.prompts()
    const prompts = promptsTransformer(promptsMetadata)
    const envPromptsRunner = this.env.isTest
      ? mockPromptsRunner
      : promptsRunner

    return envPromptsRunner(prompts)
  }

  handlePromptsAnswers(answers) {
    debug.trace('POZ', 'handlePromptsAnswers')

    this.context.assign(answers)
    this.emit('onPromptEnd')
  }

  setupDestConfig() {
    debug.trace('POZ', 'setupDestConfig')

    // default
    this.destConfig = {
      target: this.cwd,
      ignore: null,
      rename: null,
      render: this.env.POZ_RENDER_ENGINE,
    }
    mergePOZDestConfig(this.destConfig, this.POZPackageConfig.dest)
    this.context.set('dest', this.destConfig)
  }

  dest() {
    debug.trace('POZ', 'dest')

    this.emit('onDestStart')
    let renameConfig = this.destConfig.rename

    if (!isPlainObject(renameConfig)) {
      _.info('Expect "rename" property to be a plain object')
      renameConfig = {}
    }

    const getNewName = name => {
      Object.keys(renameConfig).forEach(pattern => {
        name = name.replace(pattern, renameConfig[pattern])
      })
      return name
    }

    const render = this.destConfig.render

    const transformer = vinylFile => {
      // 1. renmae
      let oldRelative = vinylFile.relative
      let newName = getNewName(vinylFile.path)
      if (vinylFile.path !== newName) {
        vinylFile.path = newName
        _.info(`Rename ${_.gray(oldRelative)} ==> ${_.gray(vinylFile.relative)}`)
      }

      // 2. render
      if (!vinylFile.isDirectory()) {
        try {
          let renderResult = render(vinylFile.contents.toString(), this.context, vinylFile)
          vinylFile.contents = new Buffer(renderResult)
          this.handleRenderSuccess(vinylFile)
        } catch (error) {
          this.handleRenderFailure(error, vinylFile)
        }
      }
    }

    return new Promise((resolve, reject) => {
      this.POZTemplateDirectoryTree.setDestIgnore(this.destConfig.ignore)
      const destStream = this.POZTemplateDirectoryTree.dest(this.destConfig.target, transformer)
      destStream.on('error', error => {
        _.error(error)
        reject()
      })
      destStream.on('unExpectedTransformer', () => {
        _.error(`Unexpected transformer`)
      })
      destStream.on('end', () => {
        this.POZDestDirectoryTree = new POZDirectory(this.destConfig.target)
        this.emit('onDestEnd')
        resolve()
      })
    }).catch(error => {
      console.log(error)
    })
  }

  start() {
    debug.trace('POZ', 'start')

    this.emit('onStart')
    this.POZTemplateDirectoryTree = new POZDirectory(this.POZTemplateDirectory)
    return this.prompt()
      .then(answers => {
        this.handlePromptsAnswers(answers)
        this.setupDestConfig()
        return Promise.all([
          this.POZTemplateDirectoryTree.traverse(),
          this.dest()
        ])
      })
      .then(() => {
        this.emit('onExit')
      })
      .catch(error => {
        throw error
        this.emit('onExit', error)
      })
  }
}

POZ.PackageManager = POZPackageManager
POZ.POZPackage = POZPackage
POZ.POZError = POZError
POZ.utils = {
  string,
  logger: _,
  datatypes,
  shell,
  prompts,
  fs,
  render: handlebars2.render
}

assign(POZ.utils.fs, cfs)

export default POZ
