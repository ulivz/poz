import {resolve} from '../utils/path'
import {getGitUser} from '../utils/git'
import {isPlainObject} from '../utils/datatypes'
import {exists, isDirectory} from '../utils/fs'
import {promptsRunner, mockPromptsRunner, promptsTransformer} from '../utils/prompts'
import * as string from '../utils/string'
import * as logger from '../utils/logger'
import * as datatypes from '../utils/datatypes'
import * as shell from '../utils/child_process'
import * as prompts from '../utils/prompts'
import env from './POZENV.js'
import {mergePOZDestConfig} from './POZUtils.js'
import POZContext from './POZContext.js'
import POZEventEmitter from './POZEventEmitter.js'
import POZDirectory from '../file-system/POZDirectory'
import POZPackageManager from './POZPackageManager'
import POZPackageValidator from './POZPackageValidator'

class POZ extends POZEventEmitter {

  constructor(POZPackageDirectory) {
    super()
    this.env = env
    this.destConfig = {}
    this.cwd = null
    this.POZPackageDirectory = null
    this.POZTemplateDirectory = null
    this.context = new POZContext()
    this.initUtil()
    this.initContext(POZPackageDirectory)
    this.initLifeCycle()
  }

  initUtil() {
    this.debug('initUtil')
    this.utils = this.constructor.utils
  }

  initContext(POZPackageDirectory) {
    this.debug('initContext')

    let {
      errorList,
      POZPackageIndexFile,
      POZTemplateDirectory
    } = POZPackageValidator(POZPackageDirectory)

    if (errorList.length) {
      throw Error(errorList[0])
    }

    const user = getGitUser()
    const cwd = process.cwd()

    this.POZPackageDirectory = POZPackageDirectory
    this.POZTemplateDirectory = POZTemplateDirectory
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
    this.templateConfig = require(POZPackageIndexFile)(this.context, this)
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
    const promptsMetadata = this.templateConfig.prompts()
    const prompts = promptsTransformer(promptsMetadata)
    const envPromptsRunner = this.env.isTest
      ? mockPromptsRunner
      : promptsRunner
    return envPromptsRunner(prompts)
  }

  handlePromptsAnswers(answers) {
    this.debug('handlePromptsAnswers')
    this.emit('onPromptEnd')
    this.context.assign(answers)
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
    let { dest } = this.templateConfig
    mergePOZDestConfig(this.destConfig, dest)
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
      let newName = getNewName(vinylFile.basename)
      if (vinylFile.basename !== newName) {
        vinylFile.basename = newName
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
        logger.error(`unexpected transformer`)
      })
      destStream.on('end', () => {
        this.POZDestDirectoryTree = new POZDirectory(this.destConfig.target);
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
  prompts
}
export default POZ
