import {getGitUser} from '../utils/git'
import {isPlainObject} from '../utils/datatypes'
import {exists, isDirectory} from '../utils/fs'
import {resolve} from '../utils/path'
import {generate} from '../utils/stream'
import {env} from '../utils/env'
import {promptsRunner, mockPromptsRunner, promptsTransformer} from '../utils/prompts'
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
    this.__TEMPLATE__ = require(poaEntry)(this.context, this)
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
    const template = this.__TEMPLATE__
    const promptsMetadata = template.prompts()
    const prompts = promptsTransformer(promptsMetadata)

    const envPromptsRunner = env.IS_TEST
      ? mockPromptsRunner
      : promptsRunner

    this.emit('onPromptsStart')
    return envPromptsRunner(prompts).then(answers => {
      this.emit('onPromptsEnd')
      this.context.assign(answers)
      this.emit('onSpawnStart')
      return generate(
        this.context.tplDir,
        this.context.cwd,
        {
          render: true,
          context: this.context
        }
      )
    }).then(() => {
      this.emit('onSpawnEnd')
      this.emit('onExit')
    })
  }

}
