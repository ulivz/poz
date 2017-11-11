import handlebar2 from 'handlebars2'

export const ENV = {
  DEV: 'develop',
  TEST: 'test',
  DEBUG: 'debug',
  PROD: 'production'
}

const POAENVCONFIG =
  {
    POA_TEMPLATE_DIRECTORY_NAME: 'template',
    POA_PACKAGE_INDEX_FILE_NAME: 'poa.js',
    POA_RENDER_ENGINE: handlebar2.render
  }


export default class POAENV {

  constructor() {
    Object.keys(POAENVCONFIG).forEach(key => this[key] = POAENVCONFIG[key])
  }

  get POA_ENV() {
    return process.env.POA_ENV || process.env.NODE_ENV || process.env.BABEL_ENV
  }

  get isTest() {
    return this.POA_ENV === ENV.TEST
  }

  get isDebug() {
    return this.POA_ENV === ENV.DEBUG
  }

  get isDev() {
    return this.POA_ENV === ENV.DEBUG || this.POA_ENV === ENV.TEST
  }

  get isProduction() {
    return !this.POA_ENV || this.POA_ENV === ENV.PROD
  }
}

