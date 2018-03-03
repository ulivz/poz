import _ from '../logger/POZLogger'
import env from './env'

function getTime() {
  return _.gray(`[${new Date().toLocaleTimeString()}]`)
}

function parseInfo(main, method, extra) {
  let finalInfo = _.bold(_.green(main))
  if (method) {
    finalInfo += '=> ' + _.magenta(method)
  }
  if (extra) {
    finalInfo += '=> ' + _.gray(extra)
  }
  return finalInfo
}

class POZDebugger {

  start(info) {
    if (!env.isDebug) {
      return
    }
    _.debug(
      getTime(),
      'Starting',
      parseInfo(info)
    )
  }

  end(info) {
    if (!env.isDebug) {
      return
    }
    _.debug(
      getTime(),
      'Finished',
      parseInfo(info)
    )
  }

  trace(...info) {
    if (!env.isDebug) {
      return
    }
    _.debug(
      getTime() + ' ' + parseInfo(...info)
    )
  }
}

export default new POZDebugger()
