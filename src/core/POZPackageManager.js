import fs from 'fs-extra'
import {exists} from '../utils/fs'
import {download} from '../utils/download'
import * as logger from '../utils/log'
import {getPkg} from '../utils/pkg'
import path from 'path'
import pkg from '../../package.json'
import home from 'user-home'


export default class POZPackageManager {
  constructor() {
    this.rootDir = path.join(home, '.poz')
    this.pmConfigPath = path.join(this.rootDir, 'poz.json')
    this.pmPkgResourcesDir = path.join(this.rootDir, 'packages')
    this.userPmConfigPath = path.join(this.rootDir, 'poz_profile.json')
  }

  // Ensure the core file
  initEnv() {
    if (!exists(this.rootDir)) {
      fs.ensureDirSync(this.rootDir)
    }

    if (!exists(this.userPmConfigPath)) {
      fs.writeJsonSync(this.userPmConfigPath, { __VERSION__: pkg.version }, { spaces: 2 })
    }

    if (!exists(this.pmConfigPath)) {
      fs.writeJsonSync(this.pmConfigPath, {
        __VERSION__: pkg.version,
        packages: []
      }, { spaces: 2 })
    }
  }

  set pmConfig(config) {
    fs.writeJsonSync(this.pmConfigPath, config, { spaces: 2 })
  }

  get pmConfig() {
    return require(this.pmConfigPath)
  }

  parsePkgName(pkgName) {

  }

  savePkg(pkgName) {
    return download(pkgName, this.pmPkgResourcesDir)
      .then(packageInfo => {
        let pmConfig = this.pmConfig
        let pkg = {
          requestName: pkgName,
          ...packageInfo,
          pkg: getPkg(
            path.join(this.pmPkgResourcesDir, packageInfo.packageName)
          )
        }
        pmConfig.packages.push(pkg)
        this.pmConfig = pmConfig
        return pkg
      }).catch(error => {
        console.log(error)
      })
  }

  removePkg(pkgName) {
    let pmConfig = this.pmConfig
    let pkgIndex = pmConfig.packages.findIndex(pkg => pkgName.packageName)
    if (pkgIndex === -1) {
      logger.warn(`Cannot find package <cyan>${pkgName.packageName}</cyan>`)
    } else {
      let deletePkg = pmConfig.splice(pkgIndex, 1)
      this.pmConfig = pmConfig
      fs.removeSync(path.join(this.pmPkgResourcesDir, deletePkg.packageName))
    }
  }

  saveConfig() {

  }

}
