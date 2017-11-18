export default class POZError extends Error {

  constructor(msg) {
    super(msg)
    this.name = this.constructor.name
  }

}
