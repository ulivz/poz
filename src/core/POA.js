import {resolve} from '../utils/path'
import {getGitUser} from '../utils/git'
import {isPlainObject, isFunction, isUndefined} from '../utils/datatypes'
import {exists, isDirectory} from '../utils/fs'
import {match} from '../utils/minimatch'
import {promptsRunner, mockPromptsRunner, promptsTransformer} from '../utils/prompts'
import * as string from '../utils/string'
import * as logger from '../utils/log'
import * as datatypes from '../utils/datatypes'
import POAENV from './POAENV.js'
import {mergePOADestConfig} from './POAUtils.js'
import POAError from './POAError.js'
import POAContext from './POAContext.js'
import POAEventEmitter from './POAEventEmitter.js'
import DirectoryNode from '../class/DirectoryNode'

export default class POA extends POAEventEmitter {

  constructor(POAPackageDirectory) {
    super()
    this.env = new POAENV()
    this.destConfig = {}
    this.cwd = null
    this.POAPackageDirectory = null
    this.POATemplateDirectory = null
    this.context = new POAContext()
    this.initUtil()
    this.initContext(POAPackageDirectory)
    this.initLifeCycle()
  }

  initUtil() {
    this.util = { string, datatypes, logger }
  }

  initContext(POAPackageDirectory) {
    if (!exists(POAPackageDirectory)) {
      throw new POAError(`${POAPackageDirectory} not exist!`)
    }
    if (!isDirectory(POAPackageDirectory)) {
      throw new POAError(`Expect "${POAPackageDirectory}" is a directory!`)
    }

    const packageIndexFile = resolve(POAPackageDirectory, 'poa.js')
    if (!exists(packageIndexFile)) {
      throw new POAError(
        `Cannot resolve "${packageIndexFile}", ` +
        'For using POA, the root directory of ' +
        'your POA package must contain a file ' +
        'named "poa.js".'
      )
    }

    const POATemplateDirectory = resolve(POAPackageDirectory, 'template')
    if (!exists(POATemplateDirectory)) {
      throw new POAError(
        `Cannot resolve ${POATemplateDirectory}, ` +
        'For using POA, A POA template package ' +
        'should contains a "template" directory ' +
        'which used to store the template files.'
      )
    }

    const user = getGitUser()
    const cwd = process.cwd()

    this.POAPackageDirectory = POAPackageDirectory
    this.POATemplateDirectory = POATemplateDirectory
    this.cwd = cwd

    this.context.assign({
      $cwd: cwd,
      $env: this.env.POA_ENV,
      $dirname: cwd.slice(cwd.lastIndexOf('/') + 1),
      $gituser: user.name,
      $gitemail: user.email,
      $POAPackageDirectory: POAPackageDirectory,
      $POATemplateDirectory: POATemplateDirectory
    })
    this.templateConfig = require(packageIndexFile)(this.context, this)
  }

  set(key, value) {
    if (isPlainObject(key)) {
      this.context.assign(key)
    } else {
      this.context.set(key, value)
    }
  }

  prompt() {
    this.emit('onPromptStart')
    const promptsMetadata = this.templateConfig.prompts()
    const prompts = promptsTransformer(promptsMetadata)
    const envPromptsRunner = this.env.isTest
      ? mockPromptsRunner
      : promptsRunner
    return envPromptsRunner(prompts)
  }

  handlePromptsAnswers(answers) {
    this.emit('onPromptEnd')
    this.context.assign(answers)
  }

  setupDestConfig() {
    // default
    this.destConfig = {
      target: this.cwd,
      ignore: null,
      rename: null,
      render: this.env.POA_RENDER_ENGINE,
    }
    let { dest } = this.templateConfig
    mergePOADestConfig(this.destConfig, dest)
  }

  dest() {
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
          this.emit('renderSuccess', vinylFile)
          vinylFile.contents = new Buffer(renderResult)
        } catch (error) {
          this.emit('renderFailure', error, vinylFile)
        }
      }
    }

    return new Promise((resolve, reject) => {
      this.POATemplateDirectoryTree.setDestIgnore(this.destConfig.ignore)
      const destStream = this.POATemplateDirectoryTree.dest(this.destConfig.target, transformer)
      destStream.on('error', reject)
      destStream.on('finish', () => {
        this.emit('onDestEnd')
        resolve()
      })
    })
  }

  start() {
    this.emit('onStart')
    this.POATemplateDirectoryTree = new DirectoryNode(this.POATemplateDirectory)
    return this.prompt()
      .then(this.handlePromptsAnswers.bind(this))
      .then(this.setupDestConfig.bind(this))
      .then(() => Promise.all([
        this.POATemplateDirectoryTree.traverse(),
        this.dest()
      ]))
      .then(() => {
        this.emit('onExit')
      })
      .catch(error => {
        this.emit('onExit', error)
      })
  }

}
