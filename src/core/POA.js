import {resolve} from '../utils/path'
import {getGitUser} from '../utils/git'
import {isPlainObject, isFunction} from '../utils/datatypes'
import {exists, isDirectory} from '../utils/fs'
import {match} from '../utils/minimatch'
import {promptsRunner, mockPromptsRunner, promptsTransformer} from '../utils/prompts'
import * as string from '../utils/string'
import * as logger from '../utils/log'
import * as datatypes from '../utils/datatypes'
import POAENV from './POAENV.js'
import POAError from './POAError.js'
import POAContext from './POAContext.js'
import POAEventEmitter from './POAEventEmitter.js'
import DirectoryNode from '../class/DirectoryNode'

export default class POA extends POAEventEmitter {

  constructor(packageDirectory) {
    super()
    this.env = new POAENV()
    this.presets = {}
    this.context = new POAContext()
    this.initUtil()
    this.initContext(packageDirectory)
    this.initLifeCycle()
  }

  initUtil() {
    this.util = { string, datatypes, logger }
  }

  initContext(packageDirectory) {

    if (!exists(packageDirectory)) {
      throw new POAError(`${packageDirectory} not exist!`)
    }

    if (!isDirectory(packageDirectory)) {
      throw new POAError(`Expect "${packageDirectory}" is a directory!`)
    }

    const packageIndexFile = resolve(packageDirectory, 'poa.js')

    if (!exists(packageIndexFile)) {
      throw new POAError(
        `Cannot resolve "${packageIndexFile}", ` +
        'For using POA, the root directory of ' +
        'your POA package must contain a file ' +
        'named "poa.js".'
      )
    }

    const templateDirectory = resolve(packageDirectory, 'template')
    if (!exists(templateDirectory)) {
      throw new POAError(
        `Cannot resolve ${templateDirectory}, ` +
        'For using POA, A POA template package ' +
        'should contains a "template" directory ' +
        'which used to store the template files.'
      )
    }

    const user = getGitUser()
    const cwd = process.cwd()

    this.packageDirectory = packageDirectory
    this.templateDirectory = templateDirectory
    this.destDirectory = this.cwd = cwd

    this.context.assign({
      $cwd: cwd,
      $env: this.env.POA_ENV,
      $dirname: cwd.slice(cwd.lastIndexOf('/') + 1),
      $gituser: user.name,
      $gitemail: user.email,
      $packageDirectory: packageDirectory,
      $templateDirectory: templateDirectory
    })
    this.templateConfig = require(packageIndexFile)(this.context, this)
    this.renderEngine = this.env.POA_RENDER_ENGINE
  }

  setRenderEngine(render) {
    if (!isFunction(render)) {
      throw new POAError('Expect "render" to be a function')
    }
    logger.info('Use a custom rendering engine')
    this.renderEngine = render
  }

  // rename(renameConfig) {
  //   for (let matchString of renameConfig) {
  //
  //   }
  // }

  set(key, value) {
    if (isPlainObject(key)) {
      this.context.assign(key)
    } else {
      this.context.set(key, value)
    }
  }

  _validate(source, type) {
  }

  parsePresets(presets) {
    let { dest, transform } = presets
    if (!isPlainObject(dest)) {
      dest = {}
    }
    if (!isPlainObject(transform)) {
      transform = {}
    }
    this.presets.dest = Object.assign({
      target: this.destDirectory,
      ignore: {},
      rename: {}
    }, dest)
    this.presets.transform = Object.assign({
      engine: this.env.POA_RENDER_ENGINE,
      ignore: {}
    }, transform)
  }

  run() {

    this.emit('onStart')

    const prompt = () => {
      this.emit('onPromptStart')
      const promptsMetadata = this.templateConfig.prompts()
      const prompts = promptsTransformer(promptsMetadata)
      const envPromptsRunner = this.env.isTest
        ? mockPromptsRunner
        : promptsRunner
      return envPromptsRunner(prompts)
    }

    const handlePromptsAnswers = answers => {
      this.emit('onPromptEnd')
      this.context.assign(answers)
    }

    const parsePresets = () => {
      let { presets } = this.templateConfig
      if (isFunction(presets)) {
        presets = presets()
      } else if (isPlainObject(presets)) {

      } else {
        throw new POAError('Expect "presets" to be a function or a plain object')
      }
      this.parsePresets(presets)
    }

    const traverse = () => {
      return this.templateDirectoryTree.traverse()
    }

    const reproduce = () => {
      this.emit('onReproduceStart')

      const transformer = vinylFile => {
        if (match(vinylFile.path, this.presets.transform.ignore)) {
          this.transformIgnore(vinylFile)
        } else if (!vinylFile.isDirectory()) {
          try {
            let renderResult = this.renderEngine(vinylFile.contents.toString(), this.context, vinylFile)
            this.emit('renderSuccess', vinylFile)
            vinylFile.contents = new Buffer(renderResult)
          } catch (error) {
            this.emit('renderFailure', error, vinylFile)
          }
        }
      }
      return new Promise((resolve, reject) => {
        this.templateDirectoryTree.setDestIgnore(this.presets.dest.ignore)
        const reproduceStream = this.templateDirectoryTree.dest(this.presets.dest.target, transformer)
        reproduceStream.on('error', reject)
        reproduceStream.on('finish', () => {
          this.emit('onReproduceEnd')
          resolve()
        })
      })
    }

    this.templateDirectoryTree = new DirectoryNode(this.templateDirectory)

    return prompt()
      .then(handlePromptsAnswers)
      .then(parsePresets)
      .then(() => Promise.all([traverse(), reproduce()]))
      .then()
      .then(() => {
        this.emit('onExit')
      })
      .catch(error => {
        this.emit('onExit', error)
      })
  }

}
