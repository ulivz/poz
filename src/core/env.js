export const ENV = {
  TEST: 'test',
  DEBUG: 'debug'
}

function env() {
  const POZ_ENV = process.env.POZ_ENV
    || process.env.NODE_ENV
    || process.env.BABEL_ENV
    || null
  const isTest = POZ_ENV === ENV.TEST
  const isDebug = POZ_ENV === ENV.DEBUG

  return {
    POZ_ENV,
    isTest,
    isDebug
  }
}

export default env()

