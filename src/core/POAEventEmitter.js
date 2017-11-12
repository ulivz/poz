import {EventEmitter} from 'events'
import archy from 'archy'
import {isPlainObject, isFunction} from '../utils/datatypes'
import {relative} from '../utils/path'
import * as logger from '../utils/log'
import POAError from './POAError'
import DirectoryNode from '../class/DirectoryNode'

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
  'transformIgnore',
  'printTemplateTree'
]

export default  class POAEventEmitter extends EventEmitter {

  renderSuccess(file) {
    let filePath = relative(this.templateDirectory, file.path)
    logger.success(`render <cyan>${filePath}</cyan>`)
  }

  renderFailure(error, file) {
    let filePath = relative(this.templateDirectory, file.path)
    logger.error(`render <cyan>${filePath}</cyan>`)
    logger.echo(error)
    const targetNode = this.templateDirectoryTree.searchByAbsolutePath(file.path)
    targetNode.label = targetNode.label + ' ' + logger.parseColor('<gray>[Render Error!]</gray>')
  }

  printTree() {
    logger.echo()
    this.destDirectoryTree = new DirectoryNode(this.presets.dest.target);
    return this.destDirectoryTree.traverse()
      .then(() => {
        logger.print(`<yellow>${archy(this.destDirectoryTree)}</yellow>`)
      })
  }

  transformIgnore(file) {
    logger.echo()
    logger.info(`Skip rendering  <cyan>${file.basename}</cyan>`)
  }

  constructor() {
    super()
    for (let event of EVNET_LIST) {
      this.on(event, (...args) => {
        this[event](...args)
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
          this.on(hook, (...args) => {
            this.status = hook
            hookHandler(...args)
          })
        } else {
          if (this.env.isDev) {
            logger.warn(`<cyan>${hook}</cyan> must be a function, skipped!`)
          }
        }
      }
    }
  }
}
