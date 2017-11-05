export const ENV = {
  DEV: 'develop',
  TEST: 'test',
  DEBUG: 'debug',
  PROD: 'production'
}

class POAEnv {
  get POA_ENV() {
    return process.env.NODE_ENV ||
      process.env.BABEL_ENV
  }

  get IS_TEST() {
    return this.POA_ENV === ENV.TEST
  }

  get IS_DEBUG() {
    return this.POA_ENV === ENV.DEBUG
  }

  get IS_DEV() {
    return this.POA_ENV === ENV.DEBUG || this.POA_ENV === ENV.TEST
  }

  get IS_PRODUCTION() {
    return this.POA_ENV === ENV.PROD
  }
}

export const env = new POAEnv()
