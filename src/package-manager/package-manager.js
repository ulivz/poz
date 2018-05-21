import ora from 'ora'
import fs from '../utils/fs'
import logger from '../utils/logger'
import path from 'path'
// import pkg from '../../package.json'
import home from 'user-home'
import env from '../core/env'
import PackageValidator from '../core/package-validator'
import Package from './package'
import PackageCache from './package-cache'
import Downloader from './downloader'

/**
 * Parse user package request
 * @param {String} requestName
 * @returns {Package}
 */

export function parseRequest(requestName) {
  let packageName, origin
  const NPM_REG = /^[a-zA-Z0-9@\-]+$/
  const GIT_REG = /^[a-zA-Z0-9\/\-]+$/

  // local package
  if (fs.existsSync(requestName)) {
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

  return {
    packageName,
    origin
  }
}

export default class PackageManager {

  constructor() {
    this.env = env
    this.wd = path.join(home, '.poz')

    if (!fs.existsSync(this.wd)) {
      fs.ensureDirSync(this.wd)
    }

    this.cache = new PackageCache(this.wd)
    // this.cache.setItem('__VERSION__', pkg.version)
  }


  fetchPkg(requestName, timeout) {
    let _package
    _package = this.cache.getPackageByName(requestName)

    // 1. Find from cache
    if (_package) {
      return Promise.resolve(_package)
    }

    // 2. Find from Github / NPM
    const { packageName, origin } = parseRequest(requestName)
    const cachePath = path.join(this.cache.packageDirPath, packageName)
    _package = new Package({ requestName, packageName, origin, cachePath })

    if (!_package) {
      return Promise.reject(null)
    }

    const timer = setTimeout(() => {
      logger.error('Request TIMEOUT, Please check your network.')
      process.exit()
    }, timeout)

    const spinner = ora(`Fetching package ${logger.packageNameStyle(requestName)} ....`).start()

    return Downloader(_package)
      .then(() => {
        spinner.stop()
        clearTimeout(timer)

        // let { errors } = PackageValidator(_package.cachePath)
        // if (errors && errors.length) {
        //   return Promise.reject(errorList)
        // }

        this.cache.cachePackageInfo(_package)
        return _package
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

        } else {
          throw error
        }
      })
  }
}
