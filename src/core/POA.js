import {EventEmitter} from 'events'
import {getGitUser} from '../utils/git'
import {isString} from '../utils/datatypes'
import {exists, isDirectory, copy} from '../utils/fs'
import {resolve} from '../utils/path'
import {noop} from '../utils/function'
import {promptsRunner, promptsTransformer} from '../utils/prompts'
import POAError from './POAError.js'

const LIFE_CYCLE = [
  'before',
  'render',
  'after'
]

export class POAContext {
  constructor() {

  }

  set(key, val) {
    this[key] = val
    return this
  }

  assign(kVs) {
    Object.keys(kVs).forEach(_key => {
      this.set(_key, kVs[_key])
    })
    return this
  }

  get(key) {
    return this[key]
  }
}

export default class POA extends EventEmitter {

  constructor(tmplDir) {
    super()
    this.context = new POAContext()
    this.template = null
    this.hooks = {}
    this.initContext(tmplDir)
    this.initLifeCycle()
  }

  initContext(tmplDir) {
    if (!exists(tmplDir)) {
      throw new POAError(`${tmplDir} not exist!`)
    }
    if (!isDirectory(tmplDir)) {
      throw new POAError(`${tmplDir} is not a directory!`)
    }
    const entry = resolve(tmplDir, 'poa.js')
    if (!exists(entry)) {
      throw new POAError(`Cannot find ${entry}, the template directory must contains a file called 'poa.js'`)
    }
    const user = getGitUser()
    const cwd = process.cwd()
    this.context.assign({
      tmplDir,
      dirname: cwd.slice(cwd.lastIndexOf('/') + 1),
      cwd: cwd,
      gituser: user.name,
      gitemail: user.email
    })
    this.template = require(entry)(this.context, this)
  }

  initLifeCycle() {
    LIFE_CYCLE.forEach(hookName => {
      this.hooks[hookName] = this.template[hookName] || noop
    })
  }

  generate(sourceDir, targetDir) {
    return fs.copy
  }

  run() {
    // before
    // this.hooks.before()
    // const template = this.template
    // const promptsMetadata = template.prompts()
    // const prompts = promptsTransformer(promptsMetadata)
    // promptsRunner(prompts).then(answers => {
    //   this.context.set(answers)
    // })


    // if(this.context.cwd){
    //
    // }
    // this.generate(
    //   this.context.tmplDir,
    //   this.context.cwd,
    // )
    // // render
    // this.hooks.render()
  }

}
