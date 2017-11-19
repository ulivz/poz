import chalk from 'chalk'
import textable from 'text-table'
import {simpleStringParser} from './parser'
import {isPlainObject, isArray} from './datatypes'

const GLOBAL_INDENT = '  '
const COLOR_REG = /<([\w]+)>([^<>]*)<\/\1>/g
export const echo = (...args) => console.log(...args)
export const COLOR = chalk

export const simplelogMsgParser = msg => {
  return simpleStringParser(msg, {
    reg: COLOR_REG,
    onMatch: (matchPart, tagName, tagContent) => {
      if (!COLOR[tagName]) {
        return tagContent
      } else {
        return COLOR[tagName](tagContent)
      }
    }
  })
}

export const parseColor = simplelogMsgParser

export const simpleColorLog = (color, type) => {
  return (msg) => {
    const msgType = type ? chalk.gray(`[POZ]`) + ' ' + COLOR[color](type) + ' ' : ''
    const fullMsg = msgType + msg
    echo(parseColor(fullMsg))
    //   fullMsg.replace(/(^)/gm, `$1${GLOBAL_INDENT}`)
    // ))
  }
}

export const success = simpleColorLog('green', '[success]')
export const error = simpleColorLog('red', '[error]')
export const warn = simpleColorLog('yellow', '[warn]')
export const info = simpleColorLog('gray', '[info]')
export const debug = simpleColorLog('gray', '[debug]')
export const print = simpleColorLog()

export function table(raw) {
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
        row[i] = GLOBAL_INDENT + '  ' + chalk.yellow(item)
      } else {
        row[i] = chalk.gray(item)
      }
    }
  })
  var t = textable(data, { align: ['l', 'l'] })
  console.log(t)
}
