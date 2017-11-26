import handlebar2 from 'handlebars2'

export const ENV = {
  DEV: 'develop',
  TEST: 'test',
  DEBUG: 'debug',
  PROD: 'production'
}

const POZENVCONFIG = {
  POZ_TEMPLATE_DIRECTORY_NAME: 'template',
  POZ_PACKAGE_INDEX_FILE_NAME: 'poz.js',
  POZ_RENDER_ENGINE: handlebar2.render,
  POZ_LIFE_CYCLE: [
    'onStart',
    'onPromptStart',
    'onPromptEnd',
    'onDestStart',
    'onDestEnd',
    'onExit'
  ]
}

class POZENV {

  constructor() {
    Object.keys(POZENVCONFIG).forEach(key => this[key] = POZENVCONFIG[key])
  }

  get POZ_ENV() {
    return process.env.POZ_ENV || process.env.NODE_ENV || process.env.BABEL_ENV || null
  }

  get isTest() {
    return this.POZ_ENV === ENV.TEST
  }

  get isDebug() {
    return this.POZ_ENV === ENV.DEBUG
  }

  get isDev() {
    return this.POZ_ENV === ENV.DEBUG || this.POZ_ENV === ENV.TEST
  }

  get isProduction() {
    return !this.POZ_ENV || this.POZ_ENV === ENV.PROD
  }
}

export default new POZENV()

