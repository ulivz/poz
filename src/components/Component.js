import PropaError from '../utils/PropaError'
import {render} from 'handlebars2'
import {isPlainObject, isString} from '../utils/utils'

class Component {

  constructor(template, config) {

    if (template && !isString(template)) {
      throw new PropaError('Expected "template" to be string')
    }

    if (!isPlainObject(config)) {
      throw new PropaError('Expected "config" to be plain object')
    }

    this.template = template
    this.config = config
  }

  render() {
    return render(this.template, this.config)
  }

  setDefaultConfig(config) {
    this.config = Object.assign(config, this.config)
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
