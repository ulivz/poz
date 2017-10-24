import POAError from '../core/POAError'
import H2 from 'handlebars2'
import {isPlainObject, isString, isUndefined} from '../utils/utils'

const GLOBAL_CONFIG = {
  __start__: '```handlebars',
  __end__: '```'
}

class Component {

  constructor({ template, config, DEFAULT_TEMPLATE, DEFAULT_CONFIG }) {
    if (!config) {
      config = template
      template = undefined
    }
    this.init(template, config, DEFAULT_TEMPLATE, DEFAULT_CONFIG)
  }

  init(template, config, DEFAULT_TEMPLATE, DEFAULT_CONFIG) {

    if (isUndefined(template)) {
      template = DEFAULT_TEMPLATE
    } else if (!isString(template)) {
      throw new POAError('Expected "template" to be string')
    }

    if (!isPlainObject(config)) {
      throw new POAError('Expected "config" to be plain object')
    }

    this.config = Object.assign(GLOBAL_CONFIG, DEFAULT_CONFIG, config)
    this.template = this.getTemplate(template)
  }

  /**
   * Allow to pass a template with specific start tag and end tag
   * @returns {ArrayBuffer|string|Blob|Array.<T>}
   */
  getTemplate(template) {
    const { __start__, __end__ } = this.config
    if (__start__) {
      return template.slice(template.indexOf(__start__) + __start__.length + 1, template.lastIndexOf(__end__) - 1)
    }
    return template
  }

  render() {
    return H2.render(this.template, this.config)
  }

  get(key) {
    return this.config[key]
  }

  set(key, value) {
    this.config[key] = value
  }

  del(key) {
    delete this.config[key]
  }

}

export default Component
