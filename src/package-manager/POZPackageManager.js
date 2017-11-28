import fs from 'fs-extra'
import ora from 'ora'
import {exists} from '../utils/fs'
import logger from '../utils/logger'
import path from 'path'
import pkg from '../../package.json'
import home from 'user-home'
import env from '../core/POZENV'
import POZPackage from './POZPackage'
import POZPackageCache from './POZPackageCache'
import POZDownloader from './POZDownloader'

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

  parseRequest(requestName) {
    let packageName, origin, cachePath
    const NPM_REG = /^[a-zA-Z0-9@\-]+$/
    const GIT_REG = /^[a-zA-Z0-9\/\-]+$/

    // local package
    if (exists(requestName)) {
      packageName = requestName.split('/').pop()
      origin = 'local'

    } else if (NPM_REG.test(requestName)) {
      packageName = requestName
      origin = 'npm'

    } else if (GIT_REG.test(requestName)) {
      packageName = requestName.split('/').pop()
      origin = 'git'

    } else {
      return null
    }

    cachePath = path.join(this.cache.packageDirPath, packageName)
    return new POZPackage({
      requestName,
      packageName,
      cachePath,
      origin,
    })
  }


  fetchPkg(requestName) {
    let _package
    _package = this.cache.getPackageByName(requestName)

    // 1. Find from cache
    if (_package) {
      logger.debug.only(`Use local package ${logger.yellow(requestName)}`)
      return Promise.resolve(_package)
    }

    // 2. Find from Github / NPM
    const spinner = ora(`Fetching package ${logger.yellow(requestName)} ....`).start()
    _package = this.parseRequest(requestName)

    if (!_package) {
      return Promise.reject(null)
    } else {
      return POZDownloader(_package)
        .then(() => {
          spinner.stop()
          return _package
        })
        .catch(error => {
          if (error.statusCode === 404) {
            spinner.fail(`404: Cannot find package ${logger.yellow(requestName)}`)
          }
        })
    }
  }
}
