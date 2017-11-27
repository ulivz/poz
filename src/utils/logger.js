import _ from 'chalk'
import textable from 'text-table'
import {isPlainObject, isArray} from './datatypes'

const GLOBAL_INDENT = '  '
export const echo = console.log
export const COLOR = _

const __ = {
  'success': v => _.bgGreen(_.black(v)),
  'warning': v => _.bgYellow(_.black(v)),
  'error': v => _.bgRed(_.black(v)),
  'info': v => _.bgWhiteBright(_.black(v)),
  'debug': v => _.bgBlackBright(_.black(v)),
}

const getLogFunction = (type) => {
  return (msg) => {
    const msgType = type ? __[type](' ' + type.toUpperCase() + ' ') + ' ' : ''
    const fullMsg = msgType + msg
    echo(fullMsg)
  }
}

_.success = getLogFunction('success')
_.error = getLogFunction('error')
_.warn = getLogFunction('warning')
_.info = getLogFunction('info')
_.debug = getLogFunction('debug')
_.debug.only = msg => {
  if (process.env.NODE_ENV === 'debug') {
    debug(msg)
  }
}

_.print = getLogFunction()

_.table = raw => {
  let data = []
  if (isPlainObject(raw)) {
    Object.keys(raw).forEach(key => {
      data.push([key, raw[key] || 'None'])
    })
  }
  if (isArray(raw)) {
    if (!raw.length) {
      return
    }
    data = raw
  }
  data.forEach((row, idx) => {
    for (var i = 0, l = row.length; i < l; i++) {
      let item = row[i]
      if (i === 0) {
        row[i] = GLOBAL_INDENT + '  ' + _.yellow(item)
      } else {
        row[i] = _.gray(item)
      }
    }
  })
  var t = textable(data, { align: ['l', 'l'] })
  console.log(t)
}

export default _
