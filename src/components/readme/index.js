import Component from '../Component'
import DEFAULT_TEMPLATE from './default/template.hbs'
import DEFAULT_CONFIG from './default/config'

/**
 * new Readme([template,] config)
 */
export default class Readme extends Component {

  constructor(template, config) {
    if (!config) {
      config = template
      template = undefined
    }
    super(template, config, DEFAULT_TEMPLATE, DEFAULT_CONFIG)
  }

  static create(...args) {
    return new Readme(...args)
  }
}
