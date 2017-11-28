import fs from 'fs-extra'
import ora from 'ora'
import chalk from 'chalk'
import {exists} from '../utils/fs'
import {download} from '../utils/download'
import logger from '../utils/logger'
import {getPkg} from '../utils/pkg'
import path from 'path'
import pkg from '../../package.json'
import home from 'user-home'
import env from '../core/POZENV'
import POZPackage from './POZPackage'

export default class POZPackageManager {

  constructor() {
    if (!(this instanceof POZPackageManager)) {
      return new POZPackageManager()
    }

    this.env = env
    this.wd = path.join(home, '.poz')

    if (!exists(this.wd)) {
      fs.ensureDirSync(this.wd)
    }

    this.cache = new POZPackageCache(this.wd)
    this.cache.setItem('__VERSION__', pkg.version)
  }

  fetchPackage(requestName) {
    let packageName, origin, cachePath
    const NPM_REG = /^[a-zA-Z0-9@\-]+$/
    const GIT_REG = /^[a-zA-Z0-9\/\-]+$/
    
    // local package
    if (exists(requestName)) {
      packageName = url.split('/').pop()
      origin = 'local'

    } else if (NPM_REG.test(requestName)) {
      packageName = requestName
      origin = 'npm'

    } else if (GIT_REG.test(requestName)) {
      packageName = url.split('/').pop()
      origin = 'git'

    } else {
      throw new Error('Invalid package request string:' + requestName)
    }

    cachePath = path.join(this.PATH.packageCacheDir, packageName)
    return new POZPackage({
      requestName,
      packageName,
      cachePath,
      origin,
    })
  }

  download() {

  }

  fetchPkg(requestName) {
    let PMConfig = this.PMConfig
    let pkg = this.getPkgByName(requestName, PMConfig)

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

}
