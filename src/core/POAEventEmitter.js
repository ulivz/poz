import {EventEmitter} from 'events'
import archy from 'archy'
import {isPlainObject, isFunction} from '../utils/datatypes'
import {env} from '../utils/env'
import {relative} from '../utils/path'
import POAError from './POAError'
import * as logger from '../utils/log'

const LIFE_CYCLE = [
  'onStart',
  'onPromptsStart',
  'onPromptsEnd',
  'onSpawnStart',
  'onSpawnEnd',
  'onExit'
]

export default  class POAEventEmitter extends EventEmitter {
  constructor() {
    super()
    this.on('error', msg => {
      throw new Error(logger.simplelogMsgParser(msg)) // TODO to research why cannot use POAError
    })
    this.on('log', (msg, msgType) => {
      if (msgType) {
        logger[msgType](msg)
      } else {
        logger.print(msg)
      }
      logger.echo()
    })
    this.on('renderSuccess', file => {
      // let filePath = relative(this.context.tplDir, file.path)
      // this.emit('log', `render <cyan>${filePath}</cyan>`, 'success')
    })
    this.on('renderFailure', file => {
      let filePath = relative(this.context.tplDir, file.path)
      this.emit('log', `render <cyan>${filePath}</cyan>`, 'error')
      const targetNode = this.templateDirectoryTree.findByFullPath(file.path)
      targetNode.label = targetNode.label + ' ' + logger.parseColor('<gray>[Render Error!]</gray>')
    })
    this.on('logFileTree', () => {
      logger.echo()
      console.log(this.templateDirectoryTree)
      logger.print(`<yellow>${archy(this.templateDirectoryTree)}</yellow>`)
    })
  }

  initLifeCycle() {
    if (!isPlainObject(this.templateConfig)) {
      this.emit('error', '<yellow>poa.js</yellow> must export a plain object')
    }
    for (let hook of LIFE_CYCLE) {
      let hookHandler = this.templateConfig[hook]
      if (hookHandler) {
        if (isFunction(hookHandler)) {
          this.on(hook, hookHandler)
        } else {
          if (env.IS_DEV) {
            this.emit('log', `<cyan>${hook}</cyan> must be a function, skipped!`, 'warn')
          }
        }
      }
    }
  }
}
