import Component from '../Component'
import DEFAULT_TEMPLATE from './default/template.md'
import DEFAULT_CONFIG from './default/config'

/**
 * new Pkg([template,] config)
 */
export default class Pkg extends Component {

  constructor(template, config) {
    super({ template, config, DEFAULT_TEMPLATE, DEFAULT_CONFIG })
  }

  static create(...args) {
    return new Pkg(...args).render()
  }
}
