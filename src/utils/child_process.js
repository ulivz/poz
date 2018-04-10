import child_process from 'child_process'
import { isString, isFunction, isPlainObject } from './datatypes'

export function exec(command, options = {}, callback) {
  if (!command || !isString(command)) {
    throw new Error('Expected "command" to be string')
  }
  if (arguments.length === 2 && isFunction(options)) {
    callback = options
    options = null
  }
  if (arguments.length === 3 && !isFunction(callback)) {
    throw new Error('Expected "callback" to be function')
  }
  if (options && !isPlainObject(options)) {
    throw new Error('Expected "options" to be plain object')
  }
  return new Promise(resolve => {
    child_process.exec(command, options || {}, (error, stdout, stderr) => {
      if (stdout) {
        console.log(stdout)
      }
      if (stderr) {
        console.log(stdout)
      }
      callback && callback(error, stdout, stderr)
      resolve({ error, stdout, stderr })
    })
  }).then(result => {
    if (!options.slient) {
      if (result.error) {
        console.log(result.error)
      }
      if (result.stdout) {
        console.log(result.stdout)
      }
    }
    return result
  })
}

export function execSync(command, options) {
  if (!options) {
    options = { encoding: 'utf-8' }
  }
  return child_process.execSync(command, options)
}
