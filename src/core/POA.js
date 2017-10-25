import {EventEmitter} from 'events'
import {getGitUser} from './utils/git'
import {exists, isDirectory} from './utils/fs'
import {resolve} from './utils/path'
import {promptsRunner, promptsTransformer} from './utils/prompts'
import POAError from './POAError.js'

const LIFE_CYCLE = ['before', 'after']

export class POAEnv {
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
    this.context = new POAEnv()
    this.template = null
    this.initPoaEnviormment(poaTmplDir)
  }

  initPoaEnviormment(poaTmplDir) {

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
  }

  set(...args) {
    this.context.set(...args)
  }

  run() {
    const template = this.template
    template.before && template.before()
    const promptsMetadata = template.prompts()
    const prompts = promptsTransformer(promptsMetadata)
    return promptsRunner(prompts).then(answers => {
      console.log(answers)
      console.log('Finish')
    })
  }

}
