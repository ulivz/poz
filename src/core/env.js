export const ENV = {
  TEST: 'test',
  DEBUG: 'debug'
}

const POZ_ENV = process.env.POZ_ENV
  || process.env.NODE_ENV
  || process.env.BABEL_ENV
  || null
const isTest = POZ_ENV === ENV.TEST
const isDebug = POZ_ENV === ENV.DEBUG
const isDev = isTest || isDebug

export default {
  POZ_ENV,
  isTest,
  isDebug,
  isDev
}

