import _ from 'chalk'
import {assign} from '../utils/assign'
import textable from 'text-table'
import {isPlainObject, isArray} from '../utils/datatypes'

const GLOBAL_INDENT = '  '
const echo = _.echo = console.log

const extraColors = {
  'errorItemStyle': v => _.cyan(v),
  'packageNameStyle': v => _.magenta(v),
  'redSnowStyle': v => _.bold(_.red('*')),
  'whiteSnowStyle': v => _.bold(_.white('*')),
  'boldYellow': v => _.bold(_.yellow(v)),
  'boldGreen': v => _.bold(_.green(v)),
  'boldRed': v => _.bold(_.red(v)),
  'boldMagenta': v => _.bold(_.magenta(v)),
  'successStyle': v => _.bgGreen(_.black(v)),
  'warnStyle': v => _.bgYellow(_.black(v)),
  'errorStyle': v => _.bgRed(_.black(v)),
  'infoStyle': v => _.bgWhiteBright(_.black(v)),
  'debugStyle': v => _.bgBlackBright(_.black(v)),
}

assign(_, extraColors)

_.promptsLogger = {
  successStyle: v => _.reset(_.warnStyle(' SUCCESS ')) + ' ' + _.bold(v),
  warnStyle: v => _.reset(_.successStyle(' WARN ')) + ' ' + _.bold(v),
  errorStyle: v => _.reset(_.errorStyle(' ERROR ')) + ' ' + _.bold(v),
  infoStyle: v => _.reset(_.infoStyle(' ERROR ')) + ' ' + _.bold(v)
}

const getLogFunction = (type) => {
  return (msg) => {
    const msgType = type ? extraColors[`${type}Style`](' ' + type.toUpperCase() + ' ') + ' ' : ''
    const fullMsg = msgType + msg
    echo(fullMsg)
  }
}

_.wrap = () => console.log()
_.success = getLogFunction('success')
_.error = getLogFunction('error')
_.warn = getLogFunction('warn')
_.info = getLogFunction('info')
_.redSnow = v => echo(extraColors.redSnowStyle() + ' ' + v)
_.snow = v => echo(extraColors.whiteSnowStyle() + ' ' + v)
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
