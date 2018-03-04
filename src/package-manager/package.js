/**
 * POZ Package
 */
export default class POZPackage {
  constructor({ requestName, packageName, cachePath, origin }) {
    this.requestName = requestName
    this.packageName = packageName
    this.cachePath = cachePath
    this.origin = origin
  }
}
