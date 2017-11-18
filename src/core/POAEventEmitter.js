import {EventEmitter} from 'events'
import archy from 'archy'
import {isPlainObject, isFunction} from '../utils/datatypes'
import {relative} from '../utils/path'
import * as logger from '../utils/log'
import POAError from './POAError'
import POADirectory from '../file-system/POADirectory'

const LIFE_CYCLE = [
  'onStart',
  'onPromptStart',
  'onPromptEnd',
  'onDestStart',
  'onDestEnd',
  'onExit'
]

export default  class POAEventEmitter extends EventEmitter {

  handleRenderSuccess(file) {
    let filePath = relative(this.POATemplateDirectory, file.path)
    logger.success(`render <cyan>${filePath}</cyan>`)
  }

  handleRenderFailure(error, file) {
    let filePath = relative(this.POATemplateDirectory, file.path)
    logger.error(`render <cyan>${filePath}</cyan>`)
    logger.echo(error)
    const targetNode = this.POATemplateDirectoryTree.searchByAbsolutePath(file.path)
    targetNode.label = targetNode.label + ' ' + logger.parseColor('<gray>[Render Error!]</gray>')
  }

  printTree() {
    logger.echo()
    return this.destDirectoryTree.traverse()
      .then(() => {
        console.log(this.destDirectoryTree.childNodes)
        logger.print(`<yellow>${archy(this.destDirectoryTree)}</yellow>`)
      })
  }

  transformIgnore(file) {
    logger.echo()
    logger.info(`Skip rendering  <cyan>${file.basename}</cyan>`)
  }

  constructor() {
    super()
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
