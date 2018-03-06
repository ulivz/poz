export const ENV = {
  TEST: 'test',
  DEBUG: 'debug'
}

export const POZ_ENV = process.env.POZ_ENV
  || process.env.NODE_ENV
  || process.env.BABEL_ENV
  || null

export const isTest = POZ_ENV === ENV.TEST
export const isDebug = POZ_ENV === ENV.DEBUG
export const isDev = isTest || isDebug

export default {
  POZ_ENV,
  isTest,
  isDebug,
  isDev
}

