/**
 * POZ Package
 */
export default class Package {
  constructor({ requestName, packageName, cachePath, origin }) {
    this.requestName = requestName
    this.packageName = packageName
    this.cachePath = cachePath
    this.origin = origin
  }
}
