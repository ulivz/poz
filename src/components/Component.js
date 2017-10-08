import POAError from '../utils/POAError'
import {render} from 'handlebars2'
import {isPlainObject, isString, isUndefined} from '../utils/utils'

class Component {

  constructor(template, config, DEFAULT_TEMPLATE, DEFAULT_CONFIG) {

    if (isUndefined(template)) {
      template = DEFAULT_TEMPLATE
    } else if(!isString(template)) {
      throw new POAError('Expected "template" to be string')
    }

    if (!isPlainObject(config)) {
      throw new POAError('Expected "config" to be plain object')
    }

    this.config = Object.assign(DEFAULT_CONFIG, config)
    this.template = template
  }

  /**
   * Allow to pass a template with specific start tag and end tag
   * @returns {ArrayBuffer|string|Blob|Array.<T>}
   */
  getTemplate() {
    const { start, end } = this.config
    const template = this.template
    if (start) {
      return template.slice(template.indexOf(start) + start.length, template.lastIndexOf(end) + end.length)
    }
    return this.template
  }

  render() {
    return render(this.template, this.config)
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
