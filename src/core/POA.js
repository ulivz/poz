import {EventEmitter} from 'events'
import {getGitUser} from '../utils/git'
import {isString, isPlainObject} from '../utils/datatypes'
import {exists, isDirectory, copy} from '../utils/fs'
import {resolve, relative} from '../utils/path'
import {noop} from '../utils/function'
import {render} from '../utils/render'
import {promptsRunner, mockPromptsRunner, promptsTransformer} from '../utils/prompts'
import POAError from './POAError.js'


const IS_TEST_ENV =
  process.env.BABEL_ENV === 'test' ||
  process.env.NODE_ENV === 'test'

export function generate(source, target) {
}


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

  constructor(tmplPkgDir) {
    super()
    this.context = new POAContext()
    this.template = null
    this.hooks = {}
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
      throw new POAError(
        `Cannot find ${poaEntry}, A POA template package should contains at least a file called 'poa.js' at root directory`
      )
    }

    // template/
    const tmplDir = resolve(tmplPkgDir, 'template')
    if (!exists(tmplDir)) {
      throw new POAError(
        `Cannot find ${poaEntry}, A POA template package should contains a template directory which used to store the template files`
      )
    }

    const user = getGitUser()
    const cwd = process.cwd()
    this.context.assign({
      IS_TEST_ENV,
      tmplDir,
      dirname: cwd.slice(cwd.lastIndexOf('/') + 1),
      cwd: cwd,
      gituser: user.name,
      gitemail: user.email
    })
    this.template = require(poaEntry)(this.context, this)
  }

  initLifeCycle() {
    LIFE_CYCLE.forEach(hookName => {
      this.hooks[hookName] = this.template[hookName] || noop
    })
  }

  set(key, value) {
    if (isPlainObject(key)) {
      this.context.assign(key)
    } else {
      this.context.set(key, value)
    }
  }

  run() {
    this.hooks.before()
    const template = this.template
    const promptsMetadata = template.prompts()
    const prompts = promptsTransformer(promptsMetadata)

    let envPromptsRunner = IS_TEST_ENV
      ? mockPromptsRunner
      : promptsRunner

    return envPromptsRunner(prompts).then(answers => {
      this.context.assign(answers)
      return this.generate(
        this.context.tmplDir,
        this.context.cwd,
      )
    }).then(() => {
      console.log('Go hacking!')
    })


    // render
    // this.hooks.render()
  }

}
