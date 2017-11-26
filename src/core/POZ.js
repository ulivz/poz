import {getGitUser} from '../utils/git'
import {isPlainObject} from '../utils/datatypes'
import {promptsRunner, mockPromptsRunner, promptsTransformer} from '../utils/prompts'
import * as string from '../utils/string'
import * as logger from '../utils/logger'
import * as datatypes from '../utils/datatypes'
import * as shell from '../utils/child_process'
import * as prompts from '../utils/prompts'
import handlebars2 from 'handlebars2'
import fs from 'fs-extra'
import * as cfs from '../utils/fs'
import {assign} from '../utils/assign'
import env from './POZENV.js'
import {mergePOZDestConfig} from './POZUtils.js'
import POZContext from './POZContext.js'
import POZEventHandler from './POZEventHandler.js'
import POZDirectory from '../file-system/POZDirectory'
import POZPackageManager from './POZPackageManager'
import POZPackageValidator from './POZPackageValidator'

class POZ extends POZEventHandler {

  constructor(POZPackageDirectory) {
    super()
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
    this.initUtils()
    this.initContext(POZPackageDirectory)
    this.initLifeCycle()
  }

  initUtils() {
    this.debug('initUtils')
    this.utils = this.constructor.utils
  }

  initContext(POZPackageDirectory) {
    this.debug('initContext')

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

  set(key, value) {
    if (isPlainObject(key)) {
      this.context.assign(key)
    } else {
      this.context.set(key, value)
    }
  }

  prompt() {
    this.debug('prompt')
    this.emit('onPromptStart')
    const promptsMetadata = this.POZPackageConfig.prompts()
    const prompts = promptsTransformer(promptsMetadata)
    const envPromptsRunner = this.env.isTest
      ? mockPromptsRunner
      : promptsRunner
    return envPromptsRunner(prompts)
  }

  handlePromptsAnswers(answers) {
    this.debug('handlePromptsAnswers')
    this.context.assign(answers)
    this.emit('onPromptEnd')
  }

  setupDestConfig() {
    this.debug('setupDestConfig')
    // default
    this.destConfig = {
      target: this.cwd,
      ignore: null,
      rename: null,
      render: this.env.POZ_RENDER_ENGINE,
    }
    mergePOZDestConfig(this.destConfig, this.POZPackageConfig.dest)
    this.set('dest', this.destConfig)
  }

  dest() {
    this.debug('dest')
    this.emit('onDestStart')

    let renameConfig = this.destConfig.rename

    if (!isPlainObject(renameConfig)) {
      logger.info('Expect "rename" property to be a plain object')
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
        logger.info(`Rename <gray>${oldRelative}</gray> ==> <gray>${vinylFile.relative}</gray>`)
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
        logger.error(error)
        reject()
      })
      destStream.on('unExpectedTransformer', () => {
        logger.error(`Unexpected transformer`)
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
    this.debug('start')
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
POZ.utils = {
  string,
  logger,
  datatypes,
  shell,
  prompts,
  fs,
  render: handlebars2.render
}

assign(POZ.utils.fs, cfs)

export default POZ
