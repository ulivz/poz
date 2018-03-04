import fs from 'fs-extra'
import ora from 'ora'
import { exists } from '../utils/fs'
import logger from '../logger/logger'
import path from 'path'
import pkg from '../../package.json'
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

  return {
    packageName,
    origin
  }
}

export default class PackageManager {

  constructor() {
    if (!(this instanceof PackageManager)) {
      return new PackageManager()
    }

    this.env = env
    this.wd = path.join(home, '.poz')

    if (!exists(this.wd)) {
      fs.ensureDirSync(this.wd)
    }

    this.cache = new PackageCache(this.wd)
    this.cache.setItem('__VERSION__', pkg.version)
  }


  fetchPkg(requestName, timeout) {
    let Package
    Package = this.cache.getPackageByName(requestName)

    // 1. Find from cache
    if (Package) {
      return Promise.resolve(Package)
    }

    // 2. Find from Github / NPM
    const { packageName, origin } = parseRequest(requestName)
    const cachePath = path.join(this.cache.packageDirPath, packageName)
    Package = new Package({ requestName, packageName, origin, cachePath })

    if (!Package) {
      return Promise.reject(null)
    }

    const timer = setTimeout(() => {
      logger.error('Request TIMEOUT, Please check your network.')
      process.exit()
    }, timeout)

    const spinner = ora(`Fetching package ${logger.packageNameStyle(requestName)} ....`).start()

    return Downloader(Package)
      .then(() => {
        spinner.stop()
        clearTimeout(timer)

        let { errorList } = PackageValidator(Package.cachePath)
        if (errorList.length) {
          return Promise.reject(errorList)
        }

        this.cache.cachePackageInfo(Package)
        return Package
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

        } else if (error.length && error[0] instanceof Error) {
          return Promise.reject(error)
        }
      })
  }
}
