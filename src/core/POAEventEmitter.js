import {EventEmitter} from 'events'
import archy from 'archy'
import {isPlainObject, isFunction} from '../utils/datatypes'
import {relative} from '../utils/path'
import * as LOGGER from '../utils/log'
import POAError from './POAError'

const LIFE_CYCLE = [
  'onStart',
  'onPromptStart',
  'onPromptEnd',
  'onReproduceStart',
  'onReproduceEnd',
  'onExit'
]

const EVNET_LIST = [
  'renderSuccess',
  'renderFailure',
  'printTemplateTree'
]

export default  class POAEventEmitter extends EventEmitter {

  _renderSuccess(file) {
    let filePath = relative(this.templateDirectory, file.path)
    LOGGER.success(`render <cyan>${filePath}</cyan>`)
  }

  _renderFailure() {
    let filePath = relative(this.templateDirectory, file.path)
    LOGGER.error(`render <cyan>${filePath}</cyan>`)
    const targetNode = this.templateDirectoryTree.searchByAbsolutePath(file.path)
    targetNode.label = targetNode.label + ' ' + LOGGER.parseColor('<gray>[Render Error!]</gray>')
  }

  _printTemplateTree() {
    LOGGER.echo()
    LOGGER.print(`<yellow>${archy(this.templateDirectoryTree)}</yellow>`)
  }

  constructor() {
    super()
    for (let event of EVNET_LIST) {
      this.on(event, (...args) => {
        this['_' + event](...args)
      })
    }
  }

  initLifeCycle() {
    if (!isPlainObject(this.templateConfig)) {
      throw new POAError('"poa.js" must export a plain object')
    }
    for (let hook of LIFE_CYCLE) {
      let hookHandler = this.templateConfig[hook]
      if (hookHandler) {
        if (isFunction(hookHandler)) {
          this.on(hook, hookHandler)
        } else {
          if (this.env.isDev) {
            LOGGER.warn(`<cyan>${hook}</cyan> must be a function, skipped!`)
          }
        }
      }
    }
  }
}
