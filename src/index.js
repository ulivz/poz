import POZ from './core/poz'
import { RENDER_ENGINE } from './core/presets'
import utils, { mixin } from './utils/index'
import Package from './package-manager/package'
import PackageManager from './package-manager/package-manager'

mixin(utils, { render: RENDER_ENGINE })

export default {
  POZ,
  Package,
  PackageManager
}

export {
  POZ,
  Package,
  PackageManager
}

