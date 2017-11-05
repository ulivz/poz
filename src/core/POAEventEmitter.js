import {EventEmitter} from 'events'
import {isPlainObject, isFunction} from '../utils/datatypes'
import {env} from '../utils/env'
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
        logger.echo(msg)
      }
    })
  }

  initLifeCycle() {
    if (!isPlainObject(this.__TEMPLATE__)) {
      this.emit('error', '<yellow>poa.js</yellow> must export a plain object')
    }
    for (let hook of LIFE_CYCLE) {
      let hookHandler = this.__TEMPLATE__[hook]
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
