import path from 'path'
import fs from 'fs-extra'
import {exists} from '../utils/fs'
import debug from '../core/debugger'
import POZPackage from './package'
import POZPackageValidator from '../core/package-validator'

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
      fs.writeJsonSync(this.indexInfoPath, { packagesMap: {} }, { spaces: 2 })
    }

    if (!exists(this.packageDirPath)) {
      fs.ensureDirSync(this.packageDirPath)
    }

    this._readIndexInfo()
    this._readPackageDir()
  }

  _readIndexInfo() {
    debug.trace('POZPackageCache', '_readIndexInfo')
    this.indexInfo = require(this.indexInfoPath)
  }

  _readPackageDir() {
    debug.trace('POZPackageCache', '_readPackageDir')
    this.packageNames = fs.readdirSync(this.packageDirPath)
  }

  validateAllPackages() {
    debug.trace('POZPackageCache', 'validatePackages')

    let packageValidationResultList = []
    let packagesMap = this.getItem('packagesMap')
    let packagesMapChanged = false

    // 1. Check if package isn't indexed
    this.packageNames
      .filter(packageName => IGNORE_FILES.indexOf(packageName) === -1)
      .forEach(packageName => {
        let packagePath = this.getPackagePathByName(packageName)
        let { errorList } = POZPackageValidator(packagePath)

        if (!errorList.length && this.getPackageByName(packageName) === null) {
          packagesMap[packageName] = new POZPackage({
            requestName: packageName,
            packageName,
            cachePath: packagePath,
            origin: 'local',
          })
          packagesMapChanged = true
        }

        packageValidationResultList.push({
          packageName,
          errorList
        })
      })

    // 2. Check if package is indexed but not have package
    for (let poaPakcage of Object.keys(packagesMap)) {
      if (this.packageNames.indexOf(poaPakcage.packageName) === -1) {
        delete packagesMap[poaPakcage.packageName]
        packagesMapChanged = true
      }
    }

    if (packagesMapChanged) {
      this.setItem('packagesMap', packagesMap)
    }

    return packageValidationResultList
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
    let pozPackage

    // match packageName or requestName
    if (packagesMap[packageName]) {
      pozPackage = packagesMap[packageName]

    } else {
      for (let pozPackageName of Object.keys(packagesMap)) {
        if (packagesMap[pozPackageName].requestName === packageName) {
          pozPackage = packagesMap[pozPackageName]
          break
        }
      }
    }

    if (pozPackage) {
      return new POZPackage(pozPackage)
    }

    return null
  }

  cleanCache() {
    debug.trace('POZPackageCache', 'cleanAll')

    fs.removeSync(this.indexInfoPath)
    fs.removeSync(this.packageDirPath)
  }

  removePackage(poaPackage) {
    if (!(poaPackage instanceof POZPackage)) {
      return
    }
    this.removePackageCache(poaPackage)
    this.removePackageIndexCache(poaPackage)
  }

  isPackageDownloded(packageName) {
    return this.packageNames.indexOf(packageName) > -1
  }

  removePackageCache(poaPackage) {
    let { cachePath } = poaPackage
    if (cachePath.indexOf(this.packageDirPath) === -1 || !exists(this.packageDirPath)) {
      throw new Error('Invalid package cache path: ' + cachePath)
    }
    fs.removeSync(cachePath)
  }

  removePackageIndexCache(poaPackage) {
    let { packageName } = poaPackage
    let packagesMap = this.getItem('packagesMap')
    delete packagesMap[packageName]
    this.setItem('packagesMap', packagesMap)
  }
}
