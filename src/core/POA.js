import {getGitUser} from '../utils/git'
import {isPlainObject} from '../utils/datatypes'
import {exists, isDirectory, getFileTree} from '../utils/fs'
import {resolve, relative} from '../utils/path'
import {env} from '../utils/env'
import {promptsRunner, mockPromptsRunner, promptsTransformer} from '../utils/prompts'
import DirectoryNode from '../class/DirectoryNode'
import POAError from './POAError.js'
import POAContext from './POAContext.js'
import POAEventEmitter from './POAEventEmitter.js'

export default class POA extends POAEventEmitter {

  constructor(tmplPkgDir) {
    super()
    this.context = new POAContext()
    this.initContext(tmplPkgDir)
    this.initLifeCycle()
  }

  initContext(tmplPkgDir) {
    if (!exists(tmplPkgDir)) {
      throw new POAError(`${tmplPkgDir} not exist!`)
    }
    if (!isDirectory(tmplPkgDir)) {
      throw new POAError(`${tmplPkgDir} is not a directory!`)
    }
    const poaEntry = resolve(tmplPkgDir, 'poa.js')

    // poa.js
    if (!exists(poaEntry)) {
      this.emit('error',
        `Cannot find <cyan>${poaEntry}</cyan>, ` +
        `A POA template package should contains at least a file called <cyan>'poa.js'</cyan> at root directory`
      )
    }

    // template/
    const tplDir = resolve(tmplPkgDir, 'template')
    if (!exists(tplDir)) {
      this.emit('error',
        `Cannot find <cyan>${poaEntry}/template</cyan>, ` +
        `A POA template package should contains a template directory which used to store the template files`
      )
    }

    const user = getGitUser()
    const cwd = process.cwd()
    this.context.assign({
      env: env.POA_ENV,
      tplDir,
      cwd: cwd,
      $dirname: cwd.slice(cwd.lastIndexOf('/') + 1),
      $gituser: user.name,
      $gitemail: user.email
    })
    this.templateConfig = require(poaEntry)(this.context, this)
  }

  set(key, value) {
    if (isPlainObject(key)) {
      this.context.assign(key)
    } else {
      this.context.set(key, value)
    }
  }

  run() {

    this.emit('onStart')
    const prompt = () => {

      this.emit('log', 'prompts task', 'info')

      this.emit('onPromptsStart')
      const promptsMetadata = this.templateConfig.prompts()
      const prompts = promptsTransformer(promptsMetadata)
      const envPromptsRunner = env.IS_TEST
        ? mockPromptsRunner
        : promptsRunner
      return envPromptsRunner(prompts)
    }

    const handlePromptsAnswers = answers => {
      this.emit('log', 'start handlePromptsAnswers', 'info')
      this.emit('onPromptsEnd')
      this.context.assign(answers)
    }

    const traverse = () => {
      return this.templateDirectoryTree.traverse()
    }

    const reproduce = () => {
      this.emit('onDuplicateStart')

      const transformer = vinylFile => {
        if (vinylFile.isDirectory()) {
          let res = render(vinylFile.contents.toString(), this.context)
          if (res.status === 200) {
            vinylFile.contents = new Buffer(res.out)
            this.emit('renderSuccess', { file: vinylFile })
          } else {
            this.emit('renderFailure', { file: vinylFile, error: res.error })
          }
        }
      }

      return new Promise((resolve, reject) => {
        const reproduceStream = this.templateDirectoryTree.dest(this.context.cwd, transformer)
        reproduceStream.on('error', reject)
        reproduceStream.on('finish', resolve)
      })
    }

    this.templateDirectoryTree = new DirectoryNode(this.context.tplDir)

    return prompt()
      .then(handlePromptsAnswers)
      .then(() => Promise.all([traverse(), reproduce()]))
      .then(() => {
        this.emit('logFileTree')
        console.log('Finish')
      })
      .catch(error => {
        console.log(error)
      })
  }

}
