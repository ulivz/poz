import {EventEmitter} from 'events'
import archy from 'archy'
import {isPlainObject, isFunction} from '../utils/datatypes'
import {relative} from '../utils/path'
import * as logger from '../utils/logger'

export default  class POZEventHandler extends EventEmitter {

  constructor() {
    super()
  }

  handleRenderSuccess(file) {
    let filePath = relative(this.POZTemplateDirectory, file.path)
    logger.success(`render <cyan>${filePath}</cyan>`)
  }

  handleRenderFailure(error, file) {
    let filePath = relative(this.POZTemplateDirectory, file.path)
    logger.error(`render <cyan>${filePath}</cyan>`)
    logger.echo(error)
    const targetNode = this.POZTemplateDirectoryTree.searchByAbsolutePath(file.path)
    console.log(targetNode)
    targetNode.label = targetNode.label + ' ' + logger.parseColor('<gray>[Render Error!]</gray>')
  }

  debug(name) {
    if (this.env.isDebug) {
      logger.debug(name)
    }
  }

  printTree() {
    logger.echo()
    setTimeout(() => {
      this.POZDestDirectoryTree.traverse()
        .then(() => {
          logger.print(`<yellow>${archy(this.POZDestDirectoryTree)}</yellow>`)
        })
    }, 10)
  }

  transformIgnore(file) {
    logger.echo()
    logger.info(`Skip rendering  <cyan>${file.basename}</cyan>`)
  }

  initLifeCycle() {
    this.debug('initLifeCycle')
    if (!isPlainObject(this.POZPackageConfig)) {
      throw new Error('"poz.js" must export a plain object')
    }
    for (let hook of this.env.POZ_LIFE_CYCLE) {
      let hookHandler = this.POZPackageConfig[hook]
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
