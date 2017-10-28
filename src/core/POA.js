import {EventEmitter} from 'events'
import {getGitUser} from './utils/git'
import {exists, isDirectory} from './utils/fs'
import {resolve} from './utils/path'
import {noop} from './utils/function'
import {promptsRunner, promptsTransformer} from './utils/prompts'
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
    if (typeof key === 'object') {
      let kVs = key
      Object.keys(kVs).forEach(_key => {
        this.set(_key, kVs[_key])
      })
      return this;
    }
    this[key] = val
    return this
  }

  get(key) {
    return this[key]
  }
}

export default class POA extends EventEmitter {

  constructor(poaTmplDir) {
    super()
    this.context = new POAContext()
    this.template = null
    this.hooks = {}
    this.initContext(poaTmplDir)
    this.initLifeCycle()
  }

  initContext(poaTmplDir) {
    if (!exists(poaTmplDir)) {
      throw new POAError(`${poaTmplDir} not exist!`)
    }
    if (!isDirectory(poaTmplDir)) {
      throw new POAError(`${poaTmplDir} is not a directory!`)
    }
    const entry = resolve(poaTmplDir, 'poa.js')
    if (!exists(entry)) {
      throw new POAError(`Cannot find ${entry}, the template directory must contains a file called 'poa.js'`)
    }
    const user = getGitUser()
    const cwd = process.cwd()
    this.context.set({
      dirname: cwd.slice(cwd.lastIndexOf('/') + 1),
      cwd: cwd,
      gituser: user.name,
      gitemail: user.email
    })
    this.template = require(entry)(this.context, this)
    this.template.path = poaTmplDir
  }

  initLifeCycle() {
    LIFE_CYCLE.forEach(hookName => {
      this.hooks[hookName] = this.template[hookName] || noop
    })
  }

  set(...args) {
    this.context.set(...args)
  }

  generate() {

  }

  run() {
    const template = this.template
    const promptsMetadata = template.prompts()
    const prompts = promptsTransformer(promptsMetadata)
    // promptsRunner(prompts).then(answers => {
    //   this.set(answers)
    // })
    // this.hooks.render()
  }

}
