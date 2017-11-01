// import chalk from 'chalk'
var chalk = require('chalk')

const GLOBAL_INDENT = ' '
const COLOR_REG = /<([\w]+)>([^<>]*)<\/\1>/g
const echo = (...args) => console.log(...[GLOBAL_INDENT, ...args])

const simpleStringTagParser = (str, options) => {
  const reg = options.reg
  const lib = options.lib
  const onKnownTag = options.onKnownTag
  const onUnknownTag = options.onUnknownTag
  let match, nStr = ''
  let start = reg.lastIndex
  while (match = reg.exec(str)) {
    let [, tag, content] = match
    if (!lib[tag]) {
      onKnownTag && onKnownTag(tag)
      nStr = nStr + str.slice(start, match.index) + content
    } else {
      onKnownTag && onUnknownTag(tag)
      nStr = nStr + str.slice(start, match.index) + lib[tag](content)
    }
    start = reg.lastIndex
  }
  return nStr
}

const parselogMessage = msg => {
  return simpleStringTagParser(msg, {
    reg: COLOR_REG,
    lib: chalk,
    onKnownTag: tag => echo(`Find not support color tag: ${tag}`),
    onUnknownTag: tag => null
  })
}

const simpleColorLog = (color, text) => {
  return (msg) => echo(chalk[color](text), parselogMessage(msg))
}

export const success = simpleColorLog('green', 'success')
export const error = simpleColorLog('red', 'error')
export const warn = simpleColorLog('yellow', 'warn')
export const info = simpleColorLog('cyan', 'info')
