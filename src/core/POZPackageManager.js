import fs from 'fs-extra'
import ora from 'ora'
import {exists} from '../utils/fs'
import {download} from '../utils/download'
import * as logger from '../utils/logger'
import {getPkg} from '../utils/pkg'
import path from 'path'
import pkg from '../../package.json'
import home from 'user-home'
import env from './POZENV'
import {pkgFinder} from './POZUtils'

export default class POZPackageManager {
  constructor() {
    this.env = env
    this.rootDir = path.join(home, '.poz')
    this.pmConfigPath = path.join(this.rootDir, 'poz.json')
    this.pmPkgResourcesDir = path.join(this.rootDir, 'packages')
    this.userPmConfigPath = path.join(this.rootDir, 'poz_profile.json')
    this.initialize()
  }

  // Ensure the core file
  initialize() {
    if (!exists(this.rootDir)) {
      fs.ensureDirSync(this.rootDir)
    }

    if (!exists(this.userPmConfigPath)) {
      fs.writeJsonSync(this.userPmConfigPath, { __VERSION__: pkg.version }, { spaces: 2 })
    }

    if (!exists(this.pmConfigPath)) {
      fs.writeJsonSync(this.pmConfigPath, {
        __VERSION__: pkg.version,
        packages: {}
      }, { spaces: 2 })
    }
  }

  set pmConfig(config) {
    fs.writeJsonSync(this.pmConfigPath, config, { spaces: 2 })
  }

  get pmConfig() {
    return require(this.pmConfigPath)
  }

  getLocalPkgs() {
    return this.pmConfig.packages
  }

  fetchPkg(requestName) {
    let pmConfig = this.pmConfig
    let pkg = pkgFinder(pmConfig.packages, requestName)
    if (pkg) {
      if (this.env.isDebug) {
        logger.debug(`Use local package <yellow>${requestName}</yellow>`)
      }
      // TODO check package updates
      return Promise.resolve(pkg)
    }

    if (this.env.isDebug) {
      logger.debug(`Downloading POZ package <yellow>${requestName}</yellow> ...`)
    }

    const spinner = ora(`Downloading POZ package ${requestName} ....`).start()
    logger.print()
    return download(requestName, this.pmPkgResourcesDir)
      .then(packageInfo => {
        spinner.stop()
        let pkg = {
          requestName,
          ...packageInfo,
          pkg: getPkg(
            path.join(this.pmPkgResourcesDir, packageInfo.packageName)
          )
        }
        pmConfig.packages[packageInfo.packageName] = pkg
        this.pmConfig = pmConfig
        return pkg
      }).catch(error => {
        console.log(error)
      })
  }

  removePkg(packageName) {
    const pmConfig = this.pmConfig
    const deletePkg = pmConfig.packages[packageName]
    if (!deletePkg) {
      logger.warn(`Cannot find package <cyan>${packageName}</cyan>`)
    } else {
      delete pmConfig.packages[packageName]
      this.pmConfig = pmConfig
      fs.removeSync(path.join(this.pmPkgResourcesDir, deletePkg.packageName))
    }
  }

  saveConfig() {

  }

}
