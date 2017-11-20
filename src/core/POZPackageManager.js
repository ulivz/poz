import fs from 'fs-extra'
import ora from 'ora'
import chalk from 'chalk'
import {exists, isDirectory, isDirEmpty} from '../utils/fs'
import {download} from '../utils/download'
import {isFunction, isPlainObject, isPromise} from '../utils/datatypes'
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
    this.PMRootDir = path.join(home, '.poz')
    this.PMConfigPath = path.join(this.PMRootDir, 'poz.json')
    this.PMPkgResourcesDir = path.join(this.PMRootDir, 'packages')
    this.userPMConfigPath = path.join(this.PMRootDir, 'poz_profile.json')
    this.initialize()
  }

  // Ensure the core file
  initialize() {
    if (!exists(this.PMRootDir)) {
      fs.ensureDirSync(this.PMRootDir)
    }

    // Hide temporarily
    // if (!exists(this.userPMConfigPath)) {
    //   fs.writeJsonSync(this.userPMConfigPath, { __VERSION__: pkg.version }, { spaces: 2 })
    // }

    if (!exists(this.PMConfigPath)) {
      fs.writeJsonSync(this.PMConfigPath, {
        __VERSION__: pkg.version,
        pkgMap: {}
      }, { spaces: 2 })
    }

    // Ensure the packages dir was saved in poz.json
    this.handlePMConfig(PMConfig => {
      let packages = fs.readdirSync(this.PMPkgResourcesDir)
      for (let name of packages) {
        let pkgPath = path.join(this.PMPkgResourcesDir, name)
        if (isDirectory(pkgPath)
          && !isDirEmpty(pkgPath)
          && pkgFinder(PMConfig.pkgMap, name) === null
        ) {
          PMConfig.pkgMap[name] = {
            name: name,
            requestName: name,
            origin: 'local',
            path: pkgPath,
            pkg: getPkg(pkgPath)
          }
        }
      }
      return PMConfig
    })
  }

  handlePMConfig(handler) {
    let result = handler && handler(this.PMConfig)
    if (isPromise(result)) {
      result.then(data => {
        this.PMConfig = data
      })
    } else {
      this.PMConfig = result
    }
  }

  get PMConfig() {
    return require(this.PMConfigPath)
  }

  set PMConfig(config) {
    if (isPlainObject(config)) {
      fs.writeJsonSync(this.PMConfigPath, config, { spaces: 2 })
    }
  }

  fetchPkg(requestName) {
    let PMConfig = this.PMConfig
    let pkg = pkgFinder(PMConfig.pkgMap, requestName)

    // Find from cache
    if (pkg) {
      if (this.env.isDebug) {
        logger.debug(`Use local package <yellow>${requestName}</yellow>`)
      }
      // TODO check package updates
      return Promise.resolve(pkg)
    }

    // Find from Github/NPM
    if (this.env.isDebug) {
      logger.debug(`Fetching POZ package <yellow>${requestName}</yellow> ...`)
    }

    const spinner = ora(`Fetching package ${chalk.yellow(requestName)} ....`).start()

    return download(requestName, this.PMPkgResourcesDir)
      .then(packageInfo => {
        spinner.stop()
        let pkg = {
          requestName,
          ...packageInfo,
          pkg: getPkg(
            path.join(this.PMPkgResourcesDir, packageInfo.packageName)
          )
        }
        PMConfig.packages[packageInfo.packageName] = pkg
        this.PMConfig = PMConfig
        return pkg

      }).catch(error => {
        if (error.statusCode === 404) {
          spinner.fail(`404: Cannot find package ${chalk.yellow(requestName)}`)
        }
        return null
      })
  }

  removePkg(packageName) {
    const PMConfig = this.PMConfig
    const deletePkg = PMConfig.packages[packageName]
    if (!deletePkg) {
      logger.warn(`Cannot find package <cyan>${packageName}</cyan>`)
    } else {
      delete PMConfig.packages[packageName]
      this.PMConfig = PMConfig
      fs.removeSync(path.join(this.PMPkgResourcesDir, deletePkg.packageName))
    }
  }

  saveConfig() {

  }

}
