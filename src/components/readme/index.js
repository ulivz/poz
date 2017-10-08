import Component from '../Component'
import DEFAULT_TEMPLATE from './default/template.hbs'
import DEFAULT_CONFIG from './default/config'

export default class Readme extends Component {

  constructor(template, config) {
    super(template || DEFAULT_TEMPLATE, config || {})
    this.setDefaultConfig(DEFAULT_CONFIG)
  }

}
