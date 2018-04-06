import path from 'path'
import fs from '../utils/fs'
import Package from './package'
import PackageValidator from '../core/package-validator'

const IGNORE_FILES = [
  '.DS_Store'
]

export default class PackageCache {
  constructor(baseDir) {

    this.indexInfoPath = path.join(baseDir, 'poz.json')
    this.indexInfo = null

    this.packageDirPath = path.join(baseDir, 'packages')
    this.packageNames = null

    if (!fs.existsSync(this.indexInfoPath)) {
      fs.writeJsonSync(this.indexInfoPath, { packagesMap: {} }, { spaces: 2 })
    }

    if (!fs.existsSync(this.packageDirPath)) {
      fs.ensureDirSync(this.packageDirPath)
    }

    this._readIndexInfo()
    this._readPackageDir()
  }

  _readIndexInfo() {
    this.indexInfo = require(this.indexInfoPath)
  }

  _readPackageDir() {
    this.packageNames = fs.readdirSync(this.packageDirPath)
  }

  validateAllPackages() {

    let packageValidationResultList = []
    let packagesMap = this.getItem('packagesMap')
    let packagesMapChanged = false

    // 1. Check if package isn't indexed
    this.packageNames
      .filter(packageName => IGNORE_FILES.indexOf(packageName) === -1)
      .forEach(packageName => {
        let packagePath = this.getPackagePathByName(packageName)
        let { errorList } = PackageValidator(packagePath)

        if (!errorList.length && this.getPackageByName(packageName) === null) {
          packagesMap[packageName] = new Package({
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
    if (!this.indexInfo) {
      this._readIndexInfo()
    }
    return this.indexInfo[name]
  }

  setItem(name, value) {
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
    return path.join(this.packageDirPath, packageName)
  }

  getPackageByName(packageName) {
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
      return new Package(pozPackage)
    }

    return null
  }

  cleanCache() {

    fs.removeSync(this.indexInfoPath)
    fs.removeSync(this.packageDirPath)
  }

  removePackage(poaPackage) {
    if (!(poaPackage instanceof Package)) {
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
    if (cachePath.indexOf(this.packageDirPath) === -1 || !fs.existsSync(this.packageDirPath)) {
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
