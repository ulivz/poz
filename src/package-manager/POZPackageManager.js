import fs from 'fs-extra'
import ora from 'ora'
import chalk from 'chalk'
import {exists, isDirectory, isDirEmpty} from '../utils/fs'
import {download} from '../utils/download'
import {isPlainObject, isPromise} from '../utils/datatypes'
import logger from '../utils/logger'
import {getPkg} from '../utils/pkg'
import path from 'path'
import pkg from '../../package.json'
import home from 'user-home'
import env from '../core/POZENV'
import POZPackageValidator from '../core/POZPackageValidator'
import {pkgFinder} from '../core/POZUtils'

class POZPackage {
  constructor({ requestName, packageName, cachePath, origin }) {
    this.requestName = requestName
    this.packageName = packageName
    this.cachePath = cachePath
    this.origin = origin
  }
}

/**
 * POZ Cache
 */
class POZPackageCache {
  constructor(baseDir) {

    this.indexInfoPath = path.join(baseDir, 'poz.json')
    this.indexInfo = null

    this.packageDirPath = path.join(baseDir, 'packages')
    this.packageNames = null

    if (!exists(this.indexInfoPath)) {
      fs.writeJsonSync(this.indexInfoPath, {}, { spaces: 2 })
    }

    if (!exists(this.packageDirPath)) {
      fs.ensureDirSync(this.packageDirPath)
    }

    this._readIndexInfo()
    this._readPackageDir()
    this._check()
  }

  _readIndexInfo() {
    this.indexInfo = require(this.indexInfoPath)
  }

  _readPackageDir() {
    this.packageNames = fs.readdirSync(this.packageDirPath)
  }

  _check() {
    let packagesMap = this.getItem('packagesMap')
    let findNewPackage = false

    this.packageNames.filter(packageName => !this.getPackageByName(packageName))
      .forEach(packageName => {
        let packagePath = this.getPackagePathByName(packageName)
        let { errorList } = POZPackageValidator(packagePath)

        if (!errorList.length) {
          packagesMap[packageName] = new POZPackage({
            requestName: packageName,
            packageName,
            cachePath: packagePath,
            origin: 'local',
          })
          findNewPackage = true

        } else {
          logger.warn(`${logger.POZ.word(packageName)} is not a valid POZ package, See the error message below:`)
          console.log(errorList.join('\n'))
        }
      })

    if (findNewPackage) {
      this.setItem('packagesMap', packagesMap)
    }
  }

  getItem(name) {
    if (!this.indexInfo) {
      this._readIndexInfo()
    }
    return this.indexInfo[name]
  }

  setItem(name) {
    this.indexInfo[name] = name
    fs.writeJsonSync(this.indexInfoPath, this.indexInfo, { spaces: 2 })
    this.indexInfo = null
  }


  getPackagePathByName(packageName) {
    return path.join(this.packageDirPath, packageName)
  }

  getPackageByName(packageName) {
    let packagesMap = this.getItem('packagesMap')
    let package

    // match packageName or requestName
    if (packagesMap[packageName]) {
      package = packagesMap[packageName]

    } else {
      for (let _packageName of Object.keys(packagesMap)) {
        if (packagesMap[_packageName].requestName === packageName) {
          package = packagesMap[_packageName]
          break
        }
      }
    }

    if (package) {
      return new POZPackage(package)
    }

    return null
  }
}


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
    const NEED_CLONE_REG = /(bitbucket|gitlab|https?)/

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
