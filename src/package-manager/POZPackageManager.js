import fs from 'fs-extra'
import ora from 'ora'
import {exists} from '../utils/fs'
import logger from '../logger/logger'
import path from 'path'
import pkg from '../../package.json'
import home from 'user-home'
import env from '../core/POZENV'
import debug from '../core/POZDebugger'
import POZPackageValidator from '../core/POZPackageValidator'
import POZPackage from './POZPackage'
import POZPackageCache from './POZPackageCache'
import {POZError} from '../error/POZError'
import POZDownloader from './POZDownloader'

export default class POZPackageManager {

  constructor() {
    debug.trace('POZPackageManager', 'constructor')

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

  constructorPOZPackage(data) {
    return new POZPackage(data)
  }

  parseRequest(requestName) {
    debug.trace('POZPackageManager', 'parseRequest')

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

  fetchPkg(requestName, timeout) {
    debug.trace('POZPackageManager', 'fetchPkg')

    let pozPackage
    pozPackage = this.cache.getPackageByName(requestName)

    // 1. Find from cache
    if (pozPackage) {
      return Promise.resolve(pozPackage)
    }

    // 2. Find from Github / NPM
    pozPackage = this.parseRequest(requestName)

    if (!pozPackage) {
      return Promise.reject(null)
    }

    const timer = setTimeout(() => {
      logger.error('Request TIMEOUT, Please check your network.')
      process.exit()
    }, timeout)

    const spinner = ora(`Fetching package ${logger.packageNameStyle(requestName)} ....`).start()

    return POZDownloader(pozPackage)
      .then(() => {
        spinner.stop()
        clearTimeout(timer)

        let { errorList } = POZPackageValidator(pozPackage.cachePath)
        if (errorList.length) {
          return Promise.reject(errorList)
        }

        this.cache.cachePackageInfo(pozPackage)
        return pozPackage
      })

      .catch(error => {
        spinner.stop()
        clearTimeout(timer)

        // 1. 404 Not Found
        if (error.statusCode === 404) {
          spinner.stop()
          logger.error(`404: Cannot find package ${logger.packageNameStyle(requestName)}`)

          // 2. Network Error
        } else if (error.code === 'ENOTFOUND') {
          spinner.stop()
          logger.error('Please check your network.')

        } else if (error.length && error[0] instanceof POZError) {
          return Promise.reject(error)
        }
      })
  }
}
