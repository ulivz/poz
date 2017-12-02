import path from 'path'
import fs from 'fs-extra'
import {exists} from '../utils/fs'
import logger from '../logger/logger'
import debug from '../core/POZDebugger'
import POZPackage from './POZPackage'
import POZPackageValidator from '../core/POZPackageValidator'

const IGNORE_FILES = [
  '.DS_Store'
]

export default class POZPackageCache {
  constructor(baseDir) {
    debug.trace('POZPackageCache', 'constructor')

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
    this.setItem('packagesMap', {})

    this._readPackageDir()
    this._check()
  }

  _readIndexInfo() {
    debug.trace('POZPackageCache', '_readIndexInfo')
    this.indexInfo = require(this.indexInfoPath)
  }

  _readPackageDir() {
    debug.trace('POZPackageCache', '_readPackageDir')
    this.packageNames = fs.readdirSync(this.packageDirPath)
  }

  _check() {
    debug.trace('POZPackageCache', '_check')
    let packagesMap = this.getItem('packagesMap')
    let findNewPackage = false

    this.packageNames
      .filter(packageName => IGNORE_FILES.indexOf(packageName) === -1)
      .filter(packageName => !this.getPackageByName(packageName))
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
    debug.trace('POZPackageCache', 'getItem')
    if (!this.indexInfo) {
      this._readIndexInfo()
    }
    return this.indexInfo[name]
  }

  setItem(name, value) {
    debug.trace('POZPackageCache', 'setItem')
    if (!this.indexInfo) {
      this._readIndexInfo()
    }
    this.indexInfo[name] = value
    fs.writeJsonSync(this.indexInfoPath, this.indexInfo, { spaces: 2 })
    this.indexInfo = null
  }

  cachePackageInfo(pozPackage) {
    let packagesMap = this.getItem('packagesMap')
    packagesMap[pozPackage.packageName] = pozPackage
    this.setItem('packagesMap', packagesMap)
  }

  getPackagePathByName(packageName) {
    debug.trace('POZPackageCache', 'getPackagePathByName')
    return path.join(this.packageDirPath, packageName)
  }

  getPackageByName(packageName) {
    debug.trace('POZPackageCache', 'getPackageByName')

    let packagesMap = this.getItem('packagesMap')
    let _package

    // match packageName or requestName
    if (packagesMap[packageName]) {
      _package = packagesMap[packageName]

    } else {
      for (let _packageName of Object.keys(packagesMap)) {
        if (packagesMap[_packageName].requestName === packageName) {
          _package = packagesMap[_packageName]
          break
        }
      }
    }

    if (_package) {
      return new POZPackage(_package)
    }

    return null
  }
}
